<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates: plan_formations, plan_participants, plan_formateurs, affectation_themes
     */
    public function up(): void
    {
        Schema::create('plan_formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('title')->nullable();
            $table->string('status')->default('draft'); // draft, active, completed, cancelled
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
        });

        Schema::create('plan_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['plan_formation_id', 'utilisateur_id'], 'plan_participant_unique');
        });

        Schema::create('plan_formateurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['plan_formation_id', 'utilisateur_id'], 'plan_formateur_unique');
        });

        Schema::create('affectation_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('theme_id')->constrained('themes')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->foreignId('formateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->timestamps();

            // A participant cannot be assigned to the same theme twice in the same plan
            $table->unique(['plan_formation_id', 'theme_id', 'participant_id'], 'affectation_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affectation_themes');
        Schema::dropIfExists('plan_formateurs');
        Schema::dropIfExists('plan_participants');
        Schema::dropIfExists('plan_formations');
    }
};
