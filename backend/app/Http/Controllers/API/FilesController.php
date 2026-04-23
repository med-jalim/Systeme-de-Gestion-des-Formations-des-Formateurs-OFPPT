<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FilesController extends Controller
{
    private const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    /**
     * List files for a given entity.
     * GET /api/files?entity_type=formation&entity_id=1
     */
    public function index(Request $request)
    {
        $request->validate([
            'entity_type' => 'required|in:formation,theme,plan,user',
            'entity_id'   => 'required|integer',
        ]);

        $files = File::where('entity_type', $request->entity_type)
            ->where('entity_id', $request->entity_id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($files);
    }

    /**
     * Upload a file to R2 and store metadata.
     * POST /api/files (multipart/form-data)
     */
    public function store(Request $request)
    {
        $request->validate([
            'entity_type' => 'required|in:formation,theme,plan,user',
            'entity_id'   => 'required|integer',
            'file'        => 'required|file|max:20480', // 20 MB max
            'name'        => 'nullable|string|max:255',
        ]);

        $uploadedFile = $request->file('file');

        if (!in_array($uploadedFile->getMimeType(), self::ALLOWED_TYPES)) {
            return response()->json([
                'message' => 'Type de fichier non autorisé. Types acceptés: PDF, Word, PowerPoint, Excel, Images.'
            ], 422);
        }

        // Build unique key: documents/{entity_type}/{entity_id}/{uuid}.{ext}
        $ext = $uploadedFile->getClientOriginalExtension();
        $key = "documents/{$request->entity_type}/{$request->entity_id}/" . Str::uuid() . ".{$ext}";

        // If entity_type is 'user', we must delete the old avatar(s) to avoid orphans
        if ($request->entity_type === 'user') {
            $oldFiles = File::where('entity_type', 'user')
                            ->where('entity_id', $request->entity_id)
                            ->get();
            foreach ($oldFiles as $oldFile) {
                Storage::disk('r2')->delete($oldFile->file_key);
                $oldFile->delete();
            }
        }

        // Upload to R2
        Storage::disk('r2')->put(
            $key,
            file_get_contents($uploadedFile->getRealPath()),
            ['ContentType' => $uploadedFile->getMimeType()]
        );

        $file = File::create([
            'entity_type'   => $request->entity_type,
            'entity_id'     => (int) $request->entity_id,
            'name'          => $request->name ?: pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME),
            'original_name' => $uploadedFile->getClientOriginalName(),
            'file_key'      => $key,
            'file_type'     => $uploadedFile->getMimeType(),
            'file_size'     => $uploadedFile->getSize(),
            'uploaded_by'   => null, // Set to authenticated user once Keycloak is integrated
        ]);

        return response()->json($file, 201);
    }

    /**
     * Redirect to a temporary signed URL for download.
     * GET /api/files/{file}/download
     */
    public function download(File $file)
    {
        $url = Storage::disk('r2')->temporaryUrl($file->file_key, now()->addMinutes(15));
        return redirect($url);
    }

    /**
     * Delete a file from R2 and the DB.
     * DELETE /api/files/{file}
     */
    public function destroy(File $file)
    {
        Storage::disk('r2')->delete($file->file_key);
        $file->delete();
        return response()->noContent();
    }
}
