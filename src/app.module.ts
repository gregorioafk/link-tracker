import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinkModule } from './modules/link/link.module';
import { IpBlockerMiddleware } from './middlewares/ip-blocker.middleware';

@Module({
  imports: [
    LinkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IpBlockerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
