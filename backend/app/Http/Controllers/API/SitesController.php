<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;

class SitesController extends Controller
{
    public function index()
    {
        return response()->json(Site::with('centre')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'centre_id' => 'required|exists:centres,id',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $site = Site::create($validated);
        return response()->json($site, 201);
    }

    public function show(Site $site)
    {
        return response()->json($site->load('centre'));
    }

    public function update(Request $request, Site $site)
    {
        $validated = $request->validate([
            'centre_id' => 'sometimes|required|exists:centres,id',
            'name' => 'sometimes|required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $site->update($validated);
        return response()->json($site);
    }

    public function destroy(Site $site)
    {
        $site->delete();
        return response()->noContent();
    }
}
