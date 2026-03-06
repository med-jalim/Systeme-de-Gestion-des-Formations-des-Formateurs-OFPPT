<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\Request;

class ThemesController extends Controller
{
    public function index(Request $request)
    {
        $query = Theme::query()->with('formation');

        if ($request->has('formation_id')) {
            $query->where('formation_id', $request->formation_id);
        }

        return response()->json($query->get());
    }

    public function show(Theme $theme)
    {
        return response()->json($theme->load('formation'));
    }
}
