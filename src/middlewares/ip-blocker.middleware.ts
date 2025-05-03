import { Injectable, NestMiddleware, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IpBlockerMiddleware implements NestMiddleware {
    private blockedIps: string[] = [];
    private readonly logger = new Logger('IpBlockerMiddleware');
    private readonly configFile = path.join(process.cwd(), 'blockedips.json');

    constructor() {
        this.loadBlockedIps();
    }

    private loadBlockedIps(): void {
        try {
            if (fs.existsSync(this.configFile)) {
                const content = fs.readFileSync(this.configFile, 'utf8');
                const config = JSON.parse(content);
                this.blockedIps = config.blockedIps || [];
                this.logger.log(`Loaded ${this.blockedIps.length} blocked IPs`);
            } else {
                fs.writeFileSync(
                    this.configFile,
                    JSON.stringify({ blockedIps: [] }, null, 2),
                    'utf8',
                );
                this.logger.log('Created default blockedips.json file');
            }
        } catch (error) {
            this.logger.error(`Error loading blocked IPs: ${error.message}`);
        }
    }

    use(req: Request, res: Response, next: NextFunction): void {
        const clientIp =
            req.ip ||
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            '0.0.0.0';

        if (this.blockedIps.includes(clientIp)) {
            this.logger.warn(`Blocked request from IP: ${clientIp}`);
            res.status(HttpStatus.FORBIDDEN).json({
                statusCode: HttpStatus.FORBIDDEN,
                message: 'Access denied',
            });
        }

        next();
    }
}
