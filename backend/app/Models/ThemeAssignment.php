<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ThemeAssignment extends Model
{
    use HasFactory;

    protected $table = 'affectation_themes';

    protected $fillable = [
        'plan_formation_id',
        'theme_id',
        'participant_id',
        'formateur_id',
    ];

    public function trainingPlan()
    {
        return $this->belongsTo(TrainingPlan::class, 'plan_formation_id');
    }

    public function theme()
    {
        return $this->belongsTo(Theme::class);
    }

    public function participant()
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }
}
