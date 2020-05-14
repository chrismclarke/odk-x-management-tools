import {
  Controller,
  Req,
  Headers,
  HttpService,
  All,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Message } from '@odkxm/api-interfaces';
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
    @Headers('odkserverurl') odkserverurl
  ) {
    // url ensured via middleware
    const url = `${odkserverurl}/odktables${req.url}`;
    const httpsAgent = new Agent({
      rejectUnauthorized: false
    });
    this.http
      .request({ ...req, url, httpsAgent })
      .toPromise()
      .then(proxyRes => {
        const { status, data } = proxyRes;
        const message: Message = { status, data, message: 'success' };
        res.status(status).json(message);
      })
      .catch((proxyErr: AxiosError<any>) => {
        const { message, response } = proxyErr;
        const { status, statusText, data } = response;
        console.log('proxyErr', proxyErr);
        res.json({ status, message: message, data });
      });
  }
}
