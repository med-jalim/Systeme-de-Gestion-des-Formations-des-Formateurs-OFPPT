<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->string('matricule')->unique()->nullable()->after('keycloak_id');
            // The 6 roles: admin, responsable_cdc, responsable_formation, responsable_dr, formateur_animateur, formateur_participant
            $table->enum('role', [
                'admin', 
                'responsable_cdc', 
                'responsable_formation', 
                'responsable_dr', 
                'formateur_animateur', 
                'formateur_participant'
            ])->default('formateur_participant')->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn(['matricule', 'role']);
        });
    }
};
