<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Accommodation extends Model
{
    use HasFactory;

    protected $table = 'hebergements';

    protected $fillable = ['name', 'type', 'address', 'site_id'];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function planAccommodations()
    {
        return $this->hasMany(PlanAccommodation::class, 'hebergement_id');
    }
}
