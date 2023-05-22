import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateUserDto {
    @IsString()
    firstName: String;

    @IsNotEmpty()
    lastName: String;

    @IsEmail()
    @IsNotEmpty()
    email: String;

    @IsNotEmpty()
    password: String;

    userRole: Number;

    scienceFairId?: mongoose.Schema.Types.ObjectId;

    schoolId?: mongoose.Schema.Types.ObjectId;

    proficient_languages?: Object[];

    avatar?: String;

    addedBy?: mongoose.Schema.Types.ObjectId;
}