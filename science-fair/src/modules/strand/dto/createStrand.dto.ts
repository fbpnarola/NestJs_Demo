import { IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateStrandDto {
    @IsNotEmpty()
    strandName: String;

    parentStrand?: mongoose.Schema.Types.ObjectId;
}