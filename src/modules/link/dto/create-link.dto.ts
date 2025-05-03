import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateLinkDto {
    @ApiProperty({
        description: 'URL original a la que se redirigirá',
        example: 'https://www.ejemplo.com/pagina-muy-larga',
    })
    @IsUrl({}, { message: 'por favor ingresa una URL valida' })
    originalUrl: string;

    @ApiProperty({
        description: 'contraseña opcional para proteger el acceso al link',
        required: false,
        example: 'miContraseña123',
    })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({
        description: 'fecha de expiracin del enlace (ISO 8601)',
        required: false,
        example: '2023-12-31T23:59:59Z',
    })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @ApiProperty({
        description: 'id corto personalizado (opcional)',
        required: false,
        example: 'mi-link',
    })
    @IsOptional()
    @IsString()
    customShortId?: string;
}
