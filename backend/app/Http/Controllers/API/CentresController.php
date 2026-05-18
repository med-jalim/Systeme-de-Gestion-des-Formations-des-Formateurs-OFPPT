<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Centre;
use Illuminate\Http\Request;

class CentresController extends Controller
{
    public function index()
    {
        $query = Centre::with('direction')->withCount('sites');
        $user = auth()->user();

        if ($user && $user->role === 'responsable_dr' && $user->direction_id) {
            $query->where('direction_id', $user->direction_id);
        } elseif ($user && $user->role === 'responsable_cdc' && $user->centre_id) {
            $query->where('id', $user->centre_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if ($user && $user->role === 'responsable_dr' && $user->direction_id) {
            $request->merge(['direction_id' => $user->direction_id]);
        }

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
        $this->authorizeCentreAccess($centre);
        return response()->json($centre->load('direction')->loadCount('sites'));
    }

    public function update(Request $request, Centre $centre)
    {
        $this->authorizeCentreAccess($centre);
        $user = auth()->user();

        if ($user && $user->role === 'responsable_dr' && $user->direction_id) {
            $request->merge(['direction_id' => $user->direction_id]);
        }

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
        $this->authorizeCentreAccess($centre);
        $centre->delete();
        return response()->noContent();
    }

    private function authorizeCentreAccess(Centre $centre): void
    {
        $user = auth()->user();
        if (!$user) return;

        if ($user->role === 'responsable_dr' && $centre->direction_id !== $user->direction_id) {
            abort(403, 'Action non autorisée sur ce centre.');
        }

        if ($user->role === 'responsable_cdc' && $centre->id !== $user->centre_id) {
            abort(403, 'Action non autorisée. Ce centre n\'est pas le vôtre.');
        }
    }
}
