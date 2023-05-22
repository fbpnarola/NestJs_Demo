import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from '../user/user.schema';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private jwtService: JwtService
    ) { }

    async login(data: LoginDto) {
        try {
            const { email, password } = data;
            const checkUser = await this.userModel.findOne({ email });
            if (!checkUser) {
                return { message: "User does not exists!!" };
            }
            const compare = await bcrypt.compare(password, checkUser.password)
            // console.log('Compare Result ==>', compare)
            if (compare === false) {
                return { message: "Invalid password!!" };
            }
            const token = this.jwtService.sign({ id: checkUser._id, role: checkUser.userRole })
            const responseSend = {
                token: token,
                message: "Login Successfully!!"
            }
            return responseSend;
        } catch (error) {
            return error
        }
    }

    async validateUser(id) {
        try {
            const checkUser = await this.userModel.findOne({ _id: id }).select('-updatedAt -createdAt -password -__v -resetPasswordToken');
            if (checkUser) {
                return checkUser;
            }
            return console.error();
        } catch (error) {
            return error
        }
    }
}
