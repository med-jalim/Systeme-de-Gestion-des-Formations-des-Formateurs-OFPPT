<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Keycloak Admin REST API Service
 * 
 * Handles user management in Keycloak via the Admin API.
 * Uses client_credentials flow on sgff-api to obtain admin tokens.
 */
class KeycloakAdminService
{
    private string $baseUrl;
    private string $realm;
    private string $clientId;
    private string $clientSecret;

    public function __construct()
    {
        $this->baseUrl       = rtrim(config('keycloak.url'), '/');
        $this->realm         = config('keycloak.realm');
        $this->clientId      = config('keycloak.client_id');
        $this->clientSecret  = config('keycloak.client_secret');
    }

    // ─── Token ───────────────────────────────────────────────────────────────

    /**
     * Obtain a short-lived admin access token via client_credentials.
     * Cached for 55 seconds (tokens usually expire in 60s).
     */
    private function getAdminToken(): string
    {
        return Cache::remember('keycloak_admin_token', 55, function () {
            $response = Http::withoutVerifying()
                ->asForm()
                ->post("{$this->baseUrl}/realms/{$this->realm}/protocol/openid-connect/token", [
                    'grant_type'    => 'client_credentials',
                    'client_id'     => $this->clientId,
                    'client_secret' => $this->clientSecret,
                ]);

            if (!$response->successful()) {
                throw new \RuntimeException(
                    "Impossible d'obtenir le token admin Keycloak: " . $response->body()
                );
            }

            return $response->json('access_token');
        });
    }

    private function adminHttp()
    {
        return Http::withoutVerifying()
            ->withToken($this->getAdminToken())
            ->acceptJson()
            ->contentType('application/json');
    }

    private function adminUrl(string $path = ''): string
    {
        return "{$this->baseUrl}/admin/realms/{$this->realm}{$path}";
    }

    // ─── User CRUD ────────────────────────────────────────────────────────────

    /**
     * Create a user in Keycloak and return the new Keycloak ID (UUID).
     */
    public function createUser(array $data): string
    {
        $attributes = [
            'role' => [$data['role']],
        ];
        if (!empty($data['matricule'])) {
            $attributes['matricule'] = [$data['matricule']];
        }

        $payload = [
            'username'      => $data['email'],
            'email'         => $data['email'],
            'firstName'     => $data['first_name'],
            'lastName'      => $data['last_name'],
            'enabled'       => true,
            'emailVerified' => true,
            'attributes'    => $attributes,
        ];

        $response = $this->adminHttp()->post($this->adminUrl('/users'), $payload);

        if ($response->status() !== 201) {
            throw new \RuntimeException(
                "Erreur Keycloak lors de la création de l'utilisateur: " . $response->body()
            );
        }

        // Keycloak returns the user ID in the Location header
        $location = $response->header('Location');
        $keycloakId = basename($location);

        // Set temporary password
        $passwordPayload = [
            'type'      => 'password',
            'value'     => $data['temp_password'] ?? '123456',
            'temporary' => true,
        ];
        
        $pwdResponse = $this->adminHttp()->put(
            $this->adminUrl("/users/{$keycloakId}/reset-password"), 
            $passwordPayload
        );

        if (!$pwdResponse->successful()) {
            throw new \RuntimeException(
                "Erreur Keycloak lors de la définition du mot de passe: " . $pwdResponse->body()
            );
        }

        // Assign realm role
        $this->assignRole($keycloakId, $data['role']);

        return $keycloakId;
    }

    /**
     * Update user profile in Keycloak.
     */
    public function updateUser(string $keycloakId, array $data): void
    {
        // Skip placeholder IDs (users created before Keycloak integration)
        if (str_starts_with($keycloakId, 'local_')) return;

        $payload = array_filter([
            'firstName'  => $data['first_name'] ?? null,
            'lastName'   => $data['last_name']  ?? null,
            'email'      => $data['email']       ?? null,
            'username'   => $data['email']       ?? null,
        ]);

        $response = $this->adminHttp()->put(
            $this->adminUrl("/users/{$keycloakId}"),
            $payload
        );

        if (!$response->successful()) {
            Log::warning("Keycloak updateUser failed: " . $response->body());
        }

        // Update role if changed
        if (!empty($data['role'])) {
            $this->syncRole($keycloakId, $data['role']);
        }
    }

    /**
     * Delete a user from Keycloak.
     */
    public function deleteUser(string $keycloakId): void
    {
        if (str_starts_with($keycloakId, 'local_')) return;

        $response = $this->adminHttp()->delete($this->adminUrl("/users/{$keycloakId}"));

        if (!$response->successful() && $response->status() !== 404) {
            Log::warning("Keycloak deleteUser failed: " . $response->body());
        }
    }

    /**
     * Change user password directly (Admin action).
     */
    public function changePassword(string $keycloakId, string $newPassword, bool $temporary = false): void
    {
        if (str_starts_with($keycloakId, 'local_')) return;

        $passwordPayload = [
            'type'      => 'password',
            'value'     => $newPassword,
            'temporary' => $temporary,
        ];
        
        $response = $this->adminHttp()->put(
            $this->adminUrl("/users/{$keycloakId}/reset-password"), 
            $passwordPayload
        );

        if (!$response->successful()) {
            throw new \RuntimeException(
                "Erreur Keycloak lors du changement de mot de passe: " . $response->body()
            );
        }
    }

    /**
     * Send a password reset email to the user.
     */
    public function sendPasswordResetEmail(string $keycloakId): void
    {
        if (str_starts_with($keycloakId, 'local_')) return;

        $this->adminHttp()->put(
            $this->adminUrl("/users/{$keycloakId}/execute-actions-email"),
            ['UPDATE_PASSWORD']
        );
    }

    // ─── Role Management ─────────────────────────────────────────────────────

    private function getRoleRepresentation(string $roleName): ?array
    {
        $response = $this->adminHttp()->get($this->adminUrl("/roles/{$roleName}"));
        return $response->successful() ? $response->json() : null;
    }

    private function createRole(string $roleName): bool
    {
        $response = $this->adminHttp()->post($this->adminUrl("/roles"), [
            'name' => $roleName,
            'description' => "Auto-created role: {$roleName}"
        ]);

        if (!$response->successful()) {
            Log::error("Keycloak createRole failed for '{$roleName}'. Error: " . $response->body());
            return false;
        }
        return true;
    }

    private function assignRole(string $keycloakId, string $roleName): void
    {
        $role = $this->getRoleRepresentation($roleName);
        
        if (!$role) {
            // Role doesn't exist, create it auto
            $this->createRole($roleName);
            $role = $this->getRoleRepresentation($roleName);
        }

        if (!$role || !isset($role['id']) || !isset($role['name'])) {
            Log::error("Failed to auto-create and fetch Keycloak role: {$roleName}");
            throw new \RuntimeException("Keycloak role mapping failed: Role not found or invalid format: " . json_encode($role));
        }

        // Strict payload for mapping: avoids Jackson deserialization errors in Keycloak
        $payload = [
            [
                'id' => $role['id'],
                'name' => $role['name']
            ]
        ];

        Log::info("Assigning role {$roleName} (id: {$role['id']}) to user ID: {$keycloakId}");

        $response = $this->adminHttp()->post(
            $this->adminUrl("/users/{$keycloakId}/role-mappings/realm"),
            $payload
        );

        if (!$response->successful()) {
            $errorBody = $response->body();
            Log::error("Failed to map role {$roleName} to user {$keycloakId}: " . $errorBody);
            throw new \RuntimeException("Keycloak role mapping failed: " . $errorBody);
        }
    }

    private function syncRole(string $keycloakId, string $newRole): void
    {
        // Get current realm roles
        $response = $this->adminHttp()->get(
            $this->adminUrl("/users/{$keycloakId}/role-mappings/realm")
        );
        if (!$response->successful()) return;

        $appRoles = [
            'admin', 'responsable_cdc', 'responsable_formation',
            'responsable_dr', 'formateur_animateur', 'formateur_participant',
        ];

        // Remove old app roles
        $toRemove = array_filter(
            $response->json(),
            fn($r) => in_array($r['name'], $appRoles) && $r['name'] !== $newRole
        );

        if (!empty($toRemove)) {
            $this->adminHttp()->delete(
                $this->adminUrl("/users/{$keycloakId}/role-mappings/realm"),
                array_values($toRemove)
            );
        }

        // Assign new role
        $this->assignRole($keycloakId, $newRole);
    }
}
