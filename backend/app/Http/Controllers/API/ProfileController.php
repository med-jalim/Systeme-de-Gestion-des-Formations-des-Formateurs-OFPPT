<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\KeycloakAdminService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    private KeycloakAdminService $keycloakService;

    public function __construct(KeycloakAdminService $keycloakService)
    {
        $this->keycloakService = $keycloakService;
    }

    /**
     * Get the currently authenticated user's profile.
     */
    public function show(Request $request)
    {
        // auth_user is set by KeycloakAuth middleware
        $user = $request->attributes->get('auth_user');
        
        return response()->json($user->load(['centre', 'direction', 'avatar']));
    }

    /**
     * Update the currently authenticated user's profile (names and password).
     */
    public function update(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name'  => 'sometimes|required|string|max:255',
            'password'   => 'sometimes|required|string|min:6',
        ]);

        try {
            DB::beginTransaction();

            $updatedFields = [];
            if (array_key_exists('first_name', $validated)) $updatedFields['first_name'] = $validated['first_name'];
            if (array_key_exists('last_name', $validated))  $updatedFields['last_name'] = $validated['last_name'];
            
            // Update local DB
            if (!empty($updatedFields)) {
                $user->update($updatedFields);
            }

            // Sync with Keycloak
            if ($user->keycloak_id && !str_starts_with($user->keycloak_id, 'local_')) {
                if (isset($updatedFields['first_name']) || isset($updatedFields['last_name'])) {
                    $keycloakData = [
                        'first_name' => $user->first_name,
                        'last_name'  => $user->last_name,
                    ];
                    $this->keycloakService->updateUser($user->keycloak_id, $keycloakData);
                }
                
                if (isset($validated['password'])) {
                    // Change password in Keycloak. We set temporary = false since user set it themselves.
                    $this->keycloakService->changePassword($user->keycloak_id, $validated['password'], false);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Profil mis à jour avec succès.',
                'user' => $user->load(['centre', 'direction'])
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating user profile: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du profil.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
