<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\Request;

class FormationsController extends Controller
{
    public function index()
    {
        $authUser = auth()->user();
        $query = Formation::with('themes');

        if ($authUser && $authUser->role !== 'admin') {
            $query->where('created_by', $authUser->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $authUser = auth()->user();
        $validated['created_by'] = $authUser ? $authUser->id : null;

        $formation = Formation::create($validated);
        return response()->json($formation, 201);
    }

    public function show(Formation $formation)
    {
        return response()->json($formation->load('themes'));
    }

    public function update(Request $request, Formation $formation)
    {
        $authUser = auth()->user();
        if ($authUser && $authUser->role !== 'admin' && $formation->created_by !== $authUser->id) {
            abort(403, 'Vous n\'êtes pas autorisé à modifier ce programme.');
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
        ]);

        $formation->update($validated);
        return response()->json($formation);
    }

    public function destroy(Formation $formation)
    {
        $authUser = auth()->user();
        if ($authUser && $authUser->role !== 'admin' && $formation->created_by !== $authUser->id) {
            abort(403, 'Vous n\'êtes pas autorisé à supprimer ce programme.');
        }

        $formation->delete();
        return response()->noContent();
    }
}
