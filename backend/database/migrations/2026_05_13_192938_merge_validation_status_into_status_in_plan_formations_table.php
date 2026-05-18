<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Migrate data
        DB::table('plan_formations')
            ->whereIn('validation_status', ['en_attente', 'approuve', 'rejete'])
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->update([
                'status' => DB::raw('validation_status')
            ]);
            
        // 2. Drop the column
        Schema::table('plan_formations', function (Blueprint $table) {
            $table->dropColumn('validation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_formations', function (Blueprint $table) {
            $table->enum('validation_status', ['en_attente', 'approuve', 'rejete'])->default('en_attente');
        });

        // Try to reverse the data
        DB::table('plan_formations')
            ->whereIn('status', ['en_attente', 'approuve', 'rejete'])
            ->update([
                'validation_status' => DB::raw('status'),
                'status' => 'draft' // fallback
            ]);
    }
};
