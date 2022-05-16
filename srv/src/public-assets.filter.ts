import {
    Catch,
    NotFoundException, ExceptionFilter, HttpException, ArgumentsHost, HttpStatus
} from '@nestjs/common';
import * as path from "path";

@Catch(NotFoundException)
export class PublicAssetNotFoundFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const url = ctx.getRequest().url;
        const response = ctx.getResponse();
        if(url.startsWith("/public/ui")) {
            response.sendFile(path.resolve("public/ui/index.html"));
        } else {
            response.status(HttpStatus.NOT_FOUND).send();
        }
    }
}
