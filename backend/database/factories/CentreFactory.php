<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Centre;
use App\Models\Direction;

class CentreFactory extends Factory
{
    protected $model = Centre::class;

    public function definition(): array
    {
        return [
            'direction_id' => Direction::factory(),
            'code' => 'CF' . $this->faker->unique()->numberBetween(100, 999),
            'name' => 'Centre de Formation ' . $this->faker->city(),
        ];
    }
}
