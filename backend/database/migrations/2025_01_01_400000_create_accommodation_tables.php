<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates: hebergements, plan_hebergements
     */
    public function up(): void
    {
        Schema::create('hebergements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // hotel, resider, centre_interne
            $table->string('address')->nullable();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('plan_hebergements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('hebergement_id')->constrained('hebergements')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_hebergements');
        Schema::dropIfExists('hebergements');
    }
};
