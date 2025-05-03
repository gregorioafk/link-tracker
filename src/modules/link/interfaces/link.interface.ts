export interface Link {
    shortId: string;
    originalUrl: string;
    expiresAt?: Date;
    passwordHash?: string;
    clickCount: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
} 