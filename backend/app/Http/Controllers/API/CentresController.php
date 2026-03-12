<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Centre;
use Illuminate\Http\Request;

class CentresController extends Controller
{
    public function index()
    {
        return response()->json(Centre::with('direction')->withCount('sites')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'direction_id' => 'required|exists:directions,id',
            'code'         => 'required|string|max:50|unique:centres,code',
            'name'         => 'required|string|max:255',
        ]);

        $centre = Centre::create($validated);
        return response()->json($centre->load('direction')->loadCount('sites'), 201);
    }

    public function show(Centre $centre)
    {
        return response()->json($centre->load('direction')->loadCount('sites'));
    }

    public function update(Request $request, Centre $centre)
    {
        $validated = $request->validate([
            'direction_id' => 'sometimes|required|exists:directions,id',
            'code'         => 'sometimes|required|string|max:50|unique:centres,code,' . $centre->id,
            'name'         => 'sometimes|required|string|max:255',
        ]);

        $centre->update($validated);
        return response()->json($centre->load('direction')->loadCount('sites'));
    }

    public function destroy(Centre $centre)
    {
        $centre->delete();
        return response()->noContent();
    }
}
