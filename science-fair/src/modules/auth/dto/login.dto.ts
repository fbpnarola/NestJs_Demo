import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
   
    @IsEmail()
    @IsNotEmpty()
    email: String;

    @IsNotEmpty()
    password: String;
}