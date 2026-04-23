<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\KeycloakAdminService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UsersController extends Controller
{
    private KeycloakAdminService $keycloakService;

    public function __construct(KeycloakAdminService $keycloakService)
    {
        $this->keycloakService = $keycloakService;
    }

    public function index(Request $request)
    {
        $query = User::with(['centre', 'direction']);

        $authUser = request()->attributes->get('auth_user');
        if ($authUser) {
            if ($authUser->role === 'responsable_dr') {
                $query->where('direction_id', $authUser->direction_id);
            } elseif ($authUser->role === 'responsable_cdc') {
                $query->where('centre_id', $authUser->centre_id);
            }
        }

        if ($request->has('role') && in_array($request->role, [
            'admin', 'responsable_cdc', 'responsable_formation',
            'responsable_dr', 'formateur_animateur', 'formateur_participant'
        ])) {
            $query->where('role', $request->role);
        }

        return response()->json($query->get());
    }

    public function show(User $user)
    {
        return response()->json($user->load(['centre', 'direction']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'   => 'required|string|max:255',
            'last_name'    => 'required|string|max:255',
            'email'        => 'required|email|unique:utilisateurs,email',
            'matricule'    => 'required|string|max:50|unique:utilisateurs,matricule',
            'role'         => 'required|in:admin,responsable_cdc,responsable_formation,responsable_dr,formateur_animateur,formateur_participant',
            'centre_id'    => 'nullable|exists:centres,id',
            'direction_id' => 'nullable|exists:directions,id',
        ]);

        try {
            DB::beginTransaction();

            // 1. Create in Keycloak
            $keycloakId = $this->keycloakService->createUser($validated);
            $validated['keycloak_id'] = $keycloakId;

            // 2. Create in local DB
            $user = User::create($validated);

            DB::commit();

            return response()->json($user->load(['centre', 'direction']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating user: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la création de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name'   => 'sometimes|required|string|max:255',
            'last_name'    => 'sometimes|required|string|max:255',
            'email'        => 'sometimes|required|email|unique:utilisateurs,email,' . $user->id,
            'matricule'    => 'sometimes|required|string|max:50|unique:utilisateurs,matricule,' . $user->id,
            'role'         => 'sometimes|required|in:admin,responsable_cdc,responsable_formation,responsable_dr,formateur_animateur,formateur_participant',
            'centre_id'    => 'nullable|exists:centres,id',
            'direction_id' => 'nullable|exists:directions,id',
        ]);

        try {
            DB::beginTransaction();

            $user->update($validated);

            // Sync with Keycloak (if keycloak_id exists and isn't a mock one)
            if ($user->keycloak_id) {
                // We pass the merged data to ensure we have all fields required for update
                $syncData = array_merge($user->toArray(), $validated);
                if (isset($validated['role'])) {
                    $syncData['role'] = $validated['role'];
                }
                $this->keycloakService->updateUser($user->keycloak_id, $syncData);
            }

            DB::commit();

            return response()->json($user->load(['centre', 'direction']));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating user: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la mise à jour de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(User $user)
    {
        try {
            DB::beginTransaction();

            $keycloakId = $user->keycloak_id;
            
            $user->delete();

            // Delete from Keycloak
            if ($keycloakId) {
                $this->keycloakService->deleteUser($keycloakId);
            }

            DB::commit();

            return response()->noContent();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting user: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la suppression de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }
}
