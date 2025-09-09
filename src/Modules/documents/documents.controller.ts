
import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, Param, Res, Patch, Delete, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { Response } from 'express';
import { Roles } from '../users/decorators/roles.decorator';
import { UserType } from '../../utils/enums';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryStorageService } from './file-storage/cloudinary-storage.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { get as httpsGet } from 'https';

@ApiTags('Documents')
@Controller('api/v1/documents')
export class DocumentsController {
    private static readonly allowedMimeTypes = new Set<string>([
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/json',
        'image/png',
        'image/jpeg',
        'image/gif',
    ]);

    private static fileFilter(_: any, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) {
        if (!file || !file.mimetype) return cb(null, false);
        if (DocumentsController.allowedMimeTypes.has(file.mimetype)) return cb(null, true);
        return cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
    }
    private readonly logger = new Logger(DocumentsController.name);

    constructor(
        private readonly documentsService: DocumentsService,
        private readonly cloudinaryStorage: CloudinaryStorageService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @ApiSecurity('bearer')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), fileFilter: DocumentsController.fileFilter }))
    @HttpCode(HttpStatus.CREATED)
    async createDocument(
        @Body() createDocumentDto: CreateDocumentDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.documentsService.createDocument(createDocumentDto, file);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @HttpCode(HttpStatus.OK)
    @ApiSecurity('bearer')
    async getAllDocuments(@Query() query: any) {
        return this.documentsService.getAllDocuments(query);
    }

    @Get('search')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @HttpCode(HttpStatus.OK)
    async searchDocuments(@Query() query: SearchDocumentsDto) {
        const documents = await this.documentsService.searchDocuments(query);
        return { length: documents.length, documents };
    }

    @Get(':id/download')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @ApiSecurity('bearer')
    async downloadDocument(@Param('id') id: string, @Query('download') download: string, @Res() res: Response) {
        try {
            const document = await this.documentsService.getDocumentById(id);
            if (!document || !document.secureUrl || !document.publicId) {
                throw new NotFoundException('Document or file not found');
            }

            this.logger.log(`Attempting to stream file from Cloudinary: ${document.secureUrl}`);

            const urlParts = document.secureUrl.split('/');
            const defaultFileName = urlParts[urlParts.length - 1] || 'document.pdf';
            const forceDownload = typeof download === 'string' && ['1', 'true', 'yes'].includes(download.toLowerCase());

            httpsGet(document.secureUrl, (cloudRes) => {
                if (cloudRes.statusCode !== 200) {
                    this.logger.error(`Cloudinary returned status ${cloudRes.statusCode} for URL: ${document.secureUrl}`);
                    res.status(cloudRes.statusCode).json({ message: `Failed to fetch file from Cloudinary: Status ${cloudRes.statusCode}` });
                    return;
                }

                const contentType = cloudRes.headers['content-type'] || 'application/pdf';
                const contentLength = cloudRes.headers['content-length'];
                const contentDisposition = forceDownload
                    ? `attachment; filename="${defaultFileName}"`
                    : `attachment; filename="${defaultFileName}"`;

                res.setHeader('Content-Type', contentType);
                if (contentLength) res.setHeader('Content-Length', contentLength);
                res.setHeader('Content-Disposition', contentDisposition);
                this.logger.log(`Streaming file with Content-Type: ${contentType}, Filename: ${defaultFileName}`);
                cloudRes.pipe(res);
            }).on('error', (error) => {
                this.logger.error(`Failed to stream file from Cloudinary: ${error.message}`);
                res.status(500).json({ message: `Failed to fetch file from Cloudinary: ${error.message}` });
            });
        } catch (error) {
            this.logger.error(`Failed to download document ID ${id}: ${error.message}`);
            throw error instanceof NotFoundException
                ? error
                : new InternalServerErrorException(`Failed to download document: ${error.message}`);
        }
    }

    @Post('upload/:projectId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @ApiSecurity('bearer')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), fileFilter: DocumentsController.fileFilter }))
    @HttpCode(HttpStatus.CREATED)
    async uploadDocument(
        @Param('projectId') projectId: string,
        @Body() body: Omit<CreateDocumentDto, 'projectId'>,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const dto: CreateDocumentDto = { ...body, projectId: parseInt(projectId, 10) } as CreateDocumentDto;
        return this.documentsService.createDocument(dto, file);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @HttpCode(HttpStatus.OK)
    async getDocumentById(@Param('id') id: string) {
        return this.documentsService.getDocumentById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @HttpCode(HttpStatus.OK)
    async updateDocument(@Param('id') id: string, @Body() data: any) {
        return this.documentsService.updateDocument(id, data);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @HttpCode(HttpStatus.OK)
    async deleteDocument(@Param('id') id: string) {
        return this.documentsService.deleteDocument(id);
    }
}