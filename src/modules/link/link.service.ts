import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { Link } from './interfaces/link.interface';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { InMemoryLinkRepository } from './repositories/in-memory-link.repository';

@Injectable()
export class LinkService {
    private readonly logger = new Logger(LinkService.name);

    constructor(private readonly linkRepository: InMemoryLinkRepository) { }

    async create(createLinkDto: CreateLinkDto): Promise<Link> {
        const shortId = createLinkDto.customShortId || nanoid(8);

        const existingLink = await this.linkRepository.findOne(shortId);
        if (existingLink && createLinkDto.customShortId) {
            throw new BadRequestException(`El ID corto '${shortId}' ya está en uso`);
        }

        const linkData: Link = {
            shortId,
            originalUrl: createLinkDto.originalUrl,
            isActive: true,
            clickCount: 0,
        };

        if (createLinkDto.expiresAt) {
            linkData.expiresAt = new Date(createLinkDto.expiresAt);
        }

        if (createLinkDto.password) {
            linkData.passwordHash = await bcrypt.hash(createLinkDto.password, 10);
        }

        return this.linkRepository.create(linkData);
    }

    async findAll(): Promise<Link[]> {
        return this.linkRepository.findAll();
    }

    async findOne(shortId: string): Promise<Link> {
        const link = await this.linkRepository.findOne(shortId);
        if (!link) {
            throw new NotFoundException(`Link con ID '${shortId}' no encontrado`);
        }
        return link;
    }

    async getRedirect(shortId: string, password?: string): Promise<string> {
        const link = await this.findOne(shortId);

        if (!link.isActive) {
            this.logger.warn(`Intento de acceso a enlace inactivo: ${shortId}`);
            throw new BadRequestException('Este enlace ha sido invalidado');
        }

        if (link.expiresAt && new Date() > link.expiresAt) {
            this.logger.warn(`Intento de acceso a enlace expirado: ${shortId}`);
            throw new BadRequestException('Este enlace ha expirado');
        }

        if (link.passwordHash) {
            if (!password) {
                throw new BadRequestException('Este enlace requiere contraseña');
            }

            const isPasswordValid = await bcrypt.compare(password, link.passwordHash);
            if (!isPasswordValid) {
                this.logger.warn(
                    `Intento de acceso con contraseña incorrecta: ${shortId}`,
                );
                throw new BadRequestException('Contraseña incorrecta');
            }
        }

        await this.linkRepository.incrementClickCount(shortId);

        return link.originalUrl;
    }

    async update(shortId: string, updateLinkDto: UpdateLinkDto): Promise<Link> {
        const link = await this.findOne(shortId);

        const updateData: Partial<Link> = {};

        if (updateLinkDto.originalUrl) {
            updateData.originalUrl = updateLinkDto.originalUrl;
        }

        if (updateLinkDto.expiresAt) {
            updateData.expiresAt = new Date(updateLinkDto.expiresAt);
        }

        if (typeof updateLinkDto.isActive !== 'undefined') {
            updateData.isActive = updateLinkDto.isActive;
        }

        if (updateLinkDto.password) {
            updateData.passwordHash = await bcrypt.hash(updateLinkDto.password, 10);
        }

        await this.linkRepository.update(shortId, updateData);
        return this.findOne(shortId);
    }

    async invalidate(shortId: string): Promise<void> {
        await this.findOne(shortId);
        await this.linkRepository.update(shortId, { isActive: false });
    }

    async getStats(shortId: string): Promise<{
        clickCount: number;
        createdAt: Date;
        expiresAt?: Date;
        isActive: boolean;
    }> {
        const link = await this.findOne(shortId);

        return {
            clickCount: link.clickCount,
            createdAt: link.createdAt || new Date(),
            expiresAt: link.expiresAt,
            isActive: link.isActive,
        };
    }
}
