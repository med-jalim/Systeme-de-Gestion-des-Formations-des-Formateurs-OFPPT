<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ThemeAssignmentsController extends Controller
{
    public function index(TrainingPlan $plan)
    {
        return response()->json($plan->themeAssignments()->with(['theme', 'participant', 'trainer'])->get());
    }

    public function store(Request $request, TrainingPlan $plan)
    {
        $validated = $request->validate([
            'assignments' => 'required|array',
            'assignments.*.theme_id' => [
                'required', 
                Rule::exists('themes', 'id')->where('formation_id', $plan->formation_id) // MUST belong to the plan's formation
            ],
            'assignments.*.participant_id' => [
                'required',
                Rule::exists('plan_participants', 'utilisateur_id')->where('plan_formation_id', $plan->id) // MUST be in this plan
            ],
            'assignments.*.formateur_id' => [
                'required',
                Rule::exists('plan_formateurs', 'utilisateur_id')->where('plan_formation_id', $plan->id) // MUST be a trainer in this plan
            ],
        ]);

        $created = [];
        foreach ($validated['assignments'] as $assignment) {
            $created[] = $plan->themeAssignments()->updateOrCreate(
                [
                    'theme_id' => $assignment['theme_id'],
                    'participant_id' => $assignment['participant_id'],
                ],
                ['formateur_id' => $assignment['formateur_id']]
            );
        }

        return response()->json($created, 201);
    }
}
