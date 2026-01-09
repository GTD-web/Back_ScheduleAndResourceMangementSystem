export interface OpenApiPath {
    operationId: string;
    summary: string;
    description?: string;
    tags?: string[];
    parameters?: OpenApiParameter[];
    requestBody?: OpenApiRequestBody;
    responses: Record<string, OpenApiResponse>;
    security?: Array<Record<string, any>>;
}

export interface OpenApiParameter {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    required?: boolean;
    schema?: OpenApiSchema;
    description?: string;
    example?: any;
}

export interface OpenApiRequestBody {
    required?: boolean;
    content: {
        [contentType: string]: {
            schema: OpenApiSchema | { $ref: string };
        };
    };
}

export interface OpenApiResponse {
    description: string;
    content?: {
        [contentType: string]: {
            schema: OpenApiSchema | OpenApiComposedSchema | { $ref: string };
        };
    };
}

export interface OpenApiSchema {
    type?: string;
    format?: string;
    enum?: string[];
    example?: any;
    properties?: Record<string, OpenApiSchema | { $ref: string }>;
    items?: OpenApiSchema | { $ref: string };
    required?: string[];
}

export interface OpenApiComposedSchema {
    allOf: Array<OpenApiSchema | { $ref: string }>;
}
