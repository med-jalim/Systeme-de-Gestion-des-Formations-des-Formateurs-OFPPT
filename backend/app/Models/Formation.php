<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Formation extends Model
{
    use HasFactory;

    protected $table = 'formations';

    protected $fillable = ['title', 'description', 'start_date', 'end_date'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    public function themes()
    {
        return $this->hasMany(Theme::class);
    }

    public function trainingPlans()
    {
        return $this->hasMany(TrainingPlan::class);
    }
}
