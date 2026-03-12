<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingSession extends Model
{
    protected $table = 'training_sessions';

    protected $fillable = [
        'training_plan_id',
        'theme_id',
        'trainer_id',
        'date',
        'start_time',
        'end_time',
        'type',
        'remote_link',
    ];

    public function trainingPlan()
    {
        return $this->belongsTo(TrainingPlan::class, 'training_plan_id');
    }

    public function theme()
    {
        return $this->belongsTo(Theme::class);
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function absences()
    {
        return $this->hasMany(Absence::class, 'training_session_id');
    }
}
