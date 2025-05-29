import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import RoleForm from '~/components/Roles/RoleForm';
import AuthenticatedLayout from '~/layouts/authenticated-layout';
import { Permission } from '~/types';
import axios from 'axios';
import { useToast } from '~/components/ui/use-toast';

const RolesCreatePage: React.FC = () => {
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const { toast } = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as string[], // Selected permission names
    });

    useEffect(() => {
        axios.get('/api/permissions')
            .then(response => {
                setAllPermissions(response.data);
            })
            .catch(error => {
                toast({
                    title: "Error Fetching Permissions",
                    description: error.message || "Could not load permissions.",
                    variant: "destructive",
                });
                console.error("Error fetching permissions:", error);
            });
    }, [toast]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('roles.store'), { // Using named route for API endpoint
            onSuccess: () => {
                toast({ title: "Role Created", description: `Role "${data.name}" has been created successfully.` });
                reset(); // Reset form fields
                router.visit(route('roles.index')); // Redirect to roles index page
            },
            onError: (formErrors) => {
                 if (formErrors.name || formErrors.permissions) {
                    // Errors are handled by the form component via props.errors
                } else {
                    const generalError = Object.values(formErrors).join(', ') || "An unexpected error occurred.";
                    toast({
                        title: "Error Creating Role",
                        description: generalError,
                        variant: "destructive",
                    });
                }
            },
        });
    };

    return (
        <AuthenticatedLayout title="Create Role">
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-semibold mb-6">Create New Role</h1>
                <RoleForm
                    allPermissions={allPermissions}
                    formData={data}
                    setFormData={setData}
                    onSubmit={handleSubmit}
                    processing={processing}
                    errors={errors} // Pass Inertia errors to the form
                    submitButtonText="Create Role"
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default RolesCreatePage;
