<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Accommodation;
use App\Models\Site;

class AccommodationFactory extends Factory
{
    protected $model = Accommodation::class;

    public function definition(): array
    {
        $types = ['hotel', 'resider', 'centre_interne'];

        return [
            'name' => 'Hébergement ' . $this->faker->company(),
            'type' => $this->faker->randomElement($types),
            'address' => $this->faker->address(),
            'site_id' => Site::factory(),
        ];
    }
}
