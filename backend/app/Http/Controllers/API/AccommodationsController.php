<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;

class AccommodationsController extends Controller
{
    public function index(Request $request)
    {
        $query = Accommodation::with('site');
        $user = auth()->user();
        
        // Only CDC is restricted to their own centre's accommodations in the list
        if ($user && $user->role === 'responsable_cdc' && !$request->has('all')) {
            $query->whereHas('site', fn($q) => $q->where('centre_id', $user->centre_id));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'type'    => 'required|in:hotel,resider,centre_interne',
            'address' => 'nullable|string',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        if (!empty($validated['site_id'])) {
            $this->authorizeLocationAccess(null, $validated['site_id']);
        }

        $accommodation = Accommodation::create($validated);
        return response()->json($accommodation->load('site'), 201);
    }

    public function show(Accommodation $accommodation)
    {
        if ($accommodation->site_id) {
            $this->authorizeLocationAccess($accommodation);
        }
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

        if (isset($validated['site_id']) && $validated['site_id']) {
            $this->authorizeLocationAccess(null, $validated['site_id']);
        }
        if ($accommodation->site_id) {
            $this->authorizeLocationAccess($accommodation);
        }

        $accommodation->update($validated);
        return response()->json($accommodation->load('site'));
    }

    public function destroy(Accommodation $accommodation)
    {
        if ($accommodation->site_id) {
            $this->authorizeLocationAccess($accommodation);
        }
        $accommodation->delete();
        return response()->noContent();
    }

    private function authorizeLocationAccess(Accommodation $accommodation = null, $siteId = null): void
    {
        $user = auth()->user();
        if (!$user) return;

        if ($accommodation) {
            $siteId = $accommodation->site_id;
        }
        if ($siteId) {
            $site = \App\Models\Site::with('centre')->find($siteId);
            if ($site && $site->centre) {
                if ($user->role === 'responsable_dr' && $site->centre->direction_id !== $user->direction_id) {
                    abort(403, 'Action non autorisée. Ce site appartient à une autre direction.');
                }
                if ($user->role === 'responsable_cdc' && $site->centre->id !== $user->centre_id) {
                    abort(403, 'Action non autorisée. Ce site n\'appartient pas à votre centre.');
                }
            }
        }
    }
}
