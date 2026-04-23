<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;

class SitesController extends Controller
{
    public function index()
    {
        $query = Site::with('centre', 'centre.direction');
        $user = request()->attributes->get('auth_user');

        // Only CDC is restricted to their own centre's sites in the list
        if ($user && $user->role === 'responsable_cdc') {
            $query->where('centre_id', $user->centre_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = request()->attributes->get('auth_user');
        if ($user && $user->role === 'responsable_cdc') {
            $request->merge(['centre_id' => $user->centre_id]);
        }

        $validated = $request->validate([
            'centre_id' => 'required|exists:centres,id',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $this->authorizeLocationAccess(null, $validated['centre_id']);

        $site = Site::create($validated);
        return response()->json($site, 201);
    }

    public function show(Site $site)
    {
        $this->authorizeLocationAccess($site);
        return response()->json($site->load('centre'));
    }

    public function update(Request $request, Site $site)
    {
        $user = request()->attributes->get('auth_user');
        if ($user && $user->role === 'responsable_cdc') {
            $request->merge(['centre_id' => $user->centre_id]);
        }

        $validated = $request->validate([
            'centre_id' => 'sometimes|required|exists:centres,id',
            'name' => 'sometimes|required|string|max:255',
            'address' => 'nullable|string',
        ]);

        if (isset($validated['centre_id'])) {
            $this->authorizeLocationAccess(null, $validated['centre_id']);
        }
        $this->authorizeLocationAccess($site); // Also check original site

        $site->update($validated);
        return response()->json($site);
    }

    public function destroy(Site $site)
    {
        $this->authorizeLocationAccess($site);
        $site->delete();
        return response()->noContent();
    }

    private function authorizeLocationAccess(Site $site = null, $centreId = null): void
    {
        $user = request()->attributes->get('auth_user');
        if (!$user) return;

        if ($site) {
            $centreId = $site->centre_id;
        }
        if ($centreId) {
            $centre = \App\Models\Centre::find($centreId);
            if ($centre && $user->role === 'responsable_dr' && $centre->direction_id !== $user->direction_id) {
                abort(403, 'Action non autorisée. Ce centre appartient à une autre direction.');
            }
            if ($centre && $user->role === 'responsable_cdc' && $centre->id !== $user->centre_id) {
                abort(403, 'Action non autorisée. Ce centre n\'est pas le vôtre.');
            }
        }
    }
}
