<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlanAccommodation extends Model
{
    use HasFactory;

    protected $table = 'plan_hebergements';

    protected $fillable = [
        'plan_formation_id',
        'hebergement_id',
        'utilisateur_id',
        'check_in_date',
        'check_out_date',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date'  => 'date',
            'check_out_date' => 'date',
        ];
    }

    public function trainingPlan()
    {
        return $this->belongsTo(TrainingPlan::class, 'plan_formation_id');
    }

    public function accommodation()
    {
        return $this->belongsTo(Accommodation::class, 'hebergement_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}
