<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Site;
use App\Models\Centre;

class SiteFactory extends Factory
{
    protected $model = Site::class;

    public function definition(): array
    {
        return [
            'centre_id' => Centre::factory(),
            'name' => 'Site ' . $this->faker->word(),
            'address' => $this->faker->address(),
        ];
    }
}
