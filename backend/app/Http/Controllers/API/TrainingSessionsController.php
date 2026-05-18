<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingSession;
use Illuminate\Http\Request;

class TrainingSessionsController extends Controller
{
    public function index(Request $request)
    {
        $query = TrainingSession::query()->with(['theme', 'trainer']);

        $authUser = auth()->user();
        if ($authUser) {
            if ($authUser->role === 'responsable_dr') {
                $query->whereHas('trainingPlan', function ($q) use ($authUser) {
                    $q->whereHas('site.centre', fn($c) => $c->where('direction_id', $authUser->direction_id))
                      ->orWhere('created_by', $authUser->id);
                });
            } elseif ($authUser->role === 'responsable_cdc') {
                $query->whereHas('trainingPlan.site', fn($q) => $q->where('centre_id', $authUser->centre_id));
            }
        }

        if ($request->has('plan_id')) {
            $query->where('training_plan_id', $request->plan_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'training_plan_id' => 'required|exists:plan_formations,id',
            'theme_id' => 'required|exists:themes,id',
            'trainer_id' => 'required|exists:utilisateurs,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'type' => 'required|in:présentiel,à distance',
            'remote_link' => 'nullable|url',
        ]);

        $this->authorizeSessionEdit(null, $validated['training_plan_id']);

        $session = TrainingSession::create($validated);
        return response()->json($session->load(['theme', 'trainer']), 201);
    }

    public function update(Request $request, TrainingSession $trainingSession)
    {
        $validated = $request->validate([
            'theme_id' => 'sometimes|required|exists:themes,id',
            'trainer_id' => 'sometimes|required|exists:utilisateurs,id',
            'date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required',
            'end_time' => 'sometimes|required|after:start_time',
            'type' => 'sometimes|required|in:présentiel,à distance',
            'remote_link' => 'nullable|url',
        ]);

        if (isset($validated['training_plan_id'])) {
            $this->authorizeSessionEdit(null, $validated['training_plan_id']);
        }
        $this->authorizeSessionEdit($trainingSession);

        $trainingSession->update($validated);
        return response()->json($trainingSession->load(['theme', 'trainer']));
    }

    public function destroy(TrainingSession $trainingSession)
    {
        $this->authorizeSessionEdit($trainingSession);
        $trainingSession->delete();
        return response()->noContent();
    }

    private function authorizeSessionEdit(TrainingSession $session = null, $planId = null): void
    {
        $user = auth()->user();
        if (!$user) return;

        if ($user->role === 'responsable_cdc') {
            abort(403, 'Le responsable de centre n\'est pas autorisé à modifier les sessions.');
        }

        if ($session) {
            $planId = $session->training_plan_id;
        }

        if ($planId && $user->role !== 'admin') {
            $plan = \App\Models\TrainingPlan::find($planId);
            if ($plan && $plan->created_by !== $user->id) {
                abort(403, 'Vous ne pouvez modifier des sessions que pour les plans de formation que vous avez créés.');
            }
        }
    }
}
