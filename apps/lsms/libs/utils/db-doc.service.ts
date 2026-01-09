import { Injectable } from '@nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';
import { Entities } from '../entities';
import * as fs from 'fs';
import * as path from 'path';

interface DocMetadata {
    name: string;
    columns: any[];
    relations: any[];
}

@Injectable()
export class DbDocService {
    private readonly metadata: DocMetadata[];

    constructor() {
        if (process.env.NODE_ENV === 'local') {
            const storage = getMetadataArgsStorage();
            this.metadata = storage.tables.map((table) => ({
                name: table.name,
                columns: storage.columns.filter((col) => col.target === table.target),
                relations: storage.relations.filter((rel) => rel.target === table.target),
            }));
            // this.generateDbDocumentation();
        }
    }

    async generateDbDocumentation(): Promise<void> {
        const doc = this.generateMarkdown();
        const outputPath = path.join('C:/Users/USER/Desktop/projects/RMS-documents/docs/개발/02_database-design.md');
        const outputDir = path.dirname(outputPath);

        // Create directory if it doesn't exist
        await fs.promises.mkdir(outputDir, { recursive: true });

        await fs.promises.writeFile(outputPath, doc, 'utf8');
    }

    private generateMarkdown(): string {
        let markdown = '# 데이터베이스 설계 문서\n\n';
        markdown += "import { MermaidDiagram } from '@site/src/components/MermaidDiagram';\n\n";

        // 1. ERD 다이어그램
        markdown += this.generateErdSection();

        // 2. 엔티티 상세 정보
        markdown += this.generateEntityDetailsSection();

        // 3. 관계 정보
        markdown += this.generateRelationsSection();

        return markdown;
    }

    private generateErdSection(): string {
        let section = '## ERD (Entity Relationship Diagram)\n\n';

        // Mermaid.js를 사용한 ERD 다이어그램
        section += '<MermaidDiagram\n';
        section += 'title="database-erd"\n';
        section += 'chart={`\n';
        section += 'erDiagram\n';

        // 엔티티 정의
        this.metadata.forEach((metadata) => {
            const entityName = metadata.name.replace(/[^a-zA-Z0-9]/g, '').replace(/s$/, '');
            section += `    ${entityName} {\n`;
            metadata.columns.forEach((column) => {
                let type = 'unknown';
                if (column.options?.type) {
                    if (typeof column.options.type === 'string') {
                        type = column.options.type;
                    } else if (typeof column.options.type === 'function') {
                        switch (column.options.type.name) {
                            case 'String':
                                type = 'string';
                                break;
                            case 'Number':
                                type = 'number';
                                break;
                            case 'Boolean':
                                type = 'boolean';
                                break;
                            case 'Date':
                                type = 'date';
                                break;
                            default:
                                type = column.options.type.name.toLowerCase();
                        }
                    }
                }
                const isPrimary = column.options?.primary ? 'PK' : '';
                section += `        ${type} ${column.propertyName} ${isPrimary}\n`;
            });
            section += '    }\n';
        });

        // 관계 정의
        this.metadata.forEach((metadata) => {
            const sourceEntity = metadata.name.replace(/[^a-zA-Z0-9]/g, '').replace(/s$/, '');
            metadata.relations.forEach((relation) => {
                const targetEntity = relation.type.toString().split('.').pop();
                if (targetEntity) {
                    const sanitizedTarget = targetEntity
                        .toLowerCase()
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .replace(/s$/, '');
                    // 관계 타입에 따른 카디널리티 결정
                    let cardinality = '||--o{';
                    if (relation.relationType === 'one-to-one') {
                        cardinality = '||--||';
                    } else if (relation.relationType === 'many-to-one') {
                        cardinality = '}|--||';
                    }
                    // 관계 설명은 many-to-one일 때 belongs_to, 나머지는 has
                    const relationDesc = relation.relationType === 'many-to-one' ? 'belongs_to' : 'has';

                    section += `    ${sourceEntity} ${cardinality} ${sanitizedTarget} : ${relationDesc}\n`;
                }
            });
        });

        section += '`}\n';
        section += '/>\n\n';
        return section;
    }

    private generateEntityDetailsSection(): string {
        let section = '## 엔티티 상세 정보\n\n';

        this.metadata.forEach((metadata) => {
            section += `### ${metadata.name}\n\n`;
            section += '| 컬럼명 | 타입 | 제약조건 | 설명 |\n';
            section += '|--------|------|-----------|------|\n';
            metadata.columns.forEach((column) => {
                const constraints = [];
                if (column.options.primary) constraints.push('PK');
                if (!column.options.nullable) constraints.push('NOT NULL');
                if (column.options.unique) constraints.push('UNIQUE');

                let type = column.options.type;
                if (typeof type === 'function') {
                    type = type.name;
                }

                section += `| ${column.propertyName} | ${type} | ${constraints.join(', ')} | ${column.options?.comment || ''} |\n`;
            });

            section += '\n';
        });

        return section;
    }

    private generateRelationsSection(): string {
        let section = '## 관계 정보\n\n';

        this.metadata.forEach((metadata) => {
            if (metadata.relations.length > 0) {
                section += `### ${metadata.name} 관계\n\n`;
                section += '| 관계 타입 | 대상 엔티티 | 설명 |\n';
                section += '|------------|-------------|------|\n';

                metadata.relations.forEach((relation) => {
                    const targetEntity = relation.type.toString();
                    const relationType = relation.relationType;
                    section += `| ${relationType} | ${targetEntity} | ${relation.options?.comment || ''} |\n`;
                });

                section += '\n';
            }
        });

        return section;
    }
}
