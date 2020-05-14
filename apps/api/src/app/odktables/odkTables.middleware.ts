import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { IAPIResponse } from '@odkxm/api-interfaces';
@Injectable()
export class OdkTablesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('odktablesRequest...');
    const { headers } = req;
    const odkserverurl = headers.odkserverurl;
    // ensure serverUrl provided
    if (!odkserverurl) {
      const message: IAPIResponse = {
        status: 400,
        message: 'No server url provided'
      };
      return res.json(message);
    }

    next();
  }
}
