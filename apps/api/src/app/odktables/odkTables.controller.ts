import {
  Controller,
  Req,
  Headers,
  HttpService,
  All,
  Res,
  Body
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IAPIResponse } from '@odkxm/api-interfaces';
import { Agent } from 'https';
import { AxiosError } from 'axios';

@Controller('odktables')
export class OdkTablesController {
  constructor(private http: HttpService) {}
  @All()
  /**
   * On all requests simply forward to the odktables server api
   * as given in the initial request
   */
  proxy(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('odkserverurl') odkserverurl: string,
    @Body() body: any
  ) {
    // url ensured via middleware
    const url = `${odkserverurl}/odktables${req.url}`;
    const httpsAgent = new Agent({
      rejectUnauthorized: false
    });
    this.http
      .request({ ...(req as any), url, httpsAgent, data: body })
      .toPromise()
      .then(proxyRes => {
        const { status, data } = proxyRes;
        const message: IAPIResponse = { data, message: 'success' };
        res.status(status).json(message);
      })
      .catch((proxyErr: AxiosError<any>) => {
        const { message, response } = proxyErr;
        const { status, data } = response ? response : ({} as any);
        res.status(status).json({ status, message: message, data });
      });
  }
}
