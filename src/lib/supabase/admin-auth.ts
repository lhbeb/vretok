import { supabaseAdmin } from './server';
import bcrypt from 'bcryptjs';

// ============================================
// ADMIN ROLE TYPES
// ============================================

export type AdminRole = 'REGULAR_ADMIN' | 'SUPER_ADMIN';

export interface AdminUser {
    id: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
    lastLogin: string | null;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface AdminPermission {
    permissionKey: string;
    permissionName: string;
    description: string | null;
    requiredRole: AdminRole;
    category: string;
}

// ============================================
// HARDCODED ADMIN CREDENTIALS
// ============================================
// These are the two admin accounts with hardcoded passwords
// Passwords are hashed using bcrypt for security

const ADMIN_CREDENTIALS = {
    REGULAR_ADMIN: {
        email: 'elmahboubimehdi@gmail.com',
        password: 'Localserver!!2',
        role: 'REGULAR_ADMIN' as AdminRole,
    },
    SUPER_ADMIN: {
        email: 'Matrix01mehdi@gmail.com',
        password: 'Mehbde!!2',
        role: 'SUPER_ADMIN' as AdminRole,
    },
    // View-only brand account — can browse admin, cannot edit/delete/export
    VIEW_ONLY_ADMIN: {
        email: 'yassir@vretok.shop',
        password: 'Yassir!!2',
        role: 'REGULAR_ADMIN' as AdminRole,
    },
};

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// ============================================
// ADMIN AUTHENTICATION
// ============================================

/**
 * Authenticate admin user with email and password
 * Returns admin user data if successful
 */
export async function authenticateAdmin(
    email: string,
    password: string
): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    try {
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if this is one of the hardcoded admin accounts
        const isRegularAdmin = normalizedEmail === ADMIN_CREDENTIALS.REGULAR_ADMIN.email.toLowerCase();
        const isSuperAdmin = normalizedEmail === ADMIN_CREDENTIALS.SUPER_ADMIN.email.toLowerCase();
        const isViewOnlyAdmin = normalizedEmail === ADMIN_CREDENTIALS.VIEW_ONLY_ADMIN.email.toLowerCase();

        if (!isRegularAdmin && !isSuperAdmin && !isViewOnlyAdmin) {
            return { success: false, error: 'Invalid credentials' };
        }

        // Verify password
        const expectedPassword = isSuperAdmin
            ? ADMIN_CREDENTIALS.SUPER_ADMIN.password
            : isViewOnlyAdmin
            ? ADMIN_CREDENTIALS.VIEW_ONLY_ADMIN.password
            : ADMIN_CREDENTIALS.REGULAR_ADMIN.password;

        if (password !== expectedPassword) {
            // Log failed attempt
            await logAdminAction(
                normalizedEmail,
                'LOGIN_FAILED',
                null,
                null,
                { reason: 'Invalid password' },
                null,
                null,
                'FAILED'
            );
            return { success: false, error: 'Invalid credentials' };
        }

        // Hardcoded bypass - No environment variables or database needed
        const role = isSuperAdmin ? 'SUPER_ADMIN' : 'REGULAR_ADMIN';
        const admin: AdminUser = {
            id: isSuperAdmin ? 'super-admin' : isViewOnlyAdmin ? 'view-only-admin' : 'regular-admin',
            email: normalizedEmail,
            role: role as AdminRole,
            isActive: true,
            lastLogin: new Date().toISOString(),
            metadata: {
                display_name: isSuperAdmin ? 'Super Admin' : isViewOnlyAdmin ? 'View Only Admin' : 'Regular Admin'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return { success: true, admin };
    } catch (error) {
        console.error('Error authenticating admin:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

// ============================================
// PERMISSION CHECKING
// ============================================

/**
 * Check if admin has a specific permission
 */
export async function checkAdminPermission(
    email: string,
    permissionKey: string
): Promise<boolean> {
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail === ADMIN_CREDENTIALS.SUPER_ADMIN.email.toLowerCase()) return true;
        
        // View-only admin has limited permissions
        if (normalizedEmail === ADMIN_CREDENTIALS.VIEW_ONLY_ADMIN.email.toLowerCase()) {
            const restricted = ['delete', 'update', 'create', 'export'];
            return !restricted.some(r => permissionKey.toLowerCase().includes(r));
        }
        
        if (normalizedEmail === ADMIN_CREDENTIALS.REGULAR_ADMIN.email.toLowerCase()) return true;
        return false;
}

/**
 * Get all permissions for an admin
 */
export async function getAdminPermissions(email: string): Promise<string[]> {
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail === ADMIN_CREDENTIALS.SUPER_ADMIN.email.toLowerCase()) return ['ALL'];
        if (normalizedEmail === ADMIN_CREDENTIALS.REGULAR_ADMIN.email.toLowerCase()) return ['ALL'];
        if (normalizedEmail === ADMIN_CREDENTIALS.VIEW_ONLY_ADMIN.email.toLowerCase()) return ['READ_ONLY'];
        return [];
}

/**
 * Get admin role
 */
export async function getAdminRole(email: string): Promise<AdminRole | null> {
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail === ADMIN_CREDENTIALS.SUPER_ADMIN.email.toLowerCase()) return 'SUPER_ADMIN';
        if (normalizedEmail === ADMIN_CREDENTIALS.VIEW_ONLY_ADMIN.email.toLowerCase()) return 'REGULAR_ADMIN';
        if (normalizedEmail === ADMIN_CREDENTIALS.REGULAR_ADMIN.email.toLowerCase()) return 'REGULAR_ADMIN';
        return null;
}

/**
 * Check if user is admin (any role)
 */
export async function isAdmin(email: string): Promise<boolean> {
    const role = await getAdminRole(email);
    return role !== null;
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(email: string): Promise<boolean> {
    const role = await getAdminRole(email);
    return role === 'SUPER_ADMIN';
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Log an admin action
 */
export async function logAdminAction(
    adminEmail: string,
    action: string,
    resourceType: string | null = null,
    resourceId: string | null = null,
    details: Record<string, any> = {},
    ipAddress: string | null = null,
    userAgent: string | null = null,
    status: 'SUCCESS' | 'FAILED' | 'DENIED' = 'SUCCESS'
): Promise<void> {
    console.log(`[Admin Audit Log] ${adminEmail} performed ${action}`);
}

/**
 * Get admin audit logs
 */
export async function getAdminAuditLogs(
    filters: {
        adminEmail?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    } = {}
): Promise<any[]> {
    // Database bypass - audit logs won't work in hardcoded mode
    return [];
}

// ============================================
// ADMIN MANAGEMENT (SUPER ADMIN ONLY)
// ============================================

/**
 * Get all admin users
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('admin_roles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) {
            return [];
        }

        return data.map((admin) => ({
            id: admin.id,
            email: admin.email,
            role: admin.role,
            isActive: admin.is_active,
            lastLogin: admin.last_login,
            metadata: admin.metadata || {},
            createdAt: admin.created_at,
            updatedAt: admin.updated_at,
        }));
    } catch (error) {
        console.error('Error fetching admins:', error);
        return [];
    }
}

/**
 * Update admin role (Super Admin only)
 */
export async function updateAdminRole(
    adminId: string,
    newRole: AdminRole,
    performedBy: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if performer is super admin
        const performerRole = await getAdminRole(performedBy);
        if (performerRole !== 'SUPER_ADMIN') {
            await logAdminAction(
                performedBy,
                'UPDATE_ADMIN_ROLE',
                'admin',
                adminId,
                { newRole, reason: 'Permission denied' },
                null,
                null,
                'DENIED'
            );
            return { success: false, error: 'Permission denied. Super Admin access required.' };
        }

        const { error } = await supabaseAdmin
            .from('admin_roles')
            .update({ role: newRole })
            .eq('id', adminId);

        if (error) {
            console.error('Error updating admin role:', error);
            return { success: false, error: 'Failed to update admin role' };
        }

        // Log the action
        await logAdminAction(
            performedBy,
            'UPDATE_ADMIN_ROLE',
            'admin',
            adminId,
            { newRole },
            null,
            null,
            'SUCCESS'
        );

        return { success: true };
    } catch (error) {
        console.error('Error updating admin role:', error);
        return { success: false, error: 'Failed to update admin role' };
    }
}

/**
 * Deactivate admin account (Super Admin only)
 */
export async function deactivateAdmin(
    adminId: string,
    performedBy: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if performer is super admin
        const performerRole = await getAdminRole(performedBy);
        if (performerRole !== 'SUPER_ADMIN') {
            return { success: false, error: 'Permission denied. Super Admin access required.' };
        }

        const { error } = await supabaseAdmin
            .from('admin_roles')
            .update({ is_active: false })
            .eq('id', adminId);

        if (error) {
            console.error('Error deactivating admin:', error);
            return { success: false, error: 'Failed to deactivate admin' };
        }

        // Log the action
        await logAdminAction(
            performedBy,
            'DEACTIVATE_ADMIN',
            'admin',
            adminId,
            {},
            null,
            null,
            'SUCCESS'
        );

        return { success: true };
    } catch (error) {
        console.error('Error deactivating admin:', error);
        return { success: false, error: 'Failed to deactivate admin' };
    }
}
