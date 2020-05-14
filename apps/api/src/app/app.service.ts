import { Injectable } from '@nestjs/common';
import { IAPIResponse } from '@odkxm/api-interfaces';

@Injectable()
export class AppService {
  getData(): IAPIResponse {
    return { message: 'Api Running', status: 200 };
  }
}
