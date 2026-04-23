<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type');          // 'formation' | 'theme' | 'plan'
            $table->unsignedBigInteger('entity_id');
            $table->string('name');                 // Display name
            $table->string('original_name');        // Original filename
            $table->string('file_key')->unique();   // R2 object key
            $table->string('file_type');            // MIME type
            $table->unsignedBigInteger('file_size');// Bytes
            $table->foreignId('uploaded_by')
                  ->nullable()
                  ->constrained('utilisateurs')
                  ->nullOnDelete();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
