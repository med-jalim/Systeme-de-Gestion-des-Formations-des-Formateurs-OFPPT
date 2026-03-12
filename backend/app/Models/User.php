<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    const ROLE_ADMIN = 'admin';
    const ROLE_RESPONSABLE_CDC = 'responsable_cdc';
    const ROLE_RESPONSABLE_FORMATION = 'responsable_formation';
    const ROLE_RESPONSABLE_DR = 'responsable_dr';
    const ROLE_FORMATEUR_ANIMATEUR = 'formateur_animateur';
    const ROLE_FORMATEUR_PARTICIPANT = 'formateur_participant';

    use HasFactory, Notifiable;

    protected $table = 'utilisateurs';

    protected $fillable = [
        'keycloak_id',
        'matricule',
        'first_name',
        'last_name',
        'email',
        'role',
        'centre_id',
        'direction_id',
    ];

    protected $hidden = ['remember_token'];

    protected function casts(): array
    {
        return [];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isResponsableCdc(): bool
    {
        return $this->role === self::ROLE_RESPONSABLE_CDC;
    }

    public function isResponsableFormation(): bool
    {
        return $this->role === self::ROLE_RESPONSABLE_FORMATION;
    }

    public function isResponsableDr(): bool
    {
        return $this->role === self::ROLE_RESPONSABLE_DR;
    }

    public function isFormateurAnimateur(): bool
    {
        return $this->role === self::ROLE_FORMATEUR_ANIMATEUR;
    }

    public function isFormateurParticipant(): bool
    {
        return $this->role === self::ROLE_FORMATEUR_PARTICIPANT;
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
