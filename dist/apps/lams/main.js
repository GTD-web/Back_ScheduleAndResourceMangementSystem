/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/lams/libs/configs/env.config.ts":
/*!**********************************************!*\
  !*** ./apps/lams/libs/configs/env.config.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SSO_CONFIG = exports.STORAGE_CONFIG = exports.JWT_CONFIG = exports.DB_CONFIG = exports.ENV = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
exports.ENV = process.env;
exports.DB_CONFIG = (0, config_1.registerAs)('database', () => {
    return {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        dropSchema: process.env.DROP_SCHEMA,
    };
});
exports.JWT_CONFIG = (0, config_1.registerAs)('jwt', () => {
    return {
        secret: process.env.GLOBAL_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
    };
});
exports.STORAGE_CONFIG = (0, config_1.registerAs)('storage', () => {
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
exports.SSO_CONFIG = (0, config_1.registerAs)('sso', () => {
    return {
        baseUrl: process.env.SSO_API_URL,
        clientId: process.env.SSO_CLIENT_ID,
        clientSecret: process.env.SSO_CLIENT_SECRET,
    };
});


/***/ }),

/***/ "./apps/lams/libs/decorators/public.decorator.ts":
/*!*******************************************************!*\
  !*** ./apps/lams/libs/decorators/public.decorator.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ }),

/***/ "./apps/lams/libs/guards/jwt-auth.guard.ts":
/*!*************************************************!*\
  !*** ./apps/lams/libs/guards/jwt-auth.guard.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtAuthGuard_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const public_decorator_1 = __webpack_require__(/*! ../decorators/public.decorator */ "./apps/lams/libs/decorators/public.decorator.ts");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
        this.logger = new common_1.Logger(JwtAuthGuard_1.name);
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            this.logger.debug('Public 엔드포인트 - 인증 건너뜀');
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        console.log('authHeader :', request.headers);
        this.logger.debug(`인증 시도: ${request.method} ${request.url}, Authorization: ${authHeader ? '있음' : '없음'}`);
        return super.canActivate(context);
    }
    handleRequest(err, user, info) {
        if (err || !user) {
            this.logger.warn(`인증 실패: err=${err?.message}, info=${info?.message}, user=${user ? '있음' : '없음'}`);
            throw err || new Error('인증에 실패했습니다.');
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], JwtAuthGuard);


/***/ }),

/***/ "./apps/lams/libs/strategies/jwt.strategy.ts":
/*!***************************************************!*\
  !*** ./apps/lams/libs/strategies/jwt.strategy.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtStrategy_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        const secret = configService.get('jwt.secret') || configService.get('GLOBAL_SECRET');
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: secret || 'default-secret-key-change-in-production',
        });
        this.logger = new common_1.Logger(JwtStrategy_1.name);
        if (!secret) {
            console.warn('⚠️ JWT secret이 설정되지 않았습니다.');
        }
        else {
            console.log(`✅ JWT secret 설정 완료 (길이: ${secret.length})`);
        }
    }
    async validate(payload) {
        this.logger.debug(`JWT 토큰 검증 시작: employeeNumber=${payload?.employeeNumber}`);
        if (!payload || !payload.employeeNumber) {
            this.logger.warn(`토큰 검증 실패: employeeNumber가 없습니다. payload=${JSON.stringify(payload)}`);
            throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다. employeeNumber가 없습니다.');
        }
        this.logger.debug(`✅ 토큰 검증 성공: employeeNumber=${payload.employeeNumber}`);
        return {
            id: payload.id || payload.employeeNumber,
            employeeNumber: payload.employeeNumber,
            name: payload.name,
            email: payload.email,
            ...payload,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),

/***/ "./apps/lams/src/app.module.ts":
/*!*************************************!*\
  !*** ./apps/lams/src/app.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const database_module_1 = __webpack_require__(/*! @libs/database/database.module */ "./libs/database/database.module.ts");
const domain_module_1 = __webpack_require__(/*! ./refactoring/domain/domain.module */ "./apps/lams/src/refactoring/domain/domain.module.ts");
const interface_module_1 = __webpack_require__(/*! ./refactoring/interface/interface.module */ "./apps/lams/src/refactoring/interface/interface.module.ts");
const path = __webpack_require__(/*! path */ "path");
const env_config_1 = __webpack_require__(/*! ../libs/configs/env.config */ "./apps/lams/libs/configs/env.config.ts");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const jwt_auth_guard_1 = __webpack_require__(/*! ../libs/guards/jwt-auth.guard */ "./apps/lams/libs/guards/jwt-auth.guard.ts");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const jwt_config_1 = __webpack_require__(/*! @libs/configs/jwt.config */ "./libs/configs/jwt.config.ts");
const jwt_strategy_1 = __webpack_require__(/*! ../libs/strategies/jwt.strategy */ "./apps/lams/libs/strategies/jwt.strategy.ts");
const migration_module_1 = __webpack_require__(/*! ./refactoring/integrations/migration/migration.module */ "./apps/lams/src/refactoring/integrations/migration/migration.module.ts");
const init_module_1 = __webpack_require__(/*! ./refactoring/integrations/init/init.module */ "./apps/lams/src/refactoring/integrations/init/init.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [path.resolve('apps', 'lams', '.env')],
                load: [env_config_1.DB_CONFIG, env_config_1.JWT_CONFIG, env_config_1.SSO_CONFIG],
            }),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                useFactory: jwt_config_1.jwtConfig,
                inject: [config_1.ConfigService],
            }),
            database_module_1.DatabaseModule,
            domain_module_1.DomainModule,
            interface_module_1.InterfaceModule,
            migration_module_1.OrganizationMigrationModule,
            init_module_1.InitModule,
        ],
        controllers: [],
        providers: [
            jwt_strategy_1.JwtStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);


/***/ }),

/***/ "./apps/lams/src/common/decorators/public.decorator.ts":
/*!*************************************************************!*\
  !*** ./apps/lams/src/common/decorators/public.decorator.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ }),

/***/ "./apps/lams/src/common/decorators/user.decorator.ts":
/*!***********************************************************!*\
  !*** ./apps/lams/src/common/decorators/user.decorator.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.User = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});


/***/ }),

/***/ "./apps/lams/src/common/interceptors/request.interceptor.ts":
/*!******************************************************************!*\
  !*** ./apps/lams/src/common/interceptors/request.interceptor.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestInterceptor = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
let RequestInterceptor = class RequestInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query, params } = request;
        const now = Date.now();
        console.log(`[Request] ${new Date().toISOString()} ${method} ${url}`);
        if (Object.keys(body).length > 0) {
            console.log('Body:', body);
        }
        if (Object.keys(query).length > 0) {
            console.log('Query:', query);
        }
        if (Object.keys(params).length > 0) {
            console.log('Params:', params);
        }
        return next.handle().pipe((0, operators_1.tap)(() => {
            console.log(`[Response Time] ${Date.now() - now}ms`);
        }));
    }
};
exports.RequestInterceptor = RequestInterceptor;
exports.RequestInterceptor = RequestInterceptor = __decorate([
    (0, common_1.Injectable)()
], RequestInterceptor);


/***/ }),

/***/ "./apps/lams/src/common/swagger/swagger.ts":
/*!*************************************************!*\
  !*** ./apps/lams/src/common/swagger/swagger.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupSwagger = setupSwagger;
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
function setupSwagger(app, dtos) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Resource Management API')
        .setDescription('Resource Management API Description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {});
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        jsonDocumentUrl: '/api-docs-json',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
        ],
        customCssUrl: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
        ],
        swaggerOptions: {
            tagsSorter: (a, b) => {
                const isAEnglish = /^[A-Za-z]/.test(a);
                const isBEnglish = /^[A-Za-z]/.test(b);
                if (isAEnglish && !isBEnglish)
                    return -1;
                if (!isAEnglish && isBEnglish)
                    return 1;
                return a.localeCompare(b, 'en');
            },
            docExpansion: 'none',
            persistAuthorization: true,
        },
    });
}


/***/ }),

/***/ "./apps/lams/src/refactoring/business/file-management-business/file-management-business.module.ts":
/*!********************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/business/file-management-business/file-management-business.module.ts ***!
  \********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileManagementBusinessModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const file_management_business_service_1 = __webpack_require__(/*! ./file-management-business.service */ "./apps/lams/src/refactoring/business/file-management-business/file-management-business.service.ts");
const file_management_context_module_1 = __webpack_require__(/*! ../../context/file-management-context/file-management-context.module */ "./apps/lams/src/refactoring/context/file-management-context/file-management-context.module.ts");
const attendance_data_context_module_1 = __webpack_require__(/*! ../../context/attendance-data-context/attendance-data-context.module */ "./apps/lams/src/refactoring/context/attendance-data-context/attendance-data-context.module.ts");
let FileManagementBusinessModule = class FileManagementBusinessModule {
};
exports.FileManagementBusinessModule = FileManagementBusinessModule;
exports.FileManagementBusinessModule = FileManagementBusinessModule = __decorate([
    (0, common_1.Module)({
        imports: [file_management_context_module_1.FileManagementContextModule.forRoot(), attendance_data_context_module_1.AttendanceDataContextModule],
        providers: [file_management_business_service_1.FileManagementBusinessService],
        exports: [file_management_business_service_1.FileManagementBusinessService],
    })
], FileManagementBusinessModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/business/file-management-business/file-management-business.service.ts":
/*!*********************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/business/file-management-business/file-management-business.service.ts ***!
  \*********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FileManagementBusinessService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileManagementBusinessService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const file_management_context_service_1 = __webpack_require__(/*! ../../context/file-management-context/file-management-context.service */ "./apps/lams/src/refactoring/context/file-management-context/file-management-context.service.ts");
const attendance_data_context_service_1 = __webpack_require__(/*! ../../context/attendance-data-context/attendance-data-context.service */ "./apps/lams/src/refactoring/context/attendance-data-context/attendance-data-context.service.ts");
let FileManagementBusinessService = FileManagementBusinessService_1 = class FileManagementBusinessService {
    constructor(fileManagementContextService, attendanceDataContextService) {
        this.fileManagementContextService = fileManagementContextService;
        this.attendanceDataContextService = attendanceDataContextService;
        this.logger = new common_1.Logger(FileManagementBusinessService_1.name);
    }
    async 파일을업로드한다(file, uploadBy, year, month) {
        this.logger.log(`파일 업로드 시작: ${file.originalname}`);
        const result = await this.fileManagementContextService.파일을업로드한다(file, uploadBy, year, month);
        this.logger.log(`파일 업로드 완료: ${result.fileId}`);
        return result;
    }
    async 파일내용을반영한다(fileIds, employeeIds, year, month, performedBy) {
        this.logger.log(`파일 내용 반영 시작: fileIds=${fileIds.length}개, 직원 수=${employeeIds.length}`);
        const reflections = [];
        for (const fileId of fileIds) {
            this.logger.log(`파일 내용 반영 중: fileId=${fileId}`);
            const reflectionResult = await this.fileManagementContextService.파일내용을반영한다(fileId, employeeIds, year, month, performedBy);
            reflections.push({
                fileId: reflectionResult.fileId,
                reflectionHistoryId: reflectionResult.reflectionHistoryId,
            });
            this.logger.log(`파일 내용 반영 완료: fileId=${fileId}, reflectionHistoryId=${reflectionResult.reflectionHistoryId}`);
        }
        this.logger.log(`모든 파일 내용 반영 완료: 총 ${reflections.length}개 파일`);
        const dailySummaryResult = await this.attendanceDataContextService.일일요약을생성한다(employeeIds, year, month, performedBy);
        this.logger.log(`일일 요약 생성 완료: daily=${dailySummaryResult.statistics.dailyEventSummaryCount}, issues=${dailySummaryResult.statistics.attendanceIssueCount}`);
        const monthlySummaryResult = await this.attendanceDataContextService.월간요약을생성한다(employeeIds, year, month, performedBy);
        this.logger.log(`월간 요약 생성 완료: monthly=${monthlySummaryResult.statistics.monthlyEventSummaryCount}`);
        return {
            reflections,
            dailySummaryResult,
            monthlySummaryResult,
        };
    }
};
exports.FileManagementBusinessService = FileManagementBusinessService;
exports.FileManagementBusinessService = FileManagementBusinessService = FileManagementBusinessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof file_management_context_service_1.FileManagementContextService !== "undefined" && file_management_context_service_1.FileManagementContextService) === "function" ? _a : Object, typeof (_b = typeof attendance_data_context_service_1.AttendanceDataContextService !== "undefined" && attendance_data_context_service_1.AttendanceDataContextService) === "function" ? _b : Object])
], FileManagementBusinessService);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/attendance-data-context.module.ts":
/*!*****************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/attendance-data-context.module.ts ***!
  \*****************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendanceDataContextModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const attendance_data_context_service_1 = __webpack_require__(/*! ./attendance-data-context.service */ "./apps/lams/src/refactoring/context/attendance-data-context/attendance-data-context.service.ts");
const handlers_1 = __webpack_require__(/*! ./handlers */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/index.ts");
const holiday_info_module_1 = __webpack_require__(/*! ../../domain/holiday-info/holiday-info.module */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.module.ts");
const used_attendance_module_1 = __webpack_require__(/*! ../../domain/used-attendance/used-attendance.module */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.module.ts");
const event_info_module_1 = __webpack_require__(/*! ../../domain/event-info/event-info.module */ "./apps/lams/src/refactoring/domain/event-info/event-info.module.ts");
const daily_event_summary_module_1 = __webpack_require__(/*! ../../domain/daily-event-summary/daily-event-summary.module */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.module.ts");
const monthly_event_summary_module_1 = __webpack_require__(/*! ../../domain/monthly-event-summary/monthly-event-summary.module */ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.module.ts");
const attendance_issue_module_1 = __webpack_require__(/*! ../../domain/attendance-issue/attendance-issue.module */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.module.ts");
const employee_module_1 = __webpack_require__(/*! @libs/modules/employee/employee.module */ "./libs/modules/employee/employee.module.ts");
const work_time_policy_service_1 = __webpack_require__(/*! ./services/work-time-policy.service */ "./apps/lams/src/refactoring/context/attendance-data-context/services/work-time-policy.service.ts");
let AttendanceDataContextModule = class AttendanceDataContextModule {
};
exports.AttendanceDataContextModule = AttendanceDataContextModule;
exports.AttendanceDataContextModule = AttendanceDataContextModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            holiday_info_module_1.DomainHolidayInfoModule,
            used_attendance_module_1.DomainUsedAttendanceModule,
            event_info_module_1.DomainEventInfoModule,
            daily_event_summary_module_1.DomainDailyEventSummaryModule,
            monthly_event_summary_module_1.DomainMonthlyEventSummaryModule,
            attendance_issue_module_1.DomainAttendanceIssueModule,
            employee_module_1.DomainEmployeeModule,
        ],
        providers: [
            attendance_data_context_service_1.AttendanceDataContextService,
            work_time_policy_service_1.WorkTimePolicyService,
            ...handlers_1.COMMAND_HANDLERS,
        ],
        exports: [attendance_data_context_service_1.AttendanceDataContextService],
    })
], AttendanceDataContextModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/attendance-data-context.service.ts":
/*!******************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/attendance-data-context.service.ts ***!
  \******************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendanceDataContextService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const handlers_1 = __webpack_require__(/*! ./handlers */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/index.ts");
let AttendanceDataContextService = class AttendanceDataContextService {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async 일일요약을생성한다(employeeIds, year, month, performedBy) {
        const command = new handlers_1.GenerateDailySummariesCommand({
            employeeIds,
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
    }
    async 월간요약을생성한다(employeeIds, year, month, performedBy) {
        const command = new handlers_1.GenerateMonthlySummariesCommand({
            employeeIds,
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
    }
};
exports.AttendanceDataContextService = AttendanceDataContextService;
exports.AttendanceDataContextService = AttendanceDataContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof cqrs_1.CommandBus !== "undefined" && cqrs_1.CommandBus) === "function" ? _a : Object, typeof (_b = typeof cqrs_1.QueryBus !== "undefined" && cqrs_1.QueryBus) === "function" ? _b : Object])
], AttendanceDataContextService);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.command.ts":
/*!*****************************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.command.ts ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateDailySummariesCommand = void 0;
class GenerateDailySummariesCommand {
    constructor(data) {
        this.data = data;
    }
}
exports.GenerateDailySummariesCommand = GenerateDailySummariesCommand;


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.handler.ts":
/*!*****************************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.handler.ts ***!
  \*****************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GenerateDailySummariesHandler_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateDailySummariesHandler = void 0;
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const generate_daily_summaries_command_1 = __webpack_require__(/*! ./generate-daily-summaries.command */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.command.ts");
const daily_event_summary_service_1 = __webpack_require__(/*! ../../../../../domain/daily-event-summary/daily-event-summary.service */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.service.ts");
const attendance_issue_service_1 = __webpack_require__(/*! ../../../../../domain/attendance-issue/attendance-issue.service */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.service.ts");
const event_info_service_1 = __webpack_require__(/*! ../../../../../domain/event-info/event-info.service */ "./apps/lams/src/refactoring/domain/event-info/event-info.service.ts");
const used_attendance_service_1 = __webpack_require__(/*! ../../../../../domain/used-attendance/used-attendance.service */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.service.ts");
const holiday_info_service_1 = __webpack_require__(/*! ../../../../../domain/holiday-info/holiday-info.service */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.service.ts");
const employee_service_1 = __webpack_require__(/*! @libs/modules/employee/employee.service */ "./libs/modules/employee/employee.service.ts");
const work_time_policy_service_1 = __webpack_require__(/*! ../../../services/work-time-policy.service */ "./apps/lams/src/refactoring/context/attendance-data-context/services/work-time-policy.service.ts");
const event_info_entity_1 = __webpack_require__(/*! ../../../../../domain/event-info/event-info.entity */ "./apps/lams/src/refactoring/domain/event-info/event-info.entity.ts");
const used_attendance_entity_1 = __webpack_require__(/*! ../../../../../domain/used-attendance/used-attendance.entity */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.entity.ts");
const daily_event_summary_entity_1 = __webpack_require__(/*! ../../../../../domain/daily-event-summary/daily-event-summary.entity */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const date_fns_1 = __webpack_require__(/*! date-fns */ "date-fns");
let GenerateDailySummariesHandler = GenerateDailySummariesHandler_1 = class GenerateDailySummariesHandler {
    constructor(dailyEventSummaryService, attendanceIssueService, eventInfoService, usedAttendanceService, holidayInfoService, employeeService, workTimePolicyService, dataSource) {
        this.dailyEventSummaryService = dailyEventSummaryService;
        this.attendanceIssueService = attendanceIssueService;
        this.eventInfoService = eventInfoService;
        this.usedAttendanceService = usedAttendanceService;
        this.holidayInfoService = holidayInfoService;
        this.employeeService = employeeService;
        this.workTimePolicyService = workTimePolicyService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(GenerateDailySummariesHandler_1.name);
    }
    async execute(command) {
        const { year, month, performedBy, snapshotData } = command.data;
        return await this.dataSource.transaction(async (manager) => {
            try {
                const isSnapshotMode = !!snapshotData;
                this.logger.log(`일일 요약 생성 시작: year=${year}, month=${month}, 모드=${isSnapshotMode ? '스냅샷' : '일반'}`);
                const yearNum = parseInt(year);
                const monthNum = parseInt(month);
                const startDate = (0, date_fns_1.startOfMonth)(new Date(yearNum, monthNum - 1, 1));
                const endDate = (0, date_fns_1.endOfMonth)(new Date(yearNum, monthNum - 1, 1));
                const startDateStr = (0, date_fns_1.format)(startDate, 'yyyy-MM-dd');
                const endDateStr = (0, date_fns_1.format)(endDate, 'yyyy-MM-dd');
                await this.해당연월일간요약소프트삭제(startDateStr, endDateStr, performedBy, manager);
                let summaries;
                if (isSnapshotMode) {
                    summaries = await this.스냅샷기반일일요약생성(snapshotData, year, month, manager);
                }
                else {
                    const events = await this.이벤트정보를조회한다(startDateStr, endDateStr, manager);
                    const usedAttendances = await this.근태사용내역을조회한다(startDateStr, endDateStr, manager);
                    const { employees, employeeNumberMap } = await this.직원정보를추출한다(events, usedAttendances, manager);
                    if (employees.length === 0) {
                        this.logger.warn('조회된 직원이 없습니다.');
                        return {
                            success: true,
                            statistics: {
                                dailyEventSummaryCount: 0,
                                attendanceIssueCount: 0,
                            },
                        };
                    }
                    const holidays = await this.holidayInfoService.목록조회한다();
                    const holidaySet = new Set(holidays.map((h) => h.holidayDate));
                    summaries = await this.일일요약을생성한다(events, usedAttendances, employees, employeeNumberMap, holidaySet, year, month, manager);
                }
                const issues = await this.근태이슈를생성한다(summaries, performedBy, manager);
                this.logger.log(`✅ 일일 요약 생성 완료: 요약 ${summaries.length}건, 이슈 ${issues.length}건`);
                return {
                    success: true,
                    statistics: {
                        dailyEventSummaryCount: summaries.length,
                        attendanceIssueCount: issues.length,
                    },
                };
            }
            catch (error) {
                this.logger.error(`일일 요약 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
    async 이벤트정보를조회한다(startDate, endDate, manager) {
        const startDateNum = parseInt(startDate.replace(/-/g, ''));
        const endDateNum = parseInt(endDate.replace(/-/g, ''));
        return await manager
            .createQueryBuilder(event_info_entity_1.EventInfo, 'ei')
            .where('ei.yyyymmdd >= :startDateNum', { startDateNum })
            .andWhere('ei.yyyymmdd <= :endDateNum', { endDateNum })
            .andWhere('ei.deleted_at IS NULL')
            .getMany();
    }
    async 근태사용내역을조회한다(startDate, endDate, manager) {
        const usedAttendances = await manager
            .createQueryBuilder(used_attendance_entity_1.UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua.deleted_at IS NULL')
            .andWhere('ua.used_at >= :startDate', { startDate })
            .andWhere('ua.used_at <= :endDate', { endDate })
            .getMany();
        return usedAttendances;
    }
    async 직원정보를추출한다(events, usedAttendances, manager) {
        const employeeNumbers = new Set();
        events.forEach((event) => {
            if (event.employee_number) {
                employeeNumbers.add(event.employee_number);
            }
        });
        const employeeIds = new Set();
        usedAttendances.forEach((ua) => {
            if (ua.employeeId) {
                employeeIds.add(ua.employeeId);
            }
        });
        const employeesByNumber = employeeNumbers.size > 0
            ? await manager.find(employee_entity_1.Employee, {
                where: { employeeNumber: (0, typeorm_1.In)(Array.from(employeeNumbers)) },
            })
            : [];
        const employeesById = employeeIds.size > 0
            ? await manager.find(employee_entity_1.Employee, {
                where: { id: (0, typeorm_1.In)(Array.from(employeeIds)) },
            })
            : [];
        const employeeMap = new Map();
        employeesByNumber.forEach((emp) => employeeMap.set(emp.id, emp));
        employeesById.forEach((emp) => employeeMap.set(emp.id, emp));
        const employees = Array.from(employeeMap.values());
        const employeeNumberMap = new Map(employees.map((emp) => [emp.employeeNumber, emp]));
        return { employees, employeeNumberMap };
    }
    async 일일요약을생성한다(events, usedAttendances, employees, employeeNumberMap, holidaySet, year, month, manager) {
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);
        const allDates = this.날짜범위생성(startDate, endDate);
        const eventsByEmployeeAndDate = new Map();
        events.forEach((event) => {
            if (!event.employee_number || !employeeNumberMap.has(event.employee_number))
                return;
            const employee = employeeNumberMap.get(event.employee_number);
            if (!eventsByEmployeeAndDate.has(employee.id)) {
                eventsByEmployeeAndDate.set(employee.id, new Map());
            }
            const employeeEvents = eventsByEmployeeAndDate.get(employee.id);
            const dateStr = event.yyyymmdd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            if (!employeeEvents.has(dateStr)) {
                employeeEvents.set(dateStr, []);
            }
            employeeEvents.get(dateStr).push(event);
        });
        const attendancesByEmployeeAndDate = new Map();
        usedAttendances.forEach((ua) => {
            const employeeId = ua.employee_id;
            if (!employeeId)
                return;
            if (!attendancesByEmployeeAndDate.has(employeeId)) {
                attendancesByEmployeeAndDate.set(employeeId, new Map());
            }
            const employeeAttendances = attendancesByEmployeeAndDate.get(employeeId);
            if (!employeeAttendances.has(ua.used_at)) {
                employeeAttendances.set(ua.used_at, []);
            }
            employeeAttendances.get(ua.used_at).push(ua);
        });
        const summaries = [];
        for (const employee of employees) {
            const employeeEvents = eventsByEmployeeAndDate.get(employee.id);
            const employeeAttendances = attendancesByEmployeeAndDate.get(employee.id);
            for (const date of allDates) {
                const dateStr = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
                const dayEvents = employeeEvents?.get(dateStr);
                const dayAttendances = employeeAttendances?.get(dateStr) || [];
                const summary = new daily_event_summary_entity_1.DailyEventSummary(dateStr, employee.id, undefined, holidaySet.has(dateStr) || this.주말여부확인(dateStr));
                const hireDate = employee.hireDate ? (0, date_fns_1.format)(new Date(employee.hireDate), 'yyyy-MM-dd') : null;
                const terminationDate = employee.status === '퇴사' && employee.terminationDate
                    ? (0, date_fns_1.format)(new Date(employee.terminationDate), 'yyyy-MM-dd')
                    : null;
                const isBeforeHireDate = hireDate && dateStr < hireDate;
                const isAfterTerminationDate = terminationDate && dateStr > terminationDate;
                let realEnterTime = null;
                let realLeaveTime = null;
                if (dayEvents && dayEvents.length > 0) {
                    dayEvents.sort((a, b) => a.hhmmss.localeCompare(b.hhmmss));
                    realEnterTime = this.HHMMSS를HHMMSS로변환(dayEvents[0].hhmmss);
                    realLeaveTime = this.HHMMSS를HHMMSS로변환(dayEvents[dayEvents.length - 1].hhmmss);
                    summary.real_enter = realEnterTime;
                    summary.real_leave = realLeaveTime;
                }
                const recognizedAttendances = dayAttendances.filter((ua) => this.workTimePolicyService.isRecognizedWorkTime(ua.attendanceType));
                const workTime = this.출입기록과근태기반출입시간을계산한다(realEnterTime, realLeaveTime, recognizedAttendances);
                summary.enter = workTime.enter;
                summary.leave = workTime.leave;
                if (isBeforeHireDate || isAfterTerminationDate) {
                    summary.is_absent = false;
                }
                else if (summary.is_holiday) {
                    summary.is_absent = false;
                }
                else if (recognizedAttendances.length > 0 || (dayEvents && dayEvents.length > 0)) {
                    summary.is_absent = false;
                }
                else {
                    summary.is_absent = true;
                }
                if (dayEvents && dayEvents.length > 0) {
                    const hasMorningRecognized = this.workTimePolicyService.hasMorningRecognized(recognizedAttendances);
                    const hasAfternoonRecognized = this.workTimePolicyService.hasAfternoonRecognized(recognizedAttendances);
                    const earliestHHMMSS = dayEvents[0].hhmmss;
                    const latestHHMMSS = dayEvents[dayEvents.length - 1].hhmmss;
                    summary.is_late = this.workTimePolicyService.isLate(earliestHHMMSS, hasMorningRecognized, summary.is_holiday, isBeforeHireDate, isAfterTerminationDate);
                    summary.is_early_leave = this.workTimePolicyService.isEarlyLeave(latestHHMMSS, hasAfternoonRecognized, summary.is_holiday, isBeforeHireDate, isAfterTerminationDate);
                }
                summary.is_checked = true;
                summary.note = '';
                const usedAttendanceInfos = dayAttendances.map((ua) => {
                    const attendanceType = ua.attendanceType;
                    return {
                        attendanceTypeId: ua.attendance_type_id,
                        title: attendanceType?.title || '',
                        workTime: attendanceType?.work_time,
                        isRecognizedWorkTime: attendanceType?.is_recognized_work_time,
                        startWorkTime: attendanceType?.start_work_time || null,
                        endWorkTime: attendanceType?.end_work_time || null,
                        deductedAnnualLeave: attendanceType?.deducted_annual_leave,
                    };
                });
                summary.used_attendances = usedAttendanceInfos.length > 0 ? usedAttendanceInfos : null;
                summaries.push(summary);
            }
        }
        const existingDateStartStr = (0, date_fns_1.format)(startDate, 'yyyy-MM-dd');
        const existingDateEndStr = (0, date_fns_1.format)(endDate, 'yyyy-MM-dd');
        const existingSummaries = await manager
            .createQueryBuilder(daily_event_summary_entity_1.DailyEventSummary, 'des')
            .where('des.date >= :startDate', { startDate: existingDateStartStr })
            .andWhere('des.date <= :endDate', { endDate: existingDateEndStr })
            .withDeleted()
            .getMany();
        const existingMap = new Map();
        existingSummaries.forEach((existing) => {
            const key = `${existing.date}_${existing.employee_id}`;
            existingMap.set(key, existing);
        });
        const toSave = [];
        summaries.forEach((summary) => {
            const key = `${summary.date}_${summary.employee_id}`;
            const existing = existingMap.get(key);
            if (existing) {
                existing.deleted_at = null;
                existing.enter = summary.enter;
                existing.leave = summary.leave;
                existing.real_enter = summary.real_enter;
                existing.real_leave = summary.real_leave;
                existing.is_holiday = summary.is_holiday;
                existing.is_absent = summary.is_absent;
                existing.is_late = summary.is_late;
                existing.is_early_leave = summary.is_early_leave;
                existing.is_checked = summary.is_checked;
                existing.note = summary.note;
                existing.work_time = summary.work_time;
                existing.used_attendances = summary.used_attendances;
                toSave.push(existing);
            }
            else {
                toSave.push(summary);
            }
        });
        const SUMMARY_BATCH_SIZE = 1000;
        for (let i = 0; i < toSave.length; i += SUMMARY_BATCH_SIZE) {
            const batch = toSave.slice(i, i + SUMMARY_BATCH_SIZE);
            await manager.save(daily_event_summary_entity_1.DailyEventSummary, batch);
        }
        return toSave;
    }
    async 근태이슈를생성한다(summaries, performedBy, manager) {
        const issues = [];
        for (const summary of summaries) {
            if (summary.is_late || summary.is_early_leave || summary.is_absent) {
                try {
                    const issue = await this.attendanceIssueService.생성한다({
                        employeeId: summary.employee_id,
                        date: summary.date,
                        dailyEventSummaryId: summary.id,
                        problematicEnterTime: summary.real_enter || summary.enter,
                        problematicLeaveTime: summary.real_leave || summary.leave,
                        correctedEnterTime: null,
                        correctedLeaveTime: null,
                        problematicAttendanceTypeId: null,
                        correctedAttendanceTypeId: null,
                        description: this.이슈설명생성(summary),
                    }, manager);
                    issues.push(issue);
                }
                catch (error) {
                    this.logger.warn(`근태 이슈 생성 실패 (${summary.date}, ${summary.employee_id}): ${error.message}`);
                }
            }
        }
        return issues;
    }
    이슈설명생성(summary) {
        const descriptions = [];
        if (summary.is_late)
            descriptions.push('지각');
        if (summary.is_early_leave)
            descriptions.push('조퇴');
        if (summary.is_absent)
            descriptions.push('결근');
        return descriptions.join(', ');
    }
    날짜범위생성(start, end) {
        const dates = [];
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }
        return dates;
    }
    주말여부확인(dateString) {
        const date = new Date(dateString);
        return date.getDay() === 0 || date.getDay() === 6;
    }
    출입기록과근태기반출입시간을계산한다(realEnterTime, realLeaveTime, recognizedAttendances) {
        const compareTime = (time1, time2) => {
            return time1.localeCompare(time2);
        };
        const enterTimeCandidates = [];
        if (realEnterTime) {
            enterTimeCandidates.push(realEnterTime);
        }
        recognizedAttendances.forEach((ua) => {
            const attendanceType = ua.attendanceType;
            if (attendanceType?.start_work_time) {
                const startTime = attendanceType.start_work_time.length === 5
                    ? attendanceType.start_work_time + ':00'
                    : attendanceType.start_work_time;
                enterTimeCandidates.push(startTime);
            }
        });
        const leaveTimeCandidates = [];
        if (realLeaveTime) {
            leaveTimeCandidates.push(realLeaveTime);
        }
        recognizedAttendances.forEach((ua) => {
            const attendanceType = ua.attendanceType;
            if (attendanceType?.end_work_time) {
                const endTime = attendanceType.end_work_time.length === 5
                    ? attendanceType.end_work_time + ':00'
                    : attendanceType.end_work_time;
                leaveTimeCandidates.push(endTime);
            }
        });
        let enterTime = null;
        if (enterTimeCandidates.length > 0) {
            enterTimeCandidates.sort(compareTime);
            enterTime = enterTimeCandidates[0];
        }
        let leaveTime = null;
        if (leaveTimeCandidates.length > 0) {
            leaveTimeCandidates.sort(compareTime);
            leaveTime = leaveTimeCandidates[leaveTimeCandidates.length - 1];
        }
        return {
            enter: enterTime,
            leave: leaveTime,
        };
    }
    인정근태기반출입시간을계산한다(dayAttendances) {
        const hasMorningRecognized = this.workTimePolicyService.hasMorningRecognized(dayAttendances);
        const hasAfternoonRecognized = this.workTimePolicyService.hasAfternoonRecognized(dayAttendances);
        const hasFullDayAttendance = this.workTimePolicyService.hasFullDayRecognized(dayAttendances);
        const normalStartTime = this.workTimePolicyService.getNormalWorkStartTime();
        const normalEndTime = this.workTimePolicyService.getNormalWorkEndTime();
        const formatTime = (time) => {
            return time.substring(0, 5) + ':00';
        };
        if (hasMorningRecognized && hasAfternoonRecognized) {
            return {
                enter: formatTime(normalStartTime),
                leave: formatTime(normalEndTime),
            };
        }
        if (hasFullDayAttendance) {
            return {
                enter: formatTime(normalStartTime),
                leave: formatTime(normalEndTime),
            };
        }
        return {
            enter: hasMorningRecognized ? formatTime(normalStartTime) : null,
            leave: hasAfternoonRecognized ? formatTime(normalEndTime) : null,
        };
    }
    HHMMSS를HHMMSS로변환(hhmmss) {
        if (!hhmmss || hhmmss.length !== 6) {
            return hhmmss;
        }
        return `${hhmmss.substring(0, 2)}:${hhmmss.substring(2, 4)}:${hhmmss.substring(4, 6)}`;
    }
    async 해당연월일간요약소프트삭제(startDate, endDate, performedBy, manager) {
        const existingSummaries = await manager
            .createQueryBuilder(daily_event_summary_entity_1.DailyEventSummary, 'des')
            .where('des.deleted_at IS NULL')
            .andWhere('des.date >= :startDate', { startDate })
            .andWhere('des.date <= :endDate', { endDate })
            .getMany();
        if (existingSummaries.length === 0) {
            return;
        }
        const now = new Date();
        for (const summary of existingSummaries) {
            summary.deleted_at = now;
            summary.수정자설정한다(performedBy);
            summary.메타데이터업데이트한다(performedBy);
        }
        await manager.save(daily_event_summary_entity_1.DailyEventSummary, existingSummaries);
        this.logger.log(`해당 연월 일간요약 소프트 삭제 완료: ${existingSummaries.length}건`);
    }
    async 스냅샷기반일일요약생성(snapshotData, year, month, manager) {
        const summaries = [];
        for (const snapshot of snapshotData.dailyEventSummaries) {
            const dateYear = snapshot.date.substring(0, 4);
            const dateMonth = snapshot.date.substring(5, 7);
            if (dateYear !== year || dateMonth !== month) {
                continue;
            }
            const summary = new daily_event_summary_entity_1.DailyEventSummary(snapshot.date, snapshot.employee_id, undefined, snapshot.is_holiday, snapshot.enter, snapshot.leave, snapshot.real_enter, snapshot.real_leave, snapshot.is_checked, snapshot.is_late, snapshot.is_early_leave, snapshot.is_absent, snapshot.work_time, snapshot.note, snapshot.used_attendances);
            summaries.push(summary);
        }
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = (0, date_fns_1.startOfMonth)(new Date(yearNum, monthNum - 1, 1));
        const endDate = (0, date_fns_1.endOfMonth)(new Date(yearNum, monthNum - 1, 1));
        const startDateStr = (0, date_fns_1.format)(startDate, 'yyyy-MM-dd');
        const endDateStr = (0, date_fns_1.format)(endDate, 'yyyy-MM-dd');
        const existingSummaries = await manager
            .createQueryBuilder(daily_event_summary_entity_1.DailyEventSummary, 'des')
            .where('des.date >= :startDate', { startDate: startDateStr })
            .andWhere('des.date <= :endDate', { endDate: endDateStr })
            .withDeleted()
            .getMany();
        const existingMap = new Map();
        existingSummaries.forEach((existing) => {
            const key = `${existing.date}_${existing.employee_id}`;
            existingMap.set(key, existing);
        });
        const toSave = [];
        summaries.forEach((summary) => {
            const key = `${summary.date}_${summary.employee_id}`;
            const existing = existingMap.get(key);
            if (existing) {
                existing.deleted_at = null;
                existing.enter = summary.enter;
                existing.leave = summary.leave;
                existing.real_enter = summary.real_enter;
                existing.real_leave = summary.real_leave;
                existing.is_holiday = summary.is_holiday;
                existing.is_absent = summary.is_absent;
                existing.is_late = summary.is_late;
                existing.is_early_leave = summary.is_early_leave;
                existing.is_checked = summary.is_checked;
                existing.note = summary.note;
                existing.work_time = summary.work_time;
                existing.used_attendances = summary.used_attendances;
                toSave.push(existing);
            }
            else {
                toSave.push(summary);
            }
        });
        const SUMMARY_BATCH_SIZE = 1000;
        for (let i = 0; i < toSave.length; i += SUMMARY_BATCH_SIZE) {
            const batch = toSave.slice(i, i + SUMMARY_BATCH_SIZE);
            await manager.save(daily_event_summary_entity_1.DailyEventSummary, batch);
        }
        return toSave;
    }
};
exports.GenerateDailySummariesHandler = GenerateDailySummariesHandler;
exports.GenerateDailySummariesHandler = GenerateDailySummariesHandler = GenerateDailySummariesHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(generate_daily_summaries_command_1.GenerateDailySummariesCommand),
    __metadata("design:paramtypes", [typeof (_a = typeof daily_event_summary_service_1.DomainDailyEventSummaryService !== "undefined" && daily_event_summary_service_1.DomainDailyEventSummaryService) === "function" ? _a : Object, typeof (_b = typeof attendance_issue_service_1.DomainAttendanceIssueService !== "undefined" && attendance_issue_service_1.DomainAttendanceIssueService) === "function" ? _b : Object, typeof (_c = typeof event_info_service_1.DomainEventInfoService !== "undefined" && event_info_service_1.DomainEventInfoService) === "function" ? _c : Object, typeof (_d = typeof used_attendance_service_1.DomainUsedAttendanceService !== "undefined" && used_attendance_service_1.DomainUsedAttendanceService) === "function" ? _d : Object, typeof (_e = typeof holiday_info_service_1.DomainHolidayInfoService !== "undefined" && holiday_info_service_1.DomainHolidayInfoService) === "function" ? _e : Object, typeof (_f = typeof employee_service_1.DomainEmployeeService !== "undefined" && employee_service_1.DomainEmployeeService) === "function" ? _f : Object, typeof (_g = typeof work_time_policy_service_1.WorkTimePolicyService !== "undefined" && work_time_policy_service_1.WorkTimePolicyService) === "function" ? _g : Object, typeof (_h = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _h : Object])
], GenerateDailySummariesHandler);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.command.ts":
/*!*******************************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.command.ts ***!
  \*******************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateMonthlySummariesCommand = void 0;
class GenerateMonthlySummariesCommand {
    constructor(data) {
        this.data = data;
    }
}
exports.GenerateMonthlySummariesCommand = GenerateMonthlySummariesCommand;


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.handler.ts":
/*!*******************************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.handler.ts ***!
  \*******************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GenerateMonthlySummariesHandler_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateMonthlySummariesHandler = void 0;
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const generate_monthly_summaries_command_1 = __webpack_require__(/*! ./generate-monthly-summaries.command */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.command.ts");
const monthly_event_summary_service_1 = __webpack_require__(/*! ../../../../../domain/monthly-event-summary/monthly-event-summary.service */ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.service.ts");
const daily_event_summary_service_1 = __webpack_require__(/*! ../../../../../domain/daily-event-summary/daily-event-summary.service */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.service.ts");
let GenerateMonthlySummariesHandler = GenerateMonthlySummariesHandler_1 = class GenerateMonthlySummariesHandler {
    constructor(monthlyEventSummaryService, dailyEventSummaryService, dataSource) {
        this.monthlyEventSummaryService = monthlyEventSummaryService;
        this.dailyEventSummaryService = dailyEventSummaryService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(GenerateMonthlySummariesHandler_1.name);
    }
    async execute(command) {
        const { employeeIds, year, month, performedBy } = command.data;
        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`월간 요약 생성 시작: year=${year}, month=${month}, 직원 수=${employeeIds.length}`);
                this.logger.log(`✅ 월간 요약 생성 완료`);
                return {
                    success: true,
                    statistics: {
                        monthlyEventSummaryCount: 0,
                    },
                };
            }
            catch (error) {
                this.logger.error(`월간 요약 생성 실패: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
};
exports.GenerateMonthlySummariesHandler = GenerateMonthlySummariesHandler;
exports.GenerateMonthlySummariesHandler = GenerateMonthlySummariesHandler = GenerateMonthlySummariesHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(generate_monthly_summaries_command_1.GenerateMonthlySummariesCommand),
    __metadata("design:paramtypes", [typeof (_a = typeof monthly_event_summary_service_1.DomainMonthlyEventSummaryService !== "undefined" && monthly_event_summary_service_1.DomainMonthlyEventSummaryService) === "function" ? _a : Object, typeof (_b = typeof daily_event_summary_service_1.DomainDailyEventSummaryService !== "undefined" && daily_event_summary_service_1.DomainDailyEventSummaryService) === "function" ? _b : Object, typeof (_c = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _c : Object])
], GenerateMonthlySummariesHandler);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/index.ts":
/*!**************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/index.ts ***!
  \**************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ATTENDANCE_DATA_COMMAND_HANDLERS = void 0;
__exportStar(__webpack_require__(/*! ./generate-daily-summaries.command */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.command.ts"), exports);
__exportStar(__webpack_require__(/*! ./generate-monthly-summaries.command */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.command.ts"), exports);
__exportStar(__webpack_require__(/*! ./generate-daily-summaries.handler */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.handler.ts"), exports);
__exportStar(__webpack_require__(/*! ./generate-monthly-summaries.handler */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.handler.ts"), exports);
const generate_daily_summaries_handler_1 = __webpack_require__(/*! ./generate-daily-summaries.handler */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-daily-summaries.handler.ts");
const generate_monthly_summaries_handler_1 = __webpack_require__(/*! ./generate-monthly-summaries.handler */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/generate-monthly-summaries.handler.ts");
exports.ATTENDANCE_DATA_COMMAND_HANDLERS = [generate_daily_summaries_handler_1.GenerateDailySummariesHandler, generate_monthly_summaries_handler_1.GenerateMonthlySummariesHandler];


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/index.ts":
/*!*****************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/index.ts ***!
  \*****************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./commands */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/commands/index.ts"), exports);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/index.ts":
/*!*************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/handlers/index.ts ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QUERY_HANDLERS = exports.COMMAND_HANDLERS = void 0;
__exportStar(__webpack_require__(/*! ./attendance-data */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/index.ts"), exports);
const attendance_data_1 = __webpack_require__(/*! ./attendance-data */ "./apps/lams/src/refactoring/context/attendance-data-context/handlers/attendance-data/index.ts");
exports.COMMAND_HANDLERS = [...attendance_data_1.ATTENDANCE_DATA_COMMAND_HANDLERS];
exports.QUERY_HANDLERS = [];


/***/ }),

/***/ "./apps/lams/src/refactoring/context/attendance-data-context/services/work-time-policy.service.ts":
/*!********************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/attendance-data-context/services/work-time-policy.service.ts ***!
  \********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkTimePolicyService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let WorkTimePolicyService = class WorkTimePolicyService {
    constructor() {
        this.NORMAL_WORK_START_TIME = '09:00:00';
        this.NORMAL_WORK_END_TIME = '18:00:00';
    }
    getNormalWorkStartTime() {
        return this.NORMAL_WORK_START_TIME;
    }
    getNormalWorkEndTime() {
        return this.NORMAL_WORK_END_TIME;
    }
    isRecognizedWorkTime(attendanceType) {
        return attendanceType?.is_recognized_work_time === true;
    }
    isMorningRecognized(attendanceType) {
        if (!this.isRecognizedWorkTime(attendanceType)) {
            return false;
        }
        const startTime = attendanceType?.startWorkTime;
        return !startTime || startTime <= this.NORMAL_WORK_START_TIME;
    }
    isAfternoonRecognized(attendanceType) {
        if (!this.isRecognizedWorkTime(attendanceType)) {
            return false;
        }
        const endTime = attendanceType?.endWorkTime;
        return !endTime || endTime >= this.NORMAL_WORK_END_TIME;
    }
    isFullDayRecognized(attendanceType) {
        if (!this.isRecognizedWorkTime(attendanceType)) {
            return false;
        }
        const startTime = attendanceType?.startWorkTime;
        const endTime = attendanceType?.endWorkTime;
        return ((!startTime || startTime <= this.NORMAL_WORK_START_TIME) &&
            (!endTime || endTime >= this.NORMAL_WORK_END_TIME));
    }
    hasMorningRecognized(attendances) {
        return attendances.some((ua) => this.isMorningRecognized(ua.attendanceType));
    }
    hasAfternoonRecognized(attendances) {
        return attendances.some((ua) => this.isAfternoonRecognized(ua.attendanceType));
    }
    hasRecognizedWorkTime(attendances) {
        return attendances.some((ua) => this.isRecognizedWorkTime(ua.attendanceType));
    }
    hasFullDayRecognized(attendances) {
        return attendances.some((ua) => this.isFullDayRecognized(ua.attendanceType));
    }
    isLate(enterTime, hasMorningRecognized, isHoliday, isBeforeHireDate, isAfterTerminationDate) {
        if (isBeforeHireDate || isAfterTerminationDate || isHoliday) {
            return false;
        }
        if (hasMorningRecognized) {
            return false;
        }
        const enterTimeFormatted = this.HHMMSS를HHMMSS로변환(enterTime);
        return enterTimeFormatted > this.NORMAL_WORK_START_TIME;
    }
    isEarlyLeave(leaveTime, hasAfternoonRecognized, isHoliday, isBeforeHireDate, isAfterTerminationDate) {
        if (isBeforeHireDate || isAfterTerminationDate || isHoliday) {
            return false;
        }
        if (hasAfternoonRecognized) {
            return false;
        }
        const leaveTimeFormatted = this.HHMMSS를HHMMSS로변환(leaveTime);
        return leaveTimeFormatted < this.NORMAL_WORK_END_TIME;
    }
    HHMMSS를HHMMSS로변환(hhmmss) {
        if (!hhmmss || hhmmss.length !== 6) {
            return hhmmss;
        }
        return `${hhmmss.substring(0, 2)}:${hhmmss.substring(2, 4)}:${hhmmss.substring(4, 6)}`;
    }
};
exports.WorkTimePolicyService = WorkTimePolicyService;
exports.WorkTimePolicyService = WorkTimePolicyService = __decorate([
    (0, common_1.Injectable)()
], WorkTimePolicyService);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/file-management-context.module.ts":
/*!*****************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/file-management-context.module.ts ***!
  \*****************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FileManagementContextModule_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileManagementContextModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const file_management_context_service_1 = __webpack_require__(/*! ./file-management-context.service */ "./apps/lams/src/refactoring/context/file-management-context/file-management-context.service.ts");
const handlers_1 = __webpack_require__(/*! ./handlers */ "./apps/lams/src/refactoring/context/file-management-context/handlers/index.ts");
const s3_storage_module_1 = __webpack_require__(/*! ../../integrations/s3-storage/s3-storage.module */ "./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.module.ts");
const local_storage_module_1 = __webpack_require__(/*! ../../integrations/local-storage/local-storage.module */ "./apps/lams/src/refactoring/integrations/local-storage/local-storage.module.ts");
const excel_reader_module_1 = __webpack_require__(/*! ../../integrations/excel-reader/excel-reader.module */ "./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.module.ts");
const file_module_1 = __webpack_require__(/*! ../../domain/file/file.module */ "./apps/lams/src/refactoring/domain/file/file.module.ts");
const file_content_reflection_history_module_1 = __webpack_require__(/*! ../../domain/file-content-reflection-history/file-content-reflection-history.module */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.module.ts");
const event_info_module_1 = __webpack_require__(/*! ../../domain/event-info/event-info.module */ "./apps/lams/src/refactoring/domain/event-info/event-info.module.ts");
const used_attendance_module_1 = __webpack_require__(/*! ../../domain/used-attendance/used-attendance.module */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.module.ts");
const attendance_type_module_1 = __webpack_require__(/*! ../../domain/attendance-type/attendance-type.module */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.module.ts");
const employee_module_1 = __webpack_require__(/*! @libs/modules/employee/employee.module */ "./libs/modules/employee/employee.module.ts");
const storage_1 = __webpack_require__(/*! ../../integrations/storage */ "./apps/lams/src/refactoring/integrations/storage/index.ts");
let FileManagementContextModule = FileManagementContextModule_1 = class FileManagementContextModule {
    static forRoot() {
        return {
            module: FileManagementContextModule_1,
            imports: [
                cqrs_1.CqrsModule,
                config_1.ConfigModule,
                typeorm_1.TypeOrmModule.forFeature([]),
                excel_reader_module_1.ExcelReaderModule,
                file_module_1.DomainFileModule,
                file_content_reflection_history_module_1.DomainFileContentReflectionHistoryModule,
                event_info_module_1.DomainEventInfoModule,
                used_attendance_module_1.DomainUsedAttendanceModule,
                attendance_type_module_1.DomainAttendanceTypeModule,
                employee_module_1.DomainEmployeeModule,
                s3_storage_module_1.S3StorageModule,
                local_storage_module_1.LocalStorageModule,
            ],
            providers: [
                file_management_context_service_1.FileManagementContextService,
                storage_1.StorageServiceProvider,
                ...handlers_1.FILE_UPLOAD_HANDLERS,
                ...handlers_1.FILE_CONTENT_REFLECTION_HANDLERS,
            ],
            exports: [file_management_context_service_1.FileManagementContextService],
        };
    }
};
exports.FileManagementContextModule = FileManagementContextModule;
exports.FileManagementContextModule = FileManagementContextModule = FileManagementContextModule_1 = __decorate([
    (0, common_1.Module)({})
], FileManagementContextModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/file-management-context.service.ts":
/*!******************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/file-management-context.service.ts ***!
  \******************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileManagementContextService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const commands_1 = __webpack_require__(/*! ./handlers/file-upload/commands */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/index.ts");
const commands_2 = __webpack_require__(/*! ./handlers/file-content-reflection/commands */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/index.ts");
let FileManagementContextService = class FileManagementContextService {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async 파일을업로드한다(file, uploadBy, year, month) {
        const command = new commands_1.UploadFileCommand({
            file,
            uploadBy,
            year,
            month,
        });
        return await this.commandBus.execute(command);
    }
    async 파일내용을반영한다(fileId, employeeIds, year, month, performedBy) {
        const command = new commands_2.ReflectFileContentCommand({
            fileId,
            employeeIds,
            year,
            month,
            performedBy,
        });
        return await this.commandBus.execute(command);
    }
};
exports.FileManagementContextService = FileManagementContextService;
exports.FileManagementContextService = FileManagementContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof cqrs_1.CommandBus !== "undefined" && cqrs_1.CommandBus) === "function" ? _a : Object, typeof (_b = typeof cqrs_1.QueryBus !== "undefined" && cqrs_1.QueryBus) === "function" ? _b : Object])
], FileManagementContextService);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/index.ts":
/*!**********************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/index.ts ***!
  \**********************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./reflect-file-content.command */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/reflect-file-content.command.ts"), exports);
__exportStar(__webpack_require__(/*! ./reflect-file-content.handler */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/reflect-file-content.handler.ts"), exports);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/reflect-file-content.command.ts":
/*!*********************************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/reflect-file-content.command.ts ***!
  \*********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReflectFileContentCommand = void 0;
class ReflectFileContentCommand {
    constructor(data) {
        this.data = data;
    }
}
exports.ReflectFileContentCommand = ReflectFileContentCommand;


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/reflect-file-content.handler.ts":
/*!*********************************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/reflect-file-content.handler.ts ***!
  \*********************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReflectFileContentHandler_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReflectFileContentHandler = void 0;
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const reflect_file_content_command_1 = __webpack_require__(/*! ./reflect-file-content.command */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/reflect-file-content.command.ts");
const file_service_1 = __webpack_require__(/*! ../../../../../domain/file/file.service */ "./apps/lams/src/refactoring/domain/file/file.service.ts");
const file_content_reflection_history_service_1 = __webpack_require__(/*! ../../../../../domain/file-content-reflection-history/file-content-reflection-history.service */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.service.ts");
const event_info_service_1 = __webpack_require__(/*! ../../../../../domain/event-info/event-info.service */ "./apps/lams/src/refactoring/domain/event-info/event-info.service.ts");
const used_attendance_service_1 = __webpack_require__(/*! ../../../../../domain/used-attendance/used-attendance.service */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.service.ts");
const file_content_reflection_history_types_1 = __webpack_require__(/*! ../../../../../domain/file-content-reflection-history/file-content-reflection-history.types */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types.ts");
const event_info_entity_1 = __webpack_require__(/*! ../../../../../domain/event-info/event-info.entity */ "./apps/lams/src/refactoring/domain/event-info/event-info.entity.ts");
const used_attendance_entity_1 = __webpack_require__(/*! ../../../../../domain/used-attendance/used-attendance.entity */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.entity.ts");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const attendance_type_service_1 = __webpack_require__(/*! ../../../../../domain/attendance-type/attendance-type.service */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.service.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const employee_service_1 = __webpack_require__(/*! @libs/modules/employee/employee.service */ "./libs/modules/employee/employee.service.ts");
let ReflectFileContentHandler = ReflectFileContentHandler_1 = class ReflectFileContentHandler {
    constructor(fileService, fileContentReflectionHistoryService, eventInfoService, usedAttendanceService, employeeService, attendanceTypeService, dataSource) {
        this.fileService = fileService;
        this.fileContentReflectionHistoryService = fileContentReflectionHistoryService;
        this.eventInfoService = eventInfoService;
        this.usedAttendanceService = usedAttendanceService;
        this.employeeService = employeeService;
        this.attendanceTypeService = attendanceTypeService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ReflectFileContentHandler_1.name);
    }
    async execute(command) {
        const { fileId, employeeIds, year, month, performedBy } = command.data;
        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`파일 내용 반영 시작: fileId=${fileId}, 직원 수=${employeeIds.length}`);
                const file = await this.fileService.ID로조회한다(fileId);
                if (!file) {
                    throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (fileId: ${fileId})`);
                }
                if (!file.data || !file.data.excelData) {
                    throw new common_1.BadRequestException('파일 엔티티에 저장된 데이터가 없습니다. 파일을 먼저 업로드하고 검증해야 합니다.');
                }
                const excelData = file.data.excelData;
                const fileType = file.data.fileType;
                if (!excelData || typeof excelData !== 'object' || Object.keys(excelData).length === 0) {
                    throw new common_1.BadRequestException('파일에 데이터가 없습니다.');
                }
                const totalRows = Object.values(excelData).reduce((sum, rows) => sum + rows.length, 0);
                this.logger.log(`파일 데이터 읽기 완료: ${Object.keys(excelData).length}명의 직원, 총 ${totalRows}행, 파일 타입: ${fileType}`);
                const employees = await manager.find(employee_entity_1.Employee, {
                    where: { id: (0, typeorm_2.In)(employeeIds) },
                });
                const employeeMap = new Map(employees.map((emp) => [emp.employeeNumber, emp]));
                const employeeIdMap = new Map(employees.map((emp) => [emp.employeeNumber, emp.id]));
                this.logger.log(`직원 정보 조회 완료: ${employees.length}명`);
                let attendanceTypeMap = new Map();
                if (fileType === file_content_reflection_history_types_1.ReflectionType.ATTENDANCE_DATA) {
                    const attendanceTypes = await this.attendanceTypeService.목록조회한다();
                    attendanceTypeMap = new Map(attendanceTypes.map((at) => [at.title, at.id]));
                    this.logger.log(`근태 유형 조회 완료: ${attendanceTypes.length}개`);
                }
                const processedData = await this.processFileContent(excelData, employeeIds, employeeMap, employeeIdMap, attendanceTypeMap, year, month, fileType);
                this.logger.log(`데이터 가공 완료: eventInfo ${processedData.eventInfos.length}건, usedAttendance ${processedData.usedAttendances.length}건`);
                await this.해당연월기존데이터를삭제한다(fileType, year, month, employeeIds, employeeMap, employeeIdMap, manager);
                let eventInfoCount = 0;
                if (processedData.eventInfos.length > 0) {
                    const EVENT_BATCH_SIZE = 10000;
                    for (let i = 0; i < processedData.eventInfos.length; i += EVENT_BATCH_SIZE) {
                        const batch = processedData.eventInfos.slice(i, i + EVENT_BATCH_SIZE);
                        await manager.createQueryBuilder().insert().into(event_info_entity_1.EventInfo).values(batch).execute();
                    }
                    eventInfoCount = processedData.eventInfos.length;
                }
                let usedAttendanceCount = 0;
                if (processedData.usedAttendances.length > 0) {
                    const ATTENDANCE_BATCH_SIZE = 1000;
                    for (let i = 0; i < processedData.usedAttendances.length; i += ATTENDANCE_BATCH_SIZE) {
                        const batch = processedData.usedAttendances.slice(i, i + ATTENDANCE_BATCH_SIZE);
                        await manager.createQueryBuilder().insert().into(used_attendance_entity_1.UsedAttendance).values(batch).execute();
                    }
                    usedAttendanceCount = processedData.usedAttendances.length;
                }
                const reflectionData = await this.해당연월데이터를조회한다(fileType, year, month, manager);
                const reflectionHistory = await this.fileContentReflectionHistoryService.생성한다({
                    fileId,
                    type: fileType,
                    status: file_content_reflection_history_types_1.ReflectionStatus.COMPLETED,
                    data: reflectionData,
                }, manager);
                this.logger.log(`✅ 파일 내용 반영 완료: reflectionHistoryId=${reflectionHistory.id}`);
                return {
                    fileId,
                    reflectionHistoryId: reflectionHistory.id,
                };
            }
            catch (error) {
                this.logger.error(`파일 내용 반영 실패: ${error.message}`, error.stack);
                try {
                    const file = await this.fileService.ID로조회한다(fileId);
                    const fileType = file?.data?.fileType || file_content_reflection_history_types_1.ReflectionType.OTHER;
                    await this.fileContentReflectionHistoryService.생성한다({
                        fileId,
                        type: fileType,
                        status: file_content_reflection_history_types_1.ReflectionStatus.FAILED,
                        data: {
                            error: error.message,
                            employeeIds,
                            year,
                            month,
                        },
                    }, manager);
                }
                catch (historyError) {
                    this.logger.error(`반영 실패 이력 저장 실패: ${historyError.message}`);
                }
                if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                    throw error;
                }
                throw new common_1.BadRequestException(`파일 내용 반영 중 오류가 발생했습니다: ${error.message}`);
            }
        });
    }
    async processFileContent(excelData, employeeIds, employeeMap, employeeIdMap, attendanceTypeMap, year, month, fileType) {
        const eventInfos = [];
        const usedAttendances = [];
        const processedEmployeeIds = [];
        if (fileType === file_content_reflection_history_types_1.ReflectionType.EVENT_HISTORY) {
            Object.entries(excelData).forEach(([employeeNumber, rows]) => {
                if (!employeeMap.has(employeeNumber)) {
                    return;
                }
                rows.forEach((row) => {
                    const eventTime = row.eventTime || row.event_time;
                    if (!eventTime) {
                        return;
                    }
                    const dateMatch = eventTime.match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);
                    if (!dateMatch) {
                        this.logger.warn(`이벤트 시간 형식이 올바르지 않습니다: ${eventTime}`);
                        return;
                    }
                    const eventYear = dateMatch[1];
                    const eventMonth = dateMatch[2];
                    const eventDay = dateMatch[3];
                    if (eventYear !== year || eventMonth !== month) {
                        return;
                    }
                    const yyyymmdd = `${eventYear}${eventMonth}${eventDay}`;
                    const timeMatch = eventTime.match(/(\d{2}):?(\d{2}):?(\d{2})/);
                    const hhmmss = timeMatch ? `${timeMatch[1]}${timeMatch[2]}${timeMatch[3]}` : '000000';
                    eventInfos.push({
                        employee_name: row.name || '',
                        employee_number: employeeNumber || null,
                        event_time: eventTime,
                        yyyymmdd,
                        hhmmss,
                    });
                    if (!processedEmployeeIds.includes(employeeNumber)) {
                        processedEmployeeIds.push(employeeNumber);
                    }
                });
            });
        }
        else if (fileType === file_content_reflection_history_types_1.ReflectionType.ATTENDANCE_DATA) {
            Object.entries(excelData).forEach(([employeeNumber, rows]) => {
                const employeeId = employeeIdMap.get(employeeNumber);
                if (!employeeId) {
                    return;
                }
                rows.forEach((row) => {
                    const period = row.period || '';
                    const rangeMatch = period.match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})\s*[~-]\s*(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);
                    const dateList = [];
                    if (rangeMatch) {
                        const startYear = parseInt(rangeMatch[1]);
                        const startMonth = parseInt(rangeMatch[2]);
                        const startDay = parseInt(rangeMatch[3]);
                        const endYear = parseInt(rangeMatch[4]);
                        const endMonth = parseInt(rangeMatch[5]);
                        const endDay = parseInt(rangeMatch[6]);
                        const startDate = new Date(startYear, startMonth - 1, startDay);
                        const endDate = new Date(endYear, endMonth - 1, endDay);
                        const currentDate = new Date(startDate);
                        while (currentDate <= endDate) {
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                            dateList.push(dateStr);
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                    }
                    else {
                        const dateMatch = period.match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);
                        if (!dateMatch) {
                            this.logger.warn(`기간 형식이 올바르지 않습니다: ${period}`);
                            return;
                        }
                        const dateYear = dateMatch[1];
                        const dateMonth = dateMatch[2];
                        const dateDay = dateMatch[3];
                        const dateStr = `${dateYear}-${dateMonth}-${dateDay}`;
                        dateList.push(dateStr);
                    }
                    const attendanceTypeName = row.type || '';
                    const attendanceTypeId = attendanceTypeMap.get(attendanceTypeName);
                    if (!attendanceTypeId) {
                        this.logger.warn(`근태 유형을 찾을 수 없습니다: ${attendanceTypeName} (직원: ${employeeNumber})`);
                        return;
                    }
                    dateList.forEach((dateStr) => {
                        const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                        if (!dateMatch) {
                            return;
                        }
                        const dateYear = dateMatch[1];
                        const dateMonth = dateMatch[2];
                        if (dateYear !== year || dateMonth !== month) {
                            return;
                        }
                        usedAttendances.push({
                            used_at: dateStr,
                            employee_id: employeeId,
                            attendance_type_id: attendanceTypeId,
                        });
                    });
                    if (!processedEmployeeIds.includes(employeeNumber)) {
                        processedEmployeeIds.push(employeeNumber);
                    }
                });
            });
        }
        this.logger.log(`데이터 처리 완료: eventInfo ${eventInfos.length}건, usedAttendance ${usedAttendances.length}건, 처리된 직원 ${processedEmployeeIds.length}명`);
        return {
            eventInfos,
            usedAttendances,
            processedEmployeeIds,
        };
    }
    async 해당연월기존데이터를삭제한다(fileType, year, month, employeeIds, employeeMap, employeeIdMap, manager) {
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = `${year}${month.padStart(2, '0')}01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${year}${month.padStart(2, '0')}${lastDay.toString().padStart(2, '0')}`;
        if (fileType === file_content_reflection_history_types_1.ReflectionType.EVENT_HISTORY) {
            const employeeNumbers = Array.from(employeeMap.keys());
            if (employeeNumbers.length === 0) {
                return;
            }
            const deleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(event_info_entity_1.EventInfo)
                .where('yyyymmdd >= :startDate', { startDate })
                .andWhere('yyyymmdd <= :endDate', { endDate })
                .andWhere('employee_number IN (:...employeeNumbers)', { employeeNumbers })
                .execute();
            this.logger.log(`기존 EventInfo 하드 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month}, 직원 수: ${employeeNumbers.length}명)`);
        }
        else if (fileType === file_content_reflection_history_types_1.ReflectionType.ATTENDANCE_DATA) {
            const selectedEmployeeIds = Array.from(employeeIdMap.values());
            if (selectedEmployeeIds.length === 0) {
                return;
            }
            const startDateStr = `${year}-${month.padStart(2, '0')}-01`;
            const endDateStr = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
            const deleteResult = await manager
                .createQueryBuilder()
                .delete()
                .from(used_attendance_entity_1.UsedAttendance)
                .where('used_at >= :startDate', { startDate: startDateStr })
                .andWhere('used_at <= :endDate', { endDate: endDateStr })
                .andWhere('employee_id IN (:...employeeIds)', { employeeIds: selectedEmployeeIds })
                .execute();
            this.logger.log(`기존 UsedAttendance 하드 삭제 완료: ${deleteResult.affected || 0}건 (연월: ${year}-${month}, 직원 수: ${selectedEmployeeIds.length}명)`);
        }
    }
    async 해당연월데이터를조회한다(fileType, year, month, manager) {
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startDate = `${year}${month.padStart(2, '0')}01`;
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${year}${month.padStart(2, '0')}${lastDay.toString().padStart(2, '0')}`;
        if (fileType === file_content_reflection_history_types_1.ReflectionType.EVENT_HISTORY) {
            const eventInfos = await manager
                .createQueryBuilder(event_info_entity_1.EventInfo, 'ei')
                .where('ei.yyyymmdd >= :startDate', { startDate })
                .andWhere('ei.yyyymmdd <= :endDate', { endDate })
                .andWhere('ei.deleted_at IS NULL')
                .orderBy('ei.yyyymmdd', 'ASC')
                .addOrderBy('ei.hhmmss', 'ASC')
                .getMany();
            const eventData = eventInfos.map((event) => ({
                employee_name: event.employee_name,
                employee_number: event.employee_number,
                event_time: event.event_time,
                yyyymmdd: event.yyyymmdd,
                hhmmss: event.hhmmss,
            }));
            return {
                dataType: 'eventInfo',
                year,
                month,
                data: eventData,
            };
        }
        else if (fileType === file_content_reflection_history_types_1.ReflectionType.ATTENDANCE_DATA) {
            const usedAttendances = await manager
                .createQueryBuilder(used_attendance_entity_1.UsedAttendance, 'ua')
                .leftJoinAndSelect('ua.attendanceType', 'at')
                .where('ua.used_at >= :startDate', { startDate: `${year}-${month.padStart(2, '0')}-01` })
                .andWhere('ua.used_at <= :endDate', {
                endDate: `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`,
            })
                .andWhere('ua.deleted_at IS NULL')
                .orderBy('ua.used_at', 'ASC')
                .getMany();
            const attendanceData = usedAttendances.map((ua) => ({
                used_at: ua.used_at,
                employee_id: ua.employee_id,
                attendance_type_id: ua.attendance_type_id,
                attendance_type_title: ua.attendanceType?.title || null,
            }));
            return {
                dataType: 'usedAttendance',
                year,
                month,
                data: attendanceData,
            };
        }
        else {
            return {
                dataType: 'unknown',
                year,
                month,
                data: [],
            };
        }
    }
};
exports.ReflectFileContentHandler = ReflectFileContentHandler;
exports.ReflectFileContentHandler = ReflectFileContentHandler = ReflectFileContentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reflect_file_content_command_1.ReflectFileContentCommand),
    __metadata("design:paramtypes", [typeof (_a = typeof file_service_1.DomainFileService !== "undefined" && file_service_1.DomainFileService) === "function" ? _a : Object, typeof (_b = typeof file_content_reflection_history_service_1.DomainFileContentReflectionHistoryService !== "undefined" && file_content_reflection_history_service_1.DomainFileContentReflectionHistoryService) === "function" ? _b : Object, typeof (_c = typeof event_info_service_1.DomainEventInfoService !== "undefined" && event_info_service_1.DomainEventInfoService) === "function" ? _c : Object, typeof (_d = typeof used_attendance_service_1.DomainUsedAttendanceService !== "undefined" && used_attendance_service_1.DomainUsedAttendanceService) === "function" ? _d : Object, typeof (_e = typeof employee_service_1.DomainEmployeeService !== "undefined" && employee_service_1.DomainEmployeeService) === "function" ? _e : Object, typeof (_f = typeof attendance_type_service_1.DomainAttendanceTypeService !== "undefined" && attendance_type_service_1.DomainAttendanceTypeService) === "function" ? _f : Object, typeof (_g = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _g : Object])
], ReflectFileContentHandler);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/index.ts":
/*!*************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/index.ts ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FILE_CONTENT_REFLECTION_HANDLERS = void 0;
const commands_1 = __webpack_require__(/*! ./commands */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/commands/index.ts");
exports.FILE_CONTENT_REFLECTION_HANDLERS = [commands_1.ReflectFileContentHandler];


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/index.ts":
/*!**********************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/index.ts ***!
  \**********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./upload-file.command */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/upload-file.command.ts"), exports);
__exportStar(__webpack_require__(/*! ./upload-file.handler */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/upload-file.handler.ts"), exports);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/upload-file.command.ts":
/*!************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/upload-file.command.ts ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UploadFileCommand = void 0;
class UploadFileCommand {
    constructor(data) {
        this.data = data;
    }
}
exports.UploadFileCommand = UploadFileCommand;


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/upload-file.handler.ts":
/*!************************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/upload-file.handler.ts ***!
  \************************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UploadFileHandler_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UploadFileHandler = void 0;
const cqrs_1 = __webpack_require__(/*! @nestjs/cqrs */ "@nestjs/cqrs");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const upload_file_command_1 = __webpack_require__(/*! ./upload-file.command */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/upload-file.command.ts");
const file_service_1 = __webpack_require__(/*! ../../../../../domain/file/file.service */ "./apps/lams/src/refactoring/domain/file/file.service.ts");
const storage_1 = __webpack_require__(/*! ../../../../../integrations/storage */ "./apps/lams/src/refactoring/integrations/storage/index.ts");
const excel_reader_service_1 = __webpack_require__(/*! ../../../../../integrations/excel-reader/excel-reader.service */ "./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.service.ts");
const file_content_reflection_history_types_1 = __webpack_require__(/*! ../../../../../domain/file-content-reflection-history/file-content-reflection-history.types */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types.ts");
let UploadFileHandler = UploadFileHandler_1 = class UploadFileHandler {
    constructor(storageService, excelReaderService, fileService, dataSource) {
        this.storageService = storageService;
        this.excelReaderService = excelReaderService;
        this.fileService = fileService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(UploadFileHandler_1.name);
        this.koreanToEnglish = {
            event: {
                위치: 'location',
                발생시각: 'eventTime',
                장치명: 'deviceName',
                상태: 'status',
                카드번호: 'cardNumber',
                이름: 'name',
                사원번호: 'employeeNumber',
                근무조: 'workShift',
                조직: 'department',
                직급: 'position',
                생성구분: 'eventType',
                생성시간: 'creationTime',
                생성자: 'creator',
                생성내용: 'details',
                사진유무: 'photoAvailable',
                비고: 'remarks',
                '출입(발열/마스크)': 'entryCheck',
            },
            attendance: {
                기간: 'period',
                신청일수: 'requestDays',
                근태구분: 'type',
                ERP사번: 'employeeNumber',
                부서: 'department',
            },
        };
    }
    async execute(command) {
        const { file, uploadBy, year, month } = command.data;
        return await this.dataSource.transaction(async (manager) => {
            try {
                this.logger.log(`파일 업로드 시작: ${file.originalname}, 업로드자: ${uploadBy}`);
                if (!this.isExcelFile(file)) {
                    throw new common_1.BadRequestException('엑셀 파일만 업로드 가능합니다.');
                }
                let rawExcelData = [];
                let excelData = {};
                let fileType = null;
                try {
                    const excelResult = await this.excelReaderService.readWorksheet(file.buffer, {
                        hasHeader: true,
                    });
                    if (!excelResult.records) {
                        throw new common_1.BadRequestException('엑셀 파일에 헤더가 없거나 데이터를 읽을 수 없습니다.');
                    }
                    rawExcelData = excelResult.records;
                    this.logger.log(`엑셀 데이터 읽기 완료: ${rawExcelData.length}행`);
                    if (rawExcelData.length === 0) {
                        throw new common_1.BadRequestException('엑셀 파일에 데이터가 없습니다.');
                    }
                    const firstRow = rawExcelData[0];
                    const columnNames = Object.keys(firstRow);
                    const validationResult = this.validateAndDetermineFileType(columnNames);
                    if (!validationResult.isValid) {
                        const requiredColumns = this.getRequiredColumns();
                        throw new common_1.BadRequestException(`엑셀 파일의 컬럼명 형식이 올바르지 않습니다.\n\n` +
                            `[출입 이벤트 형식 필수 컬럼]\n${requiredColumns.event.join(', ')}\n\n` +
                            `[근태 사용 내역 형식 필수 컬럼]\n${requiredColumns.attendance.join(', ')}`);
                    }
                    fileType = validationResult.fileType;
                    this.logger.log(`컬럼명 검증 완료: ${rawExcelData.length}행, 파일 타입: ${fileType}`);
                    const mapping = fileType === file_content_reflection_history_types_1.ReflectionType.EVENT_HISTORY
                        ? this.koreanToEnglish.event
                        : this.koreanToEnglish.attendance;
                    const reconstructedData = this.reconstructDataWithEnglishKeys(rawExcelData, mapping, fileType);
                    excelData = this.groupByEmployee(reconstructedData, fileType);
                }
                catch (error) {
                    this.logger.error(`엑셀 파일 검증 실패: ${error.message}`, error.stack);
                    throw error;
                }
                const uploadResult = await this.storageService.uploadExcel(file, {
                    fileName: file.originalname,
                    folder: 'attendance-excel',
                    metadata: {
                        year,
                        month,
                        uploadBy,
                        fileType: fileType || 'unknown',
                    },
                });
                this.logger.log(`파일 S3 업로드 완료: ${uploadResult.fileKey}`);
                const refactoringFile = await this.fileService.생성한다({
                    fileName: uploadResult.fileKey,
                    filePath: uploadResult.url || uploadResult.fileKey,
                    fileOriginalName: file.originalname,
                    uploadBy,
                    year,
                    month,
                    data: {
                        fileType,
                        excelData,
                    },
                }, manager);
                await this.fileService.읽음처리한다(refactoringFile.id, uploadBy, manager);
                this.logger.log(`✅ 파일 업로드 처리 완료: ${refactoringFile.id}`);
                return {
                    fileId: refactoringFile.id,
                    fileName: refactoringFile.fileName,
                    filePath: refactoringFile.filePath,
                    year,
                    month,
                };
            }
            catch (error) {
                this.logger.error(`파일 업로드 처리 실패: ${error.message}`, error.stack);
                if (error instanceof common_1.BadRequestException) {
                    throw error;
                }
                throw new common_1.BadRequestException(`파일 업로드 중 오류가 발생했습니다: ${error.message}`);
            }
        });
    }
    isExcelFile(file) {
        const excelExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = file.originalname.toLowerCase();
        return excelExtensions.some((ext) => fileName.endsWith(ext));
    }
    validateAndDetermineFileType(columnNames) {
        const requiredColumns = this.getRequiredColumns();
        const isEventFormat = requiredColumns.event.every((col) => columnNames.some((name) => name.toLowerCase().includes(col.toLowerCase())));
        const isAttendanceFormat = requiredColumns.attendance.every((col) => columnNames.some((name) => name.toLowerCase().includes(col.toLowerCase())));
        if (isEventFormat) {
            return {
                isValid: true,
                fileType: file_content_reflection_history_types_1.ReflectionType.EVENT_HISTORY,
            };
        }
        if (isAttendanceFormat) {
            return {
                isValid: true,
                fileType: file_content_reflection_history_types_1.ReflectionType.ATTENDANCE_DATA,
            };
        }
        return {
            isValid: false,
            fileType: null,
        };
    }
    getRequiredColumns() {
        return {
            event: Object.keys(this.koreanToEnglish.event),
            attendance: Object.keys(this.koreanToEnglish.attendance),
        };
    }
    reconstructDataWithEnglishKeys(excelData, mapping, fileType) {
        return excelData.map((row) => {
            const reconstructedRow = {};
            Object.keys(mapping).forEach((koreanKey) => {
                const matchedOriginalKey = Object.keys(row).find((originalKey) => originalKey.toLowerCase().includes(koreanKey.toLowerCase()) ||
                    koreanKey.toLowerCase().includes(originalKey.toLowerCase()));
                if (matchedOriginalKey) {
                    const englishKey = mapping[koreanKey];
                    reconstructedRow[englishKey] = row[matchedOriginalKey];
                }
            });
            return reconstructedRow;
        });
    }
    groupByEmployee(excelData, fileType) {
        const grouped = {};
        excelData.forEach((row) => {
            const employeeIdentifier = row.employeeNumber;
            if (employeeIdentifier) {
                if (!grouped[employeeIdentifier]) {
                    grouped[employeeIdentifier] = [];
                }
                grouped[employeeIdentifier].push(row);
            }
        });
        return grouped;
    }
};
exports.UploadFileHandler = UploadFileHandler;
exports.UploadFileHandler = UploadFileHandler = UploadFileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(upload_file_command_1.UploadFileCommand),
    __param(0, (0, common_1.Inject)('IStorageService')),
    __metadata("design:paramtypes", [typeof (_a = typeof storage_1.IStorageService !== "undefined" && storage_1.IStorageService) === "function" ? _a : Object, typeof (_b = typeof excel_reader_service_1.ExcelReaderService !== "undefined" && excel_reader_service_1.ExcelReaderService) === "function" ? _b : Object, typeof (_c = typeof file_service_1.DomainFileService !== "undefined" && file_service_1.DomainFileService) === "function" ? _c : Object, typeof (_d = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _d : Object])
], UploadFileHandler);


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/index.ts":
/*!*************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/index.ts ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FILE_UPLOAD_HANDLERS = void 0;
const commands_1 = __webpack_require__(/*! ./commands */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/commands/index.ts");
exports.FILE_UPLOAD_HANDLERS = [commands_1.UploadFileHandler];


/***/ }),

/***/ "./apps/lams/src/refactoring/context/file-management-context/handlers/index.ts":
/*!*************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/context/file-management-context/handlers/index.ts ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FILE_CONTENT_REFLECTION_HANDLERS = exports.FILE_UPLOAD_HANDLERS = void 0;
__exportStar(__webpack_require__(/*! ./file-upload */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/index.ts"), exports);
__exportStar(__webpack_require__(/*! ./file-content-reflection */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/index.ts"), exports);
var file_upload_1 = __webpack_require__(/*! ./file-upload */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-upload/index.ts");
Object.defineProperty(exports, "FILE_UPLOAD_HANDLERS", ({ enumerable: true, get: function () { return file_upload_1.FILE_UPLOAD_HANDLERS; } }));
var file_content_reflection_1 = __webpack_require__(/*! ./file-content-reflection */ "./apps/lams/src/refactoring/context/file-management-context/handlers/file-content-reflection/index.ts");
Object.defineProperty(exports, "FILE_CONTENT_REFLECTION_HANDLERS", ({ enumerable: true, get: function () { return file_content_reflection_1.FILE_CONTENT_REFLECTION_HANDLERS; } }));


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.entity.ts":
/*!**************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/assigned-project/assigned-project.entity.ts ***!
  \**************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssignedProject = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const project_entity_1 = __webpack_require__(/*! ../project/project.entity */ "./apps/lams/src/refactoring/domain/project/project.entity.ts");
let AssignedProject = class AssignedProject extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.employee_id || !this.project_id) {
            return;
        }
        this.validateUuidFormat(this.employee_id, 'employee_id');
        this.validateUuidFormat(this.project_id, 'project_id');
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
        if (this.start_date && this.end_date) {
            if (new Date(this.start_date) > new Date(this.end_date)) {
                throw new Error('할당 시작일은 종료일보다 이전이어야 합니다.');
            }
        }
    }
    constructor(employee_id, project_id, start_date, end_date, is_active = true) {
        super();
        this.employee_id = employee_id;
        this.project_id = project_id;
        this.start_date = start_date || null;
        this.end_date = end_date || null;
        this.is_active = is_active;
        this.validateInvariants();
    }
    업데이트한다(start_date, end_date, is_active) {
        if (start_date !== undefined) {
            this.start_date = start_date;
        }
        if (end_date !== undefined) {
            this.end_date = end_date;
        }
        if (is_active !== undefined) {
            this.is_active = is_active;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            employeeId: this.employee_id,
            projectId: this.project_id,
            startDate: this.start_date,
            endDate: this.end_date,
            isActive: this.is_active,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.AssignedProject = AssignedProject;
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid' }),
    __metadata("design:type", String)
], AssignedProject.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_a = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _a : Object)
], AssignedProject.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', type: 'uuid' }),
    __metadata("design:type", String)
], AssignedProject.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", typeof (_b = typeof project_entity_1.Project !== "undefined" && project_entity_1.Project) === "function" ? _b : Object)
], AssignedProject.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_date',
        type: 'date',
        nullable: true,
        comment: '할당 시작일',
    }),
    __metadata("design:type", String)
], AssignedProject.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_date',
        type: 'date',
        nullable: true,
        comment: '할당 종료일',
    }),
    __metadata("design:type", String)
], AssignedProject.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'is_active',
        type: 'boolean',
        default: true,
        comment: '활성화 여부',
    }),
    __metadata("design:type", Boolean)
], AssignedProject.prototype, "is_active", void 0);
exports.AssignedProject = AssignedProject = __decorate([
    (0, typeorm_1.Entity)('assigned_projects'),
    (0, typeorm_1.Index)(['employee_id', 'project_id'], { unique: true }),
    (0, typeorm_1.Index)(['employee_id']),
    (0, typeorm_1.Index)(['project_id']),
    __metadata("design:paramtypes", [String, String, String, String, Boolean])
], AssignedProject);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.module.ts":
/*!**************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/assigned-project/assigned-project.module.ts ***!
  \**************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainAssignedProjectModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const assigned_project_entity_1 = __webpack_require__(/*! ./assigned-project.entity */ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.entity.ts");
const assigned_project_service_1 = __webpack_require__(/*! ./assigned-project.service */ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.service.ts");
const project_module_1 = __webpack_require__(/*! ../project/project.module */ "./apps/lams/src/refactoring/domain/project/project.module.ts");
let DomainAssignedProjectModule = class DomainAssignedProjectModule {
};
exports.DomainAssignedProjectModule = DomainAssignedProjectModule;
exports.DomainAssignedProjectModule = DomainAssignedProjectModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([assigned_project_entity_1.AssignedProject]), project_module_1.DomainProjectModule],
        providers: [assigned_project_service_1.DomainAssignedProjectService],
        exports: [assigned_project_service_1.DomainAssignedProjectService, typeorm_1.TypeOrmModule],
    })
], DomainAssignedProjectModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.service.ts":
/*!***************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/assigned-project/assigned-project.service.ts ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainAssignedProjectService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const assigned_project_entity_1 = __webpack_require__(/*! ./assigned-project.entity */ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.entity.ts");
let DomainAssignedProjectService = class DomainAssignedProjectService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(assigned_project_entity_1.AssignedProject) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const existing = await repository.findOne({
            where: {
                employee_id: data.employeeId,
                project_id: data.projectId,
                deleted_at: (0, typeorm_2.IsNull)(),
            },
        });
        if (existing) {
            throw new common_1.ConflictException('이미 할당된 프로젝트입니다.');
        }
        const assignedProject = new assigned_project_entity_1.AssignedProject(data.employeeId, data.projectId, data.startDate, data.endDate, data.isActive !== undefined ? data.isActive : true);
        const saved = await repository.save(assignedProject);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const assignedProject = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'project'],
        });
        if (!assignedProject) {
            throw new common_1.NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        return assignedProject.DTO변환한다();
    }
    async 직원ID로조회한다(employeeId) {
        const assignedProjects = await this.repository.find({
            where: { employee_id: employeeId, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['project'],
            order: { created_at: 'DESC' },
        });
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }
    async 프로젝트ID로조회한다(projectId) {
        const assignedProjects = await this.repository.find({
            where: { project_id: projectId, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['employee'],
            order: { created_at: 'DESC' },
        });
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }
    async 직원과프로젝트로조회한다(employeeId, projectId) {
        const assignedProject = await this.repository.findOne({
            where: { employee_id: employeeId, project_id: projectId, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['employee', 'project'],
        });
        return assignedProject ? assignedProject.DTO변환한다() : null;
    }
    async 활성화된목록조회한다() {
        const assignedProjects = await this.repository.find({
            where: { is_active: true, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['employee', 'project'],
            order: { created_at: 'DESC' },
        });
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }
    async 날짜로활성화된목록조회한다(date) {
        const assignedProjects = await this.repository
            .createQueryBuilder('assigned')
            .where('assigned.deleted_at IS NULL')
            .andWhere('assigned.is_active = :isActive', { isActive: true })
            .andWhere('(assigned.start_date IS NULL OR assigned.start_date <= :date)', { date })
            .andWhere('(assigned.end_date IS NULL OR assigned.end_date >= :date)', { date })
            .leftJoinAndSelect('assigned.employee', 'employee')
            .leftJoinAndSelect('assigned.project', 'project')
            .getMany();
        return assignedProjects.map((ap) => ap.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const assignedProject = await repository.findOne({ where: { id } });
        if (!assignedProject) {
            throw new common_1.NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        assignedProject.업데이트한다(data.startDate, data.endDate, data.isActive);
        assignedProject.수정자설정한다(userId);
        assignedProject.메타데이터업데이트한다(userId);
        const saved = await repository.save(assignedProject);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const assignedProject = await repository.findOne({ where: { id } });
        if (!assignedProject) {
            throw new common_1.NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        assignedProject.deleted_at = new Date();
        assignedProject.수정자설정한다(userId);
        assignedProject.메타데이터업데이트한다(userId);
        await repository.save(assignedProject);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const assignedProject = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!assignedProject) {
            throw new common_1.NotFoundException(`할당된 프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(assignedProject);
    }
};
exports.DomainAssignedProjectService = DomainAssignedProjectService;
exports.DomainAssignedProjectService = DomainAssignedProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assigned_project_entity_1.AssignedProject)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainAssignedProjectService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.entity.ts":
/*!**************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.entity.ts ***!
  \**************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendanceIssue = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const daily_event_summary_entity_1 = __webpack_require__(/*! ../daily-event-summary/daily-event-summary.entity */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts");
const attendance_issue_types_1 = __webpack_require__(/*! ./attendance-issue.types */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.types.ts");
let AttendanceIssue = class AttendanceIssue extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.employee_id || !this.date) {
            return;
        }
        this.validateUuidFormat(this.employee_id, 'employee_id');
    }
    validateDataFormat() {
        if (this.problematic_enter_time && this.problematic_enter_time.length > 50) {
            throw new Error('문제가 된 출근 시간은 50자 이하여야 합니다.');
        }
        if (this.problematic_leave_time && this.problematic_leave_time.length > 50) {
            throw new Error('문제가 된 퇴근 시간은 50자 이하여야 합니다.');
        }
        if (this.corrected_enter_time && this.corrected_enter_time.length > 50) {
            throw new Error('변경할 출근 시간은 50자 이하여야 합니다.');
        }
        if (this.corrected_leave_time && this.corrected_leave_time.length > 50) {
            throw new Error('변경할 퇴근 시간은 50자 이하여야 합니다.');
        }
        if (this.daily_event_summary_id) {
            this.validateUuidFormat(this.daily_event_summary_id, 'daily_event_summary_id');
        }
        if (this.problematic_attendance_type_id) {
            this.validateUuidFormat(this.problematic_attendance_type_id, 'problematic_attendance_type_id');
        }
        if (this.corrected_attendance_type_id) {
            this.validateUuidFormat(this.corrected_attendance_type_id, 'corrected_attendance_type_id');
        }
    }
    validateLogicalConsistency() {
    }
    constructor(employee_id, date, daily_event_summary_id, problematic_enter_time, problematic_leave_time, corrected_enter_time, corrected_leave_time, problematic_attendance_type_id, corrected_attendance_type_id, description) {
        super();
        this.employee_id = employee_id;
        this.date = date;
        this.daily_event_summary_id = daily_event_summary_id || null;
        this.problematic_enter_time = problematic_enter_time || null;
        this.problematic_leave_time = problematic_leave_time || null;
        this.corrected_enter_time = corrected_enter_time || null;
        this.corrected_leave_time = corrected_leave_time || null;
        this.problematic_attendance_type_id = problematic_attendance_type_id || null;
        this.corrected_attendance_type_id = corrected_attendance_type_id || null;
        this.description = description || null;
        this.status = attendance_issue_types_1.AttendanceIssueStatus.PENDING;
        this.confirmed_by = null;
        this.confirmed_at = null;
        this.resolved_at = null;
        this.rejection_reason = null;
        this.validateInvariants();
    }
    업데이트한다(problematic_enter_time, problematic_leave_time, corrected_enter_time, corrected_leave_time, problematic_attendance_type_id, corrected_attendance_type_id, description, status, rejection_reason) {
        if (problematic_enter_time !== undefined) {
            this.problematic_enter_time = problematic_enter_time;
        }
        if (problematic_leave_time !== undefined) {
            this.problematic_leave_time = problematic_leave_time;
        }
        if (corrected_enter_time !== undefined) {
            this.corrected_enter_time = corrected_enter_time;
        }
        if (corrected_leave_time !== undefined) {
            this.corrected_leave_time = corrected_leave_time;
        }
        if (problematic_attendance_type_id !== undefined) {
            this.problematic_attendance_type_id = problematic_attendance_type_id;
        }
        if (corrected_attendance_type_id !== undefined) {
            this.corrected_attendance_type_id = corrected_attendance_type_id;
        }
        if (description !== undefined) {
            this.description = description;
        }
        if (status !== undefined) {
            this.status = status;
        }
        if (rejection_reason !== undefined) {
            this.rejection_reason = rejection_reason;
        }
        this.validateInvariants();
    }
    확인처리한다(confirmed_by) {
        this.status = attendance_issue_types_1.AttendanceIssueStatus.CONFIRMED;
        this.confirmed_by = confirmed_by;
        this.confirmed_at = new Date();
    }
    해결처리한다() {
        this.status = attendance_issue_types_1.AttendanceIssueStatus.RESOLVED;
        this.resolved_at = new Date();
    }
    거부처리한다(rejection_reason) {
        this.status = attendance_issue_types_1.AttendanceIssueStatus.REJECTED;
        this.rejection_reason = rejection_reason;
    }
    DTO변환한다() {
        return {
            id: this.id,
            employeeId: this.employee_id,
            dailyEventSummaryId: this.daily_event_summary_id,
            date: this.date,
            problematicEnterTime: this.problematic_enter_time,
            problematicLeaveTime: this.problematic_leave_time,
            correctedEnterTime: this.corrected_enter_time,
            correctedLeaveTime: this.corrected_leave_time,
            problematicAttendanceTypeId: this.problematic_attendance_type_id,
            correctedAttendanceTypeId: this.corrected_attendance_type_id,
            status: this.status,
            description: this.description,
            confirmedBy: this.confirmed_by,
            confirmedAt: this.confirmed_at,
            resolvedAt: this.resolved_at,
            rejectionReason: this.rejection_reason,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.AttendanceIssue = AttendanceIssue;
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid' }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_a = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _a : Object)
], AttendanceIssue.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_event_summary_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "daily_event_summary_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => daily_event_summary_entity_1.DailyEventSummary, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'daily_event_summary_id' }),
    __metadata("design:type", typeof (_b = typeof daily_event_summary_entity_1.DailyEventSummary !== "undefined" && daily_event_summary_entity_1.DailyEventSummary) === "function" ? _b : Object)
], AttendanceIssue.prototype, "dailyEventSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'date',
        type: 'date',
        comment: '날짜',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'problematic_enter_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '문제가 된 출근 시간',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "problematic_enter_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'problematic_leave_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '문제가 된 퇴근 시간',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "problematic_leave_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'corrected_enter_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '변경할 출근 시간',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "corrected_enter_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'corrected_leave_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '변경할 퇴근 시간',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "corrected_leave_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'problematic_attendance_type_id',
        type: 'uuid',
        nullable: true,
        comment: '문제가 된 근태 유형 ID',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "problematic_attendance_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'corrected_attendance_type_id',
        type: 'uuid',
        nullable: true,
        comment: '변경할 근태 유형 ID',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "corrected_attendance_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: attendance_issue_types_1.AttendanceIssueStatus,
        default: attendance_issue_types_1.AttendanceIssueStatus.PENDING,
        comment: '상태',
    }),
    __metadata("design:type", typeof (_c = typeof attendance_issue_types_1.AttendanceIssueStatus !== "undefined" && attendance_issue_types_1.AttendanceIssueStatus) === "function" ? _c : Object)
], AttendanceIssue.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'description',
        type: 'text',
        nullable: true,
        comment: '이슈 설명',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'confirmed_by',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '확인자',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "confirmed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'confirmed_at',
        type: 'timestamp',
        nullable: true,
        comment: '확인 시간',
    }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], AttendanceIssue.prototype, "confirmed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'resolved_at',
        type: 'timestamp',
        nullable: true,
        comment: '해결 시간',
    }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], AttendanceIssue.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rejection_reason',
        type: 'text',
        nullable: true,
        comment: '거부 사유',
    }),
    __metadata("design:type", String)
], AttendanceIssue.prototype, "rejection_reason", void 0);
exports.AttendanceIssue = AttendanceIssue = __decorate([
    (0, typeorm_1.Entity)('attendance_issue'),
    (0, typeorm_1.Index)(['employee_id', 'date']),
    (0, typeorm_1.Index)(['status', 'created_at']),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String])
], AttendanceIssue);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.module.ts":
/*!**************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.module.ts ***!
  \**************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainAttendanceIssueModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const attendance_issue_entity_1 = __webpack_require__(/*! ./attendance-issue.entity */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.entity.ts");
const attendance_issue_service_1 = __webpack_require__(/*! ./attendance-issue.service */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.service.ts");
let DomainAttendanceIssueModule = class DomainAttendanceIssueModule {
};
exports.DomainAttendanceIssueModule = DomainAttendanceIssueModule;
exports.DomainAttendanceIssueModule = DomainAttendanceIssueModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([attendance_issue_entity_1.AttendanceIssue])],
        providers: [attendance_issue_service_1.DomainAttendanceIssueService],
        exports: [attendance_issue_service_1.DomainAttendanceIssueService, typeorm_1.TypeOrmModule],
    })
], DomainAttendanceIssueModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.service.ts":
/*!***************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.service.ts ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainAttendanceIssueService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const attendance_issue_entity_1 = __webpack_require__(/*! ./attendance-issue.entity */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.entity.ts");
const attendance_issue_types_1 = __webpack_require__(/*! ./attendance-issue.types */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.types.ts");
let DomainAttendanceIssueService = class DomainAttendanceIssueService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(attendance_issue_entity_1.AttendanceIssue) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const issue = new attendance_issue_entity_1.AttendanceIssue(data.employeeId, data.date, data.dailyEventSummaryId, data.problematicEnterTime, data.problematicLeaveTime, data.correctedEnterTime, data.correctedLeaveTime, data.problematicAttendanceTypeId, data.correctedAttendanceTypeId, data.description);
        const saved = await repository.save(issue);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const issue = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'dailyEventSummary'],
        });
        if (!issue) {
            throw new common_1.NotFoundException(`근태 이슈를 찾을 수 없습니다. (id: ${id})`);
        }
        return issue.DTO변환한다();
    }
    async 직원ID로조회한다(employeeId) {
        const issues = await this.repository.find({
            where: { employee_id: employeeId, deleted_at: (0, typeorm_2.IsNull)() },
            order: { date: 'DESC', created_at: 'DESC' },
        });
        return issues.map((issue) => issue.DTO변환한다());
    }
    async 날짜범위로조회한다(startDate, endDate) {
        const issues = await this.repository
            .createQueryBuilder('issue')
            .where('issue.deleted_at IS NULL')
            .andWhere('issue.date >= :startDate', { startDate })
            .andWhere('issue.date <= :endDate', { endDate })
            .orderBy('issue.date', 'DESC')
            .addOrderBy('issue.created_at', 'DESC')
            .getMany();
        return issues.map((issue) => issue.DTO변환한다());
    }
    async 상태별목록조회한다(status) {
        const issues = await this.repository.find({
            where: { status, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return issues.map((issue) => issue.DTO변환한다());
    }
    async 일간요약ID로조회한다(dailyEventSummaryId) {
        const issues = await this.repository.find({
            where: { daily_event_summary_id: dailyEventSummaryId, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return issues.map((issue) => issue.DTO변환한다());
    }
    async 대기중목록조회한다() {
        return this.상태별목록조회한다(attendance_issue_types_1.AttendanceIssueStatus.PENDING);
    }
    async 확인된목록조회한다() {
        return this.상태별목록조회한다(attendance_issue_types_1.AttendanceIssueStatus.CONFIRMED);
    }
    async 해결된목록조회한다() {
        return this.상태별목록조회한다(attendance_issue_types_1.AttendanceIssueStatus.RESOLVED);
    }
    async 거부된목록조회한다() {
        return this.상태별목록조회한다(attendance_issue_types_1.AttendanceIssueStatus.REJECTED);
    }
    async 날짜로조회한다(date) {
        const issues = await this.repository.find({
            where: { date, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return issues.map((issue) => issue.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const issue = await repository.findOne({ where: { id } });
        if (!issue) {
            throw new common_1.NotFoundException(`근태 이슈를 찾을 수 없습니다. (id: ${id})`);
        }
        issue.업데이트한다(data.problematicEnterTime, data.problematicLeaveTime, data.correctedEnterTime, data.correctedLeaveTime, data.problematicAttendanceTypeId, data.correctedAttendanceTypeId, data.description, data.status, data.rejectionReason);
        issue.수정자설정한다(userId);
        issue.메타데이터업데이트한다(userId);
        const saved = await repository.save(issue);
        return saved.DTO변환한다();
    }
    async 확인처리한다(id, confirmedBy, userId, manager) {
        const repository = this.getRepository(manager);
        const issue = await repository.findOne({ where: { id } });
        if (!issue) {
            throw new common_1.NotFoundException(`근태 이슈를 찾을 수 없습니다. (id: ${id})`);
        }
        issue.확인처리한다(confirmedBy);
        issue.수정자설정한다(userId);
        issue.메타데이터업데이트한다(userId);
        const saved = await repository.save(issue);
        return saved.DTO변환한다();
    }
    async 해결처리한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const issue = await repository.findOne({ where: { id } });
        if (!issue) {
            throw new common_1.NotFoundException(`근태 이슈를 찾을 수 없습니다. (id: ${id})`);
        }
        issue.해결처리한다();
        issue.수정자설정한다(userId);
        issue.메타데이터업데이트한다(userId);
        const saved = await repository.save(issue);
        return saved.DTO변환한다();
    }
    async 거부처리한다(id, rejectionReason, userId, manager) {
        const repository = this.getRepository(manager);
        const issue = await repository.findOne({ where: { id } });
        if (!issue) {
            throw new common_1.NotFoundException(`근태 이슈를 찾을 수 없습니다. (id: ${id})`);
        }
        issue.거부처리한다(rejectionReason);
        issue.수정자설정한다(userId);
        issue.메타데이터업데이트한다(userId);
        const saved = await repository.save(issue);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const issue = await repository.findOne({ where: { id } });
        if (!issue) {
            throw new common_1.NotFoundException(`근태 이슈를 찾을 수 없습니다. (id: ${id})`);
        }
        issue.deleted_at = new Date();
        issue.수정자설정한다(userId);
        issue.메타데이터업데이트한다(userId);
        await repository.save(issue);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const issue = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!issue) {
            throw new common_1.NotFoundException(`근태 이슈를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(issue);
    }
};
exports.DomainAttendanceIssueService = DomainAttendanceIssueService;
exports.DomainAttendanceIssueService = DomainAttendanceIssueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_issue_entity_1.AttendanceIssue)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainAttendanceIssueService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.types.ts":
/*!*************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.types.ts ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendanceIssueStatus = void 0;
var AttendanceIssueStatus;
(function (AttendanceIssueStatus) {
    AttendanceIssueStatus["PENDING"] = "pending";
    AttendanceIssueStatus["CONFIRMED"] = "confirmed";
    AttendanceIssueStatus["RESOLVED"] = "resolved";
    AttendanceIssueStatus["REJECTED"] = "rejected";
})(AttendanceIssueStatus || (exports.AttendanceIssueStatus = AttendanceIssueStatus = {}));


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.entity.ts":
/*!************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/attendance-type/attendance-type.entity.ts ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendanceType = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
let AttendanceType = class AttendanceType extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.title) {
            return;
        }
        if (this.title.trim().length === 0) {
            throw new Error('출석 타입 제목은 필수입니다.');
        }
    }
    validateDataFormat() {
        if (this.work_time === undefined || this.deducted_annual_leave === undefined) {
            return;
        }
        if (this.work_time < 0) {
            throw new Error('근무 시간은 0 이상이어야 합니다.');
        }
        if (this.deducted_annual_leave < 0) {
            throw new Error('차감 연차는 0 이상이어야 합니다.');
        }
    }
    validateLogicalConsistency() {
    }
    constructor(title, work_time, is_recognized_work_time, start_work_time, end_work_time, deducted_annual_leave = 0) {
        super();
        this.title = title;
        this.work_time = work_time;
        this.is_recognized_work_time = is_recognized_work_time;
        this.start_work_time = start_work_time || null;
        this.end_work_time = end_work_time || null;
        this.deducted_annual_leave = deducted_annual_leave;
        this.validateInvariants();
    }
    업데이트한다(title, work_time, is_recognized_work_time, start_work_time, end_work_time, deducted_annual_leave) {
        if (title !== undefined) {
            this.title = title;
        }
        if (work_time !== undefined) {
            this.work_time = work_time;
        }
        if (is_recognized_work_time !== undefined) {
            this.is_recognized_work_time = is_recognized_work_time;
        }
        if (start_work_time !== undefined) {
            this.start_work_time = start_work_time;
        }
        if (end_work_time !== undefined) {
            this.end_work_time = end_work_time;
        }
        if (deducted_annual_leave !== undefined) {
            this.deducted_annual_leave = deducted_annual_leave;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            title: this.title,
            workTime: this.work_time,
            isRecognizedWorkTime: this.is_recognized_work_time,
            startWorkTime: this.start_work_time,
            endWorkTime: this.end_work_time,
            deductedAnnualLeave: this.deducted_annual_leave,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
    calculateWorkTime() {
        if (this.work_time < 60) {
            this.work_time = this.work_time * 60;
        }
    }
};
exports.AttendanceType = AttendanceType;
__decorate([
    (0, typeorm_1.Column)({
        name: 'title',
        comment: '출석 타입 제목',
    }),
    __metadata("design:type", String)
], AttendanceType.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'work_time',
        comment: '근무 시간 (분 단위)',
    }),
    __metadata("design:type", Number)
], AttendanceType.prototype, "work_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'is_recognized_work_time',
        comment: '인정 근무 시간 여부',
    }),
    __metadata("design:type", Boolean)
], AttendanceType.prototype, "is_recognized_work_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_work_time',
        nullable: true,
        comment: '시작 근무 시간',
    }),
    __metadata("design:type", String)
], AttendanceType.prototype, "start_work_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_work_time',
        nullable: true,
        comment: '종료 근무 시간',
    }),
    __metadata("design:type", String)
], AttendanceType.prototype, "end_work_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'deducted_annual_leave',
        type: 'float',
        default: 0,
        comment: '차감 연차',
    }),
    __metadata("design:type", Number)
], AttendanceType.prototype, "deducted_annual_leave", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AttendanceType.prototype, "calculateWorkTime", null);
exports.AttendanceType = AttendanceType = __decorate([
    (0, typeorm_1.Entity)('attendance_types'),
    __metadata("design:paramtypes", [String, Number, Boolean, String, String, Number])
], AttendanceType);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.module.ts":
/*!************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/attendance-type/attendance-type.module.ts ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainAttendanceTypeModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const attendance_type_entity_1 = __webpack_require__(/*! ./attendance-type.entity */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.entity.ts");
const attendance_type_service_1 = __webpack_require__(/*! ./attendance-type.service */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.service.ts");
let DomainAttendanceTypeModule = class DomainAttendanceTypeModule {
};
exports.DomainAttendanceTypeModule = DomainAttendanceTypeModule;
exports.DomainAttendanceTypeModule = DomainAttendanceTypeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([attendance_type_entity_1.AttendanceType])],
        providers: [attendance_type_service_1.DomainAttendanceTypeService],
        exports: [attendance_type_service_1.DomainAttendanceTypeService, typeorm_1.TypeOrmModule],
    })
], DomainAttendanceTypeModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.service.ts":
/*!*************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/attendance-type/attendance-type.service.ts ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainAttendanceTypeService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const attendance_type_entity_1 = __webpack_require__(/*! ./attendance-type.entity */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.entity.ts");
let DomainAttendanceTypeService = class DomainAttendanceTypeService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(attendance_type_entity_1.AttendanceType) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const attendanceType = new attendance_type_entity_1.AttendanceType(data.title, data.workTime, data.isRecognizedWorkTime, data.startWorkTime, data.endWorkTime, data.deductedAnnualLeave !== undefined ? data.deductedAnnualLeave : 0);
        const saved = await repository.save(attendanceType);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const attendanceType = await this.repository.findOne({ where: { id } });
        if (!attendanceType) {
            throw new common_1.NotFoundException(`출석 타입을 찾을 수 없습니다. (id: ${id})`);
        }
        return attendanceType.DTO변환한다();
    }
    async 목록조회한다() {
        const attendanceTypes = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return attendanceTypes.map((at) => at.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const attendanceType = await repository.findOne({ where: { id } });
        if (!attendanceType) {
            throw new common_1.NotFoundException(`출석 타입을 찾을 수 없습니다. (id: ${id})`);
        }
        attendanceType.업데이트한다(data.title, data.workTime, data.isRecognizedWorkTime, data.startWorkTime, data.endWorkTime, data.deductedAnnualLeave);
        attendanceType.수정자설정한다(userId);
        attendanceType.메타데이터업데이트한다(userId);
        const saved = await repository.save(attendanceType);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const attendanceType = await repository.findOne({ where: { id } });
        if (!attendanceType) {
            throw new common_1.NotFoundException(`출석 타입을 찾을 수 없습니다. (id: ${id})`);
        }
        attendanceType.deleted_at = new Date();
        attendanceType.수정자설정한다(userId);
        attendanceType.메타데이터업데이트한다(userId);
        await repository.save(attendanceType);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const attendanceType = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!attendanceType) {
            throw new common_1.NotFoundException(`출석 타입을 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(attendanceType);
    }
};
exports.DomainAttendanceTypeService = DomainAttendanceTypeService;
exports.DomainAttendanceTypeService = DomainAttendanceTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_type_entity_1.AttendanceType)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainAttendanceTypeService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts":
/*!********************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts ***!
  \********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DailyEventSummary = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
let DailyEventSummary = class DailyEventSummary extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.date) {
            return;
        }
    }
    validateDataFormat() {
        if (this.employee_id) {
            this.validateUuidFormat(this.employee_id, 'employee_id');
        }
        if (this.monthly_event_summary_id) {
            this.validateUuidFormat(this.monthly_event_summary_id, 'monthly_event_summary_id');
        }
    }
    validateLogicalConsistency() {
    }
    constructor(date, employee_id, monthly_event_summary_id, is_holiday = false, enter, leave, real_enter, real_leave, is_checked = true, is_late = false, is_early_leave = false, is_absent = false, work_time, note, used_attendances) {
        super();
        this.date = date;
        this.employee_id = employee_id || null;
        this.monthly_event_summary_id = monthly_event_summary_id || null;
        this.is_holiday = is_holiday;
        this.enter = enter || null;
        this.leave = leave || null;
        this.real_enter = real_enter || null;
        this.real_leave = real_leave || null;
        this.is_checked = is_checked;
        this.is_late = is_late;
        this.is_early_leave = is_early_leave;
        this.is_absent = is_absent;
        this.work_time = work_time || null;
        this.note = note || null;
        this.used_attendances = used_attendances || null;
        this.validateInvariants();
    }
    업데이트한다(monthly_event_summary_id, is_holiday, enter, leave, real_enter, real_leave, is_checked, is_late, is_early_leave, is_absent, work_time, note, used_attendances) {
        if (monthly_event_summary_id !== undefined) {
            this.monthly_event_summary_id = monthly_event_summary_id;
        }
        if (is_holiday !== undefined) {
            this.is_holiday = is_holiday;
        }
        if (enter !== undefined) {
            this.enter = enter;
        }
        if (leave !== undefined) {
            this.leave = leave;
        }
        if (real_enter !== undefined) {
            this.real_enter = real_enter;
        }
        if (real_leave !== undefined) {
            this.real_leave = real_leave;
        }
        if (is_checked !== undefined) {
            this.is_checked = is_checked;
        }
        if (is_late !== undefined) {
            this.is_late = is_late;
        }
        if (is_early_leave !== undefined) {
            this.is_early_leave = is_early_leave;
        }
        if (is_absent !== undefined) {
            this.is_absent = is_absent;
        }
        if (work_time !== undefined) {
            this.work_time = work_time;
        }
        if (note !== undefined) {
            this.note = note;
        }
        if (used_attendances !== undefined) {
            this.used_attendances = used_attendances;
        }
        this.validateInvariants();
    }
    근무시간계산한다() {
        if (this.enter && this.leave && this.date) {
            const enterDate = new Date(`${this.date}T${this.enter}`);
            const leaveDate = new Date(`${this.date}T${this.leave}`);
            const diff = leaveDate.getTime() - enterDate.getTime();
            this.work_time = Math.floor(diff / (1000 * 60));
        }
        else {
            this.work_time = null;
        }
    }
    이벤트시간입력한다(earliest, latest) {
        this.enter = earliest;
        this.leave = latest;
        this.real_enter = earliest;
        this.real_leave = latest;
        this.is_absent = false;
        this.is_late = false;
        this.is_early_leave = false;
        this.is_checked = true;
        this.note = '';
    }
    이벤트시간초기화한다() {
        this.enter = '';
        this.leave = '';
        this.real_enter = '';
        this.real_leave = '';
        this.is_absent = false;
        this.is_late = false;
        this.is_early_leave = false;
        this.is_checked = true;
        this.note = '';
    }
    비고업데이트한다(note) {
        this.note = note;
    }
    DTO변환한다() {
        return {
            id: this.id,
            date: this.date,
            employeeId: this.employee_id,
            monthlyEventSummaryId: this.monthly_event_summary_id,
            isHoliday: this.is_holiday,
            enter: this.enter,
            leave: this.leave,
            realEnter: this.real_enter,
            realLeave: this.real_leave,
            isChecked: this.is_checked,
            isLate: this.is_late,
            isEarlyLeave: this.is_early_leave,
            isAbsent: this.is_absent,
            workTime: this.work_time,
            note: this.note,
            usedAttendances: this.used_attendances,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.DailyEventSummary = DailyEventSummary;
__decorate([
    (0, typeorm_1.Column)({ name: 'date', type: 'date' }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_b = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _b : Object)
], DailyEventSummary.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_event_summary_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "monthly_event_summary_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('MonthlyEventSummary', 'dailyEventSummaries', {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'monthly_event_summary_id' }),
    __metadata("design:type", Object)
], DailyEventSummary.prototype, "monthlyEventSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_holiday', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DailyEventSummary.prototype, "is_holiday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enter', nullable: true }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "enter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leave', nullable: true }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "leave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'real_enter', nullable: true }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "real_enter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'real_leave', nullable: true }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "real_leave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_checked', default: true }),
    __metadata("design:type", Boolean)
], DailyEventSummary.prototype, "is_checked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_late', default: false }),
    __metadata("design:type", Boolean)
], DailyEventSummary.prototype, "is_late", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_early_leave', default: false }),
    __metadata("design:type", Boolean)
], DailyEventSummary.prototype, "is_early_leave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_absent', default: false }),
    __metadata("design:type", Boolean)
], DailyEventSummary.prototype, "is_absent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_time', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DailyEventSummary.prototype, "work_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    __metadata("design:type", String)
], DailyEventSummary.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_attendances', type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Array !== "undefined" && Array) === "function" ? _c : Object)
], DailyEventSummary.prototype, "used_attendances", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DailyEventSummary.prototype, "\uADFC\uBB34\uC2DC\uAC04\uACC4\uC0B0\uD55C\uB2E4", null);
exports.DailyEventSummary = DailyEventSummary = __decorate([
    (0, typeorm_1.Entity)('daily_event_summaries'),
    (0, typeorm_1.Index)(['date', 'employee_id'], { unique: true }),
    __metadata("design:paramtypes", [String, String, String, Boolean, String, String, String, String, Boolean, Boolean, Boolean, Boolean, Number, String, typeof (_a = typeof Array !== "undefined" && Array) === "function" ? _a : Object])
], DailyEventSummary);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.module.ts":
/*!********************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.module.ts ***!
  \********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDailyEventSummaryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const daily_event_summary_entity_1 = __webpack_require__(/*! ./daily-event-summary.entity */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts");
const daily_event_summary_service_1 = __webpack_require__(/*! ./daily-event-summary.service */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.service.ts");
let DomainDailyEventSummaryModule = class DomainDailyEventSummaryModule {
};
exports.DomainDailyEventSummaryModule = DomainDailyEventSummaryModule;
exports.DomainDailyEventSummaryModule = DomainDailyEventSummaryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([daily_event_summary_entity_1.DailyEventSummary])],
        providers: [daily_event_summary_service_1.DomainDailyEventSummaryService],
        exports: [daily_event_summary_service_1.DomainDailyEventSummaryService, typeorm_1.TypeOrmModule],
    })
], DomainDailyEventSummaryModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.service.ts":
/*!*********************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.service.ts ***!
  \*********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDailyEventSummaryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const daily_event_summary_entity_1 = __webpack_require__(/*! ./daily-event-summary.entity */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts");
let DomainDailyEventSummaryService = class DomainDailyEventSummaryService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(daily_event_summary_entity_1.DailyEventSummary) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const summary = new daily_event_summary_entity_1.DailyEventSummary(data.date, data.employeeId, data.monthlyEventSummaryId, data.isHoliday !== undefined ? data.isHoliday : false, data.enter, data.leave, data.realEnter, data.realLeave, data.isChecked !== undefined ? data.isChecked : true, data.isLate !== undefined ? data.isLate : false, data.isEarlyLeave !== undefined ? data.isEarlyLeave : false, data.isAbsent !== undefined ? data.isAbsent : false, data.workTime, data.note);
        const saved = await repository.save(summary);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const summary = await this.repository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!summary) {
            throw new common_1.NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        return summary.DTO변환한다();
    }
    async 날짜범위로조회한다(startDate, endDate) {
        const summaries = await this.dataSource.manager
            .createQueryBuilder(daily_event_summary_entity_1.DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.deleted_at IS NULL')
            .andWhere('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.employee_id', 'ASC')
            .addOrderBy('daily.date', 'ASC')
            .getMany();
        return summaries.map((summary) => summary.DTO변환한다());
    }
    async 직원ID와날짜범위로조회한다(employeeId, startDate, endDate) {
        const summaries = await this.dataSource.manager
            .createQueryBuilder(daily_event_summary_entity_1.DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.deleted_at IS NULL')
            .andWhere('daily.employee_id = :employeeId', { employeeId })
            .andWhere('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.date', 'ASC')
            .getMany();
        return summaries.map((summary) => summary.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({ where: { id } });
        if (!summary) {
            throw new common_1.NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        summary.업데이트한다(data.monthlyEventSummaryId, data.isHoliday, data.enter, data.leave, data.realEnter, data.realLeave, data.isChecked, data.isLate, data.isEarlyLeave, data.isAbsent, data.workTime, data.note);
        summary.수정자설정한다(userId);
        summary.메타데이터업데이트한다(userId);
        const saved = await repository.save(summary);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({ where: { id } });
        if (!summary) {
            throw new common_1.NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        summary.deleted_at = new Date();
        summary.수정자설정한다(userId);
        summary.메타데이터업데이트한다(userId);
        await repository.save(summary);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!summary) {
            throw new common_1.NotFoundException(`일간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(summary);
    }
};
exports.DomainDailyEventSummaryService = DomainDailyEventSummaryService;
exports.DomainDailyEventSummaryService = DomainDailyEventSummaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_event_summary_entity_1.DailyEventSummary)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainDailyEventSummaryService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.entity.ts":
/*!**************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.entity.ts ***!
  \**************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DailySummaryChangeHistory = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const daily_event_summary_entity_1 = __webpack_require__(/*! ../daily-event-summary/daily-event-summary.entity */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts");
let DailySummaryChangeHistory = class DailySummaryChangeHistory extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.daily_event_summary_id || !this.date || !this.content || !this.changed_by) {
            return;
        }
        if (this.content.trim().length === 0) {
            throw new Error('변경 내역은 필수입니다.');
        }
        if (this.changed_by.trim().length === 0) {
            throw new Error('변경자는 필수입니다.');
        }
        this.validateUuidFormat(this.daily_event_summary_id, 'daily_event_summary_id');
    }
    validateDataFormat() {
        if (!this.changed_by) {
            return;
        }
        if (this.changed_by.length > 255) {
            throw new Error('변경자는 255자 이하여야 합니다.');
        }
        if (this.snapshot_id) {
            this.validateUuidFormat(this.snapshot_id, 'snapshot_id');
        }
    }
    validateLogicalConsistency() {
    }
    constructor(daily_event_summary_id, date, content, changed_by, reason, snapshot_id) {
        super();
        this.daily_event_summary_id = daily_event_summary_id;
        this.date = date;
        this.content = content;
        this.changed_by = changed_by;
        this.reason = reason || null;
        this.snapshot_id = snapshot_id || null;
        this.changed_at = new Date();
        this.validateInvariants();
    }
    업데이트한다(content, reason, snapshot_id) {
        if (content !== undefined) {
            this.content = content;
        }
        if (reason !== undefined) {
            this.reason = reason;
        }
        if (snapshot_id !== undefined) {
            this.snapshot_id = snapshot_id;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            dailyEventSummaryId: this.daily_event_summary_id,
            date: this.date,
            content: this.content,
            changedBy: this.changed_by,
            changedAt: this.changed_at,
            reason: this.reason,
            snapshotId: this.snapshot_id,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.DailySummaryChangeHistory = DailySummaryChangeHistory;
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_event_summary_id', type: 'uuid' }),
    __metadata("design:type", String)
], DailySummaryChangeHistory.prototype, "daily_event_summary_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => daily_event_summary_entity_1.DailyEventSummary, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'daily_event_summary_id' }),
    __metadata("design:type", typeof (_a = typeof daily_event_summary_entity_1.DailyEventSummary !== "undefined" && daily_event_summary_entity_1.DailyEventSummary) === "function" ? _a : Object)
], DailySummaryChangeHistory.prototype, "dailyEventSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'date',
        type: 'date',
        comment: '날짜',
    }),
    __metadata("design:type", String)
], DailySummaryChangeHistory.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'content',
        type: 'text',
        comment: '변경 내역',
    }),
    __metadata("design:type", String)
], DailySummaryChangeHistory.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'changed_by',
        type: 'varchar',
        length: 255,
        comment: '변경자',
    }),
    __metadata("design:type", String)
], DailySummaryChangeHistory.prototype, "changed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'changed_at',
        type: 'timestamp',
        comment: '변경 시간',
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], DailySummaryChangeHistory.prototype, "changed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reason',
        type: 'text',
        nullable: true,
        comment: '변경 사유',
    }),
    __metadata("design:type", String)
], DailySummaryChangeHistory.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'snapshot_id',
        type: 'uuid',
        nullable: true,
        comment: '스냅샷 ID',
    }),
    __metadata("design:type", String)
], DailySummaryChangeHistory.prototype, "snapshot_id", void 0);
exports.DailySummaryChangeHistory = DailySummaryChangeHistory = __decorate([
    (0, typeorm_1.Entity)('daily_summary_change_history'),
    (0, typeorm_1.Index)(['daily_event_summary_id', 'changed_at']),
    __metadata("design:paramtypes", [String, String, String, String, String, String])
], DailySummaryChangeHistory);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.module.ts":
/*!**************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.module.ts ***!
  \**************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDailySummaryChangeHistoryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const daily_summary_change_history_entity_1 = __webpack_require__(/*! ./daily-summary-change-history.entity */ "./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.entity.ts");
const daily_summary_change_history_service_1 = __webpack_require__(/*! ./daily-summary-change-history.service */ "./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.service.ts");
let DomainDailySummaryChangeHistoryModule = class DomainDailySummaryChangeHistoryModule {
};
exports.DomainDailySummaryChangeHistoryModule = DomainDailySummaryChangeHistoryModule;
exports.DomainDailySummaryChangeHistoryModule = DomainDailySummaryChangeHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([daily_summary_change_history_entity_1.DailySummaryChangeHistory])],
        providers: [daily_summary_change_history_service_1.DomainDailySummaryChangeHistoryService],
        exports: [daily_summary_change_history_service_1.DomainDailySummaryChangeHistoryService, typeorm_1.TypeOrmModule],
    })
], DomainDailySummaryChangeHistoryModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.service.ts":
/*!***************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.service.ts ***!
  \***************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDailySummaryChangeHistoryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const daily_summary_change_history_entity_1 = __webpack_require__(/*! ./daily-summary-change-history.entity */ "./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.entity.ts");
let DomainDailySummaryChangeHistoryService = class DomainDailySummaryChangeHistoryService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(daily_summary_change_history_entity_1.DailySummaryChangeHistory) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const history = new daily_summary_change_history_entity_1.DailySummaryChangeHistory(data.dailyEventSummaryId, data.date, data.content, data.changedBy, data.reason, data.snapshotId);
        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const history = await this.repository.findOne({
            where: { id },
            relations: ['dailyEventSummary'],
        });
        if (!history) {
            throw new common_1.NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        return history.DTO변환한다();
    }
    async 일간요약ID로목록조회한다(dailyEventSummaryId) {
        const histories = await this.repository.find({
            where: { daily_event_summary_id: dailyEventSummaryId, deleted_at: (0, typeorm_2.IsNull)() },
            order: { changed_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }
    async 날짜범위로목록조회한다(startDate, endDate) {
        const histories = await this.repository
            .createQueryBuilder('history')
            .where('history.deleted_at IS NULL')
            .andWhere('history.date >= :startDate', { startDate })
            .andWhere('history.date <= :endDate', { endDate })
            .orderBy('history.changed_at', 'DESC')
            .getMany();
        return histories.map((history) => history.DTO변환한다());
    }
    async 변경자로목록조회한다(changedBy) {
        const histories = await this.repository.find({
            where: { changed_by: changedBy, deleted_at: (0, typeorm_2.IsNull)() },
            order: { changed_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }
    async 날짜로목록조회한다(date) {
        const histories = await this.repository.find({
            where: { date, deleted_at: (0, typeorm_2.IsNull)() },
            order: { changed_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new common_1.NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        history.업데이트한다(data.content, data.reason, data.snapshotId);
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new common_1.NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        history.deleted_at = new Date();
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        await repository.save(history);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!history) {
            throw new common_1.NotFoundException(`일간 요약 변경 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(history);
    }
};
exports.DomainDailySummaryChangeHistoryService = DomainDailySummaryChangeHistoryService;
exports.DomainDailySummaryChangeHistoryService = DomainDailySummaryChangeHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_summary_change_history_entity_1.DailySummaryChangeHistory)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainDailySummaryChangeHistoryService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.entity.ts":
/*!********************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.entity.ts ***!
  \********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DataSnapshotChild_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataSnapshotChild = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const data_snapshot_info_entity_1 = __webpack_require__(/*! ../data-snapshot-info/data-snapshot-info.entity */ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
let DataSnapshotChild = DataSnapshotChild_1 = class DataSnapshotChild extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.employee_id || !this.employee_name || !this.employee_number || !this.yyyy || !this.mm) {
            return;
        }
        if (this.employee_name.trim().length === 0) {
            throw new Error('직원명은 필수입니다.');
        }
        if (this.employee_number.trim().length === 0) {
            throw new Error('직원번호는 필수입니다.');
        }
        if (this.yyyy.trim().length === 0) {
            throw new Error('연도는 필수입니다.');
        }
        if (this.mm.trim().length === 0) {
            throw new Error('월은 필수입니다.');
        }
        this.validateUuidFormat(this.employee_id, 'employee_id');
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
    }
    constructor(employee_id, employee_name, employee_number, yyyy, mm, snapshot_data) {
        super();
        this.employee_id = employee_id;
        this.employee_name = employee_name;
        this.employee_number = employee_number;
        this.yyyy = yyyy;
        this.mm = mm;
        this.snapshot_data = snapshot_data;
        this.validateInvariants();
    }
    업데이트한다(employee_name, employee_number, snapshot_data) {
        if (employee_name !== undefined) {
            this.employee_name = employee_name;
        }
        if (employee_number !== undefined) {
            this.employee_number = employee_number;
        }
        if (snapshot_data !== undefined) {
            this.snapshot_data = snapshot_data;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            employeeId: this.employee_id,
            employeeName: this.employee_name,
            employeeNumber: this.employee_number,
            yyyy: this.yyyy,
            mm: this.mm,
            snapshotData: this.snapshot_data,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
    로드후처리한다() {
        if (typeof this.snapshot_data === 'string') {
            try {
                this.snapshot_data = JSON.parse(this.snapshot_data);
            }
            catch (error) {
            }
        }
    }
    static 부모데이터로부터생성한다(snapshotData) {
        return snapshotData.map((data) => {
            const dataSnapshotChild = new DataSnapshotChild_1(data.employeeId, data.employeeName, data.employeeNumber, data.yyyymm.slice(0, 4), data.yyyymm.slice(5, 7), JSON.stringify(data));
            return dataSnapshotChild;
        });
    }
};
exports.DataSnapshotChild = DataSnapshotChild;
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid' }),
    __metadata("design:type", String)
], DataSnapshotChild.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_a = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _a : Object)
], DataSnapshotChild.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'employee_name',
        comment: '직원명',
    }),
    __metadata("design:type", String)
], DataSnapshotChild.prototype, "employee_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'employee_number',
        comment: '직원번호',
    }),
    __metadata("design:type", String)
], DataSnapshotChild.prototype, "employee_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'yyyy',
        comment: '연도',
    }),
    __metadata("design:type", String)
], DataSnapshotChild.prototype, "yyyy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'mm',
        comment: '월',
    }),
    __metadata("design:type", String)
], DataSnapshotChild.prototype, "mm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'snapshot_data', type: 'json' }),
    __metadata("design:type", String)
], DataSnapshotChild.prototype, "snapshot_data", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => data_snapshot_info_entity_1.DataSnapshotInfo, (snapshot) => snapshot.dataSnapshotChildInfoList, { onDelete: 'CASCADE' }),
    __metadata("design:type", typeof (_b = typeof data_snapshot_info_entity_1.DataSnapshotInfo !== "undefined" && data_snapshot_info_entity_1.DataSnapshotInfo) === "function" ? _b : Object)
], DataSnapshotChild.prototype, "parentSnapshot", void 0);
__decorate([
    (0, typeorm_1.AfterLoad)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataSnapshotChild.prototype, "\uB85C\uB4DC\uD6C4\uCC98\uB9AC\uD55C\uB2E4", null);
exports.DataSnapshotChild = DataSnapshotChild = DataSnapshotChild_1 = __decorate([
    (0, typeorm_1.Entity)('data_snapshot_child'),
    __metadata("design:paramtypes", [String, String, String, String, String, String])
], DataSnapshotChild);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.module.ts":
/*!********************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.module.ts ***!
  \********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDataSnapshotChildModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const data_snapshot_child_entity_1 = __webpack_require__(/*! ./data-snapshot-child.entity */ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.entity.ts");
const data_snapshot_child_service_1 = __webpack_require__(/*! ./data-snapshot-child.service */ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.service.ts");
let DomainDataSnapshotChildModule = class DomainDataSnapshotChildModule {
};
exports.DomainDataSnapshotChildModule = DomainDataSnapshotChildModule;
exports.DomainDataSnapshotChildModule = DomainDataSnapshotChildModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([data_snapshot_child_entity_1.DataSnapshotChild])],
        providers: [data_snapshot_child_service_1.DomainDataSnapshotChildService],
        exports: [data_snapshot_child_service_1.DomainDataSnapshotChildService, typeorm_1.TypeOrmModule],
    })
], DomainDataSnapshotChildModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.service.ts":
/*!*********************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.service.ts ***!
  \*********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDataSnapshotChildService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const data_snapshot_child_entity_1 = __webpack_require__(/*! ./data-snapshot-child.entity */ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.entity.ts");
let DomainDataSnapshotChildService = class DomainDataSnapshotChildService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(data_snapshot_child_entity_1.DataSnapshotChild) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const child = new data_snapshot_child_entity_1.DataSnapshotChild(data.employeeId, data.employeeName, data.employeeNumber, data.yyyy, data.mm, data.snapshotData);
        const saved = await repository.save(child);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const child = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'parentSnapshot'],
        });
        if (!child) {
            throw new common_1.NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }
        return child.DTO변환한다();
    }
    async 목록조회한다() {
        const children = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['employee', 'parentSnapshot'],
            order: { created_at: 'DESC' },
        });
        return children.map((child) => child.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const child = await repository.findOne({ where: { id } });
        if (!child) {
            throw new common_1.NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }
        child.업데이트한다(data.employeeName, data.employeeNumber, data.snapshotData);
        child.수정자설정한다(userId);
        child.메타데이터업데이트한다(userId);
        const saved = await repository.save(child);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const child = await repository.findOne({ where: { id } });
        if (!child) {
            throw new common_1.NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }
        child.deleted_at = new Date();
        child.수정자설정한다(userId);
        child.메타데이터업데이트한다(userId);
        await repository.save(child);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const child = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!child) {
            throw new common_1.NotFoundException(`데이터 스냅샷 자식을 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(child);
    }
};
exports.DomainDataSnapshotChildService = DomainDataSnapshotChildService;
exports.DomainDataSnapshotChildService = DomainDataSnapshotChildService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(data_snapshot_child_entity_1.DataSnapshotChild)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainDataSnapshotChildService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity.ts":
/*!******************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity.ts ***!
  \******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataSnapshotInfo = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const data_snapshot_child_entity_1 = __webpack_require__(/*! ../data-snapshot-child/data-snapshot-child.entity */ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.entity.ts");
const department_entity_1 = __webpack_require__(/*! @libs/modules/department/department.entity */ "./libs/modules/department/department.entity.ts");
const data_snapshot_info_types_1 = __webpack_require__(/*! ./data-snapshot-info.types */ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.types.ts");
let DataSnapshotInfo = class DataSnapshotInfo extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.snapshot_name || !this.snapshot_type || !this.yyyy || !this.mm || !this.department_id) {
            return;
        }
        if (this.snapshot_name.trim().length === 0) {
            throw new Error('스냅샷명은 필수입니다.');
        }
        if (this.yyyy.trim().length === 0) {
            throw new Error('연도는 필수입니다.');
        }
        if (this.mm.trim().length === 0) {
            throw new Error('월은 필수입니다.');
        }
        this.validateUuidFormat(this.department_id, 'department_id');
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
    }
    constructor(snapshot_name, snapshot_type, yyyy, mm, department_id, description = '') {
        super();
        this.snapshot_name = snapshot_name;
        this.snapshot_type = snapshot_type;
        this.yyyy = yyyy;
        this.mm = mm;
        this.department_id = department_id;
        this.description = description;
        this.validateInvariants();
    }
    업데이트한다(snapshot_name, description) {
        if (snapshot_name !== undefined) {
            this.snapshot_name = snapshot_name;
        }
        if (description !== undefined) {
            this.description = description;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            snapshotName: this.snapshot_name,
            description: this.description,
            snapshotType: this.snapshot_type,
            yyyy: this.yyyy,
            mm: this.mm,
            departmentId: this.department_id,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
    로드후처리한다() {
        if (this.created_at) {
            this.createdAt = new Date(this.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        }
        if (this.dataSnapshotChildInfoList) {
            this.dataSnapshotChildInfoList.sort((a, b) => a.employee_name.localeCompare(b.employee_name, 'ko'));
        }
    }
};
exports.DataSnapshotInfo = DataSnapshotInfo;
__decorate([
    (0, typeorm_1.Column)({
        name: 'snapshot_name',
        comment: '스냅샷명',
    }),
    __metadata("design:type", String)
], DataSnapshotInfo.prototype, "snapshot_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'description',
        default: '',
        comment: '설명',
    }),
    __metadata("design:type", String)
], DataSnapshotInfo.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'snapshot_type',
        type: 'text',
        comment: '스냅샷 타입',
    }),
    __metadata("design:type", typeof (_b = typeof data_snapshot_info_types_1.SnapshotType !== "undefined" && data_snapshot_info_types_1.SnapshotType) === "function" ? _b : Object)
], DataSnapshotInfo.prototype, "snapshot_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'yyyy',
        comment: '연도',
    }),
    __metadata("design:type", String)
], DataSnapshotInfo.prototype, "yyyy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'mm',
        comment: '월',
    }),
    __metadata("design:type", String)
], DataSnapshotInfo.prototype, "mm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', type: 'uuid' }),
    __metadata("design:type", String)
], DataSnapshotInfo.prototype, "department_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => data_snapshot_child_entity_1.DataSnapshotChild, (child) => child.parentSnapshot, {
        cascade: ['insert', 'update', 'remove'],
    }),
    __metadata("design:type", Array)
], DataSnapshotInfo.prototype, "dataSnapshotChildInfoList", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", typeof (_c = typeof department_entity_1.Department !== "undefined" && department_entity_1.Department) === "function" ? _c : Object)
], DataSnapshotInfo.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.AfterLoad)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DataSnapshotInfo.prototype, "\uB85C\uB4DC\uD6C4\uCC98\uB9AC\uD55C\uB2E4", null);
exports.DataSnapshotInfo = DataSnapshotInfo = __decorate([
    (0, typeorm_1.Entity)('data_snapshot_info'),
    __metadata("design:paramtypes", [String, typeof (_a = typeof data_snapshot_info_types_1.SnapshotType !== "undefined" && data_snapshot_info_types_1.SnapshotType) === "function" ? _a : Object, String, String, String, String])
], DataSnapshotInfo);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.module.ts":
/*!******************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.module.ts ***!
  \******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDataSnapshotInfoModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const data_snapshot_info_entity_1 = __webpack_require__(/*! ./data-snapshot-info.entity */ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity.ts");
const data_snapshot_info_service_1 = __webpack_require__(/*! ./data-snapshot-info.service */ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.service.ts");
let DomainDataSnapshotInfoModule = class DomainDataSnapshotInfoModule {
};
exports.DomainDataSnapshotInfoModule = DomainDataSnapshotInfoModule;
exports.DomainDataSnapshotInfoModule = DomainDataSnapshotInfoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([data_snapshot_info_entity_1.DataSnapshotInfo])],
        providers: [data_snapshot_info_service_1.DomainDataSnapshotInfoService],
        exports: [data_snapshot_info_service_1.DomainDataSnapshotInfoService, typeorm_1.TypeOrmModule],
    })
], DomainDataSnapshotInfoModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.service.ts":
/*!*******************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.service.ts ***!
  \*******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDataSnapshotInfoService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const data_snapshot_info_entity_1 = __webpack_require__(/*! ./data-snapshot-info.entity */ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.entity.ts");
let DomainDataSnapshotInfoService = class DomainDataSnapshotInfoService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(data_snapshot_info_entity_1.DataSnapshotInfo) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const snapshot = new data_snapshot_info_entity_1.DataSnapshotInfo(data.snapshotName, data.snapshotType, data.yyyy, data.mm, data.departmentId, data.description || '');
        const saved = await repository.save(snapshot);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const snapshot = await this.repository.findOne({
            where: { id },
            relations: ['dataSnapshotChildInfoList', 'department'],
        });
        if (!snapshot) {
            throw new common_1.NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        return snapshot.DTO변환한다();
    }
    async 자식포함목록조회한다() {
        const snapshots = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }
    async 자식포함조회한다(id) {
        const snapshot = await this.repository.findOne({
            where: { id, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['dataSnapshotChildInfoList'],
        });
        return snapshot ? snapshot.DTO변환한다() : null;
    }
    async 연월로목록조회한다(yyyy, mm) {
        const snapshots = await this.repository.find({
            where: { yyyy, mm, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }
    async 타입으로목록조회한다(snapshotType) {
        const snapshots = await this.repository.find({
            where: { snapshot_type: snapshotType, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }
    async 연월과타입으로목록조회한다(yyyy, mm, snapshotType) {
        const snapshots = await this.repository.find({
            where: { yyyy, mm, snapshot_type: snapshotType, deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['dataSnapshotChildInfoList'],
            order: {
                created_at: 'DESC',
            },
        });
        return snapshots.map((snapshot) => snapshot.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const snapshot = await repository.findOne({ where: { id } });
        if (!snapshot) {
            throw new common_1.NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        snapshot.업데이트한다(data.snapshotName, data.description);
        snapshot.수정자설정한다(userId);
        snapshot.메타데이터업데이트한다(userId);
        const saved = await repository.save(snapshot);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const snapshot = await repository.findOne({ where: { id } });
        if (!snapshot) {
            throw new common_1.NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        snapshot.deleted_at = new Date();
        snapshot.수정자설정한다(userId);
        snapshot.메타데이터업데이트한다(userId);
        await repository.save(snapshot);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const snapshot = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!snapshot) {
            throw new common_1.NotFoundException(`데이터 스냅샷 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(snapshot);
    }
};
exports.DomainDataSnapshotInfoService = DomainDataSnapshotInfoService;
exports.DomainDataSnapshotInfoService = DomainDataSnapshotInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(data_snapshot_info_entity_1.DataSnapshotInfo)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainDataSnapshotInfoService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.types.ts":
/*!*****************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.types.ts ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SnapshotType = void 0;
var SnapshotType;
(function (SnapshotType) {
    SnapshotType["DAILY"] = "DAILY";
    SnapshotType["WEEKLY"] = "WEEKLY";
    SnapshotType["MONTHLY"] = "MONTHLY";
    SnapshotType["ANNUAL"] = "ANNUAL_LEAVE";
})(SnapshotType || (exports.SnapshotType = SnapshotType = {}));


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/domain.module.ts":
/*!***********************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/domain.module.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const attendance_type_module_1 = __webpack_require__(/*! ./attendance-type/attendance-type.module */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.module.ts");
const attendance_issue_module_1 = __webpack_require__(/*! ./attendance-issue/attendance-issue.module */ "./apps/lams/src/refactoring/domain/attendance-issue/attendance-issue.module.ts");
const daily_event_summary_module_1 = __webpack_require__(/*! ./daily-event-summary/daily-event-summary.module */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.module.ts");
const data_snapshot_child_module_1 = __webpack_require__(/*! ./data-snapshot-child/data-snapshot-child.module */ "./apps/lams/src/refactoring/domain/data-snapshot-child/data-snapshot-child.module.ts");
const data_snapshot_info_module_1 = __webpack_require__(/*! ./data-snapshot-info/data-snapshot-info.module */ "./apps/lams/src/refactoring/domain/data-snapshot-info/data-snapshot-info.module.ts");
const event_info_module_1 = __webpack_require__(/*! ./event-info/event-info.module */ "./apps/lams/src/refactoring/domain/event-info/event-info.module.ts");
const file_module_1 = __webpack_require__(/*! ./file/file.module */ "./apps/lams/src/refactoring/domain/file/file.module.ts");
const file_content_reflection_history_module_1 = __webpack_require__(/*! ./file-content-reflection-history/file-content-reflection-history.module */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.module.ts");
const holiday_info_module_1 = __webpack_require__(/*! ./holiday-info/holiday-info.module */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.module.ts");
const monthly_event_summary_module_1 = __webpack_require__(/*! ./monthly-event-summary/monthly-event-summary.module */ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.module.ts");
const used_attendance_module_1 = __webpack_require__(/*! ./used-attendance/used-attendance.module */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.module.ts");
const daily_summary_change_history_module_1 = __webpack_require__(/*! ./daily-summary-change-history/daily-summary-change-history.module */ "./apps/lams/src/refactoring/domain/daily-summary-change-history/daily-summary-change-history.module.ts");
const project_module_1 = __webpack_require__(/*! ./project/project.module */ "./apps/lams/src/refactoring/domain/project/project.module.ts");
const assigned_project_module_1 = __webpack_require__(/*! ./assigned-project/assigned-project.module */ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.module.ts");
const work_hours_module_1 = __webpack_require__(/*! ./work-hours/work-hours.module */ "./apps/lams/src/refactoring/domain/work-hours/work-hours.module.ts");
const employee_module_1 = __webpack_require__(/*! @libs/modules/employee/employee.module */ "./libs/modules/employee/employee.module.ts");
const department_module_1 = __webpack_require__(/*! @libs/modules/department/department.module */ "./libs/modules/department/department.module.ts");
const position_module_1 = __webpack_require__(/*! @libs/modules/position/position.module */ "./libs/modules/position/position.module.ts");
const rank_module_1 = __webpack_require__(/*! @libs/modules/rank/rank.module */ "./libs/modules/rank/rank.module.ts");
const employee_department_position_module_1 = __webpack_require__(/*! @libs/modules/employee-department-position/employee-department-position.module */ "./libs/modules/employee-department-position/employee-department-position.module.ts");
let DomainModule = class DomainModule {
};
exports.DomainModule = DomainModule;
exports.DomainModule = DomainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            department_module_1.DomainDepartmentModule,
            employee_module_1.DomainEmployeeModule,
            employee_department_position_module_1.DomainEmployeeDepartmentPositionModule,
            position_module_1.DomainPositionModule,
            rank_module_1.DomainRankModule,
            attendance_type_module_1.DomainAttendanceTypeModule,
            attendance_issue_module_1.DomainAttendanceIssueModule,
            daily_event_summary_module_1.DomainDailyEventSummaryModule,
            event_info_module_1.DomainEventInfoModule,
            holiday_info_module_1.DomainHolidayInfoModule,
            used_attendance_module_1.DomainUsedAttendanceModule,
            monthly_event_summary_module_1.DomainMonthlyEventSummaryModule,
            data_snapshot_info_module_1.DomainDataSnapshotInfoModule,
            data_snapshot_child_module_1.DomainDataSnapshotChildModule,
            file_module_1.DomainFileModule,
            file_content_reflection_history_module_1.DomainFileContentReflectionHistoryModule,
            daily_summary_change_history_module_1.DomainDailySummaryChangeHistoryModule,
            project_module_1.DomainProjectModule,
            assigned_project_module_1.DomainAssignedProjectModule,
            work_hours_module_1.DomainWorkHoursModule,
        ],
        exports: [],
    })
], DomainModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/event-info/event-info.entity.ts":
/*!**************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/event-info/event-info.entity.ts ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventInfo_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventInfo = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
let EventInfo = EventInfo_1 = class EventInfo extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.employee_name || !this.event_time || !this.yyyymmdd || !this.hhmmss) {
            return;
        }
        if (this.employee_name.trim().length === 0) {
            throw new Error('직원명은 필수입니다.');
        }
        if (this.event_time.trim().length === 0) {
            throw new Error('이벤트 시간은 필수입니다.');
        }
        if (this.yyyymmdd.trim().length === 0) {
            throw new Error('날짜는 필수입니다.');
        }
        if (this.hhmmss.trim().length === 0) {
            throw new Error('시간은 필수입니다.');
        }
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
    }
    constructor(employee_name, event_time, yyyymmdd, hhmmss, employee_number) {
        super();
        this.employee_name = employee_name;
        this.event_time = event_time;
        this.yyyymmdd = yyyymmdd;
        this.hhmmss = hhmmss;
        this.employee_number = employee_number || null;
        this.validateInvariants();
    }
    업데이트한다(employee_name, employee_number, event_time, yyyymmdd, hhmmss) {
        if (employee_name !== undefined) {
            this.employee_name = employee_name;
        }
        if (employee_number !== undefined) {
            this.employee_number = employee_number;
        }
        if (event_time !== undefined) {
            this.event_time = event_time;
        }
        if (yyyymmdd !== undefined) {
            this.yyyymmdd = yyyymmdd;
        }
        if (hhmmss !== undefined) {
            this.hhmmss = hhmmss;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            employeeName: this.employee_name,
            employeeNumber: this.employee_number,
            eventTime: this.event_time,
            yyyymmdd: this.yyyymmdd,
            hhmmss: this.hhmmss,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
    static 이벤트정보로부터생성한다(eventInfo) {
        const entity = new EventInfo_1(eventInfo.employeeName || eventInfo.employee_name, eventInfo.eventTime || eventInfo.event_time, eventInfo.yyyymmdd, eventInfo.hhmmss, eventInfo.employeeNumber || eventInfo.employee_number);
        return entity;
    }
    static 이벤트정보배열로부터생성한다(eventInfoArray) {
        return eventInfoArray.map((eventInfo) => {
            return {
                employee_name: eventInfo.employeeName || eventInfo.employee_name,
                employee_number: eventInfo.employeeNumber || eventInfo.employee_number,
                event_time: eventInfo.eventTime || eventInfo.event_time,
                yyyymmdd: eventInfo.yyyymmdd,
                hhmmss: eventInfo.hhmmss,
            };
        });
    }
};
exports.EventInfo = EventInfo;
__decorate([
    (0, typeorm_1.Column)({
        name: 'employee_name',
        comment: '직원명',
    }),
    __metadata("design:type", String)
], EventInfo.prototype, "employee_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'employee_number',
        nullable: true,
        comment: '직원번호',
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EventInfo.prototype, "employee_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_time',
        comment: '이벤트 시간',
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], EventInfo.prototype, "event_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'yyyymmdd',
        comment: '날짜 (YYYYMMDD)',
    }),
    __metadata("design:type", String)
], EventInfo.prototype, "yyyymmdd", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'hhmmss',
        comment: '시간 (HHMMSS)',
    }),
    __metadata("design:type", String)
], EventInfo.prototype, "hhmmss", void 0);
exports.EventInfo = EventInfo = EventInfo_1 = __decorate([
    (0, typeorm_1.Entity)('event_info'),
    (0, typeorm_1.Index)(['employee_number', 'yyyymmdd']),
    (0, typeorm_1.Index)(['employee_number', 'event_time'], { unique: true }),
    __metadata("design:paramtypes", [String, String, String, String, String])
], EventInfo);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/event-info/event-info.module.ts":
/*!**************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/event-info/event-info.module.ts ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEventInfoModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const event_info_entity_1 = __webpack_require__(/*! ./event-info.entity */ "./apps/lams/src/refactoring/domain/event-info/event-info.entity.ts");
const event_info_service_1 = __webpack_require__(/*! ./event-info.service */ "./apps/lams/src/refactoring/domain/event-info/event-info.service.ts");
let DomainEventInfoModule = class DomainEventInfoModule {
};
exports.DomainEventInfoModule = DomainEventInfoModule;
exports.DomainEventInfoModule = DomainEventInfoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([event_info_entity_1.EventInfo])],
        providers: [event_info_service_1.DomainEventInfoService],
        exports: [event_info_service_1.DomainEventInfoService, typeorm_1.TypeOrmModule],
    })
], DomainEventInfoModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/event-info/event-info.service.ts":
/*!***************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/event-info/event-info.service.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEventInfoService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const event_info_entity_1 = __webpack_require__(/*! ./event-info.entity */ "./apps/lams/src/refactoring/domain/event-info/event-info.entity.ts");
let DomainEventInfoService = class DomainEventInfoService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(event_info_entity_1.EventInfo) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const eventInfo = new event_info_entity_1.EventInfo(data.employeeName, data.eventTime, data.yyyymmdd, data.hhmmss, data.employeeNumber);
        const saved = await repository.save(eventInfo);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const eventInfo = await this.repository.findOne({ where: { id } });
        if (!eventInfo) {
            throw new common_1.NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        return eventInfo.DTO변환한다();
    }
    async 목록조회한다() {
        const eventInfos = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            order: { event_time: 'DESC' },
        });
        return eventInfos.map((ei) => ei.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const eventInfo = await repository.findOne({ where: { id } });
        if (!eventInfo) {
            throw new common_1.NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        eventInfo.업데이트한다(data.employeeName, data.employeeNumber, data.eventTime, data.yyyymmdd, data.hhmmss);
        eventInfo.수정자설정한다(userId);
        eventInfo.메타데이터업데이트한다(userId);
        const saved = await repository.save(eventInfo);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const eventInfo = await repository.findOne({ where: { id } });
        if (!eventInfo) {
            throw new common_1.NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        eventInfo.deleted_at = new Date();
        eventInfo.수정자설정한다(userId);
        eventInfo.메타데이터업데이트한다(userId);
        await repository.save(eventInfo);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const eventInfo = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!eventInfo) {
            throw new common_1.NotFoundException(`이벤트 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(eventInfo);
    }
};
exports.DomainEventInfoService = DomainEventInfoService;
exports.DomainEventInfoService = DomainEventInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_info_entity_1.EventInfo)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainEventInfoService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.entity.ts":
/*!********************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.entity.ts ***!
  \********************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileContentReflectionHistory = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const file_entity_1 = __webpack_require__(/*! ../file/file.entity */ "./apps/lams/src/refactoring/domain/file/file.entity.ts");
const file_content_reflection_history_types_1 = __webpack_require__(/*! ./file-content-reflection-history.types */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types.ts");
let FileContentReflectionHistory = class FileContentReflectionHistory extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.file_id) {
            return;
        }
        this.validateUuidFormat(this.file_id, 'file_id');
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
    }
    constructor(file_id, type, data, status = file_content_reflection_history_types_1.ReflectionStatus.PENDING) {
        super();
        this.file_id = file_id;
        this.type = type;
        this.data = data || null;
        this.status = status;
        this.reflected_at = null;
        this.validateInvariants();
    }
    업데이트한다(status, data) {
        if (status !== undefined) {
            this.status = status;
        }
        if (data !== undefined) {
            this.data = data;
        }
        this.validateInvariants();
    }
    완료처리한다() {
        this.status = file_content_reflection_history_types_1.ReflectionStatus.COMPLETED;
        this.reflected_at = new Date();
    }
    실패처리한다() {
        this.status = file_content_reflection_history_types_1.ReflectionStatus.FAILED;
    }
    처리중처리한다() {
        this.status = file_content_reflection_history_types_1.ReflectionStatus.PROCESSING;
    }
    DTO변환한다() {
        return {
            id: this.id,
            fileId: this.file_id,
            status: this.status,
            type: this.type,
            data: this.data,
            createdAt: this.created_at,
            reflectedAt: this.reflected_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.FileContentReflectionHistory = FileContentReflectionHistory;
__decorate([
    (0, typeorm_1.Column)({ name: 'file_id', type: 'uuid' }),
    __metadata("design:type", String)
], FileContentReflectionHistory.prototype, "file_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_entity_1.File, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'file_id' }),
    __metadata("design:type", typeof (_d = typeof file_entity_1.File !== "undefined" && file_entity_1.File) === "function" ? _d : Object)
], FileContentReflectionHistory.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: file_content_reflection_history_types_1.ReflectionStatus,
        default: file_content_reflection_history_types_1.ReflectionStatus.PENDING,
        comment: '반영 상태',
    }),
    __metadata("design:type", typeof (_e = typeof file_content_reflection_history_types_1.ReflectionStatus !== "undefined" && file_content_reflection_history_types_1.ReflectionStatus) === "function" ? _e : Object)
], FileContentReflectionHistory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'enum',
        enum: file_content_reflection_history_types_1.ReflectionType,
        default: file_content_reflection_history_types_1.ReflectionType.OTHER,
        comment: '반영 타입',
    }),
    __metadata("design:type", typeof (_f = typeof file_content_reflection_history_types_1.ReflectionType !== "undefined" && file_content_reflection_history_types_1.ReflectionType) === "function" ? _f : Object)
], FileContentReflectionHistory.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'data',
        type: 'jsonb',
        nullable: true,
        comment: '반영 데이터',
    }),
    __metadata("design:type", typeof (_g = typeof Record !== "undefined" && Record) === "function" ? _g : Object)
], FileContentReflectionHistory.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reflected_at',
        type: 'timestamp',
        nullable: true,
        comment: '반영일자',
    }),
    __metadata("design:type", typeof (_h = typeof Date !== "undefined" && Date) === "function" ? _h : Object)
], FileContentReflectionHistory.prototype, "reflected_at", void 0);
exports.FileContentReflectionHistory = FileContentReflectionHistory = __decorate([
    (0, typeorm_1.Entity)('file_content_reflection_history'),
    (0, typeorm_1.Index)(['file_id', 'created_at']),
    __metadata("design:paramtypes", [String, typeof (_a = typeof file_content_reflection_history_types_1.ReflectionType !== "undefined" && file_content_reflection_history_types_1.ReflectionType) === "function" ? _a : Object, typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object, typeof (_c = typeof file_content_reflection_history_types_1.ReflectionStatus !== "undefined" && file_content_reflection_history_types_1.ReflectionStatus) === "function" ? _c : Object])
], FileContentReflectionHistory);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.module.ts":
/*!********************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.module.ts ***!
  \********************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainFileContentReflectionHistoryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const file_content_reflection_history_entity_1 = __webpack_require__(/*! ./file-content-reflection-history.entity */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.entity.ts");
const file_content_reflection_history_service_1 = __webpack_require__(/*! ./file-content-reflection-history.service */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.service.ts");
let DomainFileContentReflectionHistoryModule = class DomainFileContentReflectionHistoryModule {
};
exports.DomainFileContentReflectionHistoryModule = DomainFileContentReflectionHistoryModule;
exports.DomainFileContentReflectionHistoryModule = DomainFileContentReflectionHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_content_reflection_history_entity_1.FileContentReflectionHistory])],
        providers: [file_content_reflection_history_service_1.DomainFileContentReflectionHistoryService],
        exports: [file_content_reflection_history_service_1.DomainFileContentReflectionHistoryService, typeorm_1.TypeOrmModule],
    })
], DomainFileContentReflectionHistoryModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.service.ts":
/*!*********************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.service.ts ***!
  \*********************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainFileContentReflectionHistoryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const file_content_reflection_history_entity_1 = __webpack_require__(/*! ./file-content-reflection-history.entity */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.entity.ts");
const file_content_reflection_history_types_1 = __webpack_require__(/*! ./file-content-reflection-history.types */ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types.ts");
let DomainFileContentReflectionHistoryService = class DomainFileContentReflectionHistoryService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(file_content_reflection_history_entity_1.FileContentReflectionHistory) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const history = new file_content_reflection_history_entity_1.FileContentReflectionHistory(data.fileId, data.type, data.data, data.status || file_content_reflection_history_types_1.ReflectionStatus.PENDING);
        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const history = await this.repository.findOne({
            where: { id },
            relations: ['file'],
        });
        if (!history) {
            throw new common_1.NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        return history.DTO변환한다();
    }
    async 파일ID로목록조회한다(fileId) {
        const histories = await this.repository.find({
            where: { file_id: fileId, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }
    async 상태별목록조회한다(status) {
        const histories = await this.repository.find({
            where: { status, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }
    async 타입별목록조회한다(type) {
        const histories = await this.repository.find({
            where: { type, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return histories.map((history) => history.DTO변환한다());
    }
    async 대기중목록조회한다() {
        return this.상태별목록조회한다(file_content_reflection_history_types_1.ReflectionStatus.PENDING);
    }
    async 처리중목록조회한다() {
        return this.상태별목록조회한다(file_content_reflection_history_types_1.ReflectionStatus.PROCESSING);
    }
    async 완료된목록조회한다() {
        return this.상태별목록조회한다(file_content_reflection_history_types_1.ReflectionStatus.COMPLETED);
    }
    async 실패한목록조회한다() {
        return this.상태별목록조회한다(file_content_reflection_history_types_1.ReflectionStatus.FAILED);
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new common_1.NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        history.업데이트한다(data.status, data.data);
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }
    async 완료처리한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new common_1.NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        history.완료처리한다();
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }
    async 실패처리한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new common_1.NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        history.실패처리한다();
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }
    async 처리중처리한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new common_1.NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        history.처리중처리한다();
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        const saved = await repository.save(history);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({ where: { id } });
        if (!history) {
            throw new common_1.NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        history.deleted_at = new Date();
        history.수정자설정한다(userId);
        history.메타데이터업데이트한다(userId);
        await repository.save(history);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const history = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!history) {
            throw new common_1.NotFoundException(`파일 내용 반영 이력을 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(history);
    }
};
exports.DomainFileContentReflectionHistoryService = DomainFileContentReflectionHistoryService;
exports.DomainFileContentReflectionHistoryService = DomainFileContentReflectionHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_content_reflection_history_entity_1.FileContentReflectionHistory)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainFileContentReflectionHistoryService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types.ts":
/*!*******************************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file-content-reflection-history/file-content-reflection-history.types.ts ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReflectionType = exports.ReflectionStatus = void 0;
var ReflectionStatus;
(function (ReflectionStatus) {
    ReflectionStatus["PENDING"] = "pending";
    ReflectionStatus["PROCESSING"] = "processing";
    ReflectionStatus["COMPLETED"] = "completed";
    ReflectionStatus["FAILED"] = "failed";
})(ReflectionStatus || (exports.ReflectionStatus = ReflectionStatus = {}));
var ReflectionType;
(function (ReflectionType) {
    ReflectionType["EVENT_HISTORY"] = "event_history";
    ReflectionType["ATTENDANCE_DATA"] = "attendance_data";
    ReflectionType["OTHER"] = "other";
})(ReflectionType || (exports.ReflectionType = ReflectionType = {}));


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file/file.entity.ts":
/*!**************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file/file.entity.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.File = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const file_types_1 = __webpack_require__(/*! ./file.types */ "./apps/lams/src/refactoring/domain/file/file.types.ts");
let File = class File extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.file_name || !this.file_path) {
            return;
        }
        if (this.file_name.trim().length === 0) {
            throw new Error('파일명은 필수입니다.');
        }
        if (this.file_path.trim().length === 0) {
            throw new Error('파일 경로는 필수입니다.');
        }
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
    }
    constructor(file_name, file_path, file_original_name, year, month, data) {
        super();
        this.file_name = file_name;
        this.file_path = file_path;
        this.file_original_name = file_original_name || null;
        this.year = year || null;
        this.month = month ? month.padStart(2, '0') : null;
        this.status = file_types_1.FileStatus.UNREAD;
        this.read_at = null;
        this.error = null;
        this.data = data || null;
        this.validateInvariants();
    }
    업데이트한다(file_name, file_original_name, file_path, year, month, status, error, data) {
        if (file_name !== undefined) {
            this.file_name = file_name;
        }
        if (file_original_name !== undefined) {
            this.file_original_name = file_original_name;
        }
        if (file_path !== undefined) {
            this.file_path = file_path;
        }
        if (year !== undefined) {
            this.year = year;
        }
        if (month !== undefined) {
            this.month = month.padStart(2, '0');
        }
        if (status !== undefined) {
            this.status = status;
        }
        if (error !== undefined) {
            this.error = error;
        }
        if (data !== undefined) {
            this.data = data;
        }
        this.validateInvariants();
    }
    읽음처리한다() {
        this.read_at = new Date().toISOString();
        this.status = file_types_1.FileStatus.READ;
    }
    에러처리한다(error) {
        this.read_at = new Date().toISOString();
        this.status = file_types_1.FileStatus.ERROR;
        this.error = typeof error === 'string' ? error : JSON.stringify(error);
    }
    연도월설정한다(year, month) {
        this.year = year;
        this.month = month.padStart(2, '0');
    }
    DTO변환한다() {
        return {
            id: this.id,
            fileName: this.file_name,
            fileOriginalName: this.file_original_name,
            filePath: this.file_path,
            year: this.year,
            month: this.month,
            readAt: this.read_at,
            status: this.status,
            error: this.error,
            data: this.data,
            uploadBy: this.created_by || '',
            uploadedAt: this.created_at,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.File = File;
__decorate([
    (0, typeorm_1.Column)({
        name: 'file_name',
        comment: '파일명',
    }),
    __metadata("design:type", String)
], File.prototype, "file_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'file_original_name',
        nullable: true,
        comment: '원본 파일명',
    }),
    __metadata("design:type", String)
], File.prototype, "file_original_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'file_path',
        comment: '파일 경로',
    }),
    __metadata("design:type", String)
], File.prototype, "file_path", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'year',
        nullable: true,
        comment: '연도',
    }),
    __metadata("design:type", String)
], File.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'month',
        nullable: true,
        comment: '월',
    }),
    __metadata("design:type", String)
], File.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'read_at',
        nullable: true,
        comment: '읽은 시간',
    }),
    __metadata("design:type", String)
], File.prototype, "read_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: file_types_1.FileStatus,
        default: file_types_1.FileStatus.UNREAD,
        comment: '파일 상태',
    }),
    __metadata("design:type", typeof (_b = typeof file_types_1.FileStatus !== "undefined" && file_types_1.FileStatus) === "function" ? _b : Object)
], File.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'error',
        nullable: true,
        comment: '에러 메시지',
    }),
    __metadata("design:type", String)
], File.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'data',
        type: 'jsonb',
        nullable: true,
        comment: '파일 내용 데이터',
    }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], File.prototype, "data", void 0);
exports.File = File = __decorate([
    (0, typeorm_1.Entity)('file'),
    __metadata("design:paramtypes", [String, String, String, String, String, typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object])
], File);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file/file.module.ts":
/*!**************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file/file.module.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainFileModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const file_entity_1 = __webpack_require__(/*! ./file.entity */ "./apps/lams/src/refactoring/domain/file/file.entity.ts");
const file_service_1 = __webpack_require__(/*! ./file.service */ "./apps/lams/src/refactoring/domain/file/file.service.ts");
let DomainFileModule = class DomainFileModule {
};
exports.DomainFileModule = DomainFileModule;
exports.DomainFileModule = DomainFileModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_entity_1.File])],
        providers: [file_service_1.DomainFileService],
        exports: [file_service_1.DomainFileService, typeorm_1.TypeOrmModule],
    })
], DomainFileModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file/file.service.ts":
/*!***************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file/file.service.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainFileService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const file_entity_1 = __webpack_require__(/*! ./file.entity */ "./apps/lams/src/refactoring/domain/file/file.entity.ts");
const file_types_1 = __webpack_require__(/*! ./file.types */ "./apps/lams/src/refactoring/domain/file/file.types.ts");
let DomainFileService = class DomainFileService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(file_entity_1.File) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const file = new file_entity_1.File(data.fileName, data.filePath, data.fileOriginalName, data.year, data.month, data.data);
        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const file = await this.repository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        return file.DTO변환한다();
    }
    async 파일명으로조회한다(fileName) {
        const file = await this.repository.findOne({
            where: { file_name: fileName, deleted_at: (0, typeorm_2.IsNull)() },
        });
        return file ? file.DTO변환한다() : null;
    }
    async 목록조회한다() {
        const files = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }
    async 상태별목록조회한다(status) {
        const files = await this.repository.find({
            where: { status, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }
    async 연도월별목록조회한다(year, month) {
        const files = await this.repository.find({
            where: {
                year,
                month: month.padStart(2, '0'),
                deleted_at: (0, typeorm_2.IsNull)(),
            },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }
    async 업로드자별목록조회한다(uploadBy) {
        const files = await this.repository.find({
            where: { created_by: uploadBy, deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return files.map((file) => file.DTO변환한다());
    }
    async 읽지않은목록조회한다() {
        return this.상태별목록조회한다(file_types_1.FileStatus.UNREAD);
    }
    async 에러목록조회한다() {
        return this.상태별목록조회한다(file_types_1.FileStatus.ERROR);
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        file.업데이트한다(data.fileName, data.fileOriginalName, data.filePath, data.year, data.month, data.status, data.error);
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);
        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }
    async 읽음처리한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        file.읽음처리한다();
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);
        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }
    async 에러처리한다(id, error, userId, manager) {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        file.에러처리한다(error);
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);
        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }
    async 연도월설정한다(id, year, month, userId, manager) {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        file.연도월설정한다(year, month);
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);
        const saved = await repository.save(file);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        file.deleted_at = new Date();
        file.수정자설정한다(userId);
        file.메타데이터업데이트한다(userId);
        await repository.save(file);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const file = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!file) {
            throw new common_1.NotFoundException(`파일을 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(file);
    }
};
exports.DomainFileService = DomainFileService;
exports.DomainFileService = DomainFileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainFileService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/file/file.types.ts":
/*!*************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/file/file.types.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileStatus = void 0;
var FileStatus;
(function (FileStatus) {
    FileStatus["UNREAD"] = "unread";
    FileStatus["READ"] = "read";
    FileStatus["ERROR"] = "error";
})(FileStatus || (exports.FileStatus = FileStatus = {}));


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.entity.ts":
/*!******************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/holiday-info/holiday-info.entity.ts ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidayInfo = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
let HolidayInfo = class HolidayInfo extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.holiday_name || !this.holiday_date) {
            return;
        }
        if (this.holiday_name.trim().length === 0) {
            throw new Error('휴일명은 필수입니다.');
        }
        if (this.holiday_date.trim().length === 0) {
            throw new Error('휴일 날짜는 필수입니다.');
        }
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
    }
    constructor(holiday_name, holiday_date) {
        super();
        this.holiday_name = holiday_name;
        this.holiday_date = holiday_date;
        this.validateInvariants();
    }
    업데이트한다(holiday_name, holiday_date) {
        if (holiday_name !== undefined) {
            this.holiday_name = holiday_name;
        }
        if (holiday_date !== undefined) {
            this.holiday_date = holiday_date;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            holidayName: this.holiday_name,
            holidayDate: this.holiday_date,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.HolidayInfo = HolidayInfo;
__decorate([
    (0, typeorm_1.Column)({
        name: 'holiday_name',
        comment: '휴일명',
    }),
    __metadata("design:type", String)
], HolidayInfo.prototype, "holiday_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'holiday_date',
        comment: '휴일 날짜',
    }),
    __metadata("design:type", String)
], HolidayInfo.prototype, "holiday_date", void 0);
exports.HolidayInfo = HolidayInfo = __decorate([
    (0, typeorm_1.Entity)('holiday_info'),
    __metadata("design:paramtypes", [String, String])
], HolidayInfo);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.module.ts":
/*!******************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/holiday-info/holiday-info.module.ts ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainHolidayInfoModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const holiday_info_entity_1 = __webpack_require__(/*! ./holiday-info.entity */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.entity.ts");
const holiday_info_service_1 = __webpack_require__(/*! ./holiday-info.service */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.service.ts");
let DomainHolidayInfoModule = class DomainHolidayInfoModule {
};
exports.DomainHolidayInfoModule = DomainHolidayInfoModule;
exports.DomainHolidayInfoModule = DomainHolidayInfoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([holiday_info_entity_1.HolidayInfo])],
        providers: [holiday_info_service_1.DomainHolidayInfoService],
        exports: [holiday_info_service_1.DomainHolidayInfoService, typeorm_1.TypeOrmModule],
    })
], DomainHolidayInfoModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.service.ts":
/*!*******************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/holiday-info/holiday-info.service.ts ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainHolidayInfoService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const holiday_info_entity_1 = __webpack_require__(/*! ./holiday-info.entity */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.entity.ts");
let DomainHolidayInfoService = class DomainHolidayInfoService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(holiday_info_entity_1.HolidayInfo) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const holidayInfo = new holiday_info_entity_1.HolidayInfo(data.holidayName, data.holidayDate);
        const saved = await repository.save(holidayInfo);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const holidayInfo = await this.repository.findOne({ where: { id } });
        if (!holidayInfo) {
            throw new common_1.NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        return holidayInfo.DTO변환한다();
    }
    async 목록조회한다() {
        const holidayInfos = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            order: { holiday_date: 'ASC' },
        });
        return holidayInfos.map((hi) => hi.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const holidayInfo = await repository.findOne({ where: { id } });
        if (!holidayInfo) {
            throw new common_1.NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        holidayInfo.업데이트한다(data.holidayName, data.holidayDate);
        holidayInfo.수정자설정한다(userId);
        holidayInfo.메타데이터업데이트한다(userId);
        const saved = await repository.save(holidayInfo);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const holidayInfo = await repository.findOne({ where: { id } });
        if (!holidayInfo) {
            throw new common_1.NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        holidayInfo.deleted_at = new Date();
        holidayInfo.수정자설정한다(userId);
        holidayInfo.메타데이터업데이트한다(userId);
        await repository.save(holidayInfo);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const holidayInfo = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!holidayInfo) {
            throw new common_1.NotFoundException(`휴일 정보를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(holidayInfo);
    }
};
exports.DomainHolidayInfoService = DomainHolidayInfoService;
exports.DomainHolidayInfoService = DomainHolidayInfoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(holiday_info_entity_1.HolidayInfo)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainHolidayInfoService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.entity.ts":
/*!************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.entity.ts ***!
  \************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MonthlyEventSummary = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const daily_event_summary_entity_1 = __webpack_require__(/*! ../daily-event-summary/daily-event-summary.entity */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts");
let MonthlyEventSummary = class MonthlyEventSummary extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.employee_id || !this.yyyymm || !this.employee_number) {
            return;
        }
        if (this.employee_number.trim().length === 0) {
            throw new Error('사원 번호는 필수입니다.');
        }
        if (this.yyyymm.trim().length === 0) {
            throw new Error('연월은 필수입니다.');
        }
        this.validateUuidFormat(this.employee_id, 'employee_id');
    }
    validateDataFormat() {
        if (this.work_days_count === undefined || this.total_work_time === undefined) {
            return;
        }
        if (this.work_days_count < 0) {
            throw new Error('근무 일수는 0 이상이어야 합니다.');
        }
        if (this.total_work_time < 0) {
            throw new Error('총 근무 시간은 0 이상이어야 합니다.');
        }
        if (this.total_workable_time !== null &&
            this.total_workable_time !== undefined &&
            this.total_workable_time < 0) {
            throw new Error('총 업무 가능 시간은 0 이상이어야 합니다.');
        }
    }
    validateLogicalConsistency() {
    }
    constructor(employee_number, employee_id, yyyymm, work_days_count, total_work_time, avg_work_times, attendance_type_count, employee_name, total_workable_time, weekly_work_time_summary, daily_event_summary, late_details, absence_details, early_leave_details, note, additional_note) {
        super();
        this.employee_number = employee_number;
        this.employee_id = employee_id;
        this.yyyymm = yyyymm;
        this.work_days_count = work_days_count;
        this.total_work_time = total_work_time;
        this.avg_work_times = avg_work_times;
        this.attendance_type_count = attendance_type_count;
        this.employee_name = employee_name || null;
        this.total_workable_time = total_workable_time || null;
        this.weekly_work_time_summary = weekly_work_time_summary || null;
        this.daily_event_summary = daily_event_summary || null;
        this.late_details = late_details || null;
        this.absence_details = absence_details || null;
        this.early_leave_details = early_leave_details || null;
        this.note = note || null;
        this.additional_note = additional_note || '';
        this.validateInvariants();
    }
    업데이트한다(employee_number, employee_name, work_days_count, total_workable_time, total_work_time, avg_work_times, attendance_type_count, weekly_work_time_summary, daily_event_summary, late_details, absence_details, early_leave_details, note, additional_note) {
        if (employee_number !== undefined) {
            this.employee_number = employee_number;
        }
        if (employee_name !== undefined) {
            this.employee_name = employee_name;
        }
        if (work_days_count !== undefined) {
            this.work_days_count = work_days_count;
        }
        if (total_workable_time !== undefined) {
            this.total_workable_time = total_workable_time;
        }
        if (total_work_time !== undefined) {
            this.total_work_time = total_work_time;
        }
        if (avg_work_times !== undefined) {
            this.avg_work_times = avg_work_times;
        }
        if (attendance_type_count !== undefined) {
            this.attendance_type_count = attendance_type_count;
        }
        if (weekly_work_time_summary !== undefined) {
            this.weekly_work_time_summary = weekly_work_time_summary;
        }
        if (daily_event_summary !== undefined) {
            this.daily_event_summary = daily_event_summary;
        }
        if (late_details !== undefined) {
            this.late_details = late_details;
        }
        if (absence_details !== undefined) {
            this.absence_details = absence_details;
        }
        if (early_leave_details !== undefined) {
            this.early_leave_details = early_leave_details;
        }
        if (note !== undefined) {
            this.note = note;
        }
        if (additional_note !== undefined) {
            this.additional_note = additional_note;
        }
        this.validateInvariants();
    }
    요약업데이트한다(params) {
        this.employee_number = params.employeeInfo.employeeNumber;
        this.employee_id = params.employeeInfo.employeeId;
        this.employee_name = params.employeeInfo.employeeName;
        this.yyyymm = params.yyyymm;
        this.total_workable_time = params.totalWorkableTime;
        this.total_work_time = params.totalWorkTime;
        this.work_days_count = params.workDaysCount;
        this.avg_work_times = params.avgWorkTimes;
        this.attendance_type_count = params.attendanceTypeCount;
        this.weekly_work_time_summary = params.weeklyWorkTimeSummary;
        this.daily_event_summary = params.dailyEventSummary;
        this.late_details = params.lateDetails;
        this.absence_details = params.absenceDetails;
        this.early_leave_details = params.earlyLeaveDetails;
        this.note = params.note;
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            employeeNumber: this.employee_number,
            employeeId: this.employee_id,
            employeeName: this.employee_name,
            yyyymm: this.yyyymm,
            note: this.note,
            additionalNote: this.additional_note,
            workDaysCount: this.work_days_count,
            totalWorkableTime: this.total_workable_time,
            totalWorkTime: this.total_work_time,
            avgWorkTimes: this.avg_work_times,
            attendanceTypeCount: this.attendance_type_count,
            dailyEventSummary: this.daily_event_summary,
            weeklyWorkTimeSummary: this.weekly_work_time_summary,
            lateDetails: this.late_details,
            absenceDetails: this.absence_details,
            earlyLeaveDetails: this.early_leave_details,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.MonthlyEventSummary = MonthlyEventSummary;
__decorate([
    (0, typeorm_1.Column)({
        name: 'employee_number',
        comment: '사원 번호',
    }),
    __metadata("design:type", String)
], MonthlyEventSummary.prototype, "employee_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'uuid' }),
    __metadata("design:type", String)
], MonthlyEventSummary.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_b = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _b : Object)
], MonthlyEventSummary.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'employee_name',
        nullable: true,
        comment: '사원 이름',
    }),
    __metadata("design:type", String)
], MonthlyEventSummary.prototype, "employee_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'yyyymm',
        comment: '해당 월의 첫 날 (YYYY-MM)',
    }),
    __metadata("design:type", String)
], MonthlyEventSummary.prototype, "yyyymm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'note',
        nullable: true,
        comment: '비고',
    }),
    __metadata("design:type", String)
], MonthlyEventSummary.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'additional_note',
        default: '',
        comment: '월간 근태 요약 노트',
    }),
    __metadata("design:type", String)
], MonthlyEventSummary.prototype, "additional_note", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'work_days_count',
        comment: '근무 일수',
    }),
    __metadata("design:type", Number)
], MonthlyEventSummary.prototype, "work_days_count", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        name: 'total_workable_time',
        nullable: true,
        comment: '총 업무 가능 시간 (분 단위)',
    }),
    __metadata("design:type", Number)
], MonthlyEventSummary.prototype, "total_workable_time", void 0);
__decorate([
    (0, typeorm_1.Column)('int', {
        name: 'total_work_time',
        comment: '총 근무 시간 (분 단위)',
    }),
    __metadata("design:type", Number)
], MonthlyEventSummary.prototype, "total_work_time", void 0);
__decorate([
    (0, typeorm_1.Column)('float', {
        name: 'avg_work_times',
        comment: '평균 근무 시간 (분 단위)',
    }),
    __metadata("design:type", Number)
], MonthlyEventSummary.prototype, "avg_work_times", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', {
        name: 'attendance_type_count',
        comment: '근태 유형별 횟수',
    }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], MonthlyEventSummary.prototype, "attendance_type_count", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', {
        name: 'daily_event_summary',
        nullable: true,
        comment: '일별 이벤트 요약 (JSON 데이터)',
    }),
    __metadata("design:type", Array)
], MonthlyEventSummary.prototype, "daily_event_summary", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => daily_event_summary_entity_1.DailyEventSummary, (dailyEventSummary) => dailyEventSummary.monthlyEventSummary),
    __metadata("design:type", Array)
], MonthlyEventSummary.prototype, "dailyEventSummaries", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', {
        name: 'weekly_work_time_summary',
        nullable: true,
        comment: '주별 이벤트 요약',
    }),
    __metadata("design:type", Array)
], MonthlyEventSummary.prototype, "weekly_work_time_summary", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', {
        name: 'late_details',
        nullable: true,
        comment: '지각 상세정보',
    }),
    __metadata("design:type", Array)
], MonthlyEventSummary.prototype, "late_details", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', {
        name: 'absence_details',
        nullable: true,
        comment: '결근 상세정보',
    }),
    __metadata("design:type", Array)
], MonthlyEventSummary.prototype, "absence_details", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', {
        name: 'early_leave_details',
        nullable: true,
        comment: '조퇴 상세정보',
    }),
    __metadata("design:type", Array)
], MonthlyEventSummary.prototype, "early_leave_details", void 0);
exports.MonthlyEventSummary = MonthlyEventSummary = __decorate([
    (0, typeorm_1.Entity)('monthly_event_summary'),
    (0, typeorm_1.Index)(['employee_id', 'yyyymm'], { unique: true }),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Number, typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object, String, Number, Array, Array, Array, Array, Array, String, String])
], MonthlyEventSummary);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.module.ts":
/*!************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.module.ts ***!
  \************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainMonthlyEventSummaryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const monthly_event_summary_entity_1 = __webpack_require__(/*! ./monthly-event-summary.entity */ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.entity.ts");
const monthly_event_summary_service_1 = __webpack_require__(/*! ./monthly-event-summary.service */ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.service.ts");
const attendance_type_module_1 = __webpack_require__(/*! ../attendance-type/attendance-type.module */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.module.ts");
let DomainMonthlyEventSummaryModule = class DomainMonthlyEventSummaryModule {
};
exports.DomainMonthlyEventSummaryModule = DomainMonthlyEventSummaryModule;
exports.DomainMonthlyEventSummaryModule = DomainMonthlyEventSummaryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([monthly_event_summary_entity_1.MonthlyEventSummary]), attendance_type_module_1.DomainAttendanceTypeModule],
        providers: [monthly_event_summary_service_1.DomainMonthlyEventSummaryService],
        exports: [monthly_event_summary_service_1.DomainMonthlyEventSummaryService, typeorm_1.TypeOrmModule],
    })
], DomainMonthlyEventSummaryModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.service.ts":
/*!*************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.service.ts ***!
  \*************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DomainMonthlyEventSummaryService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainMonthlyEventSummaryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const monthly_event_summary_entity_1 = __webpack_require__(/*! ./monthly-event-summary.entity */ "./apps/lams/src/refactoring/domain/monthly-event-summary/monthly-event-summary.entity.ts");
const daily_event_summary_entity_1 = __webpack_require__(/*! ../daily-event-summary/daily-event-summary.entity */ "./apps/lams/src/refactoring/domain/daily-event-summary/daily-event-summary.entity.ts");
const used_attendance_entity_1 = __webpack_require__(/*! ../used-attendance/used-attendance.entity */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.entity.ts");
const attendance_type_service_1 = __webpack_require__(/*! ../attendance-type/attendance-type.service */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.service.ts");
const date_fns_1 = __webpack_require__(/*! date-fns */ "date-fns");
let DomainMonthlyEventSummaryService = DomainMonthlyEventSummaryService_1 = class DomainMonthlyEventSummaryService {
    constructor(repository, dataSource, attendanceTypeService) {
        this.repository = repository;
        this.dataSource = dataSource;
        this.attendanceTypeService = attendanceTypeService;
        this.logger = new common_1.Logger(DomainMonthlyEventSummaryService_1.name);
    }
    getRepository(manager) {
        return manager ? manager.getRepository(monthly_event_summary_entity_1.MonthlyEventSummary) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const existing = await repository.findOne({
            where: {
                employee_id: data.employeeId,
                yyyymm: data.yyyymm,
                deleted_at: (0, typeorm_2.IsNull)(),
            },
        });
        if (existing) {
            throw new Error('이미 해당 연월의 월간 요약이 존재합니다.');
        }
        const summary = new monthly_event_summary_entity_1.MonthlyEventSummary(data.employeeNumber, data.employeeId, data.yyyymm, data.workDaysCount, data.totalWorkTime, data.avgWorkTimes, data.attendanceTypeCount, data.employeeName, data.totalWorkableTime, data.weeklyWorkTimeSummary, data.dailyEventSummary, data.lateDetails, data.absenceDetails, data.earlyLeaveDetails, data.note, data.additionalNote);
        const saved = await repository.save(summary);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const summary = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'dailyEventSummaries'],
        });
        if (!summary) {
            throw new common_1.NotFoundException(`월간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        return summary.DTO변환한다();
    }
    async 직원ID와연월로조회한다(employeeId, yyyymm) {
        const summary = await this.repository.findOne({
            where: { employee_id: employeeId, yyyymm, deleted_at: (0, typeorm_2.IsNull)() },
        });
        return summary ? summary.DTO변환한다() : null;
    }
    async 연월로목록조회한다(yyyymm) {
        const summaries = await this.repository.find({
            where: { yyyymm, deleted_at: (0, typeorm_2.IsNull)() },
            order: { employee_number: 'ASC' },
        });
        return summaries.map((summary) => summary.DTO변환한다());
    }
    async 직원ID로목록조회한다(employeeId) {
        const summaries = await this.repository.find({
            where: { employee_id: employeeId, deleted_at: (0, typeorm_2.IsNull)() },
            order: { yyyymm: 'DESC' },
        });
        return summaries.map((summary) => summary.DTO변환한다());
    }
    async 연월범위로목록조회한다(startYyyymm, endYyyymm) {
        const summaries = await this.repository
            .createQueryBuilder('summary')
            .where('summary.deleted_at IS NULL')
            .andWhere('summary.yyyymm BETWEEN :start AND :end', {
            start: startYyyymm,
            end: endYyyymm,
        })
            .orderBy('summary.yyyymm', 'DESC')
            .addOrderBy('summary.employee_number', 'ASC')
            .getMany();
        return summaries.map((summary) => summary.DTO변환한다());
    }
    async 생성또는갱신한다(employeeId, yyyymm, dailySummaries, usedAttendances, allAttendanceTypes, queryRunner) {
        try {
            const [year, month] = yyyymm.split('-');
            if (dailySummaries.length === 0) {
                throw new Error(`${yyyymm}의 일일 요약 데이터가 없습니다.`);
            }
            const workDays = dailySummaries.filter((d) => {
                if (d.work_time !== null)
                    return true;
                const hasRecognizedAttendance = usedAttendances.some((ua) => ua.used_at === d.date && ua.attendanceType?.is_recognized_work_time === true);
                return hasRecognizedAttendance;
            });
            const weeklyWorkTimeSummary = this.주간근무시간계산한다(dailySummaries, usedAttendances, year, month);
            const totalWorkTime = weeklyWorkTimeSummary.reduce((sum, week) => sum + week.weeklyWorkTime, 0);
            const monthStart = (0, date_fns_1.startOfMonth)(new Date(`${year}-${month}-01`));
            const monthEnd = (0, date_fns_1.endOfMonth)(new Date(`${year}-${month}-01`));
            const allDays = (0, date_fns_1.eachDayOfInterval)({ start: monthStart, end: monthEnd });
            const weekdayCount = allDays.filter((day) => {
                const dow = day.getDay();
                return dow !== 0 && dow !== 6;
            }).length;
            const totalWorkableTime = weekdayCount * 624;
            const avgWorkTimes = workDays.length > 0 ? totalWorkTime / workDays.length : 0;
            const attendanceTypeCount = {};
            allAttendanceTypes.forEach((at) => {
                attendanceTypeCount[at.title] = 0;
            });
            attendanceTypeCount['지각'] = 0;
            attendanceTypeCount['결근'] = 0;
            attendanceTypeCount['조퇴'] = 0;
            usedAttendances.forEach((ua) => {
                const title = ua.attendanceType?.title;
                if (title && title in attendanceTypeCount) {
                    attendanceTypeCount[title]++;
                }
            });
            dailySummaries.forEach((d) => {
                if (d.is_late)
                    attendanceTypeCount['지각']++;
                if (d.is_absent)
                    attendanceTypeCount['결근']++;
                if (d.is_early_leave)
                    attendanceTypeCount['조퇴']++;
            });
            const dailyEventSummary = dailySummaries.map((d) => ({
                dailyEventSummaryId: d.id,
                date: d.date,
                isHoliday: d.is_holiday,
                enter: d.enter,
                leave: d.leave,
                realEnter: d.real_enter,
                realLeave: d.real_leave,
                isChecked: d.is_checked,
                isLate: d.is_late,
                isEarlyLeave: d.is_early_leave,
                isAbsent: d.is_absent,
                workTime: d.work_time,
                note: d.note || '',
                usedAttendances: usedAttendances
                    .filter((ua) => ua.used_at === d.date)
                    .map((ua) => ({
                    usedAttendanceId: ua.id,
                    attendanceTypeId: ua.attendanceType?.id,
                    title: ua.attendanceType?.title,
                })),
            }));
            const lateDetails = dailySummaries
                .filter((d) => d.is_late)
                .map((d) => ({
                dailyEventSummaryId: d.id,
                date: d.date,
                isHoliday: d.is_holiday,
                enter: d.enter,
                leave: d.leave,
                realEnter: d.real_enter,
                realLeave: d.real_leave,
                isChecked: d.is_checked,
                isLate: d.is_late,
                isEarlyLeave: d.is_early_leave,
                isAbsent: d.is_absent,
                workTime: d.work_time,
                note: d.note || '',
                usedAttendances: usedAttendances
                    .filter((ua) => ua.used_at === d.date)
                    .map((ua) => ({
                    usedAttendanceId: ua.id,
                    attendanceTypeId: ua.attendanceType?.id,
                    title: ua.attendanceType?.title,
                })),
            }));
            const absenceDetails = dailySummaries
                .filter((d) => d.is_absent)
                .map((d) => ({
                dailyEventSummaryId: d.id,
                date: d.date,
                isHoliday: d.is_holiday,
                enter: d.enter,
                leave: d.leave,
                realEnter: d.real_enter,
                realLeave: d.real_leave,
                isChecked: d.is_checked,
                isLate: d.is_late,
                isEarlyLeave: d.is_early_leave,
                isAbsent: d.is_absent,
                workTime: d.work_time,
                note: d.note || '',
                usedAttendances: usedAttendances
                    .filter((ua) => ua.used_at === d.date)
                    .map((ua) => ({
                    usedAttendanceId: ua.id,
                    attendanceTypeId: ua.attendanceType?.id,
                    title: ua.attendanceType?.title,
                })),
            }));
            const earlyLeaveDetails = dailySummaries
                .filter((d) => d.is_early_leave)
                .map((d) => ({
                dailyEventSummaryId: d.id,
                date: d.date,
                isHoliday: d.is_holiday,
                enter: d.enter,
                leave: d.leave,
                realEnter: d.real_enter,
                realLeave: d.real_leave,
                isChecked: d.is_checked,
                isLate: d.is_late,
                isEarlyLeave: d.is_early_leave,
                isAbsent: d.is_absent,
                workTime: d.work_time,
                note: d.note || '',
                usedAttendances: usedAttendances
                    .filter((ua) => ua.used_at === d.date)
                    .map((ua) => ({
                    usedAttendanceId: ua.id,
                    attendanceTypeId: ua.attendanceType?.id,
                    title: ua.attendanceType?.title,
                })),
            }));
            let summary = await queryRunner.manager.findOne(monthly_event_summary_entity_1.MonthlyEventSummary, {
                where: { employee_id: employeeId, yyyymm },
            });
            if (!summary) {
                summary = new monthly_event_summary_entity_1.MonthlyEventSummary(dailySummaries[0].employee?.employeeNumber || '', employeeId, yyyymm, workDays.length, totalWorkTime, avgWorkTimes, attendanceTypeCount, dailySummaries[0].employee?.name || null, totalWorkableTime, weeklyWorkTimeSummary, dailyEventSummary, lateDetails, absenceDetails, earlyLeaveDetails);
            }
            else {
                summary.요약업데이트한다({
                    employeeInfo: {
                        employeeNumber: dailySummaries[0].employee?.employeeNumber || '',
                        employeeId: employeeId,
                        employeeName: dailySummaries[0].employee?.name || '',
                    },
                    yyyymm,
                    totalWorkableTime,
                    totalWorkTime,
                    workDaysCount: workDays.length,
                    avgWorkTimes,
                    attendanceTypeCount,
                    weeklyWorkTimeSummary,
                    dailyEventSummary,
                    lateDetails,
                    absenceDetails,
                    earlyLeaveDetails,
                    note: summary.note || '',
                });
            }
            const saved = await queryRunner.manager.save(monthly_event_summary_entity_1.MonthlyEventSummary, summary);
            return saved.DTO변환한다();
        }
        catch (error) {
            this.logger.error(`월간 요약 생성 실패 (배치): ${error.message}`, error.stack);
            throw error;
        }
    }
    주간근무시간계산한다(dailySummaries, usedAttendances, year, month) {
        const monthStart = (0, date_fns_1.startOfMonth)(new Date(`${year}-${month}-01`));
        const monthEnd = (0, date_fns_1.endOfMonth)(new Date(`${year}-${month}-01`));
        const allDays = (0, date_fns_1.eachDayOfInterval)({ start: monthStart, end: monthEnd });
        const weekGroups = new Map();
        allDays.forEach((day) => {
            const weekNumber = (0, date_fns_1.getWeek)(day);
            const dateStr = (0, date_fns_1.format)(day, 'yyyy-MM-dd');
            if (!weekGroups.has(weekNumber)) {
                weekGroups.set(weekNumber, { dates: [], workTime: 0 });
            }
            const group = weekGroups.get(weekNumber);
            group.dates.push(dateStr);
            const dailySummary = dailySummaries.find((d) => d.date === dateStr);
            const dayAttendances = usedAttendances.filter((ua) => ua.used_at === dateStr);
            const totalAttendanceWorkTime = dayAttendances.reduce((sum, ua) => sum + (ua.attendanceType?.work_time || 0), 0);
            let dailyWorkTime = 0;
            if (dailySummary?.real_enter !== null &&
                dailySummary?.real_enter !== undefined &&
                dailySummary?.real_leave !== null &&
                dailySummary?.real_leave !== undefined) {
                const baseWorkTime = (dailySummary.work_time || 0) + totalAttendanceWorkTime;
                let lunchDeduction = 0;
                if (dailySummary.real_enter <= '12:00:00' && dailySummary.real_leave >= '13:00:00') {
                    lunchDeduction = 60;
                }
                let dinnerDeduction = 0;
                if (baseWorkTime >= 780) {
                    dinnerDeduction = 30;
                }
                dailyWorkTime = baseWorkTime - lunchDeduction - dinnerDeduction;
            }
            else if ((dailySummary?.real_enter === null || dailySummary?.real_leave === null) &&
                totalAttendanceWorkTime > 0) {
                dailyWorkTime = totalAttendanceWorkTime;
            }
            group.workTime += dailyWorkTime;
        });
        const weeklyWorkTimeSummary = [];
        weekGroups.forEach((group, weekNumber) => {
            const sortedDates = group.dates.sort();
            weeklyWorkTimeSummary.push({
                weekNumber,
                startDate: sortedDates[0],
                endDate: sortedDates[sortedDates.length - 1],
                weeklyWorkTime: group.workTime,
            });
        });
        return weeklyWorkTimeSummary.sort((a, b) => a.weekNumber - b.weekNumber);
    }
    async 일일요약포함조회한다(employeeId, yyyymm) {
        const summary = await this.repository.findOne({
            where: { employee_id: employeeId, yyyymm, deleted_at: (0, typeorm_2.IsNull)() },
        });
        if (!summary)
            return null;
        const [year, month] = yyyymm.split('-');
        const startDate = (0, date_fns_1.format)((0, date_fns_1.startOfMonth)(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');
        const endDate = (0, date_fns_1.format)((0, date_fns_1.endOfMonth)(new Date(`${year}-${month}-01`)), 'yyyy-MM-dd');
        const dailySummaries = await this.dataSource.manager
            .createQueryBuilder(daily_event_summary_entity_1.DailyEventSummary, 'daily')
            .leftJoinAndSelect('daily.employee', 'employee')
            .where('daily.deleted_at IS NULL')
            .andWhere('daily.employee_id = :employeeId', { employeeId })
            .andWhere('daily.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .orderBy('daily.date', 'ASC')
            .getMany();
        for (const daily of dailySummaries) {
            const usedAttendances = await this.dataSource.manager
                .createQueryBuilder(used_attendance_entity_1.UsedAttendance, 'ua')
                .leftJoinAndSelect('ua.attendanceType', 'at')
                .where('ua.deleted_at IS NULL')
                .andWhere('ua.employee_id = :employeeId', { employeeId: daily.employee_id })
                .andWhere('ua.used_at = :date::text', { date: daily.date })
                .getMany();
            daily.usedAttendances = usedAttendances.map((ua) => ({
                usedAttendanceId: ua.id,
                attendanceTypeId: ua.attendanceType?.id || '',
                title: ua.attendanceType?.title,
            }));
        }
        summary.daily_event_summary = dailySummaries;
        return summary.DTO변환한다();
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({ where: { id } });
        if (!summary) {
            throw new common_1.NotFoundException(`월간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        summary.업데이트한다(data.employeeNumber, data.employeeName, data.workDaysCount, data.totalWorkableTime, data.totalWorkTime, data.avgWorkTimes, data.attendanceTypeCount, data.weeklyWorkTimeSummary, data.dailyEventSummary, data.lateDetails, data.absenceDetails, data.earlyLeaveDetails, data.note, data.additionalNote);
        summary.수정자설정한다(userId);
        summary.메타데이터업데이트한다(userId);
        const saved = await repository.save(summary);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({ where: { id } });
        if (!summary) {
            throw new common_1.NotFoundException(`월간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        summary.deleted_at = new Date();
        summary.수정자설정한다(userId);
        summary.메타데이터업데이트한다(userId);
        await repository.save(summary);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const summary = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!summary) {
            throw new common_1.NotFoundException(`월간 요약을 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(summary);
    }
};
exports.DomainMonthlyEventSummaryService = DomainMonthlyEventSummaryService;
exports.DomainMonthlyEventSummaryService = DomainMonthlyEventSummaryService = DomainMonthlyEventSummaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(monthly_event_summary_entity_1.MonthlyEventSummary)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object, typeof (_c = typeof attendance_type_service_1.DomainAttendanceTypeService !== "undefined" && attendance_type_service_1.DomainAttendanceTypeService) === "function" ? _c : Object])
], DomainMonthlyEventSummaryService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/project/project.entity.ts":
/*!********************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/project/project.entity.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Project = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
let Project = class Project extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.project_code || !this.project_name) {
            return;
        }
        if (this.project_code.trim().length === 0) {
            throw new Error('프로젝트 코드는 필수입니다.');
        }
        if (this.project_name.trim().length === 0) {
            throw new Error('프로젝트명은 필수입니다.');
        }
    }
    validateDataFormat() {
        if (!this.project_code || !this.project_name) {
            return;
        }
        if (this.project_code.length > 100) {
            throw new Error('프로젝트 코드는 100자 이하여야 합니다.');
        }
        if (this.project_name.length > 255) {
            throw new Error('프로젝트명은 255자 이하여야 합니다.');
        }
    }
    validateLogicalConsistency() {
        if (this.start_date && this.end_date) {
            if (new Date(this.start_date) > new Date(this.end_date)) {
                throw new Error('시작일은 종료일보다 이전이어야 합니다.');
            }
        }
    }
    constructor(project_code, project_name, description, start_date, end_date, is_active = true) {
        super();
        this.project_code = project_code;
        this.project_name = project_name;
        this.description = description || null;
        this.start_date = start_date || null;
        this.end_date = end_date || null;
        this.is_active = is_active;
        this.validateInvariants();
    }
    업데이트한다(project_code, project_name, description, start_date, end_date, is_active) {
        if (project_code !== undefined) {
            this.project_code = project_code;
        }
        if (project_name !== undefined) {
            this.project_name = project_name;
        }
        if (description !== undefined) {
            this.description = description;
        }
        if (start_date !== undefined) {
            this.start_date = start_date;
        }
        if (end_date !== undefined) {
            this.end_date = end_date;
        }
        if (is_active !== undefined) {
            this.is_active = is_active;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            projectCode: this.project_code,
            projectName: this.project_name,
            description: this.description,
            startDate: this.start_date,
            endDate: this.end_date,
            isActive: this.is_active,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.Column)({
        name: 'project_code',
        type: 'varchar',
        length: 100,
        unique: true,
        comment: '프로젝트 코드',
    }),
    __metadata("design:type", String)
], Project.prototype, "project_code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'project_name',
        type: 'varchar',
        length: 255,
        comment: '프로젝트명',
    }),
    __metadata("design:type", String)
], Project.prototype, "project_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'description',
        type: 'text',
        nullable: true,
        comment: '프로젝트 설명',
    }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_date',
        type: 'date',
        nullable: true,
        comment: '시작일',
    }),
    __metadata("design:type", String)
], Project.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_date',
        type: 'date',
        nullable: true,
        comment: '종료일',
    }),
    __metadata("design:type", String)
], Project.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'is_active',
        type: 'boolean',
        default: true,
        comment: '활성화 여부',
    }),
    __metadata("design:type", Boolean)
], Project.prototype, "is_active", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)('projects'),
    (0, typeorm_1.Index)(['project_code'], { unique: true }),
    __metadata("design:paramtypes", [String, String, String, String, String, Boolean])
], Project);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/project/project.module.ts":
/*!********************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/project/project.module.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainProjectModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const project_entity_1 = __webpack_require__(/*! ./project.entity */ "./apps/lams/src/refactoring/domain/project/project.entity.ts");
const project_service_1 = __webpack_require__(/*! ./project.service */ "./apps/lams/src/refactoring/domain/project/project.service.ts");
let DomainProjectModule = class DomainProjectModule {
};
exports.DomainProjectModule = DomainProjectModule;
exports.DomainProjectModule = DomainProjectModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project])],
        providers: [project_service_1.DomainProjectService],
        exports: [project_service_1.DomainProjectService, typeorm_1.TypeOrmModule],
    })
], DomainProjectModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/project/project.service.ts":
/*!*********************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/project/project.service.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainProjectService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const project_entity_1 = __webpack_require__(/*! ./project.entity */ "./apps/lams/src/refactoring/domain/project/project.entity.ts");
let DomainProjectService = class DomainProjectService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(project_entity_1.Project) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const existingProject = await repository.findOne({
            where: { project_code: data.projectCode, deleted_at: (0, typeorm_2.IsNull)() },
        });
        if (existingProject) {
            throw new common_1.ConflictException(`이미 존재하는 프로젝트 코드입니다. (code: ${data.projectCode})`);
        }
        const project = new project_entity_1.Project(data.projectCode, data.projectName, data.description, data.startDate, data.endDate, data.isActive !== undefined ? data.isActive : true);
        const saved = await repository.save(project);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const project = await this.repository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        return project.DTO변환한다();
    }
    async 코드로조회한다(projectCode) {
        const project = await this.repository.findOne({
            where: { project_code: projectCode, deleted_at: (0, typeorm_2.IsNull)() },
        });
        return project ? project.DTO변환한다() : null;
    }
    async 목록조회한다() {
        const projects = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            order: { created_at: 'DESC' },
        });
        return projects.map((project) => project.DTO변환한다());
    }
    async 활성화된목록조회한다() {
        const projects = await this.repository.find({
            where: { is_active: true, deleted_at: (0, typeorm_2.IsNull)() },
            order: { project_name: 'ASC' },
        });
        return projects.map((project) => project.DTO변환한다());
    }
    async 이름으로검색한다(keyword) {
        const projects = await this.repository
            .createQueryBuilder('project')
            .where('project.deleted_at IS NULL')
            .andWhere('(project.project_name LIKE :keyword OR project.project_code LIKE :keyword)', {
            keyword: `%${keyword}%`,
        })
            .orderBy('project.project_name', 'ASC')
            .getMany();
        return projects.map((project) => project.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const project = await repository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        if (data.projectCode && data.projectCode !== project.project_code) {
            const existingProject = await repository.findOne({
                where: { project_code: data.projectCode, deleted_at: (0, typeorm_2.IsNull)() },
            });
            if (existingProject) {
                throw new common_1.ConflictException(`이미 존재하는 프로젝트 코드입니다. (code: ${data.projectCode})`);
            }
        }
        project.업데이트한다(data.projectCode, data.projectName, data.description, data.startDate, data.endDate, data.isActive);
        project.수정자설정한다(userId);
        project.메타데이터업데이트한다(userId);
        const saved = await repository.save(project);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const project = await repository.findOne({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        project.deleted_at = new Date();
        project.수정자설정한다(userId);
        project.메타데이터업데이트한다(userId);
        await repository.save(project);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const project = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!project) {
            throw new common_1.NotFoundException(`프로젝트를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(project);
    }
};
exports.DomainProjectService = DomainProjectService;
exports.DomainProjectService = DomainProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainProjectService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.entity.ts":
/*!************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/used-attendance/used-attendance.entity.ts ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsedAttendance = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const attendance_type_entity_1 = __webpack_require__(/*! ../attendance-type/attendance-type.entity */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.entity.ts");
let UsedAttendance = class UsedAttendance extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.used_at || !this.employee_id || !this.attendance_type_id) {
            return;
        }
        if (this.used_at.trim().length === 0) {
            throw new Error('사용 날짜는 필수입니다.');
        }
        this.validateUuidFormat(this.employee_id, 'employee_id');
        this.validateUuidFormat(this.attendance_type_id, 'attendance_type_id');
    }
    validateDataFormat() {
    }
    validateLogicalConsistency() {
    }
    constructor(used_at, employee_id, attendance_type_id) {
        super();
        this.used_at = used_at;
        this.employee_id = employee_id;
        this.attendance_type_id = attendance_type_id;
        this.validateInvariants();
    }
    업데이트한다(used_at, attendance_type_id) {
        if (used_at !== undefined) {
            this.used_at = used_at;
        }
        if (attendance_type_id !== undefined) {
            this.attendance_type_id = attendance_type_id;
        }
        this.validateInvariants();
    }
    DTO변환한다() {
        return {
            id: this.id,
            usedAt: this.used_at,
            employeeId: this.employee_id,
            attendanceTypeId: this.attendance_type_id,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.UsedAttendance = UsedAttendance;
__decorate([
    (0, typeorm_1.Column)({
        name: 'used_at',
        comment: '사용 날짜',
    }),
    __metadata("design:type", String)
], UsedAttendance.prototype, "used_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'employee_id',
        type: 'uuid',
        comment: '직원 ID',
    }),
    __metadata("design:type", String)
], UsedAttendance.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'attendance_type_id',
        type: 'uuid',
        comment: '근태 유형 ID',
    }),
    __metadata("design:type", String)
], UsedAttendance.prototype, "attendance_type_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employee_id' }),
    __metadata("design:type", typeof (_a = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _a : Object)
], UsedAttendance.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attendance_type_entity_1.AttendanceType),
    (0, typeorm_1.JoinColumn)({ name: 'attendance_type_id' }),
    __metadata("design:type", typeof (_b = typeof attendance_type_entity_1.AttendanceType !== "undefined" && attendance_type_entity_1.AttendanceType) === "function" ? _b : Object)
], UsedAttendance.prototype, "attendanceType", void 0);
exports.UsedAttendance = UsedAttendance = __decorate([
    (0, typeorm_1.Entity)('used_attendance'),
    (0, typeorm_1.Index)(['employee_id', 'used_at', 'attendance_type_id'], { unique: true }),
    __metadata("design:paramtypes", [String, String, String])
], UsedAttendance);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.module.ts":
/*!************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/used-attendance/used-attendance.module.ts ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainUsedAttendanceModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const used_attendance_entity_1 = __webpack_require__(/*! ./used-attendance.entity */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.entity.ts");
const used_attendance_service_1 = __webpack_require__(/*! ./used-attendance.service */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.service.ts");
const attendance_type_module_1 = __webpack_require__(/*! ../attendance-type/attendance-type.module */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.module.ts");
let DomainUsedAttendanceModule = class DomainUsedAttendanceModule {
};
exports.DomainUsedAttendanceModule = DomainUsedAttendanceModule;
exports.DomainUsedAttendanceModule = DomainUsedAttendanceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([used_attendance_entity_1.UsedAttendance]), attendance_type_module_1.DomainAttendanceTypeModule],
        providers: [used_attendance_service_1.DomainUsedAttendanceService],
        exports: [used_attendance_service_1.DomainUsedAttendanceService, typeorm_1.TypeOrmModule],
    })
], DomainUsedAttendanceModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.service.ts":
/*!*************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/used-attendance/used-attendance.service.ts ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainUsedAttendanceService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const used_attendance_entity_1 = __webpack_require__(/*! ./used-attendance.entity */ "./apps/lams/src/refactoring/domain/used-attendance/used-attendance.entity.ts");
let DomainUsedAttendanceService = class DomainUsedAttendanceService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(used_attendance_entity_1.UsedAttendance) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const existing = await repository.findOne({
            where: {
                employee_id: data.employeeId,
                used_at: data.usedAt,
                attendance_type_id: data.attendanceTypeId,
                deleted_at: (0, typeorm_2.IsNull)(),
            },
        });
        if (existing) {
            throw new common_1.ConflictException('이미 해당 날짜에 사용된 근태가 존재합니다.');
        }
        const usedAttendance = new used_attendance_entity_1.UsedAttendance(data.usedAt, data.employeeId, data.attendanceTypeId);
        const saved = await repository.save(usedAttendance);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const usedAttendance = await this.repository.findOne({
            where: { id },
            relations: ['employee', 'attendanceType'],
        });
        if (!usedAttendance) {
            throw new common_1.NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }
        return usedAttendance.DTO변환한다();
    }
    async 목록조회한다() {
        const usedAttendances = await this.repository.find({
            where: { deleted_at: (0, typeorm_2.IsNull)() },
            relations: ['employee', 'attendanceType'],
            order: { used_at: 'DESC' },
        });
        return usedAttendances.map((ua) => ua.DTO변환한다());
    }
    async 직원ID목록과날짜범위로조회한다(employeeIds, startDate, endDate) {
        const usedAttendances = await this.dataSource.manager
            .createQueryBuilder(used_attendance_entity_1.UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua.deleted_at IS NULL')
            .andWhere('ua.employee_id IN (:...employeeIds)', { employeeIds })
            .andWhere('ua.used_at BETWEEN :startDate::text AND :endDate::text', { startDate, endDate })
            .getMany();
        return usedAttendances.map((ua) => ua.DTO변환한다());
    }
    async 직원ID와날짜범위로조회한다(employeeId, startDate, endDate) {
        const usedAttendances = await this.dataSource.manager
            .createQueryBuilder(used_attendance_entity_1.UsedAttendance, 'ua')
            .leftJoinAndSelect('ua.attendanceType', 'at')
            .where('ua.deleted_at IS NULL')
            .andWhere('ua.employee_id = :employeeId', { employeeId })
            .andWhere('ua.used_at BETWEEN :startDate::text AND :endDate::text', { startDate, endDate })
            .getMany();
        return usedAttendances.map((ua) => ua.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const usedAttendance = await repository.findOne({ where: { id } });
        if (!usedAttendance) {
            throw new common_1.NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }
        if (data.usedAt || data.attendanceTypeId) {
            const existing = await repository.findOne({
                where: {
                    employee_id: usedAttendance.employee_id,
                    used_at: data.usedAt || usedAttendance.used_at,
                    attendance_type_id: data.attendanceTypeId || usedAttendance.attendance_type_id,
                    deleted_at: (0, typeorm_2.IsNull)(),
                },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('이미 해당 날짜에 사용된 근태가 존재합니다.');
            }
        }
        usedAttendance.업데이트한다(data.usedAt, data.attendanceTypeId);
        usedAttendance.수정자설정한다(userId);
        usedAttendance.메타데이터업데이트한다(userId);
        const saved = await repository.save(usedAttendance);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const usedAttendance = await repository.findOne({ where: { id } });
        if (!usedAttendance) {
            throw new common_1.NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }
        usedAttendance.deleted_at = new Date();
        usedAttendance.수정자설정한다(userId);
        usedAttendance.메타데이터업데이트한다(userId);
        await repository.save(usedAttendance);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const usedAttendance = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!usedAttendance) {
            throw new common_1.NotFoundException(`사용된 근태를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(usedAttendance);
    }
};
exports.DomainUsedAttendanceService = DomainUsedAttendanceService;
exports.DomainUsedAttendanceService = DomainUsedAttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(used_attendance_entity_1.UsedAttendance)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainUsedAttendanceService);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/work-hours/work-hours.entity.ts":
/*!**************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/work-hours/work-hours.entity.ts ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkHours = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! @libs/database/base/base.entity */ "./libs/database/base/base.entity.ts");
const assigned_project_entity_1 = __webpack_require__(/*! ../assigned-project/assigned-project.entity */ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.entity.ts");
let WorkHours = class WorkHours extends base_entity_1.BaseEntity {
    validateInvariants() {
        this.validateRequiredData();
        this.validateDataFormat();
        this.validateLogicalConsistency();
    }
    validateRequiredData() {
        if (!this.assigned_project_id || !this.date) {
            return;
        }
        this.validateUuidFormat(this.assigned_project_id, 'assigned_project_id');
    }
    validateDataFormat() {
        if (this.work_minutes === undefined) {
            return;
        }
        if (this.work_minutes < 0) {
            throw new Error('근무 시간은 0 이상이어야 합니다.');
        }
        if (this.start_time && this.start_time.length > 50) {
            throw new Error('근무 시작 시간은 50자 이하여야 합니다.');
        }
        if (this.end_time && this.end_time.length > 50) {
            throw new Error('근무 종료 시간은 50자 이하여야 합니다.');
        }
    }
    validateLogicalConsistency() {
        if (this.start_time && this.end_time && this.date) {
            this.근무시간계산한다();
        }
    }
    constructor(assigned_project_id, date, start_time, end_time, work_minutes = 0, note) {
        super();
        this.assigned_project_id = assigned_project_id;
        this.date = date;
        this.start_time = start_time || null;
        this.end_time = end_time || null;
        this.work_minutes = work_minutes;
        this.note = note || null;
        this.validateInvariants();
    }
    업데이트한다(start_time, end_time, work_minutes, note) {
        if (start_time !== undefined) {
            this.start_time = start_time;
        }
        if (end_time !== undefined) {
            this.end_time = end_time;
        }
        if (work_minutes !== undefined) {
            this.work_minutes = work_minutes;
        }
        if (note !== undefined) {
            this.note = note;
        }
        this.validateInvariants();
    }
    근무시간설정한다(hours) {
        this.work_minutes = Math.round(hours * 60);
    }
    근무시간조회한다() {
        return this.work_minutes / 60;
    }
    근무시간계산한다() {
        if (this.start_time && this.end_time && this.date) {
            try {
                const startDateTime = new Date(`${this.date}T${this.start_time}`);
                const endDateTime = new Date(`${this.date}T${this.end_time}`);
                const diff = endDateTime.getTime() - startDateTime.getTime();
                this.work_minutes = Math.floor(diff / (1000 * 60));
            }
            catch (error) {
                this.work_minutes = 0;
            }
        }
    }
    근무시간과시간설정한다(start_time, end_time) {
        this.start_time = start_time;
        this.end_time = end_time;
        this.근무시간계산한다();
    }
    DTO변환한다() {
        return {
            id: this.id,
            assignedProjectId: this.assigned_project_id,
            date: this.date,
            startTime: this.start_time,
            endTime: this.end_time,
            workMinutes: this.work_minutes,
            note: this.note,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
            deletedAt: this.deleted_at,
            createdBy: this.created_by,
            updatedBy: this.updated_by,
            version: this.version,
        };
    }
};
exports.WorkHours = WorkHours;
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_project_id', type: 'uuid' }),
    __metadata("design:type", String)
], WorkHours.prototype, "assigned_project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => assigned_project_entity_1.AssignedProject, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_project_id' }),
    __metadata("design:type", typeof (_a = typeof assigned_project_entity_1.AssignedProject !== "undefined" && assigned_project_entity_1.AssignedProject) === "function" ? _a : Object)
], WorkHours.prototype, "assignedProject", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'date',
        type: 'date',
        comment: '날짜',
    }),
    __metadata("design:type", String)
], WorkHours.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '근무 시작 시간',
    }),
    __metadata("design:type", String)
], WorkHours.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_time',
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '근무 종료 시간',
    }),
    __metadata("design:type", String)
], WorkHours.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'work_minutes',
        type: 'int',
        default: 0,
        comment: '근무 시간 (분 단위)',
    }),
    __metadata("design:type", Number)
], WorkHours.prototype, "work_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'note',
        type: 'text',
        nullable: true,
        comment: '비고',
    }),
    __metadata("design:type", String)
], WorkHours.prototype, "note", void 0);
exports.WorkHours = WorkHours = __decorate([
    (0, typeorm_1.Entity)('work_hours'),
    (0, typeorm_1.Index)(['assigned_project_id', 'date'], { unique: true }),
    (0, typeorm_1.Index)(['assigned_project_id']),
    (0, typeorm_1.Index)(['date']),
    __metadata("design:paramtypes", [String, String, String, String, Number, String])
], WorkHours);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/work-hours/work-hours.module.ts":
/*!**************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/work-hours/work-hours.module.ts ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainWorkHoursModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const work_hours_entity_1 = __webpack_require__(/*! ./work-hours.entity */ "./apps/lams/src/refactoring/domain/work-hours/work-hours.entity.ts");
const work_hours_service_1 = __webpack_require__(/*! ./work-hours.service */ "./apps/lams/src/refactoring/domain/work-hours/work-hours.service.ts");
const assigned_project_module_1 = __webpack_require__(/*! ../assigned-project/assigned-project.module */ "./apps/lams/src/refactoring/domain/assigned-project/assigned-project.module.ts");
let DomainWorkHoursModule = class DomainWorkHoursModule {
};
exports.DomainWorkHoursModule = DomainWorkHoursModule;
exports.DomainWorkHoursModule = DomainWorkHoursModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([work_hours_entity_1.WorkHours]), assigned_project_module_1.DomainAssignedProjectModule],
        providers: [work_hours_service_1.DomainWorkHoursService],
        exports: [work_hours_service_1.DomainWorkHoursService, typeorm_1.TypeOrmModule],
    })
], DomainWorkHoursModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/domain/work-hours/work-hours.service.ts":
/*!***************************************************************************!*\
  !*** ./apps/lams/src/refactoring/domain/work-hours/work-hours.service.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainWorkHoursService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const work_hours_entity_1 = __webpack_require__(/*! ./work-hours.entity */ "./apps/lams/src/refactoring/domain/work-hours/work-hours.entity.ts");
let DomainWorkHoursService = class DomainWorkHoursService {
    constructor(repository) {
        this.repository = repository;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(work_hours_entity_1.WorkHours) : this.repository;
    }
    async 생성한다(data, manager) {
        const repository = this.getRepository(manager);
        const existing = await repository.findOne({
            where: {
                assigned_project_id: data.assignedProjectId,
                date: data.date,
                deleted_at: (0, typeorm_2.IsNull)(),
            },
        });
        if (existing) {
            throw new Error('이미 해당 날짜의 시수가 존재합니다.');
        }
        let workMinutes = data.workMinutes || 0;
        if (!workMinutes && data.startTime && data.endTime) {
            try {
                const startDateTime = new Date(`${data.date}T${data.startTime}`);
                const endDateTime = new Date(`${data.date}T${data.endTime}`);
                const diff = endDateTime.getTime() - startDateTime.getTime();
                workMinutes = Math.floor(diff / (1000 * 60));
            }
            catch (error) {
                workMinutes = 0;
            }
        }
        const workHours = new work_hours_entity_1.WorkHours(data.assignedProjectId, data.date, data.startTime, data.endTime, workMinutes, data.note);
        const saved = await repository.save(workHours);
        return saved.DTO변환한다();
    }
    async ID로조회한다(id) {
        const workHours = await this.repository.findOne({
            where: { id },
            relations: ['assignedProject'],
        });
        if (!workHours) {
            throw new common_1.NotFoundException(`시수를 찾을 수 없습니다. (id: ${id})`);
        }
        return workHours.DTO변환한다();
    }
    async 할당된프로젝트ID로조회한다(assignedProjectId) {
        const workHoursList = await this.repository.find({
            where: { assigned_project_id: assignedProjectId, deleted_at: (0, typeorm_2.IsNull)() },
            order: { date: 'ASC' },
        });
        return workHoursList.map((wh) => wh.DTO변환한다());
    }
    async 날짜범위로조회한다(assignedProjectId, startDate, endDate) {
        const workHoursList = await this.repository
            .createQueryBuilder('workHours')
            .where('workHours.deleted_at IS NULL')
            .andWhere('workHours.assigned_project_id = :assignedProjectId', { assignedProjectId })
            .andWhere('workHours.date >= :startDate', { startDate })
            .andWhere('workHours.date <= :endDate', { endDate })
            .orderBy('workHours.date', 'ASC')
            .getMany();
        return workHoursList.map((wh) => wh.DTO변환한다());
    }
    async 날짜로조회한다(assignedProjectId, date) {
        const workHours = await this.repository.findOne({
            where: { assigned_project_id: assignedProjectId, date, deleted_at: (0, typeorm_2.IsNull)() },
        });
        return workHours ? workHours.DTO변환한다() : null;
    }
    async 연도별합계조회한다(assignedProjectId, year) {
        const result = await this.repository
            .createQueryBuilder('workHours')
            .select('SUM(workHours.work_minutes)', 'total')
            .where('workHours.deleted_at IS NULL')
            .andWhere('workHours.assigned_project_id = :assignedProjectId', { assignedProjectId })
            .andWhere('workHours.date LIKE :year', { year: `${year}%` })
            .getRawOne();
        return result?.total || 0;
    }
    async 월별합계조회한다(assignedProjectId, year, month) {
        const yearMonth = `${year}-${month.padStart(2, '0')}`;
        const result = await this.repository
            .createQueryBuilder('workHours')
            .select('SUM(workHours.work_minutes)', 'total')
            .where('workHours.deleted_at IS NULL')
            .andWhere('workHours.assigned_project_id = :assignedProjectId', { assignedProjectId })
            .andWhere('workHours.date LIKE :yearMonth', { yearMonth: `${yearMonth}%` })
            .getRawOne();
        return result?.total || 0;
    }
    async 생성또는수정한다(data, userId, manager) {
        const repository = this.getRepository(manager);
        const existing = await repository.findOne({
            where: {
                assigned_project_id: data.assignedProjectId,
                date: data.date,
                deleted_at: (0, typeorm_2.IsNull)(),
            },
        });
        if (existing) {
            let workMinutes = data.workMinutes;
            if (!workMinutes && data.startTime && data.endTime) {
                try {
                    const startDateTime = new Date(`${data.date}T${data.startTime}`);
                    const endDateTime = new Date(`${data.date}T${data.endTime}`);
                    const diff = endDateTime.getTime() - startDateTime.getTime();
                    workMinutes = Math.floor(diff / (1000 * 60));
                }
                catch (error) {
                    workMinutes = existing.work_minutes;
                }
            }
            existing.업데이트한다(data.startTime, data.endTime, workMinutes, data.note);
            existing.수정자설정한다(userId);
            existing.메타데이터업데이트한다(userId);
            const saved = await repository.save(existing);
            return saved.DTO변환한다();
        }
        else {
            return await this.생성한다(data, manager);
        }
    }
    async 연도별일괄생성한다(assignedProjectId, year, manager) {
        const repository = this.getRepository(manager);
        const workHoursList = [];
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            const workHours = new work_hours_entity_1.WorkHours(assignedProjectId, dateStr, null, null, 0, null);
            workHoursList.push(workHours);
        }
        const saved = await repository.save(workHoursList);
        return saved.map((wh) => wh.DTO변환한다());
    }
    async 수정한다(id, data, userId, manager) {
        const repository = this.getRepository(manager);
        const workHours = await repository.findOne({ where: { id } });
        if (!workHours) {
            throw new common_1.NotFoundException(`시수를 찾을 수 없습니다. (id: ${id})`);
        }
        let workMinutes = data.workMinutes;
        if (workMinutes === undefined && data.startTime && data.endTime) {
            try {
                const startDateTime = new Date(`${workHours.date}T${data.startTime}`);
                const endDateTime = new Date(`${workHours.date}T${data.endTime}`);
                const diff = endDateTime.getTime() - startDateTime.getTime();
                workMinutes = Math.floor(diff / (1000 * 60));
            }
            catch (error) {
                workMinutes = workHours.work_minutes;
            }
        }
        workHours.업데이트한다(data.startTime, data.endTime, workMinutes, data.note);
        workHours.수정자설정한다(userId);
        workHours.메타데이터업데이트한다(userId);
        const saved = await repository.save(workHours);
        return saved.DTO변환한다();
    }
    async 삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const workHours = await repository.findOne({ where: { id } });
        if (!workHours) {
            throw new common_1.NotFoundException(`시수를 찾을 수 없습니다. (id: ${id})`);
        }
        workHours.deleted_at = new Date();
        workHours.수정자설정한다(userId);
        workHours.메타데이터업데이트한다(userId);
        await repository.save(workHours);
    }
    async 완전삭제한다(id, userId, manager) {
        const repository = this.getRepository(manager);
        const workHours = await repository.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!workHours) {
            throw new common_1.NotFoundException(`시수를 찾을 수 없습니다. (id: ${id})`);
        }
        await repository.remove(workHours);
    }
};
exports.DomainWorkHoursService = DomainWorkHoursService;
exports.DomainWorkHoursService = DomainWorkHoursService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_hours_entity_1.WorkHours)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DomainWorkHoursService);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.constants.ts":
/*!***************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.constants.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MAX_ROWS = exports.DEFAULT_READ_OPTIONS = exports.EXCEL_MIME_TYPES = exports.SUPPORTED_EXCEL_FORMATS = void 0;
exports.SUPPORTED_EXCEL_FORMATS = ['.xlsx', '.xls', '.csv'];
exports.EXCEL_MIME_TYPES = {
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    XLS: 'application/vnd.ms-excel',
    CSV: 'text/csv',
};
exports.DEFAULT_READ_OPTIONS = {
    includeEmpty: false,
    startRow: 1,
    hasHeader: true,
};
exports.MAX_ROWS = 100000;


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.module.ts":
/*!************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.module.ts ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExcelReaderModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const excel_reader_service_1 = __webpack_require__(/*! ./excel-reader.service */ "./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.service.ts");
let ExcelReaderModule = class ExcelReaderModule {
};
exports.ExcelReaderModule = ExcelReaderModule;
exports.ExcelReaderModule = ExcelReaderModule = __decorate([
    (0, common_1.Module)({
        providers: [excel_reader_service_1.ExcelReaderService],
        exports: [excel_reader_service_1.ExcelReaderService],
    })
], ExcelReaderModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.service.ts":
/*!*************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.service.ts ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExcelReaderService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExcelReaderService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const XLSX = __webpack_require__(/*! xlsx */ "xlsx");
const excel_reader_constants_1 = __webpack_require__(/*! ./excel-reader.constants */ "./apps/lams/src/refactoring/integrations/excel-reader/excel-reader.constants.ts");
let ExcelReaderService = ExcelReaderService_1 = class ExcelReaderService {
    constructor() {
        this.logger = new common_1.Logger(ExcelReaderService_1.name);
    }
    loadWorkbook(buffer) {
        try {
            this.logger.log(`워크북 로드 시작, 버퍼 크기: ${buffer.length} bytes`);
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            this.logger.log(`워크북 로드 완료, 워크시트 수: ${workbook.SheetNames.length}`);
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new common_1.BadRequestException('엑셀 파일에 워크시트가 없습니다.');
            }
            return workbook;
        }
        catch (error) {
            this.logger.error('워크북 로드 실패');
            this.logger.error(`에러 메시지: ${error.message}`);
            if (error.stack) {
                this.logger.error(`에러 스택: ${error.stack}`);
            }
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('엑셀 파일을 읽을 수 없습니다. 파일이 손상되었거나 올바른 형식이 아닙니다.');
        }
    }
    async getFileInfo(buffer) {
        const workbook = this.loadWorkbook(buffer);
        const worksheets = workbook.SheetNames.map((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
            return {
                name: sheetName,
                index,
                rowCount: range.e.r + 1,
                columnCount: range.e.c + 1,
                state: 'visible',
            };
        });
        return {
            worksheets,
            worksheetCount: worksheets.length,
            format: 'xlsx',
        };
    }
    async readWorksheet(buffer, options) {
        const workbook = this.loadWorkbook(buffer);
        const readOptions = {
            ...excel_reader_constants_1.DEFAULT_READ_OPTIONS,
            ...options,
        };
        let sheetName;
        let worksheet;
        if (options?.sheetName) {
            sheetName = options.sheetName;
            worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                throw new common_1.BadRequestException(`워크시트 '${options.sheetName}'을(를) 찾을 수 없습니다.`);
            }
        }
        else if (options?.sheetIndex !== undefined) {
            sheetName = workbook.SheetNames[options.sheetIndex];
            if (!sheetName) {
                throw new common_1.BadRequestException(`워크시트 인덱스 ${options.sheetIndex}을(를) 찾을 수 없습니다.`);
            }
            worksheet = workbook.Sheets[sheetName];
        }
        else {
            sheetName = workbook.SheetNames[0];
            worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                throw new common_1.BadRequestException('워크시트가 없습니다.');
            }
        }
        this.logger.log(`워크시트 읽기: ${sheetName}`);
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const startRow = (readOptions.startRow || 1) - 1;
        let endRow = readOptions.endRow ? readOptions.endRow - 1 : range.e.r;
        if (endRow - startRow > excel_reader_constants_1.MAX_ROWS) {
            this.logger.warn(`요청된 행 수가 너무 많습니다. 최대 ${excel_reader_constants_1.MAX_ROWS}행으로 제한합니다.`);
            endRow = startRow + excel_reader_constants_1.MAX_ROWS;
        }
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: readOptions.hasHeader ? undefined : 1,
            range: startRow,
            defval: readOptions.includeEmpty ? null : undefined,
            raw: false,
        });
        const limitedData = jsonData.slice(0, Math.min(jsonData.length, endRow - startRow + 1));
        let headers;
        let rows;
        let records;
        if (readOptions.hasHeader && limitedData.length > 0) {
            headers = Object.keys(limitedData[0]);
            records = limitedData;
            rows = records.map((record) => headers.map((header) => record[header]));
        }
        else {
            rows = limitedData;
            if (rows.length > 0 && Array.isArray(rows[0])) {
                headers = rows[0].map((_, index) => `Column${index + 1}`);
            }
        }
        const sheetIndex = workbook.SheetNames.indexOf(sheetName);
        this.logger.log(`워크시트 읽기 완료: ${sheetName} (${rows.length}행, ${headers?.length || 0}열)`);
        return {
            sheetName,
            headers,
            data: rows,
            records,
            rowCount: rows.length,
            columnCount: headers?.length || rows[0]?.length || 0,
        };
    }
    async readMultipleWorksheets(buffer, sheetNames, options) {
        const workbook = this.loadWorkbook(buffer);
        const results = [];
        if (sheetNames && sheetNames.length > 0) {
            for (const sheetName of sheetNames) {
                const result = await this.readWorksheet(buffer, {
                    ...options,
                    sheetName,
                });
                results.push(result);
            }
        }
        else {
            for (let i = 0; i < workbook.SheetNames.length; i++) {
                const result = await this.readWorksheet(buffer, {
                    ...options,
                    sheetIndex: i,
                });
                results.push(result);
            }
        }
        return results;
    }
    validateData(data, rules) {
        const errors = [];
        const warnings = [];
        if (!data.records && !data.headers) {
            throw new common_1.BadRequestException('헤더가 있는 데이터만 검증할 수 있습니다.');
        }
        data.records?.forEach((record, rowIndex) => {
            rules.forEach((rule) => {
                const columnName = typeof rule.column === 'string' ? rule.column : data.headers[rule.column];
                const value = record[columnName];
                if (rule.required && (value === null || value === undefined || value === '')) {
                    errors.push({
                        row: rowIndex + 2,
                        column: columnName,
                        value,
                        message: `필수 값입니다.`,
                    });
                    return;
                }
                if (rule.type && value !== null && value !== undefined && value !== '') {
                    const isValid = this.validateType(value, rule.type);
                    if (!isValid) {
                        errors.push({
                            row: rowIndex + 2,
                            column: columnName,
                            value,
                            message: `타입이 ${rule.type}이어야 합니다.`,
                        });
                    }
                }
                if (rule.pattern && value) {
                    const regex = new RegExp(rule.pattern);
                    if (!regex.test(String(value))) {
                        errors.push({
                            row: rowIndex + 2,
                            column: columnName,
                            value,
                            message: `패턴이 일치하지 않습니다.`,
                        });
                    }
                }
                if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
                    errors.push({
                        row: rowIndex + 2,
                        column: columnName,
                        value,
                        message: `${rule.min} 이상이어야 합니다.`,
                    });
                }
                if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
                    errors.push({
                        row: rowIndex + 2,
                        column: columnName,
                        value,
                        message: `${rule.max} 이하여야 합니다.`,
                    });
                }
            });
        });
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    async convertToCSV(data) {
        const rows = [];
        if (data.headers) {
            rows.push(data.headers);
        }
        data.data.forEach((row) => {
            rows.push(row.map((cell) => (cell === null || cell === undefined ? '' : String(cell))));
        });
        return rows.map((row) => row.map((cell) => this.escapeCSVCell(cell)).join(',')).join('\n');
    }
    readFileAsJson(filePath) {
        const workbook = XLSX.readFile(filePath);
        if (workbook.SheetNames.length === 0) {
            throw new common_1.BadRequestException('엑셀 파일이 비어있습니다.');
        }
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            throw new common_1.BadRequestException('엑셀 시트가 존재하지 않습니다.');
        }
        return XLSX.utils.sheet_to_json(sheet);
    }
    findExcelFile(filePath) {
        return this.readFileAsJson(filePath);
    }
    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'date':
                return value instanceof Date || !isNaN(Date.parse(value));
            default:
                return true;
        }
    }
    escapeCSVCell(cell) {
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
    }
};
exports.ExcelReaderService = ExcelReaderService;
exports.ExcelReaderService = ExcelReaderService = ExcelReaderService_1 = __decorate([
    (0, common_1.Injectable)()
], ExcelReaderService);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/init/init.module.ts":
/*!********************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/init/init.module.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InitModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const init_service_1 = __webpack_require__(/*! ./init.service */ "./apps/lams/src/refactoring/integrations/init/init.service.ts");
const attendance_type_module_1 = __webpack_require__(/*! ../../domain/attendance-type/attendance-type.module */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.module.ts");
const holiday_info_module_1 = __webpack_require__(/*! ../../domain/holiday-info/holiday-info.module */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.module.ts");
const migration_module_1 = __webpack_require__(/*! ../migration/migration.module */ "./apps/lams/src/refactoring/integrations/migration/migration.module.ts");
let InitModule = class InitModule {
};
exports.InitModule = InitModule;
exports.InitModule = InitModule = __decorate([
    (0, common_1.Module)({
        imports: [attendance_type_module_1.DomainAttendanceTypeModule, holiday_info_module_1.DomainHolidayInfoModule, migration_module_1.OrganizationMigrationModule],
        providers: [init_service_1.InitService],
    })
], InitModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/init/init.service.ts":
/*!*********************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/init/init.service.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InitService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InitService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const attendance_type_service_1 = __webpack_require__(/*! ../../domain/attendance-type/attendance-type.service */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.service.ts");
const holiday_info_service_1 = __webpack_require__(/*! ../../domain/holiday-info/holiday-info.service */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.service.ts");
const migration_service_1 = __webpack_require__(/*! ../migration/migration.service */ "./apps/lams/src/refactoring/integrations/migration/migration.service.ts");
const attendance_type_entity_1 = __webpack_require__(/*! ../../domain/attendance-type/attendance-type.entity */ "./apps/lams/src/refactoring/domain/attendance-type/attendance-type.entity.ts");
const holiday_info_entity_1 = __webpack_require__(/*! ../../domain/holiday-info/holiday-info.entity */ "./apps/lams/src/refactoring/domain/holiday-info/holiday-info.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
let InitService = InitService_1 = class InitService {
    constructor(dataSource, attendanceTypeService, holidayInfoService, organizationMigrationService) {
        this.dataSource = dataSource;
        this.attendanceTypeService = attendanceTypeService;
        this.holidayInfoService = holidayInfoService;
        this.organizationMigrationService = organizationMigrationService;
        this.logger = new common_1.Logger(InitService_1.name);
    }
    async onApplicationBootstrap() {
        try {
            this.logger.log('기본 데이터 초기화 시작...');
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
            }
            await this.근태유형기본데이터생성();
            await this.휴일정보기본데이터생성();
            await this.조직데이터마이그레이션();
            this.logger.log('✅ 기본 데이터 초기화 완료');
        }
        catch (error) {
            this.logger.error(`기본 데이터 초기화 실패: ${error.message}`, error.stack);
        }
    }
    async 근태유형기본데이터생성() {
        this.logger.log('근태 유형 기본 데이터 확인 중...');
        const defaultAttendanceTypes = [
            {
                title: '연차',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 1.0,
            },
            {
                title: '오전반차',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.5,
            },
            {
                title: '오후반차',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '14:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.5,
            },
            {
                title: '공가',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오전공가',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오후공가',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '14:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '출장',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오전출장',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오후출장',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '14:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '교육',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오전교육',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오후교육',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '14:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '경조휴가',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '보건휴가(오전 반차)',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '병가',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '생일오전반차',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.5,
            },
            {
                title: '생일오후반차',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '14:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.5,
            },
            {
                title: '대체휴가',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오전대체휴가',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '오후대체휴가',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '14:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '무급휴가',
                workTime: 0,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '보건휴가(오전반차)',
                workTime: 240,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '14:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '국내출장',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '국외출장',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '사외교육',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
            {
                title: '사내교육',
                workTime: 480,
                isRecognizedWorkTime: true,
                startWorkTime: '09:00',
                endWorkTime: '18:00',
                deductedAnnualLeave: 0.0,
            },
        ];
        const existingTypes = await this.dataSource.manager.find(attendance_type_entity_1.AttendanceType, {
            where: { deleted_at: (0, typeorm_2.IsNull)() },
        });
        const existingTitles = new Set(existingTypes.map((at) => at.title));
        let createdCount = 0;
        for (const typeData of defaultAttendanceTypes) {
            if (existingTitles.has(typeData.title)) {
                this.logger.log(`근태 유형 "${typeData.title}"이 이미 존재합니다.`);
                continue;
            }
            try {
                await this.attendanceTypeService.생성한다({
                    title: typeData.title,
                    workTime: typeData.workTime,
                    isRecognizedWorkTime: typeData.isRecognizedWorkTime,
                    startWorkTime: typeData.startWorkTime,
                    endWorkTime: typeData.endWorkTime,
                    deductedAnnualLeave: typeData.deductedAnnualLeave,
                });
                createdCount++;
                this.logger.log(`근태 유형 "${typeData.title}" 생성 완료`);
            }
            catch (error) {
                this.logger.warn(`근태 유형 "${typeData.title}" 생성 실패: ${error.message}`);
            }
        }
        if (createdCount > 0) {
            this.logger.log(`근태 유형 기본 데이터 생성 완료: ${createdCount}개 생성됨`);
        }
        else {
            this.logger.log('근태 유형 기본 데이터가 모두 존재합니다.');
        }
    }
    async 휴일정보기본데이터생성() {
        this.logger.log('휴일 정보 기본 데이터 확인 중...');
        const defaultHolidays = [
            { holidayName: '1월1일', holidayDate: '2024-01-01' },
            { holidayName: '설날', holidayDate: '2024-02-09' },
            { holidayName: '설날', holidayDate: '2024-02-10' },
            { holidayName: '설날', holidayDate: '2024-02-11' },
            { holidayName: '대체공휴일(설날)', holidayDate: '2024-02-12' },
            { holidayName: '삼일절', holidayDate: '2024-03-01' },
            { holidayName: '국회의원선거', holidayDate: '2024-04-10' },
            { holidayName: '어린이날', holidayDate: '2024-05-05' },
            { holidayName: '대체공휴일(어린이날)', holidayDate: '2024-05-06' },
            { holidayName: '부처님오신날', holidayDate: '2024-05-15' },
            { holidayName: '현충일', holidayDate: '2024-06-06' },
            { holidayName: '광복절', holidayDate: '2024-08-15' },
            { holidayName: '추석', holidayDate: '2024-09-16' },
            { holidayName: '추석', holidayDate: '2024-09-17' },
            { holidayName: '추석', holidayDate: '2024-09-18' },
            { holidayName: '임시공휴일', holidayDate: '2024-10-01' },
            { holidayName: '개천절', holidayDate: '2024-10-03' },
            { holidayName: '한글날', holidayDate: '2024-10-09' },
            { holidayName: '기독탄신일', holidayDate: '2024-12-25' },
            { holidayName: '1월1일', holidayDate: '2025-01-01' },
            { holidayName: '임시공휴일(설날)', holidayDate: '2025-01-27' },
            { holidayName: '설날', holidayDate: '2025-01-28' },
            { holidayName: '설날', holidayDate: '2025-01-29' },
            { holidayName: '설날', holidayDate: '2025-01-30' },
            { holidayName: '삼일절', holidayDate: '2025-03-01' },
            { holidayName: '대체공휴일(삼일절)', holidayDate: '2025-03-03' },
            { holidayName: '어린이날', holidayDate: '2025-05-05' },
            { holidayName: '부처님오신날', holidayDate: '2025-05-05' },
            { holidayName: '대체공휴일(부처님오신날)', holidayDate: '2025-05-06' },
            { holidayName: '현충일', holidayDate: '2025-06-06' },
            { holidayName: '임시공휴일(대통령선거)', holidayDate: '2025-06-03' },
            { holidayName: '광복절', holidayDate: '2025-08-15' },
            { holidayName: '추석', holidayDate: '2025-10-05' },
            { holidayName: '추석', holidayDate: '2025-10-06' },
            { holidayName: '추석', holidayDate: '2025-10-07' },
            { holidayName: '임시공휴일(추석)', holidayDate: '2025-10-08' },
            { holidayName: '개천절', holidayDate: '2025-10-03' },
            { holidayName: '한글날', holidayDate: '2025-10-09' },
            { holidayName: '전사휴무(연차소진)', holidayDate: '2025-10-10' },
            { holidayName: '기독탄신일', holidayDate: '2025-12-25' },
        ];
        const existingHolidays = await this.dataSource.manager.find(holiday_info_entity_1.HolidayInfo, {
            where: { deleted_at: (0, typeorm_2.IsNull)() },
        });
        const existingHolidayMap = new Map();
        existingHolidays.forEach((h) => {
            const key = `${h.holiday_date}_${h.holiday_name}`;
            existingHolidayMap.set(key, true);
        });
        let createdCount = 0;
        for (const holidayData of defaultHolidays) {
            const key = `${holidayData.holidayDate}_${holidayData.holidayName}`;
            if (existingHolidayMap.has(key)) {
                this.logger.log(`휴일 정보 "${holidayData.holidayName} (${holidayData.holidayDate})"이 이미 존재합니다.`);
                continue;
            }
            try {
                await this.holidayInfoService.생성한다({
                    holidayName: holidayData.holidayName,
                    holidayDate: holidayData.holidayDate,
                });
                createdCount++;
                this.logger.log(`휴일 정보 "${holidayData.holidayName} (${holidayData.holidayDate})" 생성 완료`);
            }
            catch (error) {
                this.logger.warn(`휴일 정보 "${holidayData.holidayName} (${holidayData.holidayDate})" 생성 실패: ${error.message}`);
            }
        }
        if (createdCount > 0) {
            this.logger.log(`휴일 정보 기본 데이터 생성 완료: ${createdCount}개 생성됨`);
        }
        else {
            this.logger.log('휴일 정보 기본 데이터가 모두 존재합니다.');
        }
    }
    async 조직데이터마이그레이션() {
        this.logger.log('조직 데이터 확인 중...');
        const employeeCount = await this.dataSource.manager.count(employee_entity_1.Employee);
        if (employeeCount > 0) {
            this.logger.log(`조직 데이터가 이미 존재합니다 (직원 ${employeeCount}명). 마이그레이션을 건너뜁니다.`);
            return;
        }
        try {
            this.logger.log('조직 데이터가 없습니다. SSO에서 데이터를 가져와서 마이그레이션을 시작합니다.');
            const result = await this.organizationMigrationService.마이그레이션한다();
            this.logger.log(`✅ 조직 데이터 마이그레이션 완료: 직급 ${result.statistics.ranks}개, 직책 ${result.statistics.positions}개, 부서 ${result.statistics.departments}개, 직원 ${result.statistics.employees}명`);
        }
        catch (error) {
            this.logger.error(`조직 데이터 마이그레이션 실패: ${error.message}`, error.stack);
        }
    }
};
exports.InitService = InitService;
exports.InitService = InitService = InitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object, typeof (_b = typeof attendance_type_service_1.DomainAttendanceTypeService !== "undefined" && attendance_type_service_1.DomainAttendanceTypeService) === "function" ? _b : Object, typeof (_c = typeof holiday_info_service_1.DomainHolidayInfoService !== "undefined" && holiday_info_service_1.DomainHolidayInfoService) === "function" ? _c : Object, typeof (_d = typeof migration_service_1.OrganizationMigrationService !== "undefined" && migration_service_1.OrganizationMigrationService) === "function" ? _d : Object])
], InitService);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/local-storage/local-storage.constants.ts":
/*!*****************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/local-storage/local-storage.constants.ts ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.URL_EXPIRATION = exports.LOCAL_FOLDERS = exports.MAX_FILE_SIZE = exports.EXCEL_EXTENSIONS = exports.EXCEL_MIME_TYPES = void 0;
exports.EXCEL_MIME_TYPES = {
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    XLS: 'application/vnd.ms-excel',
    CSV: 'text/csv',
};
exports.EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
exports.MAX_FILE_SIZE = 10 * 1024 * 1024;
exports.LOCAL_FOLDERS = {
    EXCEL: 'excel-files',
    TEMP: 'temp',
};
exports.URL_EXPIRATION = 3600;


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/local-storage/local-storage.module.ts":
/*!**************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/local-storage/local-storage.module.ts ***!
  \**************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStorageModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const local_storage_service_1 = __webpack_require__(/*! ./local-storage.service */ "./apps/lams/src/refactoring/integrations/local-storage/local-storage.service.ts");
let LocalStorageModule = class LocalStorageModule {
};
exports.LocalStorageModule = LocalStorageModule;
exports.LocalStorageModule = LocalStorageModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [local_storage_service_1.LocalStorageService],
        exports: [local_storage_service_1.LocalStorageService],
    })
], LocalStorageModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/local-storage/local-storage.service.ts":
/*!***************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/local-storage/local-storage.service.ts ***!
  \***************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocalStorageService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStorageService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const crypto = __webpack_require__(/*! crypto */ "crypto");
const local_storage_constants_1 = __webpack_require__(/*! ./local-storage.constants */ "./apps/lams/src/refactoring/integrations/local-storage/local-storage.constants.ts");
let LocalStorageService = LocalStorageService_1 = class LocalStorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LocalStorageService_1.name);
        this.storagePath =
            this.configService.get('LOCAL_STORAGE_PATH') || path.join(process.cwd(), 'storage', 'local-files');
        this.ensureStorageDirectory();
        this.logger.log(`✅ 로컬 스토리지 서비스 초기화 완료`);
        this.logger.log(`   - Storage Path: ${this.storagePath}`);
    }
    async uploadExcel(file, dto) {
        try {
            this.validateExcelFile(file);
            const originalFileName = file.originalname;
            const fileExtension = path.extname(originalFileName);
            const fileKey = this.generateFileKey(fileExtension, dto?.folder);
            const filePath = path.join(this.storagePath, fileKey);
            const fileDir = path.dirname(filePath);
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }
            this.logger.log(`파일 업로드 중: ${originalFileName} -> ${fileKey}`);
            fs.writeFileSync(filePath, file.buffer);
            this.logger.log(`파일 업로드 완료: ${fileKey}`);
            const fileUrl = `/storage/${fileKey}`;
            return {
                success: true,
                message: '파일이 성공적으로 업로드되었습니다.',
                fileKey,
                bucket: this.storagePath,
                url: fileUrl,
                uploadedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('파일 업로드 실패', error);
            throw new common_1.InternalServerErrorException('파일 업로드 중 오류가 발생했습니다.');
        }
    }
    async getFileDownloadUrl(dto) {
        try {
            await this.validateFileExists(dto.fileKey);
            const expiresIn = dto.expiresIn || local_storage_constants_1.URL_EXPIRATION;
            const fileUrl = `/storage/${dto.fileKey}`;
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
            this.logger.log(`다운로드 URL 생성 완료: ${dto.fileKey}`);
            return {
                url: fileUrl,
                expiresIn,
                expiresAt,
            };
        }
        catch (error) {
            this.logger.error('다운로드 URL 생성 실패', error);
            throw new common_1.InternalServerErrorException('다운로드 URL 생성 중 오류가 발생했습니다.');
        }
    }
    async deleteFile(dto) {
        try {
            await this.validateFileExists(dto.fileKey);
            const filePath = path.join(this.storagePath, dto.fileKey);
            fs.unlinkSync(filePath);
            this.logger.log(`파일 삭제 완료: ${dto.fileKey}`);
            return {
                success: true,
                message: '파일이 성공적으로 삭제되었습니다.',
                fileKey: dto.fileKey,
            };
        }
        catch (error) {
            this.logger.error('파일 삭제 실패', error);
            throw new common_1.InternalServerErrorException('파일 삭제 중 오류가 발생했습니다.');
        }
    }
    async listFiles(dto) {
        try {
            const prefix = dto?.prefix || local_storage_constants_1.LOCAL_FOLDERS.EXCEL;
            const maxKeys = dto?.maxKeys || 100;
            const prefixPath = path.join(this.storagePath, prefix);
            if (!fs.existsSync(prefixPath)) {
                return {
                    files: [],
                    count: 0,
                    prefix,
                };
            }
            const files = [];
            const items = fs.readdirSync(prefixPath, { withFileTypes: true, recursive: true });
            let count = 0;
            for (const item of items) {
                if (count >= maxKeys)
                    break;
                if (item.isFile()) {
                    const filePath = path.join(item.path, item.name);
                    const relativePath = path.relative(this.storagePath, filePath).replace(/\\/g, '/');
                    const stats = fs.statSync(filePath);
                    files.push({
                        key: relativePath,
                        size: stats.size,
                        lastModified: stats.mtime,
                        etag: crypto.createHash('md5').update(relativePath).digest('hex'),
                    });
                    count++;
                }
            }
            this.logger.log(`파일 목록 조회 완료: ${files.length}개`);
            return {
                files,
                count: files.length,
                prefix,
            };
        }
        catch (error) {
            this.logger.error('파일 목록 조회 실패', error);
            throw new common_1.InternalServerErrorException('파일 목록 조회 중 오류가 발생했습니다.');
        }
    }
    async downloadFileStream(fileKey) {
        try {
            const filePath = path.join(this.storagePath, fileKey);
            if (!fs.existsSync(filePath)) {
                throw new common_1.BadRequestException('파일을 찾을 수 없습니다.');
            }
            return fs.readFileSync(filePath);
        }
        catch (error) {
            this.logger.error('파일 다운로드 실패', error);
            throw new common_1.InternalServerErrorException('파일 다운로드 중 오류가 발생했습니다.');
        }
    }
    async checkFileExists(fileKey) {
        try {
            const filePath = path.join(this.storagePath, fileKey);
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        }
        catch (error) {
            this.logger.debug(`파일을 찾을 수 없음: ${fileKey}`);
            return false;
        }
    }
    async validateFileExists(fileKey) {
        const exists = await this.checkFileExists(fileKey);
        if (!exists) {
            throw new common_1.BadRequestException('파일을 찾을 수 없습니다.');
        }
    }
    validateExcelFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('파일이 제공되지 않았습니다.');
        }
        if (file.size > local_storage_constants_1.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`파일 크기가 너무 큽니다. 최대 ${local_storage_constants_1.MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`);
        }
        const ext = path.extname(file.originalname).toLowerCase();
        if (!local_storage_constants_1.EXCEL_EXTENSIONS.includes(ext)) {
            throw new common_1.BadRequestException(`지원하지 않는 파일 형식입니다. 지원 형식: ${local_storage_constants_1.EXCEL_EXTENSIONS.join(', ')}`);
        }
        const validMimeTypes = Object.values(local_storage_constants_1.EXCEL_MIME_TYPES);
        if (!validMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`잘못된 파일 형식입니다. 엑셀 파일(.xlsx, .xls, .csv)만 업로드 가능합니다.`);
        }
    }
    generateFileKey(fileExtension, folder) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const baseFolder = folder || local_storage_constants_1.LOCAL_FOLDERS.EXCEL;
        return `${baseFolder}/${timestamp}-${randomString}${fileExtension}`;
    }
    ensureStorageDirectory() {
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
            this.logger.log(`저장소 디렉토리 생성: ${this.storagePath}`);
        }
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = LocalStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], LocalStorageService);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/migration/migration.module.ts":
/*!******************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/migration/migration.module.ts ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationMigrationModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const migration_service_1 = __webpack_require__(/*! ./migration.service */ "./apps/lams/src/refactoring/integrations/migration/migration.service.ts");
const sso_module_1 = __webpack_require__(/*! @libs/integrations/sso/sso.module */ "./libs/integrations/sso/sso.module.ts");
const department_module_1 = __webpack_require__(/*! @libs/modules/department/department.module */ "./libs/modules/department/department.module.ts");
const employee_module_1 = __webpack_require__(/*! @libs/modules/employee/employee.module */ "./libs/modules/employee/employee.module.ts");
const position_module_1 = __webpack_require__(/*! @libs/modules/position/position.module */ "./libs/modules/position/position.module.ts");
const rank_module_1 = __webpack_require__(/*! @libs/modules/rank/rank.module */ "./libs/modules/rank/rank.module.ts");
const employee_department_position_module_1 = __webpack_require__(/*! @libs/modules/employee-department-position/employee-department-position.module */ "./libs/modules/employee-department-position/employee-department-position.module.ts");
const employee_department_position_history_module_1 = __webpack_require__(/*! @libs/modules/employee-department-position-history/employee-department-position-history.module */ "./libs/modules/employee-department-position-history/employee-department-position-history.module.ts");
let OrganizationMigrationModule = class OrganizationMigrationModule {
};
exports.OrganizationMigrationModule = OrganizationMigrationModule;
exports.OrganizationMigrationModule = OrganizationMigrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sso_module_1.SSOModule,
            department_module_1.DomainDepartmentModule,
            employee_module_1.DomainEmployeeModule,
            position_module_1.DomainPositionModule,
            rank_module_1.DomainRankModule,
            employee_department_position_module_1.DomainEmployeeDepartmentPositionModule,
            employee_department_position_history_module_1.DomainEmployeeDepartmentPositionHistoryModule,
        ],
        providers: [migration_service_1.OrganizationMigrationService],
        exports: [migration_service_1.OrganizationMigrationService],
    })
], OrganizationMigrationModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/migration/migration.service.ts":
/*!*******************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/migration/migration.service.ts ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrganizationMigrationService_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationMigrationService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const sso_service_1 = __webpack_require__(/*! @libs/integrations/sso/sso.service */ "./libs/integrations/sso/sso.service.ts");
const department_service_1 = __webpack_require__(/*! @libs/modules/department/department.service */ "./libs/modules/department/department.service.ts");
const employee_service_1 = __webpack_require__(/*! @libs/modules/employee/employee.service */ "./libs/modules/employee/employee.service.ts");
const position_service_1 = __webpack_require__(/*! @libs/modules/position/position.service */ "./libs/modules/position/position.service.ts");
const rank_service_1 = __webpack_require__(/*! @libs/modules/rank/rank.service */ "./libs/modules/rank/rank.service.ts");
const employee_department_position_service_1 = __webpack_require__(/*! @libs/modules/employee-department-position/employee-department-position.service */ "./libs/modules/employee-department-position/employee-department-position.service.ts");
const employee_department_position_history_service_1 = __webpack_require__(/*! @libs/modules/employee-department-position-history/employee-department-position-history.service */ "./libs/modules/employee-department-position-history/employee-department-position-history.service.ts");
const department_entity_1 = __webpack_require__(/*! @libs/modules/department/department.entity */ "./libs/modules/department/department.entity.ts");
const employee_entity_1 = __webpack_require__(/*! @libs/modules/employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const position_entity_1 = __webpack_require__(/*! @libs/modules/position/position.entity */ "./libs/modules/position/position.entity.ts");
const rank_entity_1 = __webpack_require__(/*! @libs/modules/rank/rank.entity */ "./libs/modules/rank/rank.entity.ts");
const employee_department_position_entity_1 = __webpack_require__(/*! @libs/modules/employee-department-position/employee-department-position.entity */ "./libs/modules/employee-department-position/employee-department-position.entity.ts");
const employee_department_position_history_entity_1 = __webpack_require__(/*! @libs/modules/employee-department-position-history/employee-department-position-history.entity */ "./libs/modules/employee-department-position-history/employee-department-position-history.entity.ts");
let OrganizationMigrationService = OrganizationMigrationService_1 = class OrganizationMigrationService {
    constructor(ssoService, departmentService, employeeService, positionService, rankService, employeeDepartmentPositionService, employeeDepartmentPositionHistoryService, dataSource) {
        this.ssoService = ssoService;
        this.departmentService = departmentService;
        this.employeeService = employeeService;
        this.positionService = positionService;
        this.rankService = rankService;
        this.employeeDepartmentPositionService = employeeDepartmentPositionService;
        this.employeeDepartmentPositionHistoryService = employeeDepartmentPositionHistoryService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(OrganizationMigrationService_1.name);
    }
    async 마이그레이션한다(params) {
        this.logger.log('SSO 조직 데이터 마이그레이션 시작');
        const ssoData = await this.ssoService.exportAllData(params);
        this.logger.log(`SSO 데이터 조회 완료: 부서 ${ssoData.totalCounts.departments}개, 직원 ${ssoData.totalCounts.employees}명, 직급 ${ssoData.totalCounts.ranks}개, 직책 ${ssoData.totalCounts.positions}개`);
        const firstPhaseResult = await this.기본정보마이그레이션한다(ssoData);
        const secondPhaseResult = await this.배치및발령데이터마이그레이션한다(ssoData);
        const allFailedEmployeeIds = [
            ...new Set([
                ...secondPhaseResult.edpResult.failedEmployeeIds,
                ...secondPhaseResult.historyResult.failedEmployeeIds,
            ]),
        ];
        if (allFailedEmployeeIds.length > 0) {
            this.실패한직원정보를출력한다(allFailedEmployeeIds, ssoData.employees);
        }
        this.logger.log('✅ SSO 조직 데이터 마이그레이션 완료');
        return {
            success: true,
            statistics: {
                ranks: firstPhaseResult.rankCount,
                positions: firstPhaseResult.positionCount,
                departments: firstPhaseResult.departmentCount,
                employees: firstPhaseResult.employeeCount,
                employeeDepartmentPositions: secondPhaseResult.edpResult.count,
                assignmentHistories: secondPhaseResult.historyResult.count,
            },
        };
    }
    async 기본정보마이그레이션한다(ssoData) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            this.logger.log('1단계: 기본 정보 마이그레이션 시작 (Rank, Position, Department, Employee)');
            const rankCount = await this.마이그레이션Rank한다(ssoData.ranks, queryRunner);
            this.logger.log(`직급 마이그레이션 완료: ${rankCount}개`);
            const positionCount = await this.마이그레이션Position한다(ssoData.positions, queryRunner);
            this.logger.log(`직책 마이그레이션 완료: ${positionCount}개`);
            const departmentCount = await this.마이그레이션Department한다(ssoData.departments, queryRunner);
            this.logger.log(`부서 마이그레이션 완료: ${departmentCount}개`);
            const employeeCount = await this.마이그레이션Employee한다(ssoData.employees, queryRunner);
            this.logger.log(`직원 마이그레이션 완료: ${employeeCount}명`);
            await queryRunner.commitTransaction();
            this.logger.log('✅ 1단계: 기본 정보 마이그레이션 완료 및 커밋');
            return {
                rankCount,
                positionCount,
                departmentCount,
                employeeCount,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('1단계: 기본 정보 마이그레이션 실패', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async 배치및발령데이터마이그레이션한다(ssoData) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            this.logger.log('2단계: 배치 및 발령 데이터 마이그레이션 시작');
            const edpResult = await this.마이그레이션EmployeeDepartmentPosition한다(ssoData.employeeDepartmentPositions, queryRunner);
            this.logger.log(`직원-부서-직책 마이그레이션 완료: ${edpResult.count}개`);
            const historyResult = await this.마이그레이션EmployeeDepartmentPositionHistory한다(ssoData.assignmentHistories, queryRunner);
            this.logger.log(`직원 발령 이력 마이그레이션 완료: ${historyResult.count}개`);
            await queryRunner.commitTransaction();
            this.logger.log('✅ 2단계: 배치 및 발령 데이터 마이그레이션 완료 및 커밋');
            return {
                edpResult,
                historyResult,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('2단계: 배치 및 발령 데이터 마이그레이션 실패', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async 마이그레이션Rank한다(ranks, queryRunner) {
        let count = 0;
        for (const rankDto of ranks) {
            const rank = new rank_entity_1.Rank();
            rank.id = rankDto.id;
            rank.rankTitle = rankDto.rankName;
            rank.rankCode = rankDto.rankCode;
            rank.level = rankDto.level;
            await this.rankService.save(rank, { queryRunner });
            count++;
        }
        return count;
    }
    async 마이그레이션Position한다(positions, queryRunner) {
        let count = 0;
        for (const positionDto of positions) {
            const position = new position_entity_1.Position();
            position.id = positionDto.id;
            position.positionTitle = positionDto.positionTitle;
            position.positionCode = positionDto.positionCode;
            position.level = positionDto.level;
            position.hasManagementAuthority = positionDto.hasManagementAuthority;
            await this.positionService.save(position, { queryRunner });
            count++;
        }
        return count;
    }
    async 마이그레이션Department한다(departments, queryRunner) {
        let count = 0;
        const savedDepartmentIds = new Set();
        const terminatedDepartment = {
            id: 'ae6b09b3-3811-4d6a-af3b-bec84ea87b10',
            departmentName: '퇴사자',
            departmentCode: '퇴사자',
            type: 'DEPARTMENT',
            parentDepartmentId: null,
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        let remainingDepartments = [terminatedDepartment, ...departments];
        const maxIterations = departments.length;
        let iterations = 0;
        while (remainingDepartments.length > 0 && iterations < maxIterations) {
            iterations++;
            const toSave = [];
            const stillRemaining = [];
            for (const deptDto of remainingDepartments) {
                if (!deptDto.parentDepartmentId || savedDepartmentIds.has(deptDto.parentDepartmentId)) {
                    toSave.push(deptDto);
                }
                else {
                    stillRemaining.push(deptDto);
                }
            }
            for (const deptDto of toSave) {
                const department = new department_entity_1.Department();
                department.id = deptDto.id;
                department.departmentName = deptDto.departmentName;
                department.departmentCode = deptDto.departmentCode;
                department.type = deptDto.type;
                department.parentDepartmentId = deptDto.parentDepartmentId || undefined;
                department.order = deptDto.order;
                await this.departmentService.save(department, { queryRunner });
                savedDepartmentIds.add(deptDto.id);
                count++;
            }
            remainingDepartments = stillRemaining;
            if (toSave.length === 0) {
                if (remainingDepartments.length > 0) {
                    this.logger.warn(`저장되지 않은 부서가 있습니다: ${remainingDepartments.map((d) => d.departmentName).join(', ')}`);
                }
                break;
            }
        }
        if (remainingDepartments.length > 0) {
            this.logger.error(`부서 마이그레이션 실패: ${remainingDepartments.length}개의 부서를 저장하지 못했습니다. 부모 부서가 존재하지 않을 수 있습니다.`);
        }
        return count;
    }
    async 마이그레이션Employee한다(employees, queryRunner) {
        let count = 0;
        for (const empDto of employees) {
            const employee = new employee_entity_1.Employee();
            employee.id = empDto.id;
            employee.employeeNumber = empDto.employeeNumber;
            employee.name = empDto.name;
            employee.email = empDto.email || undefined;
            employee.phoneNumber = empDto.phoneNumber || undefined;
            employee.dateOfBirth = empDto.dateOfBirth ? new Date(empDto.dateOfBirth) : undefined;
            employee.gender = empDto.gender ? empDto.gender : undefined;
            employee.hireDate = new Date(empDto.hireDate);
            employee.status = empDto.status;
            employee.currentRankId = empDto.currentRankId || undefined;
            employee.isInitialPasswordSet = empDto.isInitialPasswordSet;
            await this.employeeService.save(employee, { queryRunner });
            count++;
        }
        return count;
    }
    async 마이그레이션EmployeeDepartmentPosition한다(edps, queryRunner) {
        let count = 0;
        const failedEmployeeIds = [];
        for (const edpDto of edps) {
            const itemQueryRunner = this.dataSource.createQueryRunner();
            await itemQueryRunner.connect();
            await itemQueryRunner.startTransaction();
            try {
                const edp = new employee_department_position_entity_1.EmployeeDepartmentPosition();
                edp.id = edpDto.id;
                edp.employeeId = edpDto.employeeId;
                edp.departmentId = edpDto.departmentId;
                edp.positionId = edpDto.positionId;
                edp.isManager = edpDto.isManager;
                await this.employeeDepartmentPositionService.save(edp, { queryRunner: itemQueryRunner });
                await itemQueryRunner.commitTransaction();
                count++;
            }
            catch (error) {
                await itemQueryRunner.rollbackTransaction();
                failedEmployeeIds.push(edpDto.employeeId);
                this.logger.warn(`직원-부서-직책 마이그레이션 실패 (ID: ${edpDto.id}): ${error.message}`);
            }
            finally {
                await itemQueryRunner.release();
            }
        }
        return { count, failedEmployeeIds };
    }
    async 마이그레이션EmployeeDepartmentPositionHistory한다(histories, queryRunner) {
        let count = 0;
        const failedEmployeeIds = [];
        for (const historyDto of histories) {
            const itemQueryRunner = this.dataSource.createQueryRunner();
            await itemQueryRunner.connect();
            await itemQueryRunner.startTransaction();
            try {
                const history = new employee_department_position_history_entity_1.EmployeeDepartmentPositionHistory();
                history.historyId = historyDto.historyId;
                history.employeeId = historyDto.employeeId;
                history.부서를설정한다(historyDto.departmentId);
                history.상위부서를설정한다(historyDto.parentDepartmentId || undefined);
                history.직책을설정한다(historyDto.positionId);
                history.직급을설정한다(historyDto.rankId || undefined);
                history.관리자권한을설정한다(historyDto.isManager);
                history.effectiveStartDate = historyDto.effectiveStartDate;
                history.effectiveEndDate = historyDto.effectiveEndDate || null;
                history.isCurrent = historyDto.isCurrent;
                history.assignmentReason = historyDto.assignmentReason || undefined;
                await this.employeeDepartmentPositionHistoryService.save(history, { queryRunner: itemQueryRunner });
                await itemQueryRunner.commitTransaction();
                count++;
            }
            catch (error) {
                await itemQueryRunner.rollbackTransaction();
                failedEmployeeIds.push(historyDto.employeeId);
                this.logger.warn(`직원 발령 이력 마이그레이션 실패 (historyId: ${historyDto.historyId}): ${error.message}`);
            }
            finally {
                await itemQueryRunner.release();
            }
        }
        return { count, failedEmployeeIds };
    }
    실패한직원정보를출력한다(failedEmployeeIds, ssoEmployees) {
        if (failedEmployeeIds.length === 0) {
            return;
        }
        const employeeMap = new Map(ssoEmployees.map((emp) => [emp.id, emp.employeeNumber]));
        const employeeNumbers = [];
        const notFoundEmployeeIds = [];
        for (const employeeId of failedEmployeeIds) {
            const employeeNumber = employeeMap.get(employeeId);
            if (employeeNumber) {
                employeeNumbers.push(employeeNumber);
            }
            else {
                notFoundEmployeeIds.push(employeeId);
            }
        }
        if (employeeNumbers.length > 0) {
            this.logger.warn(`마이그레이션 실패한 직원 사번 (총 ${employeeNumbers.length}명): ${employeeNumbers.join(', ')}`);
        }
        if (notFoundEmployeeIds.length > 0) {
            this.logger.warn(`마이그레이션 실패한 직원 ID (SSO 데이터에서 찾을 수 없음, ${notFoundEmployeeIds.length}명): ${notFoundEmployeeIds.join(', ')}`);
        }
    }
};
exports.OrganizationMigrationService = OrganizationMigrationService;
exports.OrganizationMigrationService = OrganizationMigrationService = OrganizationMigrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof sso_service_1.SSOService !== "undefined" && sso_service_1.SSOService) === "function" ? _a : Object, typeof (_b = typeof department_service_1.DomainDepartmentService !== "undefined" && department_service_1.DomainDepartmentService) === "function" ? _b : Object, typeof (_c = typeof employee_service_1.DomainEmployeeService !== "undefined" && employee_service_1.DomainEmployeeService) === "function" ? _c : Object, typeof (_d = typeof position_service_1.DomainPositionService !== "undefined" && position_service_1.DomainPositionService) === "function" ? _d : Object, typeof (_e = typeof rank_service_1.DomainRankService !== "undefined" && rank_service_1.DomainRankService) === "function" ? _e : Object, typeof (_f = typeof employee_department_position_service_1.DomainEmployeeDepartmentPositionService !== "undefined" && employee_department_position_service_1.DomainEmployeeDepartmentPositionService) === "function" ? _f : Object, typeof (_g = typeof employee_department_position_history_service_1.DomainEmployeeDepartmentPositionHistoryService !== "undefined" && employee_department_position_history_service_1.DomainEmployeeDepartmentPositionHistoryService) === "function" ? _g : Object, typeof (_h = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _h : Object])
], OrganizationMigrationService);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.constants.ts":
/*!***********************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.constants.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PRESIGNED_URL_EXPIRATION = exports.S3_FOLDERS = exports.MAX_FILE_SIZE = exports.EXCEL_EXTENSIONS = exports.EXCEL_MIME_TYPES = void 0;
exports.EXCEL_MIME_TYPES = {
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    XLS: 'application/vnd.ms-excel',
    CSV: 'text/csv',
};
exports.EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
exports.MAX_FILE_SIZE = 10 * 1024 * 1024;
exports.S3_FOLDERS = {
    EXCEL: 'excel-files',
    TEMP: 'temp',
};
exports.PRESIGNED_URL_EXPIRATION = 3600;


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.module.ts":
/*!********************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.module.ts ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.S3StorageModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const s3_storage_service_1 = __webpack_require__(/*! ./s3-storage.service */ "./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.service.ts");
let S3StorageModule = class S3StorageModule {
};
exports.S3StorageModule = S3StorageModule;
exports.S3StorageModule = S3StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [s3_storage_service_1.S3StorageService],
        exports: [s3_storage_service_1.S3StorageService],
    })
], S3StorageModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.service.ts":
/*!*********************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.service.ts ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3StorageService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.S3StorageService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const client_s3_1 = __webpack_require__(/*! @aws-sdk/client-s3 */ "@aws-sdk/client-s3");
const s3_request_presigner_1 = __webpack_require__(/*! @aws-sdk/s3-request-presigner */ "@aws-sdk/s3-request-presigner");
const path = __webpack_require__(/*! path */ "path");
const s3_storage_constants_1 = __webpack_require__(/*! ./s3-storage.constants */ "./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.constants.ts");
let S3StorageService = S3StorageService_1 = class S3StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(S3StorageService_1.name);
        const accessKey = this.configService.get('S3_ACCESS_KEY');
        const secretKey = this.configService.get('S3_SECRET_KEY');
        this.bucketName = this.configService.get('S3_BUCKET_NAME') || '';
        this.endpoint = this.configService.get('S3_ENDPOINT') || '';
        if (!this.bucketName) {
            this.logger.error('❌ S3_BUCKET_NAME 환경 변수가 설정되지 않았습니다.');
        }
        if (!this.endpoint) {
            this.logger.warn('⚠️ S3_ENDPOINT 환경 변수가 설정되지 않았습니다.');
        }
        if (!accessKey) {
            this.logger.error('❌ S3_ACCESS_KEY 환경 변수가 설정되지 않았습니다.');
        }
        if (!secretKey) {
            this.logger.error('❌ S3_SECRET_KEY 환경 변수가 설정되지 않았습니다.');
        }
        this.s3Client = new client_s3_1.S3Client({
            region: this.configService.get('S3_REGION') || 'ap-northeast-2',
            endpoint: this.endpoint || undefined,
            credentials: {
                accessKeyId: accessKey || '',
                secretAccessKey: secretKey || '',
            },
            forcePathStyle: true,
        });
        this.logger.log(`✅ S3 스토리지 서비스 초기화 완료`);
        this.logger.log(`   - Bucket: ${this.bucketName || '❌ 설정 안됨'}`);
        this.logger.log(`   - Endpoint: ${this.endpoint || 'AWS S3 기본'}`);
        this.logger.log(`   - Region: ${this.configService.get('S3_REGION') || 'ap-northeast-2'}`);
        this.logger.log(`   - Access Key: ${accessKey ? accessKey.substring(0, 4) + '****' : '❌ 없음'}`);
    }
    async uploadExcel(file, dto) {
        try {
            this.validateExcelFile(file);
            const originalFileName = file.originalname;
            const fileExtension = path.extname(originalFileName);
            const fileKey = this.generateFileKey(fileExtension, dto?.folder);
            const metadata = {
                'original-name': Buffer.from(originalFileName, 'utf-8').toString('base64'),
                'upload-date': new Date().toISOString(),
                ...dto?.metadata,
            };
            this.logger.log(`파일 업로드 중: ${originalFileName} -> ${fileKey}`);
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: metadata,
            });
            await this.s3Client.send(command);
            this.logger.log(`파일 업로드 완료: ${fileKey}`);
            const presignedUrl = await this.generatePresignedUrlForDownload(fileKey, s3_storage_constants_1.PRESIGNED_URL_EXPIRATION);
            return {
                success: true,
                message: '파일이 성공적으로 업로드되었습니다.',
                fileKey,
                bucket: this.bucketName,
                url: presignedUrl,
                uploadedAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('파일 업로드 실패', error);
            throw new common_1.InternalServerErrorException('파일 업로드 중 오류가 발생했습니다.');
        }
    }
    async getFileDownloadUrl(dto) {
        try {
            await this.validateFileExists(dto.fileKey);
            const expiresIn = dto.expiresIn || s3_storage_constants_1.PRESIGNED_URL_EXPIRATION;
            const url = await this.generatePresignedUrlForDownload(dto.fileKey, expiresIn);
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
            this.logger.log(`다운로드 URL 생성 완료: ${dto.fileKey}`);
            return {
                url,
                expiresIn,
                expiresAt,
            };
        }
        catch (error) {
            this.logger.error('다운로드 URL 생성 실패', error);
            throw new common_1.InternalServerErrorException('다운로드 URL 생성 중 오류가 발생했습니다.');
        }
    }
    async deleteFile(dto) {
        try {
            await this.validateFileExists(dto.fileKey);
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: dto.fileKey,
            });
            await this.s3Client.send(command);
            this.logger.log(`파일 삭제 완료: ${dto.fileKey}`);
            return {
                success: true,
                message: '파일이 성공적으로 삭제되었습니다.',
                fileKey: dto.fileKey,
            };
        }
        catch (error) {
            this.logger.error('파일 삭제 실패', error);
            throw new common_1.InternalServerErrorException('파일 삭제 중 오류가 발생했습니다.');
        }
    }
    async listFiles(dto) {
        try {
            const prefix = dto?.prefix || s3_storage_constants_1.S3_FOLDERS.EXCEL;
            const maxKeys = dto?.maxKeys || 100;
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });
            const response = await this.s3Client.send(command);
            const files = response.Contents?.map((item) => ({
                key: item.Key || '',
                size: item.Size || 0,
                lastModified: item.LastModified || new Date(),
                etag: item.ETag || '',
            })) || [];
            this.logger.log(`파일 목록 조회 완료: ${files.length}개`);
            return {
                files,
                count: files.length,
                prefix,
            };
        }
        catch (error) {
            this.logger.error('파일 목록 조회 실패', error);
            throw new common_1.InternalServerErrorException('파일 목록 조회 중 오류가 발생했습니다.');
        }
    }
    validateExcelFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('파일이 제공되지 않았습니다.');
        }
        if (file.size > s3_storage_constants_1.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`파일 크기가 너무 큽니다. 최대 ${s3_storage_constants_1.MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`);
        }
        const ext = path.extname(file.originalname).toLowerCase();
        if (!s3_storage_constants_1.EXCEL_EXTENSIONS.includes(ext)) {
            throw new common_1.BadRequestException(`지원하지 않는 파일 형식입니다. 지원 형식: ${s3_storage_constants_1.EXCEL_EXTENSIONS.join(', ')}`);
        }
        const validMimeTypes = Object.values(s3_storage_constants_1.EXCEL_MIME_TYPES);
        if (!validMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`잘못된 파일 형식입니다. 엑셀 파일(.xlsx, .xls, .csv)만 업로드 가능합니다.`);
        }
    }
    generateFileKey(fileExtension, folder) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const baseFolder = folder || s3_storage_constants_1.S3_FOLDERS.EXCEL;
        return `${baseFolder}/${timestamp}-${randomString}${fileExtension}`;
    }
    getOriginalFileName(metadata) {
        if (!metadata || !metadata['original-name']) {
            return undefined;
        }
        try {
            return Buffer.from(metadata['original-name'], 'base64').toString('utf-8');
        }
        catch (error) {
            this.logger.warn('원본 파일명 복원 실패');
            return undefined;
        }
    }
    async generatePresignedUrlForDownload(fileKey, expiresIn) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async generatePresignedUrlForUpload(mimeType, fileExtension, expiresIn = 120) {
        try {
            if (!fileExtension) {
                const mimeTypeMap = {
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
                    'application/vnd.ms-excel': 'xls',
                    'text/csv': 'csv',
                    'image/jpeg': 'jpg',
                    'image/png': 'png',
                    'image/webp': 'webp',
                };
                fileExtension = mimeTypeMap[mimeType] || 'bin';
            }
            const timestamp = Date.now();
            const milliseconds = String(timestamp).slice(-3);
            const fileKey = `${s3_storage_constants_1.S3_FOLDERS.EXCEL}/${timestamp}${milliseconds}.${fileExtension}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                ContentType: mimeType,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            this.logger.log(`업로드용 Presigned URL 생성 완료: ${fileKey}`);
            return { url, fileKey };
        }
        catch (error) {
            this.logger.error('업로드용 Presigned URL 생성 실패', error);
            throw new common_1.InternalServerErrorException('업로드용 URL 생성 중 오류가 발생했습니다.');
        }
    }
    getFileUrl(fileKey) {
        const publicEndpoint = this.endpoint.replace('s3', 'object/public');
        return `${publicEndpoint}/${this.bucketName}/${fileKey}`;
    }
    async checkFileExists(fileKey) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });
            const result = await this.s3Client.send(command);
            return result.ContentLength !== undefined && result.ContentLength > 0;
        }
        catch (error) {
            this.logger.debug(`파일을 찾을 수 없음: ${fileKey}`);
            return false;
        }
    }
    async validateFileExists(fileKey) {
        const exists = await this.checkFileExists(fileKey);
        if (!exists) {
            throw new common_1.BadRequestException('파일을 찾을 수 없습니다.');
        }
    }
    async downloadFileStream(fileKey) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });
            const response = await this.s3Client.send(command);
            const stream = response.Body;
            const chunks = [];
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks)));
            });
        }
        catch (error) {
            this.logger.error('파일 다운로드 실패', error);
            throw new common_1.InternalServerErrorException('파일 다운로드 중 오류가 발생했습니다.');
        }
    }
};
exports.S3StorageService = S3StorageService;
exports.S3StorageService = S3StorageService = S3StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], S3StorageService);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/storage/index.ts":
/*!*****************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/storage/index.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./storage.interface */ "./apps/lams/src/refactoring/integrations/storage/storage.interface.ts"), exports);
__exportStar(__webpack_require__(/*! ./storage.provider */ "./apps/lams/src/refactoring/integrations/storage/storage.provider.ts"), exports);


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/storage/storage.interface.ts":
/*!*****************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/storage/storage.interface.ts ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./apps/lams/src/refactoring/integrations/storage/storage.provider.ts":
/*!****************************************************************************!*\
  !*** ./apps/lams/src/refactoring/integrations/storage/storage.provider.ts ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageServiceProvider = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const s3_storage_service_1 = __webpack_require__(/*! ../s3-storage/s3-storage.service */ "./apps/lams/src/refactoring/integrations/s3-storage/s3-storage.service.ts");
const local_storage_service_1 = __webpack_require__(/*! ../local-storage/local-storage.service */ "./apps/lams/src/refactoring/integrations/local-storage/local-storage.service.ts");
exports.StorageServiceProvider = {
    provide: 'IStorageService',
    useFactory: (configService, s3StorageService, localStorageService) => {
        const storageType = configService.get('STORAGE_TYPE', 'local').toLowerCase();
        if (storageType === 's3') {
            console.log('S3StorageService 사용');
            return s3StorageService;
        }
        else {
            console.log('LocalStorageService 사용');
            return localStorageService;
        }
    },
    inject: [config_1.ConfigService, s3_storage_service_1.S3StorageService, local_storage_service_1.LocalStorageService],
};


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/auth/auth-interface.module.ts":
/*!***************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/auth/auth-interface.module.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthInterfaceModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./apps/lams/src/refactoring/interface/auth/auth.controller.ts");
const migration_module_1 = __webpack_require__(/*! ../../integrations/migration/migration.module */ "./apps/lams/src/refactoring/integrations/migration/migration.module.ts");
let AuthInterfaceModule = class AuthInterfaceModule {
};
exports.AuthInterfaceModule = AuthInterfaceModule;
exports.AuthInterfaceModule = AuthInterfaceModule = __decorate([
    (0, common_1.Module)({
        imports: [migration_module_1.OrganizationMigrationModule],
        controllers: [auth_controller_1.AuthController],
        providers: [],
        exports: [],
    })
], AuthInterfaceModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/auth/auth.controller.ts":
/*!*********************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/auth/auth.controller.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const public_decorator_1 = __webpack_require__(/*! ../../../common/decorators/public.decorator */ "./apps/lams/src/common/decorators/public.decorator.ts");
const generate_token_dto_1 = __webpack_require__(/*! ./dto/generate-token.dto */ "./apps/lams/src/refactoring/interface/auth/dto/generate-token.dto.ts");
const verify_token_dto_1 = __webpack_require__(/*! ./dto/verify-token.dto */ "./apps/lams/src/refactoring/interface/auth/dto/verify-token.dto.ts");
const migrate_organization_dto_1 = __webpack_require__(/*! ./dto/migrate-organization.dto */ "./apps/lams/src/refactoring/interface/auth/dto/migrate-organization.dto.ts");
const migration_service_1 = __webpack_require__(/*! ../../integrations/migration/migration.service */ "./apps/lams/src/refactoring/integrations/migration/migration.service.ts");
let AuthController = class AuthController {
    constructor(jwtService, configService, migrationService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.migrationService = migrationService;
    }
    async generateToken(dto) {
        try {
            const payload = {
                id: dto.employeeNumber,
                employeeNumber: dto.employeeNumber,
                name: dto.name || 'Test User',
                email: dto.email || 'test@example.com',
                ...dto.additionalData,
            };
            const token = this.jwtService.sign(payload);
            return {
                success: true,
                token,
                tokenInfo: {
                    employeeNumber: dto.employeeNumber,
                    name: dto.name,
                    email: dto.email,
                    issuedAt: new Date(),
                    expiresAt: undefined,
                },
                usage: `Authorization: Bearer ${token}`,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`토큰 생성 실패: ${error.message}`);
        }
    }
    async verifyToken(dto) {
        try {
            const secret = this.configService.get('GLOBAL_SECRET') || this.configService.get('jwt.secret');
            if (!secret) {
                throw new common_1.BadRequestException('JWT 시크릿이 설정되지 않았습니다.');
            }
            const payload = this.jwtService.verify(dto.token, {
                secret,
            });
            return {
                valid: true,
                payload: {
                    id: payload.id,
                    employeeNumber: payload.employeeNumber,
                    name: payload.name,
                    email: payload.email,
                    iat: payload.iat,
                    exp: payload.exp,
                    ...payload,
                },
            };
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                return {
                    valid: false,
                    expired: true,
                    error: '토큰이 만료되었습니다.',
                };
            }
            if (error.name === 'JsonWebTokenError') {
                return {
                    valid: false,
                    error: '유효하지 않은 토큰입니다.',
                };
            }
            return {
                valid: false,
                error: error.message || '토큰 검증 중 오류가 발생했습니다.',
            };
        }
    }
    async migrateOrganization(dto) {
        try {
            const result = await this.migrationService.마이그레이션한다({
                includeTerminated: dto.includeTerminated,
                includeInactiveDepartments: dto.includeInactiveDepartments,
            });
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`마이그레이션 실패: ${error.message}`);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('generate-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'JWT 토큰 생성',
        description: '만료시간 없이 유효한 JWT 토큰을 생성합니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof generate_token_dto_1.GenerateTokenRequestDto !== "undefined" && generate_token_dto_1.GenerateTokenRequestDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "generateToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'JWT 토큰 검증',
        description: 'JWT 토큰의 유효성을 검증하고 payload를 반환합니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof verify_token_dto_1.VerifyTokenRequestDto !== "undefined" && verify_token_dto_1.VerifyTokenRequestDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthController.prototype, "verifyToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('migrate-organization'),
    (0, swagger_1.ApiOperation)({
        summary: '조직 데이터 마이그레이션',
        description: 'SSO에서 모든 조직 데이터를 가져와서 로컬 데이터베이스에 동기화합니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof migrate_organization_dto_1.MigrateOrganizationRequestDto !== "undefined" && migrate_organization_dto_1.MigrateOrganizationRequestDto) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AuthController.prototype, "migrateOrganization", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('인증'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object, typeof (_c = typeof migration_service_1.OrganizationMigrationService !== "undefined" && migration_service_1.OrganizationMigrationService) === "function" ? _c : Object])
], AuthController);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/auth/dto/generate-token.dto.ts":
/*!****************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/auth/dto/generate-token.dto.ts ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateTokenResponseDto = exports.GenerateTokenRequestDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class GenerateTokenRequestDto {
}
exports.GenerateTokenRequestDto = GenerateTokenRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '직원 번호',
        example: 'TEST001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateTokenRequestDto.prototype, "employeeNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '이름',
        example: '테스트 사용자',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateTokenRequestDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '이메일',
        example: 'test@example.com',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateTokenRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '추가 payload 데이터 (JSON 형식)',
        example: { role: 'admin', department: 'IT' },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], GenerateTokenRequestDto.prototype, "additionalData", void 0);
class GenerateTokenResponseDto {
}
exports.GenerateTokenResponseDto = GenerateTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], GenerateTokenResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '생성된 JWT 토큰' }),
    __metadata("design:type", String)
], GenerateTokenResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '토큰 정보' }),
    __metadata("design:type", Object)
], GenerateTokenResponseDto.prototype, "tokenInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '사용 방법' }),
    __metadata("design:type", String)
], GenerateTokenResponseDto.prototype, "usage", void 0);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/auth/dto/migrate-organization.dto.ts":
/*!**********************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/auth/dto/migrate-organization.dto.ts ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MigrateOrganizationResponseDto = exports.MigrationStatisticsDto = exports.MigrateOrganizationRequestDto = void 0;
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class MigrateOrganizationRequestDto {
}
exports.MigrateOrganizationRequestDto = MigrateOrganizationRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '퇴사자 포함 여부',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MigrateOrganizationRequestDto.prototype, "includeTerminated", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '비활성 부서 포함 여부',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MigrateOrganizationRequestDto.prototype, "includeInactiveDepartments", void 0);
class MigrationStatisticsDto {
}
exports.MigrationStatisticsDto = MigrationStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '직급 개수', example: 10 }),
    __metadata("design:type", Number)
], MigrationStatisticsDto.prototype, "ranks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '직책 개수', example: 15 }),
    __metadata("design:type", Number)
], MigrationStatisticsDto.prototype, "positions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '부서 개수', example: 50 }),
    __metadata("design:type", Number)
], MigrationStatisticsDto.prototype, "departments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '직원 수', example: 200 }),
    __metadata("design:type", Number)
], MigrationStatisticsDto.prototype, "employees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '직원-부서-직책 배정 개수', example: 180 }),
    __metadata("design:type", Number)
], MigrationStatisticsDto.prototype, "employeeDepartmentPositions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '발령 이력 개수', example: 500 }),
    __metadata("design:type", Number)
], MigrationStatisticsDto.prototype, "assignmentHistories", void 0);
class MigrateOrganizationResponseDto {
}
exports.MigrateOrganizationResponseDto = MigrateOrganizationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '마이그레이션 성공 여부', example: true }),
    __metadata("design:type", Boolean)
], MigrateOrganizationResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '마이그레이션 통계', type: MigrationStatisticsDto }),
    __metadata("design:type", MigrationStatisticsDto)
], MigrateOrganizationResponseDto.prototype, "statistics", void 0);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/auth/dto/verify-token.dto.ts":
/*!**************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/auth/dto/verify-token.dto.ts ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VerifyTokenResponseDto = exports.VerifyTokenRequestDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class VerifyTokenRequestDto {
}
exports.VerifyTokenRequestDto = VerifyTokenRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '검증할 JWT 토큰',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyTokenRequestDto.prototype, "token", void 0);
class VerifyTokenResponseDto {
}
exports.VerifyTokenResponseDto = VerifyTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '검증 성공 여부' }),
    __metadata("design:type", Boolean)
], VerifyTokenResponseDto.prototype, "valid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '토큰이 유효한 경우 payload 정보', required: false }),
    __metadata("design:type", Object)
], VerifyTokenResponseDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '검증 실패 시 오류 메시지', required: false }),
    __metadata("design:type", String)
], VerifyTokenResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '토큰 만료 여부', required: false }),
    __metadata("design:type", Boolean)
], VerifyTokenResponseDto.prototype, "expired", void 0);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/file-management/dto/reflect-file-content.dto.ts":
/*!*********************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/file-management/dto/reflect-file-content.dto.ts ***!
  \*********************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReflectFileContentResponseDto = exports.FileReflectionResult = exports.ReflectFileContentRequestDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class ReflectFileContentRequestDto {
}
exports.ReflectFileContentRequestDto = ReflectFileContentRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '파일 ID 목록 (순서대로 반영됨)',
        example: ['86a1e801-d278-422e-90f8-bea04e40b87a', '510f7c1c-a227-4088-884d-9f0df7962a73'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], ReflectFileContentRequestDto.prototype, "fileIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '적용할 직원 ID 목록',
        example: ['839e6f06-8d44-43a1-948c-095253c4cf8c'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], ReflectFileContentRequestDto.prototype, "employeeIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '연도',
        example: '2025',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReflectFileContentRequestDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '월',
        example: '11',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReflectFileContentRequestDto.prototype, "month", void 0);
class FileReflectionResult {
}
exports.FileReflectionResult = FileReflectionResult;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '파일 ID' }),
    __metadata("design:type", String)
], FileReflectionResult.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '반영 이력 ID' }),
    __metadata("design:type", String)
], FileReflectionResult.prototype, "reflectionHistoryId", void 0);
class ReflectFileContentResponseDto {
}
exports.ReflectFileContentResponseDto = ReflectFileContentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '반영된 파일 목록',
        type: [FileReflectionResult],
    }),
    __metadata("design:type", Array)
], ReflectFileContentResponseDto.prototype, "reflections", void 0);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/file-management/dto/upload-file.dto.ts":
/*!************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/file-management/dto/upload-file.dto.ts ***!
  \************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UploadFileResponseDto = exports.UploadFileRequestDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class UploadFileRequestDto {
}
exports.UploadFileRequestDto = UploadFileRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '연도',
        example: '2024',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadFileRequestDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '월',
        example: '01',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadFileRequestDto.prototype, "month", void 0);
class UploadFileResponseDto {
}
exports.UploadFileResponseDto = UploadFileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '파일 ID' }),
    __metadata("design:type", String)
], UploadFileResponseDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '파일명' }),
    __metadata("design:type", String)
], UploadFileResponseDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '파일 경로' }),
    __metadata("design:type", String)
], UploadFileResponseDto.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '연도' }),
    __metadata("design:type", String)
], UploadFileResponseDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월' }),
    __metadata("design:type", String)
], UploadFileResponseDto.prototype, "month", void 0);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/file-management/file-management-interface.module.ts":
/*!*************************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/file-management/file-management-interface.module.ts ***!
  \*************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileManagementInterfaceModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const file_management_controller_1 = __webpack_require__(/*! ./file-management.controller */ "./apps/lams/src/refactoring/interface/file-management/file-management.controller.ts");
const file_management_business_module_1 = __webpack_require__(/*! ../../business/file-management-business/file-management-business.module */ "./apps/lams/src/refactoring/business/file-management-business/file-management-business.module.ts");
let FileManagementInterfaceModule = class FileManagementInterfaceModule {
};
exports.FileManagementInterfaceModule = FileManagementInterfaceModule;
exports.FileManagementInterfaceModule = FileManagementInterfaceModule = __decorate([
    (0, common_1.Module)({
        imports: [file_management_business_module_1.FileManagementBusinessModule],
        controllers: [file_management_controller_1.FileManagementController],
        providers: [],
        exports: [],
    })
], FileManagementInterfaceModule);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/file-management/file-management.controller.ts":
/*!*******************************************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/file-management/file-management.controller.ts ***!
  \*******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileManagementController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const user_decorator_1 = __webpack_require__(/*! ../../../common/decorators/user.decorator */ "./apps/lams/src/common/decorators/user.decorator.ts");
const file_management_business_service_1 = __webpack_require__(/*! ../../business/file-management-business/file-management-business.service */ "./apps/lams/src/refactoring/business/file-management-business/file-management-business.service.ts");
const upload_file_dto_1 = __webpack_require__(/*! ./dto/upload-file.dto */ "./apps/lams/src/refactoring/interface/file-management/dto/upload-file.dto.ts");
const reflect_file_content_dto_1 = __webpack_require__(/*! ./dto/reflect-file-content.dto */ "./apps/lams/src/refactoring/interface/file-management/dto/reflect-file-content.dto.ts");
let FileManagementController = class FileManagementController {
    constructor(fileManagementBusinessService) {
        this.fileManagementBusinessService = fileManagementBusinessService;
    }
    async uploadFile(file, dto, uploadBy) {
        if (!file) {
            throw new common_1.BadRequestException('파일이 제공되지 않았습니다.');
        }
        if (!uploadBy) {
            throw new common_1.BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }
        const result = await this.fileManagementBusinessService.파일을업로드한다(file, uploadBy, dto.year, dto.month);
        return {
            fileId: result.fileId,
            fileName: result.fileName,
            filePath: result.filePath,
            year: result.year,
            month: result.month,
        };
    }
    async reflectFileContent(dto, performedBy) {
        if (!performedBy) {
            throw new common_1.BadRequestException('사용자 정보를 찾을 수 없습니다.');
        }
        const result = await this.fileManagementBusinessService.파일내용을반영한다(dto.fileIds, dto.employeeIds, dto.year, dto.month, performedBy);
        return {
            reflections: result.reflections,
        };
    }
};
exports.FileManagementController = FileManagementController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: '파일 업로드', description: '엑셀 파일을 업로드하고 검증합니다.' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '업로드할 엑셀 파일 (.xlsx, .xls, .csv)',
                },
                year: {
                    type: 'string',
                    description: '연도 (선택사항)',
                    example: '2024',
                },
                month: {
                    type: 'string',
                    description: '월 (선택사항)',
                    example: '01',
                },
            },
            required: ['file'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        fileFilter: (req, file, callback) => {
            try {
                const decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
                file.originalname = decodedFilename;
            }
            catch (error) {
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object, typeof (_d = typeof upload_file_dto_1.UploadFileRequestDto !== "undefined" && upload_file_dto_1.UploadFileRequestDto) === "function" ? _d : Object, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], FileManagementController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('reflect'),
    (0, swagger_1.ApiOperation)({
        summary: '파일 내용 반영',
        description: '업로드된 파일의 내용을 순서대로 반영하고 일일/월간 요약을 자동으로 생성합니다.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof reflect_file_content_dto_1.ReflectFileContentRequestDto !== "undefined" && reflect_file_content_dto_1.ReflectFileContentRequestDto) === "function" ? _f : Object, String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], FileManagementController.prototype, "reflectFileContent", null);
exports.FileManagementController = FileManagementController = __decorate([
    (0, swagger_1.ApiTags)('파일 관리'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('file-management'),
    __metadata("design:paramtypes", [typeof (_a = typeof file_management_business_service_1.FileManagementBusinessService !== "undefined" && file_management_business_service_1.FileManagementBusinessService) === "function" ? _a : Object])
], FileManagementController);


/***/ }),

/***/ "./apps/lams/src/refactoring/interface/interface.module.ts":
/*!*****************************************************************!*\
  !*** ./apps/lams/src/refactoring/interface/interface.module.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InterfaceModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const file_management_interface_module_1 = __webpack_require__(/*! ./file-management/file-management-interface.module */ "./apps/lams/src/refactoring/interface/file-management/file-management-interface.module.ts");
const auth_interface_module_1 = __webpack_require__(/*! ./auth/auth-interface.module */ "./apps/lams/src/refactoring/interface/auth/auth-interface.module.ts");
let InterfaceModule = class InterfaceModule {
};
exports.InterfaceModule = InterfaceModule;
exports.InterfaceModule = InterfaceModule = __decorate([
    (0, common_1.Module)({
        imports: [file_management_interface_module_1.FileManagementInterfaceModule, auth_interface_module_1.AuthInterfaceModule],
        controllers: [],
        providers: [],
        exports: [],
    })
], InterfaceModule);


/***/ }),

/***/ "./libs/configs/jwt.config.ts":
/*!************************************!*\
  !*** ./libs/configs/jwt.config.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.jwtConfig = void 0;
const jwtConfig = (configService) => {
    const secret = configService.get('jwt.secret') || configService.get('GLOBAL_SECRET');
    const expiresIn = configService.get('jwt.expiresIn');
    return {
        secret,
        signOptions: {
            ...(expiresIn && { expiresIn }),
        },
    };
};
exports.jwtConfig = jwtConfig;


/***/ }),

/***/ "./libs/database/base/base.entity.ts":
/*!*******************************************!*\
  !*** ./libs/database/base/base.entity.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntityWithNumericId = exports.BaseEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
class BaseEntity {
    validateUuidFormat(value, fieldName) {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(value)) {
            throw new Error(`${fieldName}은(는) 유효한 UUID 형식이어야 합니다: ${value}`);
        }
    }
    validateUuidFields(fields) {
        fields.forEach((field) => {
            if (field.value) {
                this.validateUuidFormat(field.value, field.name);
            }
        });
    }
    삭제됨() {
        return this.deleted_at !== null && this.deleted_at !== undefined;
    }
    새로생성됨() {
        return !this.id || this.version === 1;
    }
    생성자설정한다(userId) {
        this.created_by = userId;
    }
    수정자설정한다(userId) {
        this.updated_by = userId;
    }
    메타데이터업데이트한다(userId) {
        const now = new Date();
        if (this.새로생성됨()) {
            this.created_at = now;
            if (userId) {
                this.created_by = userId;
            }
        }
        this.updated_at = now;
        if (userId) {
            this.updated_by = userId;
        }
    }
    get isDeleted() {
        return this.삭제됨();
    }
    get isNew() {
        return this.새로생성됨();
    }
    setCreatedBy(userId) {
        this.생성자설정한다(userId);
    }
    setUpdatedBy(userId) {
        this.수정자설정한다(userId);
    }
    updateMetadata(userId) {
        this.메타데이터업데이트한다(userId);
    }
}
exports.BaseEntity = BaseEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BaseEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp with time zone',
        name: 'created_at',
        comment: '생성 일시',
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BaseEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp with time zone',
        name: 'updated_at',
        comment: '수정 일시',
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BaseEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamp with time zone',
        nullable: true,
        name: 'deleted_at',
        comment: '삭제 일시 (소프트 삭제)',
    }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], BaseEntity.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'created_by',
        comment: '생성자 ID',
    }),
    __metadata("design:type", String)
], BaseEntity.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'updated_by',
        comment: '수정자 ID',
    }),
    __metadata("design:type", String)
], BaseEntity.prototype, "updated_by", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({
        comment: '버전 (낙관적 잠금용)',
    }),
    __metadata("design:type", Number)
], BaseEntity.prototype, "version", void 0);
class BaseEntityWithNumericId {
    validateUuidFormat(value, fieldName) {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(value)) {
            throw new Error(`${fieldName}은(는) 유효한 UUID 형식이어야 합니다: ${value}`);
        }
    }
    validateUuidFields(fields) {
        fields.forEach((field) => {
            if (field.value) {
                this.validateUuidFormat(field.value, field.name);
            }
        });
    }
    삭제됨() {
        return this.deleted_at !== null && this.deleted_at !== undefined;
    }
    새로생성됨() {
        return !this.id || this.version === 1;
    }
    생성자설정한다(userId) {
        this.created_by = userId;
    }
    수정자설정한다(userId) {
        this.updated_by = userId;
    }
    메타데이터업데이트한다(userId) {
        const now = new Date();
        if (this.새로생성됨()) {
            this.created_at = now;
            if (userId) {
                this.created_by = userId;
            }
        }
        this.updated_at = now;
        if (userId) {
            this.updated_by = userId;
        }
    }
    get isDeleted() {
        return this.삭제됨();
    }
    get isNew() {
        return this.새로생성됨();
    }
    setCreatedBy(userId) {
        this.생성자설정한다(userId);
    }
    setUpdatedBy(userId) {
        this.수정자설정한다(userId);
    }
    updateMetadata(userId) {
        this.메타데이터업데이트한다(userId);
    }
}
exports.BaseEntityWithNumericId = BaseEntityWithNumericId;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        comment: '기본키 (자동 증가)',
    }),
    __metadata("design:type", Number)
], BaseEntityWithNumericId.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp with time zone',
        name: 'created_at',
        comment: '생성 일시',
    }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], BaseEntityWithNumericId.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp with time zone',
        name: 'updated_at',
        comment: '수정 일시',
    }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], BaseEntityWithNumericId.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: 'timestamp with time zone',
        nullable: true,
        name: 'deleted_at',
        comment: '삭제 일시 (소프트 삭제)',
    }),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], BaseEntityWithNumericId.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'created_by',
        comment: '생성자 ID',
    }),
    __metadata("design:type", String)
], BaseEntityWithNumericId.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        name: 'updated_by',
        comment: '수정자 ID',
    }),
    __metadata("design:type", String)
], BaseEntityWithNumericId.prototype, "updated_by", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({
        comment: '버전 (낙관적 잠금용)',
    }),
    __metadata("design:type", Number)
], BaseEntityWithNumericId.prototype, "version", void 0);


/***/ }),

/***/ "./libs/database/database-config.service.ts":
/*!**************************************************!*\
  !*** ./libs/database/database-config.service.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseConfigService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const path_1 = __webpack_require__(/*! path */ "path");
let DatabaseConfigService = class DatabaseConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        const isDropSchema = this.configService.get('database.dropSchema') === 'true';
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const isDevelopment = this.configService.get('NODE_ENV') === 'development';
        const dbHost = this.configService.get('database.host') ||
            this.configService.get('POSTGRES_HOST', 'localhost');
        const dbPort = this.configService.get('database.port') || this.configService.get('POSTGRES_PORT', 5432);
        const dbUsername = this.configService.get('database.username') ||
            this.configService.get('POSTGRES_USER', 'admin');
        const dbPassword = this.configService.get('database.password') ||
            this.configService.get('POSTGRES_PASSWORD', 'tech7admin!');
        const dbDatabase = this.configService.get('database.database') ||
            this.configService.get('POSTGRES_DB', 'rms-test');
        const dbSchema = this.configService.get('database.schema') ||
            this.configService.get('POSTGRES_SCHEMA', 'public');
        return {
            type: 'postgres',
            host: dbHost,
            port: dbPort,
            username: dbUsername,
            password: dbPassword,
            database: dbDatabase,
            schema: dbSchema,
            migrations: [(0, path_1.join)(__dirname, '../migrations/*{.ts,.js}')],
            migrationsRun: false,
            synchronize: isDevelopment,
            logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
            extra: {
                connectionLimit: 10,
                acquireTimeout: 60000,
                timeout: 60000,
                reconnect: true,
            },
            cache: {
                type: 'database',
                duration: 30000,
            },
            ssl: isProduction ? { rejectUnauthorized: false } : false,
            retryAttempts: 3,
            retryDelay: 3000,
            autoLoadEntities: true,
            dropSchema: isDropSchema,
        };
    }
};
exports.DatabaseConfigService = DatabaseConfigService;
exports.DatabaseConfigService = DatabaseConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], DatabaseConfigService);


/***/ }),

/***/ "./libs/database/database.module.ts":
/*!******************************************!*\
  !*** ./libs/database/database.module.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const transaction_manager_service_1 = __webpack_require__(/*! ./transaction-manager.service */ "./libs/database/transaction-manager.service.ts");
const database_service_1 = __webpack_require__(/*! ./database.service */ "./libs/database/database.service.ts");
const database_config_service_1 = __webpack_require__(/*! ./database-config.service */ "./libs/database/database-config.service.ts");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: database_config_service_1.DatabaseConfigService,
            }),
        ],
        providers: [transaction_manager_service_1.TransactionManagerService, database_service_1.DatabaseService, database_config_service_1.DatabaseConfigService],
        exports: [transaction_manager_service_1.TransactionManagerService, database_service_1.DatabaseService, typeorm_1.TypeOrmModule],
    })
], DatabaseModule);


/***/ }),

/***/ "./libs/database/database.service.ts":
/*!*******************************************!*\
  !*** ./libs/database/database.service.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DatabaseService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DatabaseService_1.name);
    }
    async onModuleInit() {
        await this.checkConnection();
    }
    async onModuleDestroy() {
        await this.closeConnection();
    }
    async checkConnection() {
        try {
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
            }
            await this.dataSource.query('SELECT 1');
            this.logger.log('데이터베이스 연결이 성공적으로 설정되었습니다.');
            this.logger.log(`데이터베이스: ${this.dataSource.options.database}`);
            const pgOptions = this.dataSource.options;
            if (pgOptions.host && pgOptions.port) {
                this.logger.log(`호스트: ${pgOptions.host}:${pgOptions.port}`);
            }
            return true;
        }
        catch (error) {
            this.logger.error('데이터베이스 연결에 실패했습니다:', error);
            return false;
        }
    }
    async closeConnection() {
        try {
            if (this.dataSource.isInitialized) {
                await this.dataSource.destroy();
                this.logger.log('데이터베이스 연결이 정상적으로 종료되었습니다.');
            }
        }
        catch (error) {
            this.logger.error('데이터베이스 연결 종료 중 오류가 발생했습니다:', error);
        }
    }
    async healthCheck() {
        const startTime = Date.now();
        try {
            await this.dataSource.query('SELECT 1');
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                database: this.dataSource.options.database,
                connection: true,
                responseTime,
            };
        }
        catch (error) {
            this.logger.error('데이터베이스 헬스체크 실패:', error);
            return {
                status: 'unhealthy',
                database: this.dataSource.options.database,
                connection: false,
            };
        }
    }
    async getDatabaseStats() {
        try {
            const [connectionStats, sizeStats, versionStats] = await Promise.all([
                this.dataSource.query(`
          SELECT count(*) as total_connections,
                 count(*) FILTER (WHERE state = 'active') as active_connections
          FROM pg_stat_activity 
          WHERE datname = current_database()
        `),
                this.dataSource.query(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
        `),
                this.dataSource.query('SELECT version() as version'),
            ]);
            return {
                totalConnections: parseInt(connectionStats[0].total_connections),
                activeConnections: parseInt(connectionStats[0].active_connections),
                databaseSize: sizeStats[0].database_size,
                version: versionStats[0].version,
            };
        }
        catch (error) {
            this.logger.error('데이터베이스 통계 조회 실패:', error);
            throw error;
        }
    }
    async runMigrations() {
        try {
            await this.dataSource.runMigrations();
            this.logger.log('마이그레이션이 성공적으로 실행되었습니다.');
        }
        catch (error) {
            this.logger.error('마이그레이션 실행 실패:', error);
            throw error;
        }
    }
    async revertMigrations() {
        try {
            await this.dataSource.undoLastMigration();
            this.logger.log('마이그레이션이 성공적으로 되돌려졌습니다.');
        }
        catch (error) {
            this.logger.error('마이그레이션 되돌리기 실패:', error);
            throw error;
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object])
], DatabaseService);


/***/ }),

/***/ "./libs/database/transaction-manager.service.ts":
/*!******************************************************!*\
  !*** ./libs/database/transaction-manager.service.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransactionManagerService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionManagerService = exports.DatabaseException = exports.DatabaseErrorType = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
var DatabaseErrorType;
(function (DatabaseErrorType) {
    DatabaseErrorType["CONNECTION_ERROR"] = "CONNECTION_ERROR";
    DatabaseErrorType["CONSTRAINT_VIOLATION"] = "CONSTRAINT_VIOLATION";
    DatabaseErrorType["FOREIGN_KEY_VIOLATION"] = "FOREIGN_KEY_VIOLATION";
    DatabaseErrorType["UNIQUE_VIOLATION"] = "UNIQUE_VIOLATION";
    DatabaseErrorType["NOT_NULL_VIOLATION"] = "NOT_NULL_VIOLATION";
    DatabaseErrorType["CHECK_VIOLATION"] = "CHECK_VIOLATION";
    DatabaseErrorType["DEADLOCK"] = "DEADLOCK";
    DatabaseErrorType["TIMEOUT"] = "TIMEOUT";
    DatabaseErrorType["SERIALIZATION_FAILURE"] = "SERIALIZATION_FAILURE";
    DatabaseErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(DatabaseErrorType || (exports.DatabaseErrorType = DatabaseErrorType = {}));
class DatabaseException extends Error {
    constructor(type, originalError, query, parameters) {
        super(originalError.message);
        this.type = type;
        this.originalError = originalError;
        this.query = query;
        this.parameters = parameters;
        this.name = 'DatabaseException';
    }
}
exports.DatabaseException = DatabaseException;
let TransactionManagerService = TransactionManagerService_1 = class TransactionManagerService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(TransactionManagerService_1.name);
        this.errorHandlers = new Map();
    }
    handleDatabaseError(error, context) {
        this.logger.error(`데이터베이스 에러 발생 [${context || 'Unknown'}]:`, {
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
            table: error.table,
            column: error.column,
            stack: error.stack,
        });
        if (error.code) {
            switch (error.code) {
                case 'ECONNREFUSED':
                case 'ENOTFOUND':
                case 'ETIMEDOUT':
                case '08000':
                case '08003':
                case '08006':
                    return new DatabaseException(DatabaseErrorType.CONNECTION_ERROR, error, error.query, error.parameters);
                case '23000':
                case '23001':
                    return new DatabaseException(DatabaseErrorType.CONSTRAINT_VIOLATION, error, error.query, error.parameters);
                case '23503':
                    return new DatabaseException(DatabaseErrorType.FOREIGN_KEY_VIOLATION, error, error.query, error.parameters);
                case '23505':
                    return new DatabaseException(DatabaseErrorType.UNIQUE_VIOLATION, error, error.query, error.parameters);
                case '23502':
                    return new DatabaseException(DatabaseErrorType.NOT_NULL_VIOLATION, error, error.query, error.parameters);
                case '23514':
                    return new DatabaseException(DatabaseErrorType.CHECK_VIOLATION, error, error.query, error.parameters);
                case '40P01':
                    return new DatabaseException(DatabaseErrorType.DEADLOCK, error, error.query, error.parameters);
                case '40001':
                    return new DatabaseException(DatabaseErrorType.SERIALIZATION_FAILURE, error, error.query, error.parameters);
                case '57014':
                case '57P01':
                    return new DatabaseException(DatabaseErrorType.TIMEOUT, error, error.query, error.parameters);
            }
        }
        if (error instanceof typeorm_2.QueryFailedError) {
            return new DatabaseException(DatabaseErrorType.CONSTRAINT_VIOLATION, error, error.query, error.parameters);
        }
        return new DatabaseException(DatabaseErrorType.UNKNOWN_ERROR, error, error.query, error.parameters);
    }
    isRetryableError(error) {
        return [
            DatabaseErrorType.DEADLOCK,
            DatabaseErrorType.SERIALIZATION_FAILURE,
            DatabaseErrorType.CONNECTION_ERROR,
            DatabaseErrorType.TIMEOUT,
        ].includes(error.type);
    }
    async executeWithRetry(operation, maxRetries = 3, context = 'Transaction') {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                if (error.name && error.name.includes('Exception') && typeof error.statusCode === 'number') {
                    throw error;
                }
                const dbError = this.handleDatabaseError(error, context);
                lastError = dbError;
                if (!this.isRetryableError(dbError) || attempt === maxRetries) {
                    throw dbError;
                }
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                this.logger.warn(`트랜잭션 재시도 ${attempt}/${maxRetries} (${delay}ms 대기): ${dbError.message}`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    async executeTransaction(operation, maxRetries = 3) {
        return this.executeWithRetry(async () => {
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                await queryRunner.connect();
                await queryRunner.startTransaction();
                const result = await operation(queryRunner.manager);
                await queryRunner.commitTransaction();
                this.logger.debug('트랜잭션이 성공적으로 커밋되었습니다.');
                return result;
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                if (error.name && error.name.includes('Exception') && typeof error.statusCode === 'number') {
                    throw error;
                }
                throw this.handleDatabaseError(error, '단일 트랜잭션');
            }
            finally {
                await queryRunner.release();
            }
        }, maxRetries, '단일 트랜잭션');
    }
    async executeNestedTransaction(operation, savepointName = `sp_${Date.now()}`, maxRetries = 3) {
        return this.executeWithRetry(async () => {
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                await queryRunner.connect();
                await queryRunner.startTransaction();
                await queryRunner.query(`SAVEPOINT ${savepointName}`);
                const result = await operation(queryRunner.manager);
                await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
                await queryRunner.commitTransaction();
                this.logger.debug(`중첩 트랜잭션(${savepointName})이 성공적으로 완료되었습니다.`);
                return result;
            }
            catch (error) {
                await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
                await queryRunner.rollbackTransaction();
                this.logger.debug(`중첩 트랜잭션(${savepointName})이 롤백되었습니다.`);
                throw this.handleDatabaseError(error, '중첩 트랜잭션');
            }
            finally {
                await queryRunner.release();
            }
        }, maxRetries, `중첩 트랜잭션(${savepointName})`);
    }
    async executeBatchTransaction(operations) {
        return this.executeTransaction(async (manager) => {
            const results = [];
            for (const operation of operations) {
                const result = await operation(manager);
                results.push(result);
            }
            return results;
        });
    }
    async executeTransactionWithDomainEvents(aggregates, operation) {
        return this.executeTransaction(async (manager) => {
            const result = await operation(manager);
            const domainEvents = [];
            aggregates.forEach((aggregate) => {
                domainEvents.push(...aggregate.getDomainEvents());
                aggregate.clearDomainEvents();
            });
            if (domainEvents.length > 0) {
                this.logger.debug(`${domainEvents.length}개의 도메인 이벤트를 처리합니다.`);
                await this.processDomainEvents(domainEvents, manager);
            }
            return result;
        });
    }
    async executeReadOnlyTransaction(operation, maxRetries = 2) {
        return this.executeWithRetry(async () => {
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                await queryRunner.connect();
                await queryRunner.startTransaction('READ COMMITTED');
                await queryRunner.query('SET TRANSACTION READ ONLY');
                const result = await operation(queryRunner.manager);
                await queryRunner.commitTransaction();
                this.logger.debug('읽기 전용 트랜잭션이 성공적으로 완료되었습니다.');
                return result;
            }
            catch (error) {
                try {
                    await queryRunner.rollbackTransaction();
                    this.logger.debug('읽기 전용 트랜잭션이 롤백되었습니다.');
                }
                catch (rollbackError) {
                    this.logger.error('읽기 전용 트랜잭션 롤백 중 오류 발생:', rollbackError);
                }
                throw error;
            }
            finally {
                try {
                    await queryRunner.release();
                }
                catch (releaseError) {
                    this.logger.error('QueryRunner 해제 중 오류 발생:', releaseError);
                }
            }
        }, maxRetries, '읽기 전용 트랜잭션');
    }
    async executeTransactionWithIsolationLevel(isolationLevel, operation, maxRetries = isolationLevel === 'SERIALIZABLE' ? 5 : 3) {
        return this.executeWithRetry(async () => {
            const queryRunner = this.dataSource.createQueryRunner();
            try {
                await queryRunner.connect();
                await queryRunner.startTransaction(isolationLevel);
                const result = await operation(queryRunner.manager);
                await queryRunner.commitTransaction();
                this.logger.debug(`격리 수준 ${isolationLevel}로 트랜잭션이 완료되었습니다.`);
                return result;
            }
            catch (error) {
                try {
                    await queryRunner.rollbackTransaction();
                    this.logger.debug(`격리 수준 ${isolationLevel} 트랜잭션이 롤백되었습니다.`);
                }
                catch (rollbackError) {
                    this.logger.error(`격리 수준 ${isolationLevel} 트랜잭션 롤백 중 오류 발생:`, rollbackError);
                }
                throw error;
            }
            finally {
                try {
                    await queryRunner.release();
                }
                catch (releaseError) {
                    this.logger.error('QueryRunner 해제 중 오류 발생:', releaseError);
                }
            }
        }, maxRetries, `격리 수준 ${isolationLevel} 트랜잭션`);
    }
    getRepository(entityClass, defaultRepository, manager) {
        return manager ? manager.getRepository(entityClass) : defaultRepository;
    }
    registerDomainErrorHandler(domain) {
        this.logger.debug(`도메인 에러 핸들러 등록됨: ${domain}`);
    }
    createDomainContext(domain) {
        const errorHandler = this.errorHandlers.get(domain);
        return {
            executeSafeOperation: (operation, context) => {
                return this.executeSafeOperation(operation, context, errorHandler);
            },
        };
    }
    async executeDomainOperation(operation, context, domain) {
        const errorHandler = this.errorHandlers.get(domain);
        return this.executeSafeOperation(operation, context, errorHandler);
    }
    async executeSafeOperation(operation, context, errorHandler) {
        try {
            return await operation();
        }
        catch (error) {
            if (error.name && error.name.includes('Exception') && typeof error.statusCode === 'number') {
                throw error;
            }
            const dbError = error instanceof DatabaseException ? error : this.handleDatabaseError(error, context);
            if (errorHandler) {
                const domainError = errorHandler(dbError);
                if (domainError) {
                    throw domainError;
                }
            }
            throw dbError;
        }
    }
    async processDomainEvents(events, manager) {
        for (const event of events) {
            this.logger.debug(`도메인 이벤트 처리: ${event.eventType}`, {
                eventId: event.eventId,
                aggregateId: event.aggregateId,
                occurredAt: event.occurredAt,
            });
        }
    }
};
exports.TransactionManagerService = TransactionManagerService;
exports.TransactionManagerService = TransactionManagerService = TransactionManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object])
], TransactionManagerService);


/***/ }),

/***/ "./libs/integrations/sso/sso.constants.ts":
/*!************************************************!*\
  !*** ./libs/integrations/sso/sso.constants.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SSO_CLIENT = void 0;
exports.SSO_CLIENT = 'SSO_CLIENT';


/***/ }),

/***/ "./libs/integrations/sso/sso.module.ts":
/*!*********************************************!*\
  !*** ./libs/integrations/sso/sso.module.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SSOModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const sso_sdk_1 = __webpack_require__(/*! @lumir-company/sso-sdk */ "@lumir-company/sso-sdk");
const sso_service_1 = __webpack_require__(/*! ./sso.service */ "./libs/integrations/sso/sso.service.ts");
const sso_constants_1 = __webpack_require__(/*! ./sso.constants */ "./libs/integrations/sso/sso.constants.ts");
let SSOModule = class SSOModule {
};
exports.SSOModule = SSOModule;
exports.SSOModule = SSOModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: sso_constants_1.SSO_CLIENT,
                useFactory: async (configService) => {
                    const logger = new common_1.Logger('SSOModule');
                    const ssoConfig = configService.get('sso');
                    if (!ssoConfig?.clientId || !ssoConfig?.clientSecret) {
                        logger.warn('SSO_CLIENT_ID 또는 SSO_CLIENT_SECRET가 설정되지 않았습니다.');
                        throw new Error('SSO 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
                    }
                    const client = new sso_sdk_1.SSOClient({
                        baseUrl: ssoConfig.baseUrl,
                        clientId: ssoConfig.clientId,
                        clientSecret: ssoConfig.clientSecret,
                        timeoutMs: 10000,
                        retries: 3,
                        enableLogging: process.env.NODE_ENV === 'development',
                    });
                    try {
                        await client.initialize();
                        logger.log(`SSO 클라이언트 초기화 완료: ${client.getSystemName()}`);
                    }
                    catch (error) {
                        logger.error('SSO 시스템 인증 실패', error);
                        throw error;
                    }
                    return client;
                },
                inject: [config_1.ConfigService],
            },
            sso_service_1.SSOService,
        ],
        exports: [sso_service_1.SSOService, sso_constants_1.SSO_CLIENT],
    })
], SSOModule);


/***/ }),

/***/ "./libs/integrations/sso/sso.service.ts":
/*!**********************************************!*\
  !*** ./libs/integrations/sso/sso.service.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SSOService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SSOService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const sso_sdk_1 = __webpack_require__(/*! @lumir-company/sso-sdk */ "@lumir-company/sso-sdk");
const sso_constants_1 = __webpack_require__(/*! ./sso.constants */ "./libs/integrations/sso/sso.constants.ts");
let SSOService = SSOService_1 = class SSOService {
    constructor(ssoClient) {
        this.ssoClient = ssoClient;
        this.logger = new common_1.Logger(SSOService_1.name);
    }
    async onModuleInit() {
        const systemName = this.ssoClient.getSystemName();
        this.logger.log(`SSO 서비스 초기화 완료. 시스템명: ${systemName}`);
    }
    async login(email, password) {
        this.logger.debug(`로그인 시도: ${email}`);
        try {
            const result = await this.ssoClient.sso.login(email, password);
            this.logger.log(`로그인 성공: ${email} (${result.employeeNumber})`);
            return result;
        }
        catch (error) {
            this.logger.error(`로그인 실패: ${email}`, error);
            throw error;
        }
    }
    async verifyToken(token) {
        try {
            return await this.ssoClient.sso.verifyToken(token);
        }
        catch (error) {
            this.logger.error('토큰 검증 실패', error);
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            return await this.ssoClient.sso.refreshToken(refreshToken);
        }
        catch (error) {
            this.logger.error('토큰 갱신 실패', error);
            throw error;
        }
    }
    async checkPassword(token, currentPassword, email) {
        try {
            const result = await this.ssoClient.sso.checkPassword(token, currentPassword, email);
            return result.isValid;
        }
        catch (error) {
            this.logger.error('비밀번호 확인 실패', error);
            throw error;
        }
    }
    async changePassword(token, newPassword) {
        try {
            await this.ssoClient.sso.changePassword(token, newPassword);
            this.logger.log('비밀번호 변경 성공');
        }
        catch (error) {
            this.logger.error('비밀번호 변경 실패', error);
            throw error;
        }
    }
    async getEmployee(params) {
        try {
            return await this.ssoClient.organization.getEmployee(params);
        }
        catch (error) {
            this.logger.error('직원 정보 조회 실패', error);
            throw error;
        }
    }
    async getEmployees(params) {
        try {
            return await this.ssoClient.organization.getEmployees(params);
        }
        catch (error) {
            this.logger.error('직원 목록 조회 실패', error);
            throw error;
        }
    }
    async getDepartmentHierarchy(params) {
        try {
            return await this.ssoClient.organization.getDepartmentHierarchy(params);
        }
        catch (error) {
            this.logger.error('부서 계층구조 조회 실패', error);
            throw error;
        }
    }
    async getEmployeesManagers() {
        try {
            return await this.ssoClient.organization.getEmployeesManagers();
        }
        catch (error) {
            this.logger.error('매니저 정보 조회 실패', error);
            throw error;
        }
    }
    async subscribeFcm(params) {
        try {
            return await this.ssoClient.fcm.subscribe(params);
        }
        catch (error) {
            this.logger.error('FCM 토큰 구독 실패', error);
            throw error;
        }
    }
    async getFcmToken(params) {
        try {
            return await this.ssoClient.fcm.getToken(params);
        }
        catch (error) {
            this.logger.error('FCM 토큰 조회 실패', error);
            throw error;
        }
    }
    async getMultipleFcmTokens(params) {
        try {
            return await this.ssoClient.fcm.getMultipleTokens(params);
        }
        catch (error) {
            this.logger.error('다중 FCM 토큰 조회 실패', error);
            throw error;
        }
    }
    async unsubscribeFcm(params) {
        try {
            return await this.ssoClient.fcm.unsubscribe(params);
        }
        catch (error) {
            this.logger.error('FCM 토큰 구독 해지 실패', error);
            throw error;
        }
    }
    async exportAllData(params) {
        try {
            this.logger.debug(`모든 조직 데이터 내보내기 시작: ${JSON.stringify(params)}`);
            const result = await this.ssoClient.organization.exportAllData(params);
            this.logger.log(`모든 조직 데이터 내보내기 완료: 부서 ${result.totalCounts.departments}개, 직원 ${result.totalCounts.employees}명, 직급 ${result.totalCounts.positions}개, 계급 ${result.totalCounts.ranks}개`);
            return result;
        }
        catch (error) {
            this.logger.error('모든 조직 데이터 내보내기 실패', error);
            throw error;
        }
    }
};
exports.SSOService = SSOService;
exports.SSOService = SSOService = SSOService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sso_constants_1.SSO_CLIENT)),
    __metadata("design:paramtypes", [typeof (_a = typeof sso_sdk_1.SSOClient !== "undefined" && sso_sdk_1.SSOClient) === "function" ? _a : Object])
], SSOService);


/***/ }),

/***/ "./libs/modules/department/department.entity.ts":
/*!******************************************************!*\
  !*** ./libs/modules/department/department.entity.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Department = exports.DepartmentType = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
var DepartmentType;
(function (DepartmentType) {
    DepartmentType["COMPANY"] = "COMPANY";
    DepartmentType["DIVISION"] = "DIVISION";
    DepartmentType["DEPARTMENT"] = "DEPARTMENT";
    DepartmentType["TEAM"] = "TEAM";
})(DepartmentType || (exports.DepartmentType = DepartmentType = {}));
let Department = class Department {
};
exports.Department = Department;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', comment: '부서 ID (외부 제공)' }),
    __metadata("design:type", String)
], Department.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '부서명' }),
    __metadata("design:type", String)
], Department.prototype, "departmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: '부서 코드' }),
    __metadata("design:type", String)
], Department.prototype, "departmentCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '유형', type: 'enum', enum: DepartmentType, default: DepartmentType.DEPARTMENT }),
    __metadata("design:type", String)
], Department.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '상위 부서 ID', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "parentDepartmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '정렬 순서', default: 0 }),
    __metadata("design:type", Number)
], Department.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Department, (department) => department.childDepartments, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parentDepartmentId' }),
    __metadata("design:type", Department)
], Department.prototype, "parentDepartment", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Department, (department) => department.parentDepartment),
    __metadata("design:type", Array)
], Department.prototype, "childDepartments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Department.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Department.prototype, "updatedAt", void 0);
exports.Department = Department = __decorate([
    (0, typeorm_1.Entity)('departments-info'),
    (0, typeorm_1.Unique)('UQ_departments_parent_order', ['parentDepartmentId', 'order']),
    (0, typeorm_1.Index)('IDX_departments_parent_order', ['parentDepartmentId', 'order']),
    (0, typeorm_1.Index)('UQ_departments_root_order', ['order'], {
        unique: true,
        where: '"parentDepartmentId" IS NULL',
    })
], Department);


/***/ }),

/***/ "./libs/modules/department/department.module.ts":
/*!******************************************************!*\
  !*** ./libs/modules/department/department.module.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDepartmentModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const department_service_1 = __webpack_require__(/*! ./department.service */ "./libs/modules/department/department.service.ts");
const department_entity_1 = __webpack_require__(/*! ./department.entity */ "./libs/modules/department/department.entity.ts");
let DomainDepartmentModule = class DomainDepartmentModule {
};
exports.DomainDepartmentModule = DomainDepartmentModule;
exports.DomainDepartmentModule = DomainDepartmentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([department_entity_1.Department])],
        providers: [department_service_1.DomainDepartmentService],
        exports: [department_service_1.DomainDepartmentService],
    })
], DomainDepartmentModule);


/***/ }),

/***/ "./libs/modules/department/department.service.ts":
/*!*******************************************************!*\
  !*** ./libs/modules/department/department.service.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainDepartmentService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const department_entity_1 = __webpack_require__(/*! ./department.entity */ "./libs/modules/department/department.entity.ts");
let DomainDepartmentService = class DomainDepartmentService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(department_entity_1.Department) : this.repository;
    }
    async save(entity, options) {
        const repository = options?.queryRunner
            ? options.queryRunner.manager.getRepository(department_entity_1.Department)
            : this.repository;
        return await repository.save(entity);
    }
    async findAll(manager) {
        const repository = this.getRepository(manager);
        return await repository.find();
    }
    async findOne(id, manager) {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
};
exports.DomainDepartmentService = DomainDepartmentService;
exports.DomainDepartmentService = DomainDepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainDepartmentService);


/***/ }),

/***/ "./libs/modules/employee-department-position-history/employee-department-position-history.entity.ts":
/*!**********************************************************************************************************!*\
  !*** ./libs/modules/employee-department-position-history/employee-department-position-history.entity.ts ***!
  \**********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeDepartmentPositionHistory = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const employee_entity_1 = __webpack_require__(/*! ../employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const department_entity_1 = __webpack_require__(/*! ../department/department.entity */ "./libs/modules/department/department.entity.ts");
const position_entity_1 = __webpack_require__(/*! ../position/position.entity */ "./libs/modules/position/position.entity.ts");
const rank_entity_1 = __webpack_require__(/*! ../rank/rank.entity */ "./libs/modules/rank/rank.entity.ts");
let EmployeeDepartmentPositionHistory = class EmployeeDepartmentPositionHistory {
    부서를설정한다(departmentId) {
        this.departmentId = departmentId;
    }
    상위부서를설정한다(parentDepartmentId) {
        this.parentDepartmentId = parentDepartmentId;
    }
    직책을설정한다(positionId) {
        this.positionId = positionId;
    }
    직급을설정한다(rankId) {
        this.rankId = rankId;
    }
    관리자권한을설정한다(isManager) {
        this.isManager = isManager;
    }
    유효종료일을설정한다(effectiveEndDate) {
        this.effectiveEndDate = effectiveEndDate;
        this.isCurrent = false;
    }
    현재유효상태로설정한다() {
        this.isCurrent = true;
        this.effectiveEndDate = null;
    }
    발령사유를설정한다(assignmentReason) {
        this.assignmentReason = assignmentReason;
    }
    발령자를설정한다(assignedBy) {
        this.assignedBy = assignedBy;
    }
};
exports.EmployeeDepartmentPositionHistory = EmployeeDepartmentPositionHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "historyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직원 ID', type: 'uuid' }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '부서 ID', type: 'uuid' }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '해당 시점의 부서 상위 부서 ID (조직 계층 구조 추적용)', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "parentDepartmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직책 ID', type: 'uuid' }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "positionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직급 ID', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "rankId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '관리자 권한 여부', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeDepartmentPositionHistory.prototype, "isManager", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        comment: '발령 시작일 (이 배치가 유효해진 날짜)',
    }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "effectiveStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        comment: '발령 종료일 (NULL = 현재 유효)',
    }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "effectiveEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        default: true,
        comment: '현재 유효한 배치 여부',
    }),
    __metadata("design:type", Boolean)
], EmployeeDepartmentPositionHistory.prototype, "isCurrent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '발령 사유 (인사이동, 승진, 조직개편 등)',
    }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "assignmentReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'uuid',
        nullable: true,
        comment: '발령자 ID',
    }),
    __metadata("design:type", String)
], EmployeeDepartmentPositionHistory.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '이력 생성 시각' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], EmployeeDepartmentPositionHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", typeof (_b = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _b : Object)
], EmployeeDepartmentPositionHistory.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'departmentId' }),
    __metadata("design:type", typeof (_c = typeof department_entity_1.Department !== "undefined" && department_entity_1.Department) === "function" ? _c : Object)
], EmployeeDepartmentPositionHistory.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'parentDepartmentId' }),
    __metadata("design:type", typeof (_d = typeof department_entity_1.Department !== "undefined" && department_entity_1.Department) === "function" ? _d : Object)
], EmployeeDepartmentPositionHistory.prototype, "parentDepartment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => position_entity_1.Position, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'positionId' }),
    __metadata("design:type", typeof (_e = typeof position_entity_1.Position !== "undefined" && position_entity_1.Position) === "function" ? _e : Object)
], EmployeeDepartmentPositionHistory.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rank_entity_1.Rank, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'rankId' }),
    __metadata("design:type", typeof (_f = typeof rank_entity_1.Rank !== "undefined" && rank_entity_1.Rank) === "function" ? _f : Object)
], EmployeeDepartmentPositionHistory.prototype, "rank", void 0);
exports.EmployeeDepartmentPositionHistory = EmployeeDepartmentPositionHistory = __decorate([
    (0, typeorm_1.Entity)('employee_department_position_history'),
    (0, typeorm_1.Index)(['employeeId', 'effectiveStartDate', 'effectiveEndDate']),
    (0, typeorm_1.Index)(['departmentId', 'effectiveStartDate', 'effectiveEndDate']),
    (0, typeorm_1.Index)(['isCurrent', 'employeeId'], { where: '"isCurrent" = true' })
], EmployeeDepartmentPositionHistory);


/***/ }),

/***/ "./libs/modules/employee-department-position-history/employee-department-position-history.module.ts":
/*!**********************************************************************************************************!*\
  !*** ./libs/modules/employee-department-position-history/employee-department-position-history.module.ts ***!
  \**********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEmployeeDepartmentPositionHistoryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const employee_department_position_history_entity_1 = __webpack_require__(/*! ./employee-department-position-history.entity */ "./libs/modules/employee-department-position-history/employee-department-position-history.entity.ts");
const employee_department_position_history_service_1 = __webpack_require__(/*! ./employee-department-position-history.service */ "./libs/modules/employee-department-position-history/employee-department-position-history.service.ts");
let DomainEmployeeDepartmentPositionHistoryModule = class DomainEmployeeDepartmentPositionHistoryModule {
};
exports.DomainEmployeeDepartmentPositionHistoryModule = DomainEmployeeDepartmentPositionHistoryModule;
exports.DomainEmployeeDepartmentPositionHistoryModule = DomainEmployeeDepartmentPositionHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([employee_department_position_history_entity_1.EmployeeDepartmentPositionHistory])],
        providers: [employee_department_position_history_service_1.DomainEmployeeDepartmentPositionHistoryService],
        exports: [employee_department_position_history_service_1.DomainEmployeeDepartmentPositionHistoryService],
    })
], DomainEmployeeDepartmentPositionHistoryModule);


/***/ }),

/***/ "./libs/modules/employee-department-position-history/employee-department-position-history.service.ts":
/*!***********************************************************************************************************!*\
  !*** ./libs/modules/employee-department-position-history/employee-department-position-history.service.ts ***!
  \***********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEmployeeDepartmentPositionHistoryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const employee_department_position_history_entity_1 = __webpack_require__(/*! ./employee-department-position-history.entity */ "./libs/modules/employee-department-position-history/employee-department-position-history.entity.ts");
let DomainEmployeeDepartmentPositionHistoryService = class DomainEmployeeDepartmentPositionHistoryService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(employee_department_position_history_entity_1.EmployeeDepartmentPositionHistory) : this.repository;
    }
    async save(entity, options) {
        const repository = options?.queryRunner
            ? options.queryRunner.manager.getRepository(employee_department_position_history_entity_1.EmployeeDepartmentPositionHistory)
            : this.repository;
        return await repository.save(entity);
    }
    async 직원발령이력을생성한다(params, queryRunner) {
        const newAssignment = new employee_department_position_history_entity_1.EmployeeDepartmentPositionHistory();
        newAssignment.employeeId = params.employeeId;
        newAssignment.부서를설정한다(params.departmentId);
        newAssignment.상위부서를설정한다(params.parentDepartmentId);
        newAssignment.직책을설정한다(params.positionId);
        if (params.rankId) {
            newAssignment.직급을설정한다(params.rankId);
        }
        newAssignment.관리자권한을설정한다(params.isManager);
        newAssignment.effectiveStartDate = params.effectiveStartDate;
        newAssignment.현재유효상태로설정한다();
        if (params.assignmentReason) {
            newAssignment.발령사유를설정한다(params.assignmentReason);
        }
        if (params.assignedBy) {
            newAssignment.발령자를설정한다(params.assignedBy);
        }
        return await this.save(newAssignment, { queryRunner });
    }
    async 이력을종료한다(history, effectiveEndDate, queryRunner) {
        history.유효종료일을설정한다(effectiveEndDate);
        return await this.save(history, { queryRunner });
    }
    async findByEmployeeAtDate(employeeId, targetDate) {
        return this.repository
            .createQueryBuilder('eh')
            .leftJoinAndSelect('eh.department', 'dept')
            .leftJoinAndSelect('eh.position', 'pos')
            .leftJoinAndSelect('eh.rank', 'rank')
            .where('eh.employeeId = :employeeId', { employeeId })
            .andWhere('eh.effectiveStartDate <= :targetDate', { targetDate })
            .andWhere('(eh.effectiveEndDate IS NULL OR eh.effectiveEndDate > :targetDate)', { targetDate })
            .getOne();
    }
    async findCurrentByEmployeeId(employeeId) {
        return this.repository
            .createQueryBuilder('eh')
            .leftJoinAndSelect('eh.department', 'dept')
            .leftJoinAndSelect('eh.position', 'pos')
            .leftJoinAndSelect('eh.rank', 'rank')
            .where('eh.employeeId = :employeeId', { employeeId })
            .andWhere('eh.isCurrent = :isCurrent', { isCurrent: true })
            .getOne();
    }
    async findHistoryByEmployeeId(employeeId) {
        return this.repository
            .createQueryBuilder('eh')
            .leftJoinAndSelect('eh.department', 'dept')
            .leftJoinAndSelect('eh.position', 'pos')
            .leftJoinAndSelect('eh.rank', 'rank')
            .where('eh.employeeId = :employeeId', { employeeId })
            .orderBy('eh.effectiveStartDate', 'DESC')
            .getMany();
    }
    async findByDepartmentAtDate(departmentId, targetDate) {
        return this.repository
            .createQueryBuilder('eh')
            .leftJoinAndSelect('eh.employee', 'emp')
            .leftJoinAndSelect('eh.position', 'pos')
            .leftJoinAndSelect('eh.rank', 'rank')
            .where('eh.departmentId = :departmentId', { departmentId })
            .andWhere('eh.effectiveStartDate <= :targetDate', { targetDate })
            .andWhere('(eh.effectiveEndDate IS NULL OR eh.effectiveEndDate > :targetDate)', { targetDate })
            .getMany();
    }
    async findAllCurrent() {
        return this.repository
            .createQueryBuilder('eh')
            .leftJoinAndSelect('eh.employee', 'emp')
            .leftJoinAndSelect('eh.department', 'dept')
            .leftJoinAndSelect('eh.position', 'pos')
            .leftJoinAndSelect('eh.rank', 'rank')
            .where('eh.isCurrent = :isCurrent', { isCurrent: true })
            .getMany();
    }
};
exports.DomainEmployeeDepartmentPositionHistoryService = DomainEmployeeDepartmentPositionHistoryService;
exports.DomainEmployeeDepartmentPositionHistoryService = DomainEmployeeDepartmentPositionHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_department_position_history_entity_1.EmployeeDepartmentPositionHistory)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainEmployeeDepartmentPositionHistoryService);


/***/ }),

/***/ "./libs/modules/employee-department-position/employee-department-position.entity.ts":
/*!******************************************************************************************!*\
  !*** ./libs/modules/employee-department-position/employee-department-position.entity.ts ***!
  \******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeDepartmentPosition = exports.ManagerType = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const employee_entity_1 = __webpack_require__(/*! ../employee/employee.entity */ "./libs/modules/employee/employee.entity.ts");
const department_entity_1 = __webpack_require__(/*! ../department/department.entity */ "./libs/modules/department/department.entity.ts");
const position_entity_1 = __webpack_require__(/*! ../position/position.entity */ "./libs/modules/position/position.entity.ts");
var ManagerType;
(function (ManagerType) {
    ManagerType["DIRECT"] = "direct";
    ManagerType["FUNCTIONAL"] = "functional";
    ManagerType["PROJECT"] = "project";
    ManagerType["TEMPORARY"] = "temporary";
    ManagerType["DEPUTY"] = "deputy";
})(ManagerType || (exports.ManagerType = ManagerType = {}));
let EmployeeDepartmentPosition = class EmployeeDepartmentPosition {
};
exports.EmployeeDepartmentPosition = EmployeeDepartmentPosition;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', comment: '직원-부서-직책 ID (외부 제공)' }),
    __metadata("design:type", String)
], EmployeeDepartmentPosition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직원 ID', type: 'uuid' }),
    __metadata("design:type", String)
], EmployeeDepartmentPosition.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '부서 ID', type: 'uuid' }),
    __metadata("design:type", String)
], EmployeeDepartmentPosition.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직책 ID', type: 'uuid' }),
    __metadata("design:type", String)
], EmployeeDepartmentPosition.prototype, "positionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '관리자 권한 여부', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeDepartmentPosition.prototype, "isManager", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], EmployeeDepartmentPosition.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], EmployeeDepartmentPosition.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", typeof (_c = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _c : Object)
], EmployeeDepartmentPosition.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'departmentId' }),
    __metadata("design:type", typeof (_d = typeof department_entity_1.Department !== "undefined" && department_entity_1.Department) === "function" ? _d : Object)
], EmployeeDepartmentPosition.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => position_entity_1.Position, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'positionId' }),
    __metadata("design:type", typeof (_e = typeof position_entity_1.Position !== "undefined" && position_entity_1.Position) === "function" ? _e : Object)
], EmployeeDepartmentPosition.prototype, "position", void 0);
exports.EmployeeDepartmentPosition = EmployeeDepartmentPosition = __decorate([
    (0, typeorm_1.Entity)('employee_department_positions'),
    (0, typeorm_1.Unique)(['employeeId', 'departmentId']),
    (0, typeorm_1.Index)(['employeeId']),
    (0, typeorm_1.Index)(['departmentId']),
    (0, typeorm_1.Index)(['positionId'])
], EmployeeDepartmentPosition);


/***/ }),

/***/ "./libs/modules/employee-department-position/employee-department-position.module.ts":
/*!******************************************************************************************!*\
  !*** ./libs/modules/employee-department-position/employee-department-position.module.ts ***!
  \******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEmployeeDepartmentPositionModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const employee_department_position_service_1 = __webpack_require__(/*! ./employee-department-position.service */ "./libs/modules/employee-department-position/employee-department-position.service.ts");
const employee_department_position_entity_1 = __webpack_require__(/*! ./employee-department-position.entity */ "./libs/modules/employee-department-position/employee-department-position.entity.ts");
let DomainEmployeeDepartmentPositionModule = class DomainEmployeeDepartmentPositionModule {
};
exports.DomainEmployeeDepartmentPositionModule = DomainEmployeeDepartmentPositionModule;
exports.DomainEmployeeDepartmentPositionModule = DomainEmployeeDepartmentPositionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([employee_department_position_entity_1.EmployeeDepartmentPosition])],
        providers: [employee_department_position_service_1.DomainEmployeeDepartmentPositionService],
        exports: [employee_department_position_service_1.DomainEmployeeDepartmentPositionService],
    })
], DomainEmployeeDepartmentPositionModule);


/***/ }),

/***/ "./libs/modules/employee-department-position/employee-department-position.service.ts":
/*!*******************************************************************************************!*\
  !*** ./libs/modules/employee-department-position/employee-department-position.service.ts ***!
  \*******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEmployeeDepartmentPositionService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const employee_department_position_entity_1 = __webpack_require__(/*! ./employee-department-position.entity */ "./libs/modules/employee-department-position/employee-department-position.entity.ts");
let DomainEmployeeDepartmentPositionService = class DomainEmployeeDepartmentPositionService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(employee_department_position_entity_1.EmployeeDepartmentPosition) : this.repository;
    }
    async save(entity, options) {
        const repository = options?.queryRunner
            ? options.queryRunner.manager.getRepository(employee_department_position_entity_1.EmployeeDepartmentPosition)
            : this.repository;
        return await repository.save(entity);
    }
    async findAll(manager) {
        const repository = this.getRepository(manager);
        return await repository.find();
    }
    async findOne(id, manager) {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
};
exports.DomainEmployeeDepartmentPositionService = DomainEmployeeDepartmentPositionService;
exports.DomainEmployeeDepartmentPositionService = DomainEmployeeDepartmentPositionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_department_position_entity_1.EmployeeDepartmentPosition)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainEmployeeDepartmentPositionService);


/***/ }),

/***/ "./libs/modules/employee/employee.entity.ts":
/*!**************************************************!*\
  !*** ./libs/modules/employee/employee.entity.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Employee = exports.EmployeeStatus = exports.Gender = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const rank_entity_1 = __webpack_require__(/*! ../rank/rank.entity */ "./libs/modules/rank/rank.entity.ts");
const employee_department_position_entity_1 = __webpack_require__(/*! ../employee-department-position/employee-department-position.entity */ "./libs/modules/employee-department-position/employee-department-position.entity.ts");
var Gender;
(function (Gender) {
    Gender["Male"] = "MALE";
    Gender["Female"] = "FEMALE";
    Gender["Other"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["Active"] = "\uC7AC\uC9C1\uC911";
    EmployeeStatus["Leave"] = "\uD734\uC9C1";
    EmployeeStatus["Terminated"] = "\uD1F4\uC0AC";
})(EmployeeStatus || (exports.EmployeeStatus = EmployeeStatus = {}));
let Employee = class Employee {
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', comment: '직원 ID (외부 제공)' }),
    __metadata("design:type", String)
], Employee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: '사번' }),
    __metadata("design:type", String)
], Employee.prototype, "employeeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '이름' }),
    __metadata("design:type", String)
], Employee.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: '이메일', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '비밀번호', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '전화번호', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '생년월일', type: 'date', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Employee.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: '성별',
        type: 'enum',
        enum: Gender,
        nullable: true,
    }),
    __metadata("design:type", String)
], Employee.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '입사일', type: 'date' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Employee.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: '재직 상태',
        type: 'enum',
        enum: EmployeeStatus,
        default: EmployeeStatus.Active,
    }),
    __metadata("design:type", String)
], Employee.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '현재 직급 ID', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "currentRankId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => rank_entity_1.Rank),
    (0, typeorm_1.JoinColumn)({ name: 'currentRankId' }),
    __metadata("design:type", typeof (_c = typeof rank_entity_1.Rank !== "undefined" && rank_entity_1.Rank) === "function" ? _c : Object)
], Employee.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '퇴사일', type: 'date', nullable: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Employee.prototype, "terminationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '퇴사 사유', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "terminationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '메타데이터', type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_e = typeof Record !== "undefined" && Record) === "function" ? _e : Object)
], Employee.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '초기 비밀번호로 설정되었는지 여부', default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "isInitialPasswordSet", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_department_position_entity_1.EmployeeDepartmentPosition, (edp) => edp.employee),
    __metadata("design:type", Array)
], Employee.prototype, "departmentPositions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일' }),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], Employee.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일' }),
    __metadata("design:type", typeof (_g = typeof Date !== "undefined" && Date) === "function" ? _g : Object)
], Employee.prototype, "updatedAt", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employees-info')
], Employee);


/***/ }),

/***/ "./libs/modules/employee/employee.module.ts":
/*!**************************************************!*\
  !*** ./libs/modules/employee/employee.module.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEmployeeModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const employee_service_1 = __webpack_require__(/*! ./employee.service */ "./libs/modules/employee/employee.service.ts");
const employee_entity_1 = __webpack_require__(/*! ./employee.entity */ "./libs/modules/employee/employee.entity.ts");
let DomainEmployeeModule = class DomainEmployeeModule {
};
exports.DomainEmployeeModule = DomainEmployeeModule;
exports.DomainEmployeeModule = DomainEmployeeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([employee_entity_1.Employee])],
        providers: [employee_service_1.DomainEmployeeService],
        exports: [employee_service_1.DomainEmployeeService],
    })
], DomainEmployeeModule);


/***/ }),

/***/ "./libs/modules/employee/employee.service.ts":
/*!***************************************************!*\
  !*** ./libs/modules/employee/employee.service.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainEmployeeService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const employee_entity_1 = __webpack_require__(/*! ./employee.entity */ "./libs/modules/employee/employee.entity.ts");
let DomainEmployeeService = class DomainEmployeeService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(employee_entity_1.Employee) : this.repository;
    }
    async save(entity, options) {
        const repository = options?.queryRunner ? options.queryRunner.manager.getRepository(employee_entity_1.Employee) : this.repository;
        return await repository.save(entity);
    }
    async findAll(manager) {
        const repository = this.getRepository(manager);
        return await repository.find();
    }
    async findOne(id, manager) {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
};
exports.DomainEmployeeService = DomainEmployeeService;
exports.DomainEmployeeService = DomainEmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainEmployeeService);


/***/ }),

/***/ "./libs/modules/position/position.entity.ts":
/*!**************************************************!*\
  !*** ./libs/modules/position/position.entity.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Position = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let Position = class Position {
};
exports.Position = Position;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', comment: '직책 ID (외부 제공)' }),
    __metadata("design:type", String)
], Position.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직책명 (예: 부서장, 파트장, 팀장, 직원)' }),
    __metadata("design:type", String)
], Position.prototype, "positionTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: '직책 코드 (예: DEPT_HEAD, PART_HEAD, TEAM_LEADER, STAFF)' }),
    __metadata("design:type", String)
], Position.prototype, "positionCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직책 레벨 (낮을수록 상위 직책)' }),
    __metadata("design:type", Number)
], Position.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '관리 권한 여부', default: false }),
    __metadata("design:type", Boolean)
], Position.prototype, "hasManagementAuthority", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Position.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Position.prototype, "updatedAt", void 0);
exports.Position = Position = __decorate([
    (0, typeorm_1.Entity)('positions')
], Position);


/***/ }),

/***/ "./libs/modules/position/position.module.ts":
/*!**************************************************!*\
  !*** ./libs/modules/position/position.module.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainPositionModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const position_service_1 = __webpack_require__(/*! ./position.service */ "./libs/modules/position/position.service.ts");
const position_entity_1 = __webpack_require__(/*! ./position.entity */ "./libs/modules/position/position.entity.ts");
let DomainPositionModule = class DomainPositionModule {
};
exports.DomainPositionModule = DomainPositionModule;
exports.DomainPositionModule = DomainPositionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([position_entity_1.Position])],
        providers: [position_service_1.DomainPositionService],
        exports: [position_service_1.DomainPositionService],
    })
], DomainPositionModule);


/***/ }),

/***/ "./libs/modules/position/position.service.ts":
/*!***************************************************!*\
  !*** ./libs/modules/position/position.service.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainPositionService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const position_entity_1 = __webpack_require__(/*! ./position.entity */ "./libs/modules/position/position.entity.ts");
let DomainPositionService = class DomainPositionService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(position_entity_1.Position) : this.repository;
    }
    async save(entity, options) {
        const repository = options?.queryRunner
            ? options.queryRunner.manager.getRepository(position_entity_1.Position)
            : this.repository;
        return await repository.save(entity);
    }
    async findAll(manager) {
        const repository = this.getRepository(manager);
        return await repository.find();
    }
    async findOne(id, manager) {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
};
exports.DomainPositionService = DomainPositionService;
exports.DomainPositionService = DomainPositionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainPositionService);


/***/ }),

/***/ "./libs/modules/rank/rank.entity.ts":
/*!******************************************!*\
  !*** ./libs/modules/rank/rank.entity.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Rank = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let Rank = class Rank {
};
exports.Rank = Rank;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', comment: '직급 ID (외부 제공)' }),
    __metadata("design:type", String)
], Rank.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직급명 (예: 사원, 주임, 대리, 과장, 차장, 부장)' }),
    __metadata("design:type", String)
], Rank.prototype, "rankTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, comment: '직급 코드' }),
    __metadata("design:type", String)
], Rank.prototype, "rankCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '직급 레벨 (낮을수록 상위 직급)' }),
    __metadata("design:type", Number)
], Rank.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '생성일' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Rank.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '수정일' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Rank.prototype, "updatedAt", void 0);
exports.Rank = Rank = __decorate([
    (0, typeorm_1.Entity)('ranks')
], Rank);


/***/ }),

/***/ "./libs/modules/rank/rank.module.ts":
/*!******************************************!*\
  !*** ./libs/modules/rank/rank.module.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainRankModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const rank_service_1 = __webpack_require__(/*! ./rank.service */ "./libs/modules/rank/rank.service.ts");
const rank_entity_1 = __webpack_require__(/*! ./rank.entity */ "./libs/modules/rank/rank.entity.ts");
let DomainRankModule = class DomainRankModule {
};
exports.DomainRankModule = DomainRankModule;
exports.DomainRankModule = DomainRankModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([rank_entity_1.Rank])],
        providers: [rank_service_1.DomainRankService],
        exports: [rank_service_1.DomainRankService],
    })
], DomainRankModule);


/***/ }),

/***/ "./libs/modules/rank/rank.service.ts":
/*!*******************************************!*\
  !*** ./libs/modules/rank/rank.service.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomainRankService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const rank_entity_1 = __webpack_require__(/*! ./rank.entity */ "./libs/modules/rank/rank.entity.ts");
let DomainRankService = class DomainRankService {
    constructor(repository, dataSource) {
        this.repository = repository;
        this.dataSource = dataSource;
    }
    getRepository(manager) {
        return manager ? manager.getRepository(rank_entity_1.Rank) : this.repository;
    }
    async save(entity, options) {
        const repository = options?.queryRunner
            ? options.queryRunner.manager.getRepository(rank_entity_1.Rank)
            : this.repository;
        return await repository.save(entity);
    }
    async findAll(manager) {
        const repository = this.getRepository(manager);
        return await repository.find();
    }
    async findOne(id, manager) {
        const repository = this.getRepository(manager);
        return await repository.findOne({ where: { id } });
    }
};
exports.DomainRankService = DomainRankService;
exports.DomainRankService = DomainRankService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rank_entity_1.Rank)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _b : Object])
], DomainRankService);


/***/ }),

/***/ "@aws-sdk/client-s3":
/*!*************************************!*\
  !*** external "@aws-sdk/client-s3" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

/***/ }),

/***/ "@aws-sdk/s3-request-presigner":
/*!************************************************!*\
  !*** external "@aws-sdk/s3-request-presigner" ***!
  \************************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/s3-request-presigner");

/***/ }),

/***/ "@lumir-company/sso-sdk":
/*!*****************************************!*\
  !*** external "@lumir-company/sso-sdk" ***!
  \*****************************************/
/***/ ((module) => {

module.exports = require("@lumir-company/sso-sdk");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/cqrs":
/*!*******************************!*\
  !*** external "@nestjs/cqrs" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/cqrs");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "@nestjs/typeorm":
/*!**********************************!*\
  !*** external "@nestjs/typeorm" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "date-fns":
/*!***************************!*\
  !*** external "date-fns" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("date-fns");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "typeorm":
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),

/***/ "xlsx":
/*!***********************!*\
  !*** external "xlsx" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("xlsx");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************************!*\
  !*** ./apps/lams/src/main.ts ***!
  \*******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/lams/src/app.module.ts");
const request_interceptor_1 = __webpack_require__(/*! ./common/interceptors/request.interceptor */ "./apps/lams/src/common/interceptors/request.interceptor.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! ./common/swagger/swagger */ "./apps/lams/src/common/swagger/swagger.ts");
const dotenv_1 = __webpack_require__(/*! dotenv */ "dotenv");
(0, dotenv_1.config)();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new request_interceptor_1.RequestInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    (0, swagger_1.setupSwagger)(app, []);
    await app.listen(process.env.APP_PORT || 3060);
}
bootstrap();

})();

/******/ })()
;