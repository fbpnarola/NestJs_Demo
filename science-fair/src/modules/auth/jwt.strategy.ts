import { Body, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import mongoose from "mongoose";
import { Strategy, ExtractJwt } from "passport-jwt";
import config from "src/config/config";
import { AuthService } from "./auth.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.SECRET_KEY
        });
    }

    async validate(payload) {
        const { id } = payload;
        const user = this.authService.validateUser(id)
        return user;
    }
}