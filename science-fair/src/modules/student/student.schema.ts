import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";

export type StudentDocument = Student & Document

@Schema({
    timestamps: true
})
export class Student {
    @Prop({ type: String, required: true })
    firstName: String

    @Prop({ type: String, required: true })
    lastName: String

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ScienceFair'})
    scienceFairId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School', require: true })
    schoolId: mongoose.Schema.Types.ObjectId

    @Prop({ type: String, enum: ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Adult"], require: true })
    grade: String

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const StudentSchema = SchemaFactory.createForClass(Student)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
StudentSchema.plugin(mongoosePaginate);