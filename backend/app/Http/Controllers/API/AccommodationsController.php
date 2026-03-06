<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;

class AccommodationsController extends Controller
{
    public function index()
    {
        return response()->json(Accommodation::with('site')->get());
    }

    public function show(Accommodation $accommodation)
    {
        return response()->json($accommodation->load('site'));
    }
}
