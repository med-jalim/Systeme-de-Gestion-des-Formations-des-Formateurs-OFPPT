<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $fillable = [
        'training_session_id',
        'user_id',
        'status',
        'minutes_late',
        'is_justified',
        'justification_reason',
    ];

    public function session()
    {
        return $this->belongsTo(TrainingSession::class, 'training_session_id');
    }

    public function participant()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
