<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Direction;
use App\Models\Centre;
use App\Models\Site;
use App\Models\User;
use App\Models\Formation;
use App\Models\Theme;
use App\Models\Accommodation;
use App\Models\TrainingPlan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Organizational Structure
        $directions = Direction::factory(3)->create();
        
        $centres = collect();
        foreach ($directions as $direction) {
            $centres = $centres->concat(Centre::factory(2)->create(['direction_id' => $direction->id]));
        }

        $sites = collect();
        foreach ($centres as $centre) {
            $sites = $sites->concat(Site::factory(2)->create(['centre_id' => $centre->id]));
        }

        // 2. Create Accommodations for Sites
        foreach ($sites as $site) {
            Accommodation::factory(2)->create(['site_id' => $site->id]);
        }

        // 3. Create Users (Administrators, Managers, Trainers, and Participants)
        User::factory()->create(['role' => User::ROLE_ADMIN, 'email' => 'admin@ofppt.ma']);
        User::factory()->create(['role' => User::ROLE_RESPONSABLE_CDC, 'email' => 'cdc@ofppt.ma']);
        User::factory()->create(['role' => User::ROLE_RESPONSABLE_FORMATION, 'email' => 'formation@ofppt.ma']);
        User::factory()->create(['role' => User::ROLE_RESPONSABLE_DR, 'email' => 'dr@ofppt.ma']);

        $trainers = User::factory(10)->create([
            'role'         => User::ROLE_FORMATEUR_ANIMATEUR,
            'direction_id' => $directions->random()->id,
            'centre_id'    => $centres->random()->id,
        ]);

        $participants = User::factory(30)->create([
            'role'         => User::ROLE_FORMATEUR_PARTICIPANT,
            'direction_id' => $directions->random()->id,
            'centre_id'    => $centres->random()->id,
        ]);

        // 4. Create Formations and Themes
        $formations = Formation::factory(5)->create();
        
        foreach ($formations as $formation) {
            Theme::factory(3)->create(['formation_id' => $formation->id]);
        }

        // 5. Create Training Plans linking everything
        foreach ($formations as $formation) {
            $site = $sites->random();
            $planStart = $this->faker_date_between($formation->start_date, $formation->end_date);
            $planEnd = $this->faker_date_between($planStart, $formation->end_date);

            $plan = TrainingPlan::create([
                'formation_id' => $formation->id,
                'site_id'      => $site->id,
                'title'        => 'Session pour ' . $formation->title,
                'status'       => 'active',
                'start_date'   => $planStart,
                'end_date'     => $planEnd,
            ]);

            // Assign Trainers and Participants
            $planTrainers = $trainers->random(2);
            $planParticipants = $participants->random(10);

            $plan->trainers()->attach($planTrainers->pluck('id'));
            $plan->participants()->attach($planParticipants->pluck('id'));

            // Assign Themes
            $themes = $formation->themes;
            foreach ($planParticipants as $participant) {
                // Assign each participant 1-2 themes randomly
                $participantThemes = $themes->random(random_int(1, 2));
                
                foreach ($participantThemes as $theme) {
                    $plan->themeAssignments()->create([
                        'theme_id' => $theme->id,
                        'participant_id' => $participant->id,
                        'formateur_id' => $planTrainers->random()->id,
                    ]);
                }
            }

            // Assign Accommodations
            $siteAccommodations = $site->accommodations;
            if ($siteAccommodations->isNotEmpty()) {
                foreach ($planParticipants as $participant) {
                    $plan->planAccommodations()->create([
                        'hebergement_id' => $siteAccommodations->random()->id,
                        'utilisateur_id' => $participant->id,
                        'check_in_date'  => $planStart,
                        'check_out_date' => $planEnd,
                    ]);
                }
            }
        }
    }

    private function faker_date_between($startDate, $endDate)
    {
        $start = strtotime($startDate);
        $end = strtotime($endDate);
        return date('Y-m-d', mt_rand($start, $end));
    }
}
