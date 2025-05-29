import React from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox'; // Assuming you have a Checkbox component
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Permission } from '~/types'; // Assuming a Permission type

interface RoleFormData {
    name: string;
    permissions: string[]; // Array of selected permission names
}

interface RoleFormProps {
    allPermissions: Permission[];
    formData: RoleFormData;
    setFormData: (data: RoleFormData | ((prevData: RoleFormData) => RoleFormData)) => void;
    onSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    errors: Partial<Record<keyof RoleFormData, string>>;
    submitButtonText?: string;
    isEditing?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
    allPermissions,
    formData,
    setFormData,
    onSubmit,
    processing,
    errors,
    submitButtonText = 'Submit',
    isEditing = false,
}) => {
    const handlePermissionChange = (permissionName: string, checked: boolean | string) => {
        let selectedPermissions = [...formData.permissions];
        if (checked) {
            if (!selectedPermissions.includes(permissionName)) {
                selectedPermissions.push(permissionName);
            }
        } else {
            selectedPermissions = selectedPermissions.filter(p => p !== permissionName);
        }
        setFormData(prev => ({ ...prev, permissions: selectedPermissions }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? 'Edit Role' : 'Create Role'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 p-4 border rounded-md max-h-96 overflow-y-auto">
                            {allPermissions && allPermissions.length > 0 ? (
                                allPermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`permission-${permission.id}`}
                                            checked={formData.permissions.includes(permission.name)}
                                            onCheckedChange={(checked) => handlePermissionChange(permission.name, checked)}
                                        />
                                        <Label htmlFor={`permission-${permission.id}`} className="font-normal">
                                            {permission.name}
                                        </Label>
                                    </div>
                                ))
                            ) : (
                                <p>No permissions available.</p>
                            )}
                        </div>
                        {errors.permissions && <p className="text-sm text-red-500 mt-1">{errors.permissions}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Processing...' : submitButtonText}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default RoleForm;
