export interface Permission {
    id: number;
    name: string;
    guard_name?: string; // Optional as it might not always be needed in the frontend
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name?: string; // Optional
    created_at?: string;
    updated_at?: string;
    permissions?: Permission[]; // For when permissions are loaded with the role
}

// You can add other shared types here as your application grows.
// For example, a User type:
/*
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
    // Add any role/permission related fields if you directly embed them
}
*/
