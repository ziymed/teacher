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
        Schema::table('programs', function (Blueprint $table) {
            $table->text('name')->change();
            $table->text('description')->change();
        });

        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->text('bio')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->string('name')->change();
            $table->text('description')->change();
        });

        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->text('bio')->change();
        });
    }
};
