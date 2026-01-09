import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                if (error instanceof HttpException) {
                    console.error('Error:', error);
                    const response = error.getResponse();
                    const message = (response as any).message;
                    const errorMessage =
                        typeof message === 'object'
                            ? Array.isArray(message)
                                ? message.join('\n')
                                : message
                            : error.message;

                    return throwError(() => ({
                        success: false,
                        message: errorMessage,
                        statusCode: error.getStatus(),
                    }));
                }

                // 예상치 못한 에러의 경우
                console.error('Unexpected error:', error);
                return throwError(() => ({
                    success: false,
                    message: '예상치 못한 오류가 발생했습니다.',
                    statusCode: 500,
                }));
            }),
        );
    }
}
