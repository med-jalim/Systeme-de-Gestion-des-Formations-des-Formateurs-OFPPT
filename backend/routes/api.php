<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\FormationsController;
use App\Http\Controllers\API\SitesController;
use App\Http\Controllers\API\TrainingPlansController;
use App\Http\Controllers\API\ThemeAssignmentsController;
use App\Http\Controllers\API\UsersController;
use App\Http\Controllers\API\ThemesController;
use App\Http\Controllers\API\AccommodationsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// TODO: Replace with custom Keycloak middleware once Keycloak is integrated
// Route::middleware('auth:api')->group(function () {
    
    // Formations
    Route::apiResource('formations', FormationsController::class);
    
    // Themes
    Route::get('themes', [ThemesController::class, 'index']);
    Route::get('themes/{theme}', [ThemesController::class, 'show']);
    
    // Sites
    Route::apiResource('sites', SitesController::class);
    
    // Accommodations
    Route::get('accommodations', [AccommodationsController::class, 'index']);
    Route::get('accommodations/{accommodation}', [AccommodationsController::class, 'show']);
    
    // Users
    Route::get('users', [UsersController::class, 'index']);
    Route::get('users/{user}', [UsersController::class, 'show']);
    
    // Training Plans
    Route::apiResource('plans', TrainingPlansController::class);
    
    // Plan Assignments
    Route::post('plans/{plan}/theme-assignments', [ThemeAssignmentsController::class, 'store']);
    Route::get('plans/{plan}/theme-assignments', [ThemeAssignmentsController::class, 'index']);
    
// });
