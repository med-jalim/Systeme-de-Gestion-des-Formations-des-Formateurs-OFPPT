<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'utilisateurs';

    protected $fillable = [
        'keycloak_id',
        'first_name',
        'last_name',
        'email',
        'centre_id',
        'direction_id',
    ];

    protected $hidden = ['remember_token'];

    protected function casts(): array
    {
        return [];
    }

    // Relations
    public function centre()
    {
        return $this->belongsTo(Centre::class);
    }

    public function direction()
    {
        return $this->belongsTo(Direction::class);
    }

    public function trainingPlansAsParticipant()
    {
        return $this->belongsToMany(TrainingPlan::class, 'plan_participants', 'utilisateur_id', 'plan_formation_id')
                    ->withTimestamps();
    }

    public function trainingPlansAsTrainer()
    {
        return $this->belongsToMany(TrainingPlan::class, 'plan_formateurs', 'utilisateur_id', 'plan_formation_id')
                    ->withTimestamps();
    }
}
