<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['centre', 'direction']);

        $authUser = $request->user();
        if ($authUser && !$request->has('all')) {
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
            'password'     => 'nullable|string|min:6',
            'centre_id'    => 'nullable|exists:centres,id',
            'direction_id' => 'nullable|exists:directions,id',
        ]);

        if (empty($validated['password'])) {
            $validated['password'] = 'password'; // Default password
        }

        try {
            $user = User::create($validated);
            return response()->json($user->load(['centre', 'direction']), 201);
        } catch (\Exception $e) {
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
            'password'     => 'nullable|string|min:6',
            'centre_id'    => 'nullable|exists:centres,id',
            'direction_id' => 'nullable|exists:directions,id',
        ]);

        try {
            $user->update($validated);
            return response()->json($user->load(['centre', 'direction']));
        } catch (\Exception $e) {
            Log::error('Error updating user: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la mise à jour de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();
            return response()->noContent();
        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la suppression de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Admin resetting a user password.
     */
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        try {
            $user->update([
                'password' => Hash::make($validated['password'])
            ]);

            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        } catch (\Exception $e) {
            Log::error('Error resetting password: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la réinitialisation.'], 500);
        }
    }
}
