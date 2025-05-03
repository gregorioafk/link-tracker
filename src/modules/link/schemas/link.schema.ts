import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LinkDocument = Link & Document;

@Schema({ timestamps: true })
export class Link {
    @ApiProperty({ description: 'Identificador corto para la URL enmascarada' })
    @Prop({ required: true, unique: true })
    shortId: string;

    @ApiProperty({ description: 'URL original a la que se redirigirá' })
    @Prop({ required: true })
    originalUrl: string;

    @ApiProperty({ description: 'Fecha de expiración del enlace' })
    @Prop()
    expiresAt?: Date;

    @ApiProperty({ description: 'Contraseña de protección (hash)' })
    @Prop()
    passwordHash?: string;

    @ApiProperty({ description: 'Contador de clics en el enlace' })
    @Prop({ default: 0 })
    clickCount: number;

    @ApiProperty({ description: 'Estado del enlace (activo/inactivo)' })
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Fecha de creación' })
    @Prop()
    createdAt?: Date;

    @ApiProperty({ description: 'Fecha de última actualización' })
    @Prop()
    updatedAt?: Date;
}

export const LinkSchema = SchemaFactory.createForClass(Link);
