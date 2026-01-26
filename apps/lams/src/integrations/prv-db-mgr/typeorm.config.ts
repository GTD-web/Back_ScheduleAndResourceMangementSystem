import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
    const config: TypeOrmModuleOptions = {
        type: 'postgres',
        host: 'aws-1-ap-northeast-2.pooler.supabase.com',
        port: 5432,
        username: 'postgres.txpqhatvkesbhjrsnhgj',
        password: 'xSDsnZxHH2NJgVse',
        database: 'postgres',
        autoLoadEntities: true,
    };
    return config;
};
