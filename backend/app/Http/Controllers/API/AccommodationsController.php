<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;

class AccommodationsController extends Controller
{
    public function index()
    {
        return response()->json(Accommodation::with('site')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'type'    => 'required|in:hotel,resider,centre_interne',
            'address' => 'nullable|string',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $accommodation = Accommodation::create($validated);
        return response()->json($accommodation->load('site'), 201);
    }

    public function show(Accommodation $accommodation)
    {
        return response()->json($accommodation->load('site'));
    }

    public function update(Request $request, Accommodation $accommodation)
    {
        $validated = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'type'    => 'sometimes|required|in:hotel,resider,centre_interne',
            'address' => 'nullable|string',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $accommodation->update($validated);
        return response()->json($accommodation->load('site'));
    }

    public function destroy(Accommodation $accommodation)
    {
        $accommodation->delete();
        return response()->noContent();
    }
}
