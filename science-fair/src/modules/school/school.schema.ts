import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";

export type SchoolDocument = School & Document

@Schema({
    timestamps: true
})
export class School {
    @Prop({ type: String, required: true })
    name: String

    @Prop()
    schoolCode: String

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ScienceFair' })
    scienceFairId: mongoose.Schema.Types.ObjectId

    @Prop({ type: String, required: true })
    location1: String

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const SchoolSchema = SchemaFactory.createForClass(School)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
SchoolSchema.plugin(mongoosePaginate);