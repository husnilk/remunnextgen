import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import AuthenticatedLayout from '~/layouts/authenticated-layout';
import { Role } from '~/types';
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
import { useToast } from '~/components/ui/use-toast'; // Assuming toast is configured

// interface IndexPageProps { // Replaced by usePage hook with generic type
//     roles: Role[];
// }

const RolesIndexPage: React.FC = () => {
    const { roles, errors: pageErrors } = usePage<{ roles: Role[], errors: any }>().props;
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const { toast } = useToast(); // Assuming useToast is available

    const handleDelete = () => {
        if (roleToDelete) {
            router.delete(`/api/roles/${roleToDelete.id}`, {
                onSuccess: () => {
                    toast({ title: "Role Deleted", description: `Role "${roleToDelete.name}" has been deleted.` });
                    setRoleToDelete(null);
                    // Optionally, force a reload or rely on Inertia's partial reload if roles prop updates
                    router.reload({ only: ['roles'] });
                },
                onError: (errors) => {
                    toast({
                        title: "Error Deleting Role",
                        description: errors.message || `Failed to delete role "${roleToDelete.name}".`,
                        variant: "destructive"
                    });
                    setRoleToDelete(null);
                },
            });
        }
    };

    // Display general page errors if any
    React.useEffect(() => {
        if (pageErrors && pageErrors.message) {
            toast({ title: "Error", description: pageErrors.message, variant: "destructive" });
        }
    }, [pageErrors, toast]);


    return (
        <AuthenticatedLayout title="Roles">
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Roles Management</h1>
                    <Button asChild>
                        <Link href={route('roles.create')}>Create Role</Link>
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles && roles.length > 0 ? (
                            roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>{role.name}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('roles.edit', role.id)}>Edit</Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('roles.show', role.id)}>View</Link>
                                        </Button>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" onClick={() => setRoleToDelete(role)}>
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center">
                                    No roles found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the role
                            "{roleToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
};

export default RolesIndexPage;
