<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Centre extends Model
{
    use HasFactory;

    protected $table = 'centres';

    protected $fillable = ['direction_id', 'code', 'name'];

    public function direction()
    {
        return $this->belongsTo(Direction::class);
    }

    public function sites()
    {
        return $this->hasMany(Site::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
