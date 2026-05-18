<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->string('password')->after('email')->nullable();
            $table->rememberToken()->after('password');
            $table->string('keycloak_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn(['password', 'remember_token']);
            $table->string('keycloak_id')->nullable(false)->change();
        });
    }
};
