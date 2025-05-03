import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Query,
    Redirect,
    HttpStatus,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Link } from './schemas/link.schema';

@ApiTags('Link')
@Controller()
export class LinkController {
    private readonly logger = new Logger(LinkController.name);

    constructor(private readonly linkService: LinkService) { }

    @Post('link')
    @ApiOperation({ summary: 'crear un nuevo link enmascarado' })
    @ApiResponse({
        status: 201,
        description: 'link creado exitosamente',
        type: Link,
    })
    @ApiResponse({ status: 400, description: 'datos invalidos' })
    async create(@Body() createLinkDto: CreateLinkDto): Promise<Link> {
        return this.linkService.create(createLinkDto);
    }

    @Get('l/:id')
    @ApiOperation({ summary: 'Redireccionar a URL original' })
    @ApiParam({ name: 'id', description: 'ID corto del enlace' })
    @ApiQuery({
        name: 'password',
        required: false,
        description: 'contraseña para enlaces protegidos',
    })
    @ApiResponse({ status: 302, description: 'redireccion exitosa' })
    @ApiResponse({
        status: 400,
        description: 'enlace invalido, expirado o contraseña incorrecta',
    })
    @ApiResponse({ status: 404, description: 'enlace no encontrado' })
    @Redirect()
    async redirect(
        @Param('id') id: string,
        @Query('password') password?: string,
    ) {
        try {
            const url = await this.linkService.getRedirect(id, password);
            return { url, statusCode: HttpStatus.FOUND };
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.warn(`Intento de acceso a enlace inexistente: ${id}`);
            }
            throw error;
        }
    }

    @Get('l/:id/stats')
    @ApiOperation({ summary: 'obtener estadisticas del enlace' })
    @ApiParam({ name: 'id', description: 'ID corto del enlace' })
    @ApiResponse({
        status: 200,
        description: 'estadisticas obtenidas exitosamente',
    })
    @ApiResponse({ status: 404, description: 'enlace no encontrado' })
    async getStats(@Param('id') id: string) {
        return this.linkService.getStats(id);
    }

    @Put('l/:id')
    @ApiOperation({ summary: 'actualizar un enlace' })
    @ApiParam({ name: 'id', description: 'ID corto del enlace' })
    @ApiResponse({
        status: 200,
        description: 'enlace actualizado exitosamente',
        type: Link,
    })
    @ApiResponse({ status: 404, description: 'enlace no encontrado' })
    async update(
        @Param('id') id: string,
        @Body() updateLinkDto: UpdateLinkDto,
    ): Promise<Link> {
        return this.linkService.update(id, updateLinkDto);
    }

    @Put('l/:id/invalidate')
    @ApiOperation({ summary: 'invalidar un enlace' })
    @ApiParam({ name: 'id', description: 'ID corto del enlace' })
    @ApiResponse({ status: 200, description: 'enlace invalidado exitosamente' })
    @ApiResponse({ status: 404, description: 'enlace no encontrado' })
    async invalidate(@Param('id') id: string) {
        await this.linkService.invalidate(id);
        return { message: 'enlace invalidado exitosamente' };
    }
}
