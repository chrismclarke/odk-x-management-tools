import { Injectable } from '@nestjs/common';
import { Message } from '@odkxm/api-interfaces';

@Injectable()
export class AppService {
  getData(): Message {
    return { message: 'Api Running', status: 200 };
  }
}
