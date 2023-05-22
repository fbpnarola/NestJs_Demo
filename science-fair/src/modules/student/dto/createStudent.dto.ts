import { IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateStudentDto {
    @IsString()
    firstName: String;

    @IsNotEmpty()
    lastName: String;

    scienceFairId: mongoose.Schema.Types.ObjectId;

    schoolId: mongoose.Schema.Types.ObjectId;

    grade: String;
}