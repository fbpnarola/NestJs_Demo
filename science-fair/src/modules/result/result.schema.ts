import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";

export type ResultDocument = Result & Document

@Schema({
    timestamps: true
})
export class Result {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
    projectId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ScienceFair' })
    scienceFairId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
    categoryId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Strand' })
    strandId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Strand' })
    subStrandId: mongoose.Schema.Types.ObjectId

    @Prop({ type: String, required: true })
    feedback: String

    @Prop({ type: Number, default: 0 })
    score1: Number

    @Prop({ type: Number, default: 0 })
    score2: Number

    @Prop({ type: Number, default: 0 })
    score3: Number

    @Prop({ type: Number, default: 0 })
    finalScore: Number

    @Prop({ type: String, default: "needs_approval", enum: ["needs_approval", "approved", "rejected"] })
    status: String

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const ResultSchema = SchemaFactory.createForClass(Result)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
ResultSchema.plugin(mongoosePaginate);