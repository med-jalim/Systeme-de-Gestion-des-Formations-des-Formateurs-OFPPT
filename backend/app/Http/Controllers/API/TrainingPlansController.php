<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use Illuminate\Http\Request;

class TrainingPlansController extends Controller
{
    public function index()
    {
        return response()->json(TrainingPlan::with(['formation', 'site', 'participants', 'trainers'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'site_id'      => 'required|exists:sites,id',
            'title'        => 'nullable|string|max:255',
            'status'       => 'required|in:draft,active,completed,cancelled',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date|after_or_equal:start_date',
            'participants' => 'array',
            'participants.*.userId' => 'exists:utilisateurs,id',
            'trainers'     => 'array',
            'trainers.*.userId'   => 'exists:utilisateurs,id',
            'theme_assignments' => 'array',
            'theme_assignments.*.theme_id'      => 'required|exists:themes,id',
            'theme_assignments.*.participant_id' => 'required|exists:utilisateurs,id',
            'theme_assignments.*.formateur_id'   => 'required|exists:utilisateurs,id',
            'plan_accommodations' => 'array',
            'plan_accommodations.*.hebergement_id' => 'required|exists:hebergements,id',
            'plan_accommodations.*.utilisateur_id' => 'required|exists:utilisateurs,id',
            'plan_accommodations.*.check_in_date'  => 'nullable|date',
            'plan_accommodations.*.check_out_date' => 'nullable|date',
        ]);

        $plan = TrainingPlan::create($validated);

        if (!empty($validated['participants'])) {
            $participantIds = collect($validated['participants'])->pluck('userId')->toArray();
            $plan->participants()->sync($participantIds);
        }
        
        if (!empty($validated['trainers'])) {
            $trainerIds = collect($validated['trainers'])->pluck('userId')->toArray();
            $plan->trainers()->sync($trainerIds);
        }

        if (!empty($validated['theme_assignments'])) {
            foreach ($validated['theme_assignments'] as $assignment) {
                $plan->themeAssignments()->create($assignment);
            }
        }

        if (!empty($validated['plan_accommodations'])) {
            foreach ($validated['plan_accommodations'] as $accommodation) {
                $plan->planAccommodations()->create($accommodation);
            }
        }

        return response()->json($plan->load(['participants', 'trainers', 'themeAssignments', 'planAccommodations']), 201);
    }

    public function show(TrainingPlan $plan)
    {
        return response()->json($plan->load(['formation', 'site', 'participants', 'trainers', 'themeAssignments', 'planAccommodations']));
    }

    public function update(Request $request, TrainingPlan $plan)
    {
        $validated = $request->validate([
            'formation_id' => 'sometimes|required|exists:formations,id',
            'site_id'      => 'sometimes|required|exists:sites,id',
            'title'        => 'nullable|string|max:255',
            'status'       => 'sometimes|required|in:draft,active,completed,cancelled',
            'start_date'   => 'sometimes|required|date',
            'end_date'     => 'sometimes|required|date|after_or_equal:start_date',
            'participants' => 'array',
            'participants.*.userId' => 'exists:utilisateurs,id',
            'trainers'     => 'array',
            'trainers.*.userId'   => 'exists:utilisateurs,id',
            'theme_assignments' => 'array',
            'theme_assignments.*.theme_id'      => 'required|exists:themes,id',
            'theme_assignments.*.participant_id' => 'required|exists:utilisateurs,id',
            'theme_assignments.*.formateur_id'   => 'required|exists:utilisateurs,id',
            'plan_accommodations' => 'array',
            'plan_accommodations.*.hebergement_id' => 'required|exists:hebergements,id',
            'plan_accommodations.*.utilisateur_id' => 'required|exists:utilisateurs,id',
            'plan_accommodations.*.check_in_date'  => 'nullable|date',
            'plan_accommodations.*.check_out_date' => 'nullable|date',
        ]);

        $plan->update($validated);

        if (isset($validated['participants'])) {
            $participantIds = collect($validated['participants'])->pluck('userId')->toArray();
            $plan->participants()->sync($participantIds);
        }
        
        if (isset($validated['trainers'])) {
            $trainerIds = collect($validated['trainers'])->pluck('userId')->toArray();
            $plan->trainers()->sync($trainerIds);
        }

        if (isset($validated['theme_assignments'])) {
            $plan->themeAssignments()->delete();
            foreach ($validated['theme_assignments'] as $assignment) {
                $plan->themeAssignments()->create($assignment);
            }
        }

        if (isset($validated['plan_accommodations'])) {
            $plan->planAccommodations()->delete();
            foreach ($validated['plan_accommodations'] as $accommodation) {
                $plan->planAccommodations()->create($accommodation);
            }
        }

        return response()->json($plan->load(['participants', 'trainers', 'themeAssignments', 'planAccommodations']));
    }

    public function destroy(TrainingPlan $plan)
    {
        $plan->delete();
        return response()->noContent();
    }
}
