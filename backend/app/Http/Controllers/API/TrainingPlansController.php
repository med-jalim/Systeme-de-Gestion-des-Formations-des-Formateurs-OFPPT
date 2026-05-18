<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use Illuminate\Http\Request;

class TrainingPlansController extends Controller
{
    public function index()
    {
        $query = TrainingPlan::with(['formation', 'site', 'participants', 'trainers', 'creator', 'validator']);

        $authUser = auth()->user();
        if ($authUser && $authUser->role !== 'admin') {
            if ($authUser->role === 'responsable_dr') {
                $query->where(function ($q) use ($authUser) {
                    $q->whereHas('site.centre', fn($c) => $c->where('direction_id', $authUser->direction_id))
                      ->orWhere('created_by', $authUser->id);
                });
            } elseif ($authUser->role === 'responsable_cdc') {
                $query->where(function ($q) use ($authUser) {
                    $q->where('created_by', $authUser->id)
                      ->orWhereHas('site', fn($s) => $s->where('centre_id', $authUser->centre_id));
                });
            }
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $this->authorizePlanEdit();

        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'site_id'      => 'required|exists:sites,id',
            'title'        => 'nullable|string|max:255',
            'status'       => 'required|in:draft,en_attente,approuve,rejete,completed,cancelled',
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

        $authUser = auth()->user();
        $validated['created_by'] = $authUser ? $authUser->id : null;
        // validation_status removed. 'status' is already provided in $validated

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

        return response()->json($plan->load([
            'formation.themes', 
            'site.centre', 
            'participants', 
            'trainers', 
            'themeAssignments.theme', 
            'themeAssignments.participant.direction', 
            'themeAssignments.trainer', 
            'planAccommodations.accommodation',
            'planAccommodations.user'
        ]), 201);
    }

    public function show(TrainingPlan $plan)
    {
        return response()->json($plan->load([
            'formation.themes', 
            'site.centre', 
            'participants', 
            'trainers', 
            'creator',
            'validator',
            'themeAssignments.theme', 
            'themeAssignments.participant.direction', 
            'themeAssignments.trainer', 
            'planAccommodations.accommodation',
            'planAccommodations.user'
        ]));
    }

    public function update(Request $request, TrainingPlan $plan)
    {
        $this->authorizePlanEdit($plan);

        $validated = $request->validate([
            'formation_id' => 'sometimes|required|exists:formations,id',
            'site_id'      => 'sometimes|required|exists:sites,id',
            'title'        => 'nullable|string|max:255',
            'status'       => 'sometimes|required|in:draft,en_attente,approuve,rejete,completed,cancelled',
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

        return response()->json($plan->load([
            'formation.themes', 
            'site.centre', 
            'participants', 
            'trainers', 
            'creator',
            'validator',
            'themeAssignments.theme', 
            'themeAssignments.participant.direction', 
            'themeAssignments.trainer', 
            'planAccommodations.accommodation',
            'planAccommodations.user'
        ]));
    }

    public function destroy(TrainingPlan $plan)
    {
        $this->authorizePlanEdit($plan);
        $plan->delete();
        return response()->noContent();
    }

    public function approve(Request $request, TrainingPlan $plan)
    {
        $user = auth()->user();
        
        $plan->load('site.centre');
        $isDrOfRegion = $user && $user->role === 'responsable_dr' && $plan->site && $plan->site->centre && $plan->site->centre->direction_id === $user->direction_id;
        
        if (!$user || ($user->role !== 'admin' && !$isDrOfRegion)) {
            abort(403, 'Seul l\'administrateur ou le DR de la région cible peut approuver ce plan.');
        }

        $validated = $request->validate([
            'status' => 'required|in:approuve,rejete',
            'rejection_reason' => 'nullable|string'
        ]);

        $plan->update([
            'status'            => $validated['status'],
            'validated_by'      => $user->id,
            'rejection_reason'  => $validated['status'] === 'approuve' ? null : ($validated['rejection_reason'] ?? null)
        ]);

        return response()->json($plan->load(['creator', 'validator']));
    }

    private function authorizePlanEdit(TrainingPlan $plan = null): void
    {
        $user = auth()->user();
        if (!$user) return;

        if ($plan && $user->role !== 'admin' && $plan->created_by !== $user->id) {
            abort(403, 'Vous ne pouvez modifier que les plans que vous avez créés.');
        }
    }
}
