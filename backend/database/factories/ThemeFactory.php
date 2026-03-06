<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Theme;
use App\Models\Formation;

class ThemeFactory extends Factory
{
    protected $model = Theme::class;

    public function definition(): array
    {
        return [
            'formation_id' => Formation::factory(),
            'title' => 'Thème: ' . $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
        ];
    }
}
