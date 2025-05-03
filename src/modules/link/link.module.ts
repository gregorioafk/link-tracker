import { Module } from '@nestjs/common';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { InMemoryLinkRepository } from './repositories/in-memory-link.repository';

@Module({
    controllers: [LinkController],
    providers: [LinkService, InMemoryLinkRepository],
    exports: [LinkService],
})
export class LinkModule { }
