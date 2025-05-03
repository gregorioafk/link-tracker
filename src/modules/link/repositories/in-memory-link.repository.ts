import { Injectable } from '@nestjs/common';
import { Link } from '../interfaces/link.interface';

@Injectable()
export class InMemoryLinkRepository {
    private links: Map<string, Link> = new Map();

    async findOne(shortId: string): Promise<Link | null> {
        return this.links.get(shortId) || null;
    }

    async create(link: Link): Promise<Link> {
        const now = new Date();
        link.createdAt = now;
        link.updatedAt = now;

        this.links.set(link.shortId, link);
        return link;
    }

    async findAll(): Promise<Link[]> {
        return Array.from(this.links.values());
    }

    async update(shortId: string, updateData: Partial<Link>): Promise<boolean> {
        const link = this.links.get(shortId);
        if (!link) {
            return false;
        }

        const updatedLink = {
            ...link,
            ...updateData,
            updatedAt: new Date(),
        };

        this.links.set(shortId, updatedLink);
        return true;
    }

    async incrementClickCount(shortId: string): Promise<boolean> {
        const link = this.links.get(shortId);
        if (!link) {
            return false;
        }

        link.clickCount += 1;
        link.updatedAt = new Date();
        this.links.set(shortId, link);
        return true;
    }
} 