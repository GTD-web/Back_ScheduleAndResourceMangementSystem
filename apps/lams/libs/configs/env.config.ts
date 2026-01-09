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

export const STORAGE_CONFIG = registerAs('storage', () => {
    return {
        type: process.env.STORAGE_TYPE,
        s3: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION,
            bucketName: process.env.S3_BUCKET_NAME,
        },
        local: {
            storagePath: process.env.LOCAL_STORAGE_PATH,
        },
    };
});

export const SSO_CONFIG = registerAs('sso', () => {
    return {
        baseUrl: process.env.SSO_API_URL,
        clientId: process.env.SSO_CLIENT_ID,
        clientSecret: process.env.SSO_CLIENT_SECRET,
    };
});
