import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export interface IFileStorageService {
    uploadFile(file: Express.Multer.File, projectId: number): Promise<string>;
    getFilePath(filePath: string): string;
}

@Injectable()
export class FileStorageService implements IFileStorageService {
    private readonly uploadPath = './uploads/documents';

    constructor() {
        // Ensure upload directory exists
        import('fs').then(fs => {
            if (!fs.existsSync(this.uploadPath)) {
                fs.mkdirSync(this.uploadPath, { recursive: true });
            }
        });
    }

    async uploadFile(file: Express.Multer.File, projectId: number): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const allowedTypes = ['.pdf', '.doc', '.docx','.csv' , '.txt'];
        const fileExt = extname(file.originalname).toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            throw new BadRequestException('Only PDF and Word files are allowed');
        }
        const fileName = file.filename;
        const filePath = `${this.uploadPath}/${fileName}`;
        return filePath;
    }

    getFilePath(filePath: string): string {
        return filePath;
    }
}