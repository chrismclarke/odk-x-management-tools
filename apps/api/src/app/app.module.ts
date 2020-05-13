import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  OdkTablesController,
  OdkTablesMiddleware,
  OdkTablesService
} from './odktables';

@Module({
  imports: [],
  controllers: [AppController, OdkTablesController],
  providers: [AppService, OdkTablesService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OdkTablesMiddleware).forRoutes('odktables');
  }
}
