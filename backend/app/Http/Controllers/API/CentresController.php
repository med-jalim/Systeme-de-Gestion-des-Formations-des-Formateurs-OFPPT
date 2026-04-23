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
        $user = request()->attributes->get('auth_user');

        if ($user && $user->role === 'responsable_dr' && $user->direction_id) {
            $query->where('direction_id', $user->direction_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = request()->attributes->get('auth_user');

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
        $this->authorizeResponsableDr($centre);
        return response()->json($centre->load('direction')->loadCount('sites'));
    }

    public function update(Request $request, Centre $centre)
    {
        $this->authorizeResponsableDr($centre);
        $user = request()->attributes->get('auth_user');

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
        $this->authorizeResponsableDr($centre);
        $centre->delete();
        return response()->noContent();
    }

    private function authorizeResponsableDr(Centre $centre): void
    {
        $user = request()->attributes->get('auth_user');
        if ($user && $user->role === 'responsable_dr') {
            if ($centre->direction_id !== $user->direction_id) {
                abort(403, 'Action non autorisée sur ce centre.');
            }
        }
    }
}
