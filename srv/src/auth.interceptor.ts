import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import {Request} from "express";

@Injectable()
export class AuthenticationHeaderInterceptor implements NestInterceptor {
    constructor(private authToken = process.env.AUTH_TOKEN) {
        if(!this.authToken) {
            throw new Error(`Empty authToken detected : missing AUTH_TOKEN env property !`)
        }
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const authorizationHeader = context.switchToHttp().getRequest<Request>().header("Authorization");
        if(!authorizationHeader) {
            throw new Error("Missing Authorization header !");
        } else if(authorizationHeader === this.authToken) {
            return next.handle();
        } else {
            throw new Error("Invalid Authorization header")
        }
    }
}
