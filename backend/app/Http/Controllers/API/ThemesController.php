<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\Request;

class ThemesController extends Controller
{
    public function index(Request $request)
    {
        $query = Theme::query()->with('formation');

        if ($request->has('formation_id')) {
            $query->where('formation_id', $request->formation_id);
        }

        return response()->json($query->get());
    }

    public function show(Theme $theme)
    {
        return response()->json($theme->load('formation'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $formation = \App\Models\Formation::findOrFail($validated['formation_id']);
        
        if ($validated['start_date'] < $formation->start_date->format('Y-m-d') || 
            $validated['end_date'] > $formation->end_date->format('Y-m-d')) {
            return response()->json([
                'message' => 'Les dates du thème doivent être comprises dans la période de la formation (' . 
                             $formation->start_date->format('d/m/Y') . ' au ' . 
                             $formation->end_date->format('d/m/Y') . ').'
            ], 422);
        }

        $theme = Theme::create($validated);
        return response()->json($theme, 201);
    }

    public function update(Request $request, Theme $theme)
    {
        $validated = $request->validate([
            'formation_id' => 'sometimes|required|exists:formations,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
        ]);

        $formation = $theme->formation;
        $startDate = $validated['start_date'] ?? $theme->start_date->format('Y-m-d');
        $endDate = $validated['end_date'] ?? $theme->end_date->format('Y-m-d');

        if ($startDate < $formation->start_date->format('Y-m-d') || 
            $endDate > $formation->end_date->format('Y-m-d')) {
            return response()->json([
                'message' => 'Les dates du thème doivent être comprises dans la période de la formation (' . 
                             $formation->start_date->format('d/m/Y') . ' au ' . 
                             $formation->end_date->format('d/m/Y') . ').'
            ], 422);
        }

        $theme->update($validated);
        return response()->json($theme);
    }

    public function destroy(Theme $theme)
    {
        $theme->delete();
        return response()->noContent();
    }
}
