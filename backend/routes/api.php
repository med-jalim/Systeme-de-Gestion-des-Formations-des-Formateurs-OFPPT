<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\FormationsController;
use App\Http\Controllers\API\SitesController;
use App\Http\Controllers\API\TrainingPlansController;
use App\Http\Controllers\API\ThemeAssignmentsController;
use App\Http\Controllers\API\UsersController;
use App\Http\Controllers\API\ThemesController;
use App\Http\Controllers\API\AccommodationsController;
use App\Http\Controllers\API\TrainingSessionsController;
use App\Http\Controllers\API\AbsencesController;
use App\Http\Controllers\API\CentresController;
use App\Http\Controllers\API\DirectionsController;

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
    Route::apiResource('themes', ThemesController::class);
    
    // Sites
    Route::apiResource('sites', SitesController::class);
    
    // Accommodations
    Route::apiResource('accommodations', AccommodationsController::class);
    
    // Users
    Route::apiResource('users', UsersController::class);
    
    // Directions
    Route::apiResource('directions', DirectionsController::class);

    // Centres
    Route::apiResource('centres', CentresController::class);
    
    // Training Plans
    Route::apiResource('plans', TrainingPlansController::class);
    
    // Plan Assignments
    Route::post('plans/{plan}/theme-assignments', [ThemeAssignmentsController::class, 'store']);
    Route::get('plans/{plan}/theme-assignments', [ThemeAssignmentsController::class, 'index']);
    
    // Sessions
    Route::apiResource('sessions', TrainingSessionsController::class);
    
    // Absences
    Route::get('absences', [AbsencesController::class, 'index']);
    Route::post('absences/batch', [AbsencesController::class, 'batchUpdate']);
    
// });
