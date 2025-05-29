<?php

namespace Tests\Feature;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Database\Seeders\PermissionsSeeder;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\postJson;
use function Pest\Laravel\getJson;
use function Pest\Laravel\putJson;
use function Pest\Laravel\deleteJson;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed the permissions (ensure PermissionsSeeder uses 'sanctum' guard)
    $this->seed(PermissionsSeeder::class);

    // Create an admin user
    $this->adminUser = User::factory()->create();

    // Assign 'admin' role (created by PermissionsSeeder with 'sanctum' guard) to the user
    $adminRole = Role::findByName('admin', 'sanctum');
    if (!$adminRole) {
        // Fallback or error if admin role not found, though seeder should create it
        throw new \Exception("Admin role not found for sanctum guard. Ensure PermissionsSeeder runs correctly and creates it.");
    }
    $this->adminUser->guard_name = 'sanctum'; // Set guard context for the user model instance
    $this->adminUser->assignRole($adminRole);

    // Authenticate user
    Sanctum::actingAs($this->adminUser, ['*']);
});

it('admin can create role with permissions', function () {
    $permissionsToAssign = ['view users', 'create users'];
    $roleData = [
        'name' => 'Test Role',
        'permissions' => $permissionsToAssign,
    ];

    $response = postJson('/api/roles', $roleData);

    $response->assertStatus(201)
        ->assertJsonFragment(['name' => 'Test Role']);

    assertDatabaseHas('roles', ['name' => 'Test Role', 'guard_name' => 'sanctum']);
    $createdRole = Role::findByName('Test Role', 'sanctum');

    expect($createdRole)->not->toBeNull();

    foreach ($permissionsToAssign as $permissionName) {
        expect($createdRole->hasPermissionTo($permissionName))->toBeTrue();
    }
});

it('admin can list roles', function () {
    Role::create(['name' => 'Role One', 'guard_name' => 'sanctum']);
    Role::create(['name' => 'Role Two', 'guard_name' => 'sanctum']);

    $response = getJson('/api/roles');

    // Expecting admin role (from seeder) + Role One + Role Two
    $response->assertStatus(200)
        ->assertJsonCount(3)
        ->assertJsonFragment(['name' => 'Role One'])
        ->assertJsonFragment(['name' => 'Role Two'])
        ->assertJsonFragment(['name' => 'admin']); // Admin role from seeder
});

it('admin can show role with permissions', function () {
    $permissionToAssign = Permission::where('name', 'edit users')->where('guard_name', 'sanctum')->first();
    if (!$permissionToAssign) {
        throw new \Exception("Permission 'edit users' for guard 'sanctum' not found.");
    }

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'sanctum']);
    $role->givePermissionTo($permissionToAssign);

    $response = getJson("/api/roles/{$role->id}");

    $response->assertStatus(200)
        ->assertJsonFragment(['name' => 'Editor'])
        ->assertJsonFragment(['name' => 'edit users']); // Check if permission is in response
});

it('admin can update role name and permissions', function () {
    $initialPermission = Permission::where('name', 'create users')->where('guard_name', 'sanctum')->first();
    if (!$initialPermission) {
        throw new \Exception("Permission 'create users' for guard 'sanctum' not found.");
    }
    $updatedPermissionsToAssignNames = ['edit users', 'delete users'];
    
    // Ensure these permissions exist for sanctum guard
    foreach($updatedPermissionsToAssignNames as $pName) {
        Permission::firstOrCreate(['name' => $pName, 'guard_name' => 'sanctum']);
    }


    $role = Role::create(['name' => 'Original Name', 'guard_name' => 'sanctum']);
    $role->givePermissionTo($initialPermission);


    $updatedRoleData = [
        'name' => 'Updated Name',
        'permissions' => $updatedPermissionsToAssignNames,
    ];

    $response = putJson("/api/roles/{$role->id}", $updatedRoleData);

    $response->assertStatus(200)
        ->assertJsonFragment(['name' => 'Updated Name']);

    assertDatabaseHas('roles', ['name' => 'Updated Name', 'guard_name' => 'sanctum']);
    assertDatabaseMissing('roles', ['name' => 'Original Name', 'guard_name' => 'sanctum']);

    $updatedRole = Role::findByName('Updated Name', 'sanctum');
    expect($updatedRole)->not->toBeNull();

    foreach ($updatedPermissionsToAssignNames as $permissionName) {
        expect($updatedRole->hasPermissionTo($permissionName))->toBeTrue();
    }
    expect($updatedRole->hasPermissionTo('create users'))->toBeFalse();
});

it('admin can delete role', function () {
    $role = Role::create(['name' => 'Role To Delete', 'guard_name' => 'sanctum']);

    $response = deleteJson("/api/roles/{$role->id}");

    $response->assertStatus(204);

    assertDatabaseMissing('roles', ['name' => 'Role To Delete', 'guard_name' => 'sanctum']);
});
