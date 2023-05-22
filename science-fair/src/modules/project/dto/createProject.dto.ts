import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateProjectDto {
    @IsNotEmpty()
    name: String;

    @IsNotEmpty()
    description: String;

    @IsNotEmpty()
    schoolId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    scienceFairId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    categoryId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    strandId: mongoose.Schema.Types.ObjectId;

    subStrandId?: mongoose.Schema.Types.ObjectId;

    judges?: [mongoose.Schema.Types.ObjectId];

    students?: [mongoose.Schema.Types.ObjectId];

    addedBy: mongoose.Schema.Types.ObjectId;

    projectCode: String;
}

// strandId, subStrandId, categoryId, schoolId, scienceFairId, students