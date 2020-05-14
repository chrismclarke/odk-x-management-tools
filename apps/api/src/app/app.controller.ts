import { Controller, Get } from '@nestjs/common';

import { IAPIResponse } from '@odkxm/api-interfaces';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getData(): IAPIResponse {
    return this.appService.getData();
  }
}
