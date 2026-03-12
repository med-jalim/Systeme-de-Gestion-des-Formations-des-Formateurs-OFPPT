<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsencesController extends Controller
{
    public function index(Request $request)
    {
        $query = Absence::query()->with('participant');

        if ($request->has('session_id')) {
            $query->where('training_session_id', $request->session_id);
        }

        return response()->json($query->get());
    }

    public function batchUpdate(Request $request)
    {
        $validated = $request->validate([
            'training_session_id' => 'required|exists:training_sessions,id',
            'absences' => 'required|array',
            'absences.*.user_id' => 'required|exists:utilisateurs,id',
            'absences.*.status' => 'required|in:present,absent,late',
            'absences.*.minutes_late' => 'nullable|integer',
            'absences.*.is_justified' => 'nullable|boolean',
            'absences.*.justification_reason' => 'nullable|string',
        ]);

        foreach ($validated['absences'] as $absenceData) {
            Absence::updateOrCreate(
                [
                    'training_session_id' => $validated['training_session_id'],
                    'user_id' => $absenceData['user_id']
                ],
                $absenceData
            );
        }

        return response()->json(['message' => 'Absences updated successfully']);
    }
}
