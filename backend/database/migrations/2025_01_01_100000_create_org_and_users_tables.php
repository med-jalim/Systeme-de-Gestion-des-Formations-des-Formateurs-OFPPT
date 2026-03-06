<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates: directions, centres, sites, utilisateurs
     */
    public function up(): void
    {
        Schema::create('directions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('centres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('direction_id')->constrained('directions')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('centre_id')->nullable()->constrained('centres')->nullOnDelete();
            $table->string('name');
            $table->string('address')->nullable();
            $table->timestamps();
        });

        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id();
            $table->string('keycloak_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->foreignId('centre_id')->nullable()->constrained('centres')->nullOnDelete();
            $table->foreignId('direction_id')->nullable()->constrained('directions')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
        Schema::dropIfExists('sites');
        Schema::dropIfExists('centres');
        Schema::dropIfExists('directions');
    }
};
