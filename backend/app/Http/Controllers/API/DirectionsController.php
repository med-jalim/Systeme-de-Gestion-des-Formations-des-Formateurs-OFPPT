<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Direction;
use Illuminate\Http\Request;

class DirectionsController extends Controller
{
    public function index()
    {
        return response()->json(
            Direction::withCount('centres')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:directions,code',
            'name' => 'required|string|max:255',
        ]);

        $direction = Direction::create($validated);
        return response()->json($direction->loadCount('centres'), 201);
    }

    public function show(Direction $direction)
    {
        return response()->json($direction->load('centres')->loadCount('centres'));
    }

    public function update(Request $request, Direction $direction)
    {
        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:50|unique:directions,code,' . $direction->id,
            'name' => 'sometimes|required|string|max:255',
        ]);

        $direction->update($validated);
        return response()->json($direction->loadCount('centres'));
    }

    public function destroy(Direction $direction)
    {
        $direction->delete();
        return response()->noContent();
    }
}
