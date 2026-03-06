<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Theme extends Model
{
    use HasFactory;

    protected $table = 'themes';

    protected $fillable = ['formation_id', 'title', 'description'];

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function themeAssignments()
    {
        return $this->hasMany(ThemeAssignment::class);
    }
}
