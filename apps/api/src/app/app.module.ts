import {
  Module,
  NestModule,
  MiddlewareConsumer,
  HttpModule
} from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OdkTablesController, OdkTablesMiddleware } from './odktables';

@Module({
  imports: [HttpModule],
  controllers: [AppController, OdkTablesController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OdkTablesMiddleware).forRoutes('odktables');
  }
}
