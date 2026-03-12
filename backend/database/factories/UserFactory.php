<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Centre;
use App\Models\Direction;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'keycloak_id'  => Str::uuid()->toString(),
            'matricule'    => 'M-' . strtoupper(Str::random(6)),
            'first_name'   => $this->faker->firstName(),
            'last_name'    => $this->faker->lastName(),
            'email'        => $this->faker->unique()->safeEmail(),
            'role'         => User::ROLE_FORMATEUR_PARTICIPANT,
            'centre_id'    => Centre::factory(),
            'direction_id' => Direction::factory(),
        ];
    }
}
