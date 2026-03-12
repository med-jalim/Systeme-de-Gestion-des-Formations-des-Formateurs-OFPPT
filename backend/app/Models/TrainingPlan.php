<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TrainingPlan extends Model
{
    use HasFactory;

    protected $table = 'plan_formations';

    protected $fillable = [
        'formation_id',
        'site_id',
        'title',
        'status',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    // Relations
    public function formation()
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'plan_participants', 'plan_formation_id', 'utilisateur_id')
                    ->withTimestamps();
    }

    public function trainers()
    {
        return $this->belongsToMany(User::class, 'plan_formateurs', 'plan_formation_id', 'utilisateur_id')
                    ->withTimestamps();
    }

    public function themeAssignments()
    {
        return $this->hasMany(ThemeAssignment::class, 'plan_formation_id');
    }

    public function planAccommodations()
    {
        return $this->hasMany(PlanAccommodation::class, 'plan_formation_id');
    }

    public function trainingSessions()
    {
        return $this->hasMany(TrainingSession::class, 'training_plan_id');
    }
}
