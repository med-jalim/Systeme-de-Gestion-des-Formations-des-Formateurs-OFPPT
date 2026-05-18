<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Get the currently authenticated user's profile.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json($user->load(['centre', 'direction', 'avatar']));
    }

    /**
     * Update the currently authenticated user's profile (names and password).
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name'  => 'sometimes|required|string|max:255',
            'password'   => 'sometimes|required|string|min:6',
        ]);

        try {
            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);

            return response()->json([
                'message' => 'Profil mis à jour avec succès.',
                'user' => $user->load(['centre', 'direction'])
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error updating user profile: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du profil.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
