<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class KeycloakAuth
{
    /**
     * Validate the Keycloak Bearer token and load the local user.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Token manquant.'], 401);
        }

        $token = substr($authHeader, 7);

        try {
            $payload = $this->validateToken($token);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Token invalide: ' . $e->getMessage()], 401);
        }

        // Load or auto-provision user by keycloak_id
        $keycloakId = $payload->sub;
        $user = User::where('keycloak_id', $keycloakId)->first();

        if (!$user) {
            // Auto-provision: create local user record on first login
            $user = User::create([
                'keycloak_id' => $keycloakId,
                'first_name'  => $payload->given_name ?? 'Utilisateur',
                'last_name'   => $payload->family_name ?? ($payload->preferred_username ?? 'SGFF'),
                'email'       => $payload->email ?? $keycloakId . '@sgff.local',
                'role'        => $this->extractAppRole($payload),
            ]);
        }

        // Make user available throughout the request
        $request->attributes->set('auth_user', $user);
        $request->attributes->set('auth_payload', $payload);

        return $next($request);
    }

    // ─── Token Validation ─────────────────────────────────────────────────────

    private function validateToken(string $token): object
    {
        $jwks = $this->getJwks();
        $keys = JWK::parseKeySet($jwks);

        // firebase/php-jwt v6+ returns array of Key objects
        $decoded = JWT::decode($token, $keys);

        // Verify issuer
        $expectedIssuer = rtrim(config('keycloak.url'), '/')
            . '/realms/'
            . config('keycloak.realm');

        if (($decoded->iss ?? '') !== $expectedIssuer) {
            throw new \RuntimeException("Issuer invalide: {$decoded->iss}");
        }

        return $decoded;
    }

    /**
     * Fetch and cache the JWKS public keys from Keycloak.
     */
    private function getJwks(): array
    {
        return Cache::remember('keycloak_jwks', 600, function () {
            $url = rtrim(config('keycloak.url'), '/')
                . '/realms/'
                . config('keycloak.realm')
                . '/protocol/openid-connect/certs';

            $response = Http::withoutVerifying()->get($url);

            if (!$response->successful()) {
                throw new \RuntimeException("Impossible de récupérer les clés JWKS.");
            }

            return $response->json();
        });
    }

    /**
     * Extract the first matching app role from realm_access.roles.
     */
    private function extractAppRole(object $payload): string
    {
        $appRoles = [
            'admin',
            'responsable_cdc',
            'responsable_formation',
            'responsable_dr',
            'formateur_animateur',
            'formateur_participant',
        ];

        $realmRoles = $payload->realm_access?->roles ?? [];

        foreach ($appRoles as $role) {
            if (in_array($role, $realmRoles)) {
                return $role;
            }
        }

        return 'formateur_participant'; // default
    }
}
