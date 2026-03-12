<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['centre', 'direction']);

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

        // Generate a placeholder keycloak_id until Keycloak is integrated
        $validated['keycloak_id'] = 'local_' . Str::uuid();

        $user = User::create($validated);
        return response()->json($user->load(['centre', 'direction']), 201);
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

        $user->update($validated);
        return response()->json($user->load(['centre', 'direction']));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}
