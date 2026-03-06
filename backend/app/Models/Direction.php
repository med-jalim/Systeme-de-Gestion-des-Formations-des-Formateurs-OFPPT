<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Direction extends Model
{
    use HasFactory;

    protected $table = 'directions';

    protected $fillable = ['code', 'name'];

    public function centres()
    {
        return $this->hasMany(Centre::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
