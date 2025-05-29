import React, { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '~/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Permission, Role } from '~/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useToast } from '~/components/ui/use-toast';

interface ShowPageProps {
    role: Role & { permissions: Permission[] }; // Role data with permissions passed from controller
}

const RolesShowPage: React.FC = () => {
    const { role } = usePage<ShowPageProps>().props;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { toast } = useToast();

    const handleDelete = () => {
        router.delete(route('roles.destroy', role.id), {
            onSuccess: () => {
                toast({ title: "Role Deleted", description: `Role "${role.name}" has been deleted.` });
                router.visit(route('roles.index')); // Redirect to index page after deletion
            },
            onError: (errors) => {
                toast({
                    title: "Error Deleting Role",
                    description: errors.message || `Failed to delete role "${role.name}".`,
                    variant: "destructive"
                });
                setShowDeleteDialog(false);
            },
        });
    };

    return (
        <AuthenticatedLayout title={`Role - ${role.name}`}>
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Role Details</h1>
                    <Button asChild variant="outline">
                        <Link href={route('roles.index')}>Back to Roles</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{role.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">Permissions:</h3>
                            {role.permissions && role.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.map((permission) => (
                                        <Badge key={permission.id} variant="secondary">
                                            {permission.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p>No permissions assigned to this role.</p>
                            )}
                        </div>
                        <div className="mt-6 flex space-x-2">
                            <Button asChild>
                                <Link href={route('roles.edit', role.id)}>Edit Role</Link>
                            </Button>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                                    Delete Role
                                </Button>
                            </AlertDialogTrigger>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the role
                            "{role?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
};

export default RolesShowPage;
