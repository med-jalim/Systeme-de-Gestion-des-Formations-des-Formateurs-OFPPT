<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    protected $table = 'files';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'name',
        'original_name',
        'file_key',
        'file_type',
        'file_size',
        'uploaded_by',
    ];

    protected $appends = ['url'];

    /**
     * Generate a temporary signed URL (valid 60 min) for the file in R2.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('r2')->temporaryUrl($this->file_key, now()->addMinutes(60));
    }

    /**
     * Human-readable file size.
     */
    public function getHumanSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes < 1024)       return "{$bytes} B";
        if ($bytes < 1048576)    return round($bytes / 1024, 1) . " KB";
        return round($bytes / 1048576, 1) . " MB";
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
