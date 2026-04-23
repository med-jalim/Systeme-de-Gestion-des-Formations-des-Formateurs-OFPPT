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
        Schema::table('plan_formations', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable();
            $table->enum('validation_status', ['en_attente', 'approuve', 'rejete'])->default('en_attente');
            $table->unsignedBigInteger('validated_by')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->foreign('created_by')->references('id')->on('utilisateurs')->nullOnDelete();
            $table->foreign('validated_by')->references('id')->on('utilisateurs')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_formations', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['validated_by']);
            $table->dropColumn(['created_by', 'validation_status', 'validated_by', 'rejection_reason']);
        });
    }
};
