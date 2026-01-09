import { registerAs } from '@nestjs/config';

export const ENV = process.env;

export const DB_CONFIG = registerAs('database', () => {
    return {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        dropSchema: process.env.DROP_SCHEMA,
    };
});

export const JWT_CONFIG = registerAs('jwt', () => {
    return {
        secret: process.env.GLOBAL_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    };
});

export const FIREBASE_CONFIG = registerAs('firebase', () => {
    return {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
});
