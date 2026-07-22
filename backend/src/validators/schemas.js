import { z } from "zod";

export const createPublicationSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
    description: z.string().max(5000, "Description cannot exceed 5000 characters").optional().nullable(),
    price: z.coerce.number().positive("Price must be greater than 0").max(99999999.99, "Price cannot exceed 99,999,999.99"),
    category: z.string().max(100).optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    contactMethod: z.string().max(50).optional().nullable(),
    images: z.array(z.string().url().or(z.string().startsWith("/uploads/"))).max(5).optional().default([]),
    type: z.enum(["product", "service"]).optional().default("product"),
    moderationStatus: z.enum(["pending", "approved", "rejected"]).optional().default("pending"),
    businessHours: z.record(z.string()).optional().nullable(),
    coverageArea: z.array(z.string()).optional().nullable(),
    priceType: z.enum(["fixed", "per_hour", "negotiable"]).optional().default("fixed")
});

export const updatePublicationSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    price: z.coerce.number().positive().max(99999999.99).optional(),
    category: z.string().max(100).optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    contactMethod: z.string().max(50).optional().nullable(),
    status: z.enum(["active", "sold", "inactive"]).optional(),
    images: z.array(z.string().url().or(z.string().startsWith("/uploads/"))).max(5).optional(),
    type: z.enum(["product", "service"]).optional(),
    moderationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
    rejectionReason: z.string().optional().nullable(),
    businessHours: z.record(z.string()).optional().nullable(),
    coverageArea: z.array(z.string()).optional().nullable(),
    priceType: z.enum(["fixed", "per_hour", "negotiable"]).optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

export const publicationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
    status: z.enum(["active", "sold", "inactive"]).optional(),
    category: z.string().max(100).optional(),
    search: z.string().max(100).optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    location: z.string().max(255).optional(),
    type: z.enum(["product", "service"]).optional(),
    moderationStatus: z.enum(["pending", "approved", "rejected"]).optional()
});

export const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
    slug: z.string().min(1, "Slug is required").max(100, "Slug cannot exceed 100 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
    description: z.string().max(500).optional().nullable()
});

export const updateCategorySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens").optional(),
    description: z.string().max(500).optional().nullable()
});

export const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(255),
    email: z.string().email("Invalid email").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(100).regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number"),
    userType: z.enum(["client", "seller"]).optional().default("client")
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required")
});

export const updateProfileSchema = z.object({
    name: z.string().min(3).max(255).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(20).optional().nullable(),
    whatsapp: z.string().max(20).optional().nullable(),
    bio: z.string().max(1000).optional().nullable(),
    neighborhoodId: z.string().uuid().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable()
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(100).regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number")
});

export const createVerificationSchema = z.object({
    reason: z.string().max(500).optional().nullable()
});

export const approveVerificationSchema = z.object({
    reason: z.string().max(500).optional().nullable()
});

export const rejectVerificationSchema = z.object({
    reason: z.string().min(1, "Rejection reason is required").max(500)
});

export const createNotificationSchema = z.object({
    userId: z.string().uuid(),
    type: z.string().min(1).max(50),
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    data: z.record(z.unknown()).optional()
});

export const updateAdminUserSchema = z.object({
    name: z.string().min(3).max(255).optional(),
    email: z.string().email().max(255).optional(),
    role: z.enum(["user", "admin", "verifier"]).optional(),
    isBanned: z.boolean().optional()
});

export const updateAdminPublicationSchema = z.object({
    status: z.enum(["active", "sold", "inactive"]).optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    price: z.number().positive().max(99999999.99).optional(),
    category: z.string().max(100).optional().nullable(),
    location: z.string().max(255).optional().nullable(),
    contactMethod: z.string().max(50).optional().nullable()
});

export const moderatePublicationSchema = z.object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().max(1000).optional().nullable()
});

export const favoriteQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12)
});

export const idParamSchema = z.object({
    id: z.string().uuid("Invalid ID format")
});