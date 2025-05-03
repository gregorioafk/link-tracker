import { ApiProperty } from '@nestjs/swagger';
import {
    IsUrl,
    IsString,
    IsOptional,
    IsDateString,
    IsBoolean,
} from 'class-validator';

export class UpdateLinkDto {
    @ApiProperty({
        description: 'URL original a la que se redirigirá',
        required: false,
        example: 'https://www.ejemplo.com/nueva-pagina',
    })
    @IsOptional()
    @IsUrl({}, { message: 'Por favor ingresa una URL válida' })
    originalUrl?: string;

    @ApiProperty({
        description: 'Nueva contraseña para proteger el acceso al link',
        required: false,
        example: 'nuevaContraseña123',
    })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({
        description: 'Fecha de expiración del enlace (ISO 8601)',
        required: false,
        example: '2023-12-31T23:59:59Z',
    })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @ApiProperty({
        description: 'Estado del enlace (activo/inactivo)',
        required: false,
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
