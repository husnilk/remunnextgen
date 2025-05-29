<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;

class RoleController extends Controller
{
    public function index()
    {
        return Role::all();
    }

    public function store(StoreRoleRequest $request)
    {
        $guardName = 'sanctum'; // Define the guard to use

        $role = Role::create(['name' => $request->name, 'guard_name' => $guardName]);

        // Ensure permissions are fetched for the correct guard
        $permissionsToSync = [];
        if ($request->has('permissions') && is_array($request->permissions)) {
            $permissionsToSync = Permission::where('guard_name', $guardName)
                                           ->whereIn('name', $request->permissions)
                                           ->get();
        }
        $role->syncPermissions($permissionsToSync);

        return $role->load('permissions');
    }

    public function show(Role $role)
    {
        // Ensure the role is loaded with permissions for the correct guard if not already.
        // This typically depends on how the route model binding is configured or if global scopes handle guards.
        // For explicit loading with guard context:
        // $role->load(['permissions' => fn($query) => $query->where('guard_name', $role->guard_name)]);
        return $role->load('permissions');
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $guardName = $role->guard_name; // Use the role's existing guard

        $role->update(['name' => $request->name]);

        $permissionsToSync = [];
        if ($request->has('permissions') && is_array($request->permissions)) {
            $permissionsToSync = Permission::where('guard_name', $guardName)
                                           ->whereIn('name', $request->permissions)
                                           ->get();
        }
        $role->syncPermissions($permissionsToSync);

        return $role->load('permissions');
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return response()->noContent();
    }
}
