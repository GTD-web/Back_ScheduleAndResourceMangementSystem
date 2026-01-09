/**
 * SSO SDK 관련 상수
 */
export const SSO_CLIENT = 'SSO_CLIENT';

export const SSO_CONFIG = {
    BASE_URL: process.env.SSO_API_URL || 'https://lsso.vercel.app',
    CLIENT_ID: process.env.SSO_CLIENT_ID,
    CLIENT_SECRET: process.env.SSO_CLIENT_SECRET,
};
