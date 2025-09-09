
import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse, ConfigOptions } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export interface CloudinaryUploadResult {
    secureUrl: string;
    publicId: string;
}

@Injectable()
export class CloudinaryStorageService {
    private readonly logger = new Logger(CloudinaryStorageService.name);

    constructor(private readonly configService: ConfigService) {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error('Cloudinary environment variables are not set');
        }

        const options: ConfigOptions = {
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        };
        cloudinary.config(options);
    }

    async uploadFile(file: Express.Multer.File, projectId: number): Promise<CloudinaryUploadResult> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const folder = `projects/${projectId}/documents`;

            const uploadOptions: UploadApiOptions = {
                folder,
                resource_type: 'auto',
                access_mode: 'public',                  // public access and must in cloudinary acc setting also
            };

            const result: UploadApiResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(uploadOptions, (error, result) => {
                        if (error) return reject(error);
                        if (!result) return reject(new Error('Empty Cloudinary response'));
                        resolve(result);
                    })
                    .end(file.buffer);
            });

            this.logger.log(`Uploaded file to Cloudinary: ${result.secure_url}`);
            return {
                secureUrl: result.secure_url,
                publicId: result.public_id,
            };
        } catch (error: any) {
            this.logger.error(`Failed to upload file to Cloudinary: ${error.message}`);
            throw new InternalServerErrorException(`Failed to upload file to Cloudinary: ${error.message}`);
        }
    }

    async deleteFile(publicId: string): Promise<void> {
        if (!publicId) return;
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
            this.logger.log(`Deleted file from Cloudinary: ${publicId}`);
        } catch (error: any) {
            this.logger.error(`Failed to delete file from Cloudinary: ${error.message}`);
        }
    }
}
