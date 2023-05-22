import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateSchoolDto {
    @IsNotEmpty()
    name: String;

    @IsNotEmpty()
    location: String;

    @IsNotEmpty()
    schoolCode: String;

    @IsNotEmpty()
    scienceFairId: mongoose.Schema.Types.ObjectId;
}