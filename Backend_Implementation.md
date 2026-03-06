# Training Management System (OFPPT) - Backend Implementation

Based on your domain overview and business rules, this document provides the architectural design, database schema, Eloquent models, validation rules, API controllers, routing, and testing strategies for a Laravel monolithic REST API.

## 1. Architectural Decisions & Design

### Authentication & Identification
- **Keycloak Integration**: The application acts as an OIDC Resource Server. The `User` model (`utilisateurs` table) will **not** store passwords. Instead, it maintains a unique `keycloak_id` (the `sub` claim from the JWT).
- **Sessionless API**: All requests to the backend will carry a Bearer JWT Token. Laravel will decode the JWT, verify its signature using Keycloak's public keys, and attach the corresponding `User` to the request.
- **Roles & Permissions**: Keycloak will manage roles (e.g., `admin`, `manager`, `trainer`, `participant`). During the request processing, roles can be injected from the Token to Laravel's gate mechanism.

### Domain Modeling Strategy
- **Language Convention**: To adhere to best practices while respecting the OFPPT nomenclature, the database tables use French names (e.g., `plan_formations`, `hebergements`). The Laravel PHP code (Models, Controllers, Requests, relations) uses English terminology to maintain standardization.
- **Aggregate Roots**: `TrainingPlan` (`plan_formations`) serves as an aggregate root for the training execution. Participants, trainers, accommodations, and theme assignments are inextricably linked to a specific Training Plan.
- **Theme Assignment Constraints**: Allocating themes to participants isn't globally inherited. The `affectation_themes` (`ThemeAssignment`) table explicitly intersects a Plan, a Theme, a Participant, and a Trainer.

---

## 2. Database Migrations

### 1. Organizational Structure & Users
```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('directions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('centres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('direction_id')->constrained('directions')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('centre_id')->nullable()->constrained('centres')->nullOnDelete();
            $table->string('name');
            $table->string('address')->nullable();
            $table->timestamps();
        });

        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id();
            $table->string('keycloak_id')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->foreignId('centre_id')->nullable()->constrained('centres')->nullOnDelete();
            $table->foreignId('direction_id')->nullable()->constrained('directions')->nullOnDelete();
            $table->timestamps();
        });
    }
};
```

### 2. Formations & Themes
```php
return new class extends Migration {
    public function up()
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
        });

        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
};
```

### 3. Plans, Participants, Trainers, Theme Assignments
```php
return new class extends Migration {
    public function up()
    {
        Schema::create('plan_formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('title')->nullable(); 
            $table->string('status')->default('draft');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
        });

        Schema::create('plan_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['plan_formation_id', 'utilisateur_id'], 'plan_participant_unique');
        });

        Schema::create('plan_formateurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['plan_formation_id', 'utilisateur_id'], 'plan_formateur_unique');
        });

        Schema::create('affectation_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('theme_id')->constrained('themes')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->foreignId('formateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->timestamps();
            
            // A participant cannot be assigned to the same theme twice in the same plan
            $table->unique(['plan_formation_id', 'theme_id', 'participant_id'], 'affectation_unique');
        });
    }
};
```

### 4. Accommodations
```php
return new class extends Migration {
    public function up()
    {
        Schema::create('hebergements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // hotel, resider, centre_interne
            $table->string('address')->nullable();
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('plan_hebergements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_formation_id')->constrained('plan_formations')->cascadeOnDelete();
            $table->foreignId('hebergement_id')->constrained('hebergements')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->timestamps();
        });
    }
};
```

---

## 3. Eloquent Models

### User (Maps to `utilisateurs`)
```php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $table = 'utilisateurs';
    protected $fillable = ['keycloak_id', 'first_name', 'last_name', 'email', 'centre_id', 'direction_id'];

    public function centre() { return $this->belongsTo(Centre::class); }
    public function direction() { return $this->belongsTo(Direction::class); }
}
```

### Formation & Theme
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    protected $table = 'formations';
    protected $fillable = ['title', 'description', 'start_date', 'end_date'];

    public function themes()
    {
        return $this->hasMany(Theme::class);
    }
}

class Theme extends Model
{
    protected $table = 'themes';
    protected $fillable = ['formation_id', 'title', 'description'];

    public function formation() { return $this->belongsTo(Formation::class); }
}
```

### TrainingPlan & Its Affiliates
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingPlan extends Model
{
    protected $table = 'plan_formations';
    protected $fillable = ['formation_id', 'site_id', 'title', 'status', 'start_date', 'end_date'];

    public function formation() { return $this->belongsTo(Formation::class, 'formation_id'); }
    public function site() { return $this->belongsTo(Site::class); }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'plan_participants', 'plan_formation_id', 'utilisateur_id')
                    ->withTimestamps();
    }

    public function trainers()
    {
        return $this->belongsToMany(User::class, 'plan_formateurs', 'plan_formation_id', 'utilisateur_id')
                    ->withTimestamps();
    }

    public function themeAssignments() { return $this->hasMany(ThemeAssignment::class, 'plan_formation_id'); }
    public function accommodations() { return $this->hasMany(PlanAccommodation::class, 'plan_formation_id'); }
}

class ThemeAssignment extends Model
{
    protected $table = 'affectation_themes';
    protected $fillable = ['plan_formation_id', 'theme_id', 'participant_id', 'formateur_id'];

    public function trainingPlan() { return $this->belongsTo(TrainingPlan::class, 'plan_formation_id'); }
    public function theme() { return $this->belongsTo(Theme::class); }
    public function participant() { return $this->belongsTo(User::class, 'participant_id'); }
    public function trainer() { return $this->belongsTo(User::class, 'formateur_id'); }
}

class PlanAccommodation extends Model
{
    protected $table = 'plan_hebergements';
    protected $fillable = ['plan_formation_id', 'hebergement_id', 'utilisateur_id', 'check_in_date', 'check_out_date'];

    public function trainingPlan() { return $this->belongsTo(TrainingPlan::class, 'plan_formation_id'); }
    public function accommodation() { return $this->belongsTo(Accommodation::class, 'hebergement_id'); }
    public function user() { return $this->belongsTo(User::class, 'utilisateur_id'); }
}
```

---

## 4. Validations & Controllers

### Controller: TrainingPlansController
```php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use Illuminate\Http\Request;

class TrainingPlansController extends Controller
{
    public function store(Request $request)
    {
        // Policy Check
        // $this->authorize('create', TrainingPlan::class);

        $validated = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'site_id'      => 'required|exists:sites,id',
            'title'        => 'nullable|string|max:255',
            'status'       => 'required|in:draft,active,completed,cancelled',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date|after_or_equal:start_date',
            'participants' => 'array',
            'participants.*' => 'exists:utilisateurs,id',
            'trainers'     => 'array',
            'trainers.*'   => 'exists:utilisateurs,id',
        ]);

        $plan = TrainingPlan::create($validated);

        if (!empty($validated['participants'])) {
            $plan->participants()->sync($validated['participants']);
        }
        
        if (!empty($validated['trainers'])) {
            $plan->trainers()->sync($validated['trainers']);
        }

        return response()->json($plan->load(['participants', 'trainers']), 201);
    }
}
```

### Controller: ThemeAssignmentsController
Validates and assigns specific themes (from the formation) to specific participants with specific trainers under a shared Plan.

```php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ThemeAssignmentsController extends Controller
{
    public function store(Request $request, TrainingPlan $plan)
    {
        $validated = $request->validate([
            'assignments' => 'required|array',
            'assignments.*.theme_id' => [
                'required', 
                Rule::exists('themes', 'id')->where('formation_id', $plan->formation_id) // MUST belong to the plan's formation
            ],
            'assignments.*.participant_id' => [
                'required',
                Rule::exists('plan_participants', 'utilisateur_id')->where('plan_formation_id', $plan->id) // MUST be in this plan
            ],
            'assignments.*.formateur_id' => [
                'required',
                Rule::exists('plan_formateurs', 'utilisateur_id')->where('plan_formation_id', $plan->id) // MUST be a trainer in this plan
            ],
        ]);

        $created = [];
        foreach ($validated['assignments'] as $assignment) {
            $created[] = $plan->themeAssignments()->updateOrCreate(
                [
                    'theme_id' => $assignment['theme_id'],
                    'participant_id' => $assignment['participant_id'],
                ],
                ['formateur_id' => $assignment['formateur_id']]
            );
        }

        return response()->json($created, 201);
    }
}
```

---

## 5. Policy Example

We map Keycloak roles to authorization capabilities. Example of checking if a user has administrative control over Training Plans:

```php
namespace App\Policies;

use App\Models\User;
use App\Models\TrainingPlan;

class TrainingPlanPolicy
{
    public function create(User $user)
    {
        // Assuming Keycloak roles were attached to the user or passed via headers/service container
        return $user->hasRole('admin') || $user->hasRole('manager');
    }

    public function update(User $user, TrainingPlan $plan)
    {
        // Direction managers can only mutate plans in their directions
        if ($user->hasRole('admin')) return true;
        
        // Custom logic to check plan site belonging to user's centre/direction
        return $plan->site->centre->direction_id === $user->direction_id;
    }
}
```

---

## 6. Routes (`routes/api.php`)

```php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\FormationsController;
use App\Http\Controllers\API\TrainingPlansController;
use App\Http\Controllers\API\ThemeAssignmentsController;

Route::middleware('auth:api')->group(function () {
    
    // Formations
    Route::apiResource('formations', FormationsController::class);
    
    // Training Plans
    Route::apiResource('plans', TrainingPlansController::class);
    
    // Plan Assignments
    Route::post('plans/{plan}/theme-assignments', [ThemeAssignmentsController::class, 'store']);
    Route::get('plans/{plan}/theme-assignments', [ThemeAssignmentsController::class, 'index']);
    
    // Accommodations
    // Route::apiResource('plans.accommodations', PlanAccommodationsController::class);
});
```

---

## 7. Testing Strategy

1. **Feature Tests (Endpoints):**
   - Mock the OIDC/Keycloak authentication middleware to act as a specific `User`. Use `actingAs($user)`.
   - Write tests simulating JSON Payloads pointing to API endpoints checking HTTP status codes (201, 403, 422).
   
2. **Domain/Validation Testing:**
   - E.g., Testing that providing a `theme_id` in `ThemeAssignmentController` which does *not* exist in the `Formation` triggers a 422 Unprocessable Entity constraint error.
   
3. **Database Consistency:**
   - Assert `DatabaseCount('plan_formations', 1)` after creation.
   - Test Cascade deletions (e.g., Deleting a Plan should automatically clear out its records in `affectation_themes`, `plan_participants`, etc.) using `$this->assertDatabaseMissing()`.

*Example PHPUnit/Pest Test:*
```php
public function test_assigns_theme_successfully_if_participant_and_theme_are_in_plan()
{
    $plan = TrainingPlan::factory()->create();
    $participant = User::factory()->create();
    $trainer = User::factory()->create();
    $theme = Theme::factory()->create(['formation_id' => $plan->formation_id]);
    
    $plan->participants()->attach($participant);
    $plan->trainers()->attach($trainer);
    
    $response = $this->actingAs($this->admin)->postJson("/api/plans/{$plan->id}/theme-assignments", [
        'assignments' => [
            [
                'theme_id' => $theme->id,
                'participant_id' => $participant->id,
                'formateur_id' => $trainer->id
            ]
        ]
    ]);
    
    $response->assertStatus(201);
    $this->assertDatabaseHas('affectation_themes', [
        'theme_id' => $theme->id,
        'participant_id' => $participant->id
    ]);
}
```
