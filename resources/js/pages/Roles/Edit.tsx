import React, { useEffect, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import RoleForm from '~/components/Roles/RoleForm';
import AuthenticatedLayout from '~/layouts/authenticated-layout';
import { Permission, Role } from '~/types';
import axios from 'axios';
import { useToast } from '~/components/ui/use-toast';

interface EditPageProps {
    role: Role; // Role data passed from controller
    // all_permissions: Permission[]; // All available permissions, could be passed from controller
}

const RolesEditPage: React.FC = () => {
    // Role data is expected to be passed by Inertia from the controller
    // If role.permissions is not populated, it means it wasn't eager loaded by the backend controller's show/edit method.
    // For this component, we assume `role` prop includes `role.permissions` (array of assigned Permission objects)
    const { role } = usePage<{ role: Role & { permissions: Permission[] } }>().props;
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const { toast } = useToast();

    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        permissions: role.permissions?.map(p => p.name) || [] as string[],
    });

    useEffect(() => {
        // Fetch all available permissions
        axios.get('/api/permissions')
            .then(response => {
                setAllPermissions(response.data);
            })
            .catch(error => {
                toast({
                    title: "Error Fetching Permissions",
                    description: error.message || "Could not load all permissions.",
                    variant: "destructive",
                });
                console.error("Error fetching all permissions:", error);
            });

        // Set form data when role prop changes (e.g., on initial load)
        // This ensures the form is populated with the role's current data
        setData({
            name: role.name,
            permissions: role.permissions?.map(p => p.name) || [],
        });
    }, [role, setData, toast]); // Added setData and toast to dependency array


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('roles.update', role.id), { // Using named API route
            onSuccess: () => {
                toast({ title: "Role Updated", description: `Role "${data.name}" has been updated successfully.` });
                router.visit(route('roles.index'));
            },
            onError: (formErrors) => {
                if (formErrors.name || formErrors.permissions) {
                    // Errors are handled by the form component via props.errors
                } else {
                     const generalError = Object.values(formErrors).join(', ') || "An unexpected error occurred.";
                    toast({
                        title: "Error Updating Role",
                        description: generalError,
                        variant: "destructive",
                    });
                }
            },
        });
    };

    return (
        <AuthenticatedLayout title={`Edit Role - ${role.name}`}>
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-semibold mb-6">Edit Role: {role.name}</h1>
                <RoleForm
                    allPermissions={allPermissions}
                    formData={data}
                    setFormData={setData}
                    onSubmit={handleSubmit}
                    processing={processing}
                    errors={errors} // Pass Inertia errors to the form
                    submitButtonText="Update Role"
                    isEditing={true}
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default RolesEditPage;
