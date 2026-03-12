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

        $trainingSession->update($validated);
        return response()->json($trainingSession->load(['theme', 'trainer']));
    }

    public function destroy(TrainingSession $trainingSession)
    {
        $trainingSession->delete();
        return response()->noContent();
    }
}
