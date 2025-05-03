import { Test, TestingModule } from '@nestjs/testing';
import { LinkService } from './link.service';
import { Link } from './interfaces/link.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InMemoryLinkRepository } from './repositories/in-memory-link.repository';

jest.mock('bcryptjs', () => {
    return {
        hash: jest.fn().mockImplementation(() => Promise.resolve('hashedPassword')),
        compare: jest.fn().mockImplementation(() => Promise.resolve(true))
    };
});

describe('LinkService', () => {
    let service: LinkService;
    let repository: InMemoryLinkRepository;

    const mockLink: Link = {
        shortId: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 0,
        isActive: true,
        createdAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LinkService,
                InMemoryLinkRepository
            ],
        }).compile();

        service = module.get<LinkService>(LinkService);
        repository = module.get<InMemoryLinkRepository>(InMemoryLinkRepository);

        // Limpiar los mocks
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new link successfully', async () => {
            const createLinkDto = {
                originalUrl: 'https://example.com',
            };

            jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(repository, 'create').mockResolvedValueOnce(mockLink);

            const result = await service.create(createLinkDto);
            expect(result).toBeDefined();
            expect(repository.findOne).toHaveBeenCalled();
        });

        it('should throw an error if custom shortId already exists', async () => {
            const createLinkDto = {
                originalUrl: 'https://example.com',
                customShortId: 'abc123',
            };

            jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockLink);

            await expect(service.create(createLinkDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('findOne', () => {
        it('should return a link if found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockLink);

            const result = await service.findOne('abc123');
            expect(result).toEqual(mockLink);
        });

        it('should throw NotFoundException if link not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

            await expect(service.findOne('notfound')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getRedirect', () => {
        it('should return original URL and increase click count', async () => {
            const mockActiveLinkWithoutPassword = {
                ...mockLink,
                passwordHash: undefined,
            };

            jest
                .spyOn(service, 'findOne')
                .mockResolvedValue(mockActiveLinkWithoutPassword);

            jest.spyOn(repository, 'incrementClickCount').mockResolvedValueOnce(true);

            const result = await service.getRedirect('abc123');
            expect(result).toEqual(mockActiveLinkWithoutPassword.originalUrl);
            expect(repository.incrementClickCount).toHaveBeenCalledWith('abc123');
        });

        it('should throw BadRequestException if link is inactive', async () => {
            const inactiveLink = { ...mockLink, isActive: false };
            jest.spyOn(service, 'findOne').mockResolvedValue(inactiveLink);

            await expect(service.getRedirect('abc123')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if link has expired', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            const expiredLink = {
                ...mockLink,
                expiresAt: pastDate,
            };

            jest.spyOn(service, 'findOne').mockResolvedValue(expiredLink);

            await expect(service.getRedirect('abc123')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if password required but not provided', async () => {
            const protectedLink = {
                ...mockLink,
                passwordHash: 'hashedPassword',
            };

            jest.spyOn(service, 'findOne').mockResolvedValue(protectedLink);

            await expect(service.getRedirect('abc123')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if password is incorrect', async () => {
            const protectedLink = {
                ...mockLink,
                passwordHash: 'hashedPassword',
            };

            jest.spyOn(service, 'findOne').mockResolvedValue(protectedLink);
            (bcrypt.compare as jest.Mock).mockImplementationOnce(() => Promise.resolve(false));

            await expect(
                service.getRedirect('abc123', 'wrongpassword'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should return original URL if password is correct', async () => {
            const protectedLink = {
                ...mockLink,
                passwordHash: 'hashedPassword',
            };

            jest.spyOn(service, 'findOne').mockResolvedValue(protectedLink);
            (bcrypt.compare as jest.Mock).mockImplementationOnce(() => Promise.resolve(true));

            jest.spyOn(repository, 'incrementClickCount').mockResolvedValueOnce(true);

            const result = await service.getRedirect('abc123', 'correctpassword');
            expect(result).toEqual(protectedLink.originalUrl);
        });
    });
});
