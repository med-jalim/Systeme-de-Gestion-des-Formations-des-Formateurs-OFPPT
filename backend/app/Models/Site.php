<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Site extends Model
{
    use HasFactory;

    protected $table = 'sites';

    protected $fillable = ['centre_id', 'name', 'address'];

    public function centre()
    {
        return $this->belongsTo(Centre::class);
    }

    public function trainingPlans()
    {
        return $this->hasMany(TrainingPlan::class);
    }

    public function accommodations()
    {
        return $this->hasMany(Accommodation::class);
    }
}
