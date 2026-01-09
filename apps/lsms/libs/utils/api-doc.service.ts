import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import axios from 'axios';
import { join } from 'path';
import { OpenApiPath } from './openapi-types';

@Injectable()
export class ApiDocService {
    private readonly logger = new Logger(ApiDocService.name);

    constructor() {
        if (process.env.NODE_ENV === 'local') {
            // this.generateApiDocs();
        }
    }

    private MAX_RETRIES = 3;
    private RETRY_DELAY = 2000; // 2초
    private data: any;

    async getApiJson(retries = this.MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        try {
            const response = await axios.get('http://localhost:3060/api-docs-json');
            this.data = response.data;
        } catch (error) {
            if (retries > 0) {
                this.getApiJson(retries - 1);
            }
        }
    }

    private getControllers() {
        // v1 API 경로만 필터링
        const v1Paths = Object.entries(this.data.paths).filter(([path]) => path.startsWith('/api/v1/'));

        return v1Paths
            .map(([path, routes]) => {
                // v1 이후의 경로에서 admin 여부 확인
                const pathParts = path.split('/');
                const isAdmin = pathParts[3] === 'admin';
                // admin이면 그 다음 부분(인덱스 4), 아니면 일반 사용자 API(인덱스 3)
                const controllerIndex = isAdmin ? 4 : 3;
                const controller = pathParts[controllerIndex] || 'undefined';

                // admin 접두사 추가하여 관리자/일반 사용자 API 구분
                const controllerName = isAdmin ? `admin-${controller}` : controller;

                const apis = Object.entries(routes).map(([method, metadata]) => {
                    return {
                        method,
                        path,
                        metadata,
                        isAdmin,
                    };
                });
                return {
                    controller: controllerName,
                    apis,
                };
            })
            .reduce((acc, curr) => {
                if (acc[curr.controller]) {
                    acc[curr.controller].push(...curr.apis);
                } else {
                    acc[curr.controller] = [...curr.apis];
                }
                return acc;
            }, {});
    }

    // 스키마의 타입을 문자열로 변환하는 함수
    private getSchemaType(schema: any): string {
        if (schema.type === 'array') {
            const itemType = schema.items ? this.getSchemaType(schema.items) : 'any';
            return `${itemType}[]`;
        }
        return schema.type || 'object';
    }

    // JSON 형식으로 스키마를 변환하는 함수
    private renderSchemaJson(schema: any, indentLevel: number = 1): string {
        if (!schema) return 'null';

        const indent = '  '.repeat(indentLevel);
        const commentIndent = '  '.repeat(Math.max(0, indentLevel - 1));
        let content = '';

        if (schema.type === 'object' && schema.properties) {
            content += '{\n';
            const properties = Object.entries(schema.properties);
            properties.forEach(([key, prop]: [string, any], index) => {
                // prop이 undefined인 경우 빈 객체로 대체
                if (!prop) {
                    prop = {};
                }

                const isLast = index === properties.length - 1;
                const required = (schema.required || []).includes(key);
                const comment = [];

                // 주석에 포함될 정보 수집
                if (prop.description) comment.push(prop.description);
                if (required && prop.type !== 'except') comment.push('✅ Required');
                if (!required && prop.type !== 'except') comment.push('❌ Optional');

                if (prop.type === 'object' && prop.properties) {
                    content += `${indent}"${key}": ${this.renderSchemaJson(prop, indentLevel + 1)}${isLast ? '' : ','}`;
                } else if (prop.type === 'array' && prop.items) {
                    content += `${indent}"${key}": [`;
                    if (prop.items.type === 'object' && prop.items.properties) {
                        content += '\n';
                        content += `${indent}  ${this.renderSchemaJson(prop.items, indentLevel + 2).trim()}`;
                        content += `\n${indent}]${isLast ? '' : ','}`;
                    } else {
                        // 기본 타입 배열의 경우
                        const example = this.getExampleValue(prop.items);
                        content += `${example}]${isLast ? '' : ','}`;
                    }
                } else {
                    const example = this.getExampleValue(prop);
                    content += `${indent}"${key}": ${example}${isLast ? '' : ','}`;
                }

                // 주석 추가
                if (comment.length > 0) {
                    content += ` // ${comment.join(', ')}`;
                }
                content += '\n';
            });
            content += `${commentIndent}}`;
        } else if (schema.type === 'array' && schema.items) {
            // 배열 처리 로직 추가
            content = `[${this.getExampleValue(schema.items)}]`;
        } else {
            // 기본 타입인 경우
            content = this.getExampleValue(schema);
        }

        return content;
    }

    // 예제 값을 생성하는 헬퍼 함수
    private getExampleValue(prop: any): string {
        if (!prop) return 'null';

        if (prop.example !== undefined) {
            return typeof prop.example === 'string' ? `"${prop.example}"` : prop.example;
        }

        switch (prop.type) {
            case 'string':
                return prop.enum ? `"${prop.enum[0]}"` : '""';
            case 'number':
                return '0';
            case 'integer':
                return '0';
            case 'boolean':
                return 'false';
            case 'array':
                return '[]';
            default:
                return 'null';
        }
    }

    // resolveSchema 함수 개선
    private resolveSchema(schema: any, schemas: any, visited: Set<string> = new Set()): any {
        if (!schema) return { type: 'object', properties: {} };

        if (schema.$ref) {
            const refPath = schema.$ref.split('/');
            const schemaName = refPath[refPath.length - 1];

            // 순환 참조 방지
            if (visited.has(schemaName)) {
                return { type: 'object', description: `Reference to ${schemaName}` };
            }

            visited.add(schemaName);

            // 참조된 스키마가 없는 경우 빈 객체 반환
            if (!schemas[schemaName]) {
                this.logger.warn(`Schema reference not found: ${schemaName}`);
                return { type: 'object', properties: {} };
            }

            return this.resolveSchema(schemas[schemaName], schemas, visited);
        }

        if (schema.allOf) {
            const resolvedSchemas = schema.allOf
                .filter((s) => s) // null 또는 undefined 필터링
                .map((s) => this.resolveSchema(s, schemas, visited));

            if (resolvedSchemas.length === 0) {
                return { type: 'object', properties: {} };
            }

            return resolvedSchemas.reduce((acc, curr) => {
                return {
                    ...acc,
                    ...curr,
                    properties: {
                        ...(acc.properties || {}),
                        ...(curr.properties || {}),
                    },
                    required: [...(acc.required || []), ...(curr.required || [])],
                };
            }, {});
        }

        if (schema.properties) {
            const resolvedProperties = {};
            Object.entries(schema.properties).forEach(([key, value]) => {
                // value가 null 또는 undefined가 아닌 경우에만 처리
                if (value !== null && value !== undefined) {
                    resolvedProperties[key] = this.resolveSchema(value, schemas, new Set(visited));
                } else {
                    resolvedProperties[key] = { type: 'object', properties: {} };
                }
            });
            return { ...schema, properties: resolvedProperties };
        }

        if (schema.items) {
            return {
                ...schema,
                items: this.resolveSchema(schema.items, schemas, visited),
            };
        }

        return schema;
    }

    async generateApiDocs() {
        try {
            await this.getApiJson();
            if (!this.data || !this.data.paths) {
                this.logger.error('API 문서 데이터를 불러오는데 실패했습니다.');
                return;
            }

            const controllers = this.getControllers();
            if (Object.keys(controllers).length === 0) {
                this.logger.warn('API v1 경로를 찾을 수 없습니다.');
                return;
            }

            const schemas = this.data.components?.schemas || {};

            Object.keys(controllers).forEach((controller, index) => {
                try {
                    // 관리자 API와 일반 사용자 API를 제목에 표시
                    const isAdmin = controller.startsWith('admin-');
                    const controllerName = isAdmin ? controller.substring(6) : controller;
                    const apiType = isAdmin ? '[관리자 API]' : '[사용자 API]';

                    let markdownContent = `# ${apiType} ${controllerName[0].toUpperCase() + controllerName.slice(1)}\n\n`;
                    // markdownContent += `## ${controller} \n\n`;
                    const domain = controllers[controller];

                    for (const api of domain) {
                        try {
                            const method = api.method.toUpperCase();
                            const path = api.path;
                            const metadata: OpenApiPath = api.metadata;

                            markdownContent += `### ${metadata.summary || path}\n\n`;
                            if (metadata.description) {
                                markdownContent += `${metadata.description}\n\n`;
                            }

                            markdownContent += `- **Method:** \`${method}\`\n`;
                            markdownContent += `- **Endpoint:** \`${path}\`\n\n`;

                            // Parameters 추가
                            if (metadata.parameters && metadata.parameters.length > 0) {
                                const pathParams = metadata.parameters.filter((p) => p.in === 'path');
                                const queryParams = metadata.parameters.filter((p) => p.in === 'query');

                                if (pathParams.length > 0) {
                                    markdownContent += `#### 🔵 Path Parameters\n\n`;
                                    markdownContent += '```json\n';
                                    markdownContent += '{\n';
                                    pathParams.forEach((param, index) => {
                                        try {
                                            const resolvedSchema = this.resolveSchema(param.schema, schemas);
                                            const isLast = index === pathParams.length - 1;
                                            const example = this.getExampleValue(resolvedSchema);
                                            const required = param.required ? '✅ Required' : '❌ Optional';

                                            markdownContent += `  "${param.name}": ${example} // ${required} ${param.description || ''}\n`;
                                            markdownContent += `${isLast ? '' : ','}\n`;
                                        } catch (err) {
                                            this.logger.error(`Path parameter 처리 중 오류: ${err.message}`);
                                            markdownContent += `  "${param.name}": null // Error processing parameter\n`;
                                            markdownContent += `${index === pathParams.length - 1 ? '' : ','}\n`;
                                        }
                                    });
                                    markdownContent += '}\n';
                                    markdownContent += '```\n\n';
                                }

                                if (queryParams.length > 0) {
                                    markdownContent += `#### 🟣 Query Parameters\n\n`;
                                    markdownContent += '```json\n';
                                    markdownContent += '{\n';
                                    queryParams.forEach((param, index) => {
                                        try {
                                            const resolvedSchema = this.resolveSchema(param.schema, schemas);
                                            const isLast = index === queryParams.length - 1;
                                            const example = this.getExampleValue(resolvedSchema);
                                            const required = param.required ? '✅ Required' : '❌ Optional';

                                            markdownContent += `  "${param.name}": ${example} // ${required} ${param.description || ''}\n`;
                                            markdownContent += `${isLast ? '' : ','}\n`;
                                        } catch (err) {
                                            this.logger.error(`Query parameter 처리 중 오류: ${err.message}`);
                                            markdownContent += `  "${param.name}": null // Error processing parameter\n`;
                                            markdownContent += `${index === queryParams.length - 1 ? '' : ','}\n`;
                                        }
                                    });
                                    markdownContent += '}\n';
                                    markdownContent += '```\n\n';
                                }
                            }

                            // Request Body 추가
                            if (metadata.requestBody) {
                                markdownContent += `#### 🟠 Request Body\n\n`;
                                const content = metadata.requestBody.content;

                                if (content) {
                                    Object.keys(content).forEach((contentType) => {
                                        try {
                                            markdownContent += `**Content Type:** \`${contentType}\`\n\n`;
                                            const resolvedSchema = this.resolveSchema(
                                                content[contentType].schema,
                                                schemas,
                                            );
                                            markdownContent += '```json\n';
                                            markdownContent += this.renderSchemaJson(resolvedSchema);
                                            markdownContent += '\n```\n\n';
                                        } catch (err) {
                                            this.logger.error(`Request body 처리 중 오류: ${err.message}`);
                                            markdownContent +=
                                                '```json\n{ "error": "Error processing request body" }\n```\n\n';
                                        }
                                    });
                                }
                            }

                            // Response 추가
                            markdownContent += `#### Responses\n\n`;
                            if (metadata.responses) {
                                Object.entries(metadata.responses).forEach(([code, response]) => {
                                    try {
                                        const titleEmoji = code.startsWith('2') ? '🟢' : '🔴';
                                        markdownContent += `##### ${titleEmoji} ${code} - ${response.description || 'No description'}\n\n`;
                                        if (response.content) {
                                            Object.keys(response.content).forEach((contentType) => {
                                                try {
                                                    markdownContent += `**Content Type:** \`${contentType}\`\n\n`;
                                                    const resolvedSchema = this.resolveSchema(
                                                        response.content[contentType].schema,
                                                        schemas,
                                                    );
                                                    markdownContent += '```json\n';
                                                    markdownContent += this.renderSchemaJson(resolvedSchema);
                                                    markdownContent += '\n```\n\n';
                                                } catch (err) {
                                                    this.logger.error(`Response content 처리 중 오류: ${err.message}`);
                                                    markdownContent +=
                                                        '```json\n{ "error": "Error processing response" }\n```\n\n';
                                                }
                                            });
                                        }
                                    } catch (err) {
                                        this.logger.error(`Response 처리 중 오류: ${err.message}`);
                                        markdownContent += `##### Status ${code} - Error processing response\n\n`;
                                    }
                                });
                            }

                            markdownContent += `---\n\n`;
                        } catch (err) {
                            this.logger.error(`API 엔드포인트 처리 중 오류: ${err.message}`);
                            markdownContent += `### Error processing endpoint: ${api.path}\n\n---\n\n`;
                        }
                    }

                    // 파일명에 관리자/사용자 API 구분을 표시
                    const filePrefix = isAdmin ? 'admin_' : '';
                    const docsPath = join(
                        'C:/Users/USER/Desktop/projects/RMS-documents/docs/개발/03_api',
                        `${index + 1 < 10 ? '0' : ''}${index + 1}_${filePrefix}${controllerName}.md`,
                    );
                    this.saveMarkdown(docsPath, markdownContent);
                } catch (err) {
                    this.logger.error(`컨트롤러 문서화 중 오류 발생: ${controller}, ${err.message}`);
                }
            });

            this.logger.log('API 문서 생성이 완료되었습니다.');
        } catch (err) {
            this.logger.error(`API 문서 생성 중 예상치 못한 오류 발생: ${err.message}`);
        }
    }

    private saveMarkdown(filePath: string, content: string) {
        fs.writeFileSync(filePath, content);
        this.logger.log(`API 문서가 생성되었습니다: ${filePath}`);
    }
}
