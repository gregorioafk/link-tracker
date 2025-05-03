import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

describe('LinkController', () => {
    let controller: LinkController;
    let service: LinkService;

    const mockLink = {
        shortId: 'abc123',
        originalUrl: 'https://example.com',
        clickCount: 0,
        isActive: true,
        createdAt: new Date(),
    };

    const mockLinkService = {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        invalidate: jest.fn(),
        getRedirect: jest.fn(),
        getStats: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LinkController],
            providers: [
                {
                    provide: LinkService,
                    useValue: mockLinkService,
                },
            ],
        }).compile();

        controller = module.get<LinkController>(LinkController);
        service = module.get<LinkService>(LinkService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new link', async () => {
            const createLinkDto: CreateLinkDto = {
                originalUrl: 'https://example.com',
            };

            mockLinkService.create.mockResolvedValue(mockLink);

            const result = await controller.create(createLinkDto);

            expect(result).toEqual(mockLink);
            expect(mockLinkService.create).toHaveBeenCalledWith(createLinkDto);
        });
    });

    describe('redirect', () => {
        it('should redirect to original URL', async () => {
            mockLinkService.getRedirect.mockResolvedValue('https://example.com');

            const result = await controller.redirect('abc123');

            expect(result).toEqual({
                url: 'https://example.com',
                statusCode: HttpStatus.FOUND,
            });
            expect(mockLinkService.getRedirect).toHaveBeenCalledWith(
                'abc123',
                undefined,
            );
        });

        it('should redirect with password', async () => {
            mockLinkService.getRedirect.mockResolvedValue('https://example.com');

            const result = await controller.redirect('abc123', 'password123');

            expect(result).toEqual({
                url: 'https://example.com',
                statusCode: HttpStatus.FOUND,
            });
            expect(mockLinkService.getRedirect).toHaveBeenCalledWith(
                'abc123',
                'password123',
            );
        });

        it('should handle NotFoundException', async () => {
            mockLinkService.getRedirect.mockRejectedValue(new NotFoundException());

            await expect(controller.redirect('notfound')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getStats', () => {
        it('should return link statistics', async () => {
            const stats = {
                clickCount: 42,
                createdAt: new Date(),
                isActive: true,
            };

            mockLinkService.getStats.mockResolvedValue(stats);

            const result = await controller.getStats('abc123');

            expect(result).toEqual(stats);
            expect(mockLinkService.getStats).toHaveBeenCalledWith('abc123');
        });
    });

    describe('update', () => {
        it('should update a link', async () => {
            const updateLinkDto: UpdateLinkDto = {
                originalUrl: 'https://updated-example.com',
            };

            mockLinkService.update.mockResolvedValue({
                ...mockLink,
                originalUrl: 'https://updated-example.com',
            });

            const result = await controller.update('abc123', updateLinkDto);

            expect(result.originalUrl).toEqual('https://updated-example.com');
            expect(mockLinkService.update).toHaveBeenCalledWith(
                'abc123',
                updateLinkDto,
            );
        });
    });

    describe('invalidate', () => {
        it('should invalidate a link', async () => {
            mockLinkService.invalidate.mockResolvedValue(undefined);

            const result = await controller.invalidate('abc123');

            expect(result).toEqual({ message: 'enlace invalidado exitosamente' });
            expect(mockLinkService.invalidate).toHaveBeenCalledWith('abc123');
        });
    });
});
