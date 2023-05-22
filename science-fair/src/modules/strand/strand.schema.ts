import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";

export type StrandDocument = Strand & Document

@Schema({
    timestamps: true
})
export class Strand {
    @Prop({ type: String, required: true })
    strandName: String

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Strand', default: null })
    parentStrand: mongoose.Schema.Types.ObjectId

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const StrandSchema = SchemaFactory.createForClass(Strand)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
StrandSchema.plugin(mongoosePaginate);