import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";

export type CategoryDocument = Category & Document

@Schema({
    timestamps: true
})
export class Category {

    @Prop({ type: String, required: true })
    name: String

    @Prop()
    description: String

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const CategorySchema = SchemaFactory.createForClass(Category)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
CategorySchema.plugin(mongoosePaginate);