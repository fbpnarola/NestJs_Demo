import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";

export type ScienceFairDocument = ScienceFair & Document

@Schema({
    timestamps: true
})
export class ScienceFair {
    @Prop({ type: String, required: true })
    name: String

    @Prop({ type: Date, required: true })
    date: Date

    @Prop({ type: String })
    location1: String

    @Prop({ type: String, required: true })
    description: String

    @Prop()
    image: String

    @Prop({ type: Boolean, default: false })
    isLocked: Boolean

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const ScienceFairSchema = SchemaFactory.createForClass(ScienceFair)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
ScienceFairSchema.plugin(mongoosePaginate);