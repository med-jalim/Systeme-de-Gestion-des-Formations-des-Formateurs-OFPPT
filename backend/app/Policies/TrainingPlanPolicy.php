<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TrainingPlan;

class TrainingPlanPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TrainingPlan $trainingPlan): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Assuming Keycloak roles were attached to the user or passed via headers/service container
        // For now, returning true to allow creation, can be restricted later based on roles
        // return $user->hasRole('admin') || $user->hasRole('manager');
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TrainingPlan $plan): bool
    {
        // Example logic:
        // if ($user->hasRole('admin')) return true;
        // return $plan->site->centre->direction_id === $user->direction_id;
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TrainingPlan $trainingPlan): bool
    {
        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TrainingPlan $trainingPlan): bool
    {
        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TrainingPlan $trainingPlan): bool
    {
        return true;
    }
}
