import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, Param, Res, Patch, Delete } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { Response } from 'express';
import { Roles } from '../users/decorators/roles.decorator';
import { UserType } from '../../utils/enums';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Documents')
@Controller('api/v1/documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    @ApiSecurity('bearer')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/documents',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const fileExt = file.originalname.split('.').pop();
                cb(null, `project_${req.body.projectId}_${uniqueSuffix}.${fileExt}`);
            },
        }),
    }))
    @HttpCode(HttpStatus.CREATED)
    @ApiSecurity('bearer')
    async createDocument(
        @Body() createDocumentDto: CreateDocumentDto,
        @UploadedFile(
        ) file?: Express.Multer.File,
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
    async searchDocuments(@Query() searchDocumentsDto: SearchDocumentsDto) {
        const documents = await this.documentsService.searchDocuments(searchDocumentsDto);
        return { length: documents.length, documents };
    }

    @Get(':id/download')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN, UserType.CLIENT)
    async downloadDocument(@Param('id') id: string, @Res() res: Response) {
        const filePath = await this.documentsService.getDocumentFilePath(id);
        res.sendFile(filePath, { root: '.' });
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