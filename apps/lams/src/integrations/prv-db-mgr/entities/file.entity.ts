import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum FileStatus {
    UNREAD = 'unread',
    READ = 'read',
    ERROR = 'error',
}

@Entity()
export class FileEntity {
    @PrimaryGeneratedColumn('uuid')
    fileId: string;

    @Column()
    fileName: string;

    @Column({ nullable: true })
    fileOriginalName: string;

    @Column()
    filePath: string;

    @Column({ nullable: true })
    year: string;

    @Column({ nullable: true })
    month: string;

    @Column({ nullable: true })
    readAt: string;

    @Column({ default: FileStatus.UNREAD })
    status: FileStatus;

    @Column({ nullable: true })
    error: string;

    @Column()
    uploadBy: string;

    @CreateDateColumn()
    uploadedAt: string;

    readFile(): void {
        this.readAt = new Date().toISOString();
        this.status = FileStatus.READ;
    }

    errorFile(e: any): void {
        this.readAt = new Date().toISOString();
        this.status = FileStatus.ERROR;
        this.error = e;
    }

    setYearAndMonth(year: string, month: string): void {
        this.year = year;
        this.month = month.padStart(2, '0');
    }
}
