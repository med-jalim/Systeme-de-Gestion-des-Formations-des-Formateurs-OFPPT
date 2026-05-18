<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use App\Models\User;
use App\Models\Formation;
use App\Models\TrainingSession;
use App\Models\Absence;
use App\Models\Site;
use App\Models\Accommodation;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isDR = $user && $user->role === 'responsable_dr';
        $directionId = $user ? $user->direction_id : null;
        
        $isCDC = $user && $user->role === 'responsable_cdc';
        $centreId = $user ? $user->centre_id : null;

        $planBaseQuery = TrainingPlan::query();
        $userBaseQuery = User::query();
        $sessionBaseQuery = TrainingSession::query();
        $absenceBaseQuery = Absence::query();
        $siteBaseQuery = Site::query();
        $accBaseQuery = Accommodation::query();

        if ($isDR && $directionId) {
            $planBaseQuery->whereHas('site.centre', fn($q) => $q->where('direction_id', $directionId));
            $userBaseQuery->where('direction_id', $directionId);
            $sessionBaseQuery->whereHas('trainingPlan.site.centre', fn($q) => $q->where('direction_id', $directionId));
            $absenceBaseQuery->whereHas('session.trainingPlan.site.centre', fn($q) => $q->where('direction_id', $directionId));
            $siteBaseQuery->whereHas('centre', fn($q) => $q->where('direction_id', $directionId));
            $accBaseQuery->whereHas('site.centre', fn($q) => $q->where('direction_id', $directionId));
        } elseif ($isCDC && $centreId) {
            $planBaseQuery->whereHas('site', fn($q) => $q->where('centre_id', $centreId));
            $userBaseQuery->where('centre_id', $centreId);
            $sessionBaseQuery->whereHas('trainingPlan.site', fn($q) => $q->where('centre_id', $centreId));
            $absenceBaseQuery->whereHas('session.trainingPlan.site', fn($q) => $q->where('centre_id', $centreId));
            $siteBaseQuery->where('centre_id', $centreId);
            $accBaseQuery->whereHas('site', fn($q) => $q->where('centre_id', $centreId));
        }

        // ── Key Metrics ──────────────────────────────────────────────
        $totalPlans     = (clone $planBaseQuery)->count();
        $activePlans    = (clone $planBaseQuery)->where('status', 'en_cours')->count();
        $plannedPlans   = (clone $planBaseQuery)->where('status', 'planifie')->count();
        $completedPlans = (clone $planBaseQuery)->where('status', 'termine')->count();

        $totalUsers        = (clone $userBaseQuery)->count();
        $totalFormateurs   = (clone $userBaseQuery)->whereIn('role', ['formateur_animateur', 'formateur_participant'])->count();
        $totalParticipants = (clone $userBaseQuery)->where('role', 'formateur_participant')->count();

        $totalFormations = Formation::count(); // Global catalog
        $totalSessions   = (clone $sessionBaseQuery)->count();
        $totalSites      = (clone $siteBaseQuery)->count();
        $totalAccommodations = (clone $accBaseQuery)->count();

        // ── Absence Stats ─────────────────────────────────────────────
        $totalAbsences   = (clone $absenceBaseQuery)->where('status', 'absent')->count();
        $totalLate       = (clone $absenceBaseQuery)->where('status', 'late')->count();
        $totalPresences  = (clone $absenceBaseQuery)->where('status', 'present')->count();
        $totalAttendance = $totalAbsences + $totalLate + $totalPresences;
        $attendanceRate  = $totalAttendance > 0
            ? round(($totalPresences / $totalAttendance) * 100, 1)
            : null;

        // ── Plans by Status (for chart) ───────────────────────────────
        $plansByStatus = (clone $planBaseQuery)->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($r) => ['status' => $r->status, 'count' => $r->count]);

        // ── Plans by Site (top 5) ─────────────────────────────────────
        $plansBySite = (clone $planBaseQuery)->select('site_id', DB::raw('count(*) as count'))
            ->with('site:id,name')
            ->groupBy('site_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'site'  => $r->site?->name ?? 'Non défini',
                'count' => $r->count,
            ]);

        // ── Users by Role (for chart) ─────────────────────────────────
        $usersByRole = (clone $userBaseQuery)->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get()
            ->map(fn($r) => ['role' => $r->role, 'count' => $r->count]);

        // ── Recent Plans (last 5) ─────────────────────────────────────
        $recentPlans = (clone $planBaseQuery)->with('site:id,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'title', 'status', 'start_date', 'end_date', 'site_id', 'created_at']);

        // ── Sessions per Month (last 6 months) ────────────────────────
        $sessionsPerMonth = (clone $sessionBaseQuery)->select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
                DB::raw('count(*) as count')
            )
            ->where('date', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'metrics' => [
                'total_plans'        => $totalPlans,
                'active_plans'       => $activePlans,
                'planned_plans'      => $plannedPlans,
                'completed_plans'    => $completedPlans,
                'total_users'        => $totalUsers,
                'total_formateurs'   => $totalFormateurs,
                'total_participants' => $totalParticipants,
                'total_formations'   => $totalFormations,
                'total_sessions'     => $totalSessions,
                'total_sites'        => $totalSites,
                'total_accommodations' => $totalAccommodations,
                'total_absences'     => $totalAbsences,
                'total_late'         => $totalLate,
                'attendance_rate'    => $attendanceRate,
            ],
            'plans_by_status'   => $plansByStatus,
            'plans_by_site'     => $plansBySite,
            'users_by_role'     => $usersByRole,
            'recent_plans'      => $recentPlans,
            'sessions_per_month' => $sessionsPerMonth,
        ]);
    }
}
