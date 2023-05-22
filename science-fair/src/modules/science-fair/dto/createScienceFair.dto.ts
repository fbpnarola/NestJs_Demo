import { IsNotEmpty } from "class-validator";

export class CreateScienceFairDto {
    @IsNotEmpty()
    name: String;

    @IsNotEmpty()
    location: String;

    @IsNotEmpty()
    date: Date;

    @IsNotEmpty()
    description: String;
}