import {
  Module,
  NestModule,
  MiddlewareConsumer,
  HttpModule
} from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OdkTablesMiddleware } from './odktables/odkTables.middleware';
import { OdkTablesController } from './odktables/odkTables.controller';

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
