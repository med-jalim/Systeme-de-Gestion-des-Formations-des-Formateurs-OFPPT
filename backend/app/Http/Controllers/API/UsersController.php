<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UsersController extends Controller
{
    public function index()
    {
        return response()->json(User::with(['centre', 'direction'])->get());
    }

    public function show(User $user)
    {
        return response()->json($user->load(['centre', 'direction']));
    }
}
