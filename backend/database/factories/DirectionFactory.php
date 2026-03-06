<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Direction;

class DirectionFactory extends Factory
{
    protected $model = Direction::class;

    public function definition(): array
    {
        return [
            'code' => 'DR' . $this->faker->unique()->numberBetween(10, 99),
            'name' => 'Direction Régionale ' . $this->faker->city(),
        ];
    }
}
