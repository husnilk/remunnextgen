<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
        ];

        // Use 'sanctum' guard for API permissions
        $guardName = 'sanctum';

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => $guardName]);
        }

        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => $guardName]);
        // Ensure we fetch permissions for the correct guard before assigning
        $role->givePermissionTo(Permission::where('guard_name', $guardName)->get());
    }
}
