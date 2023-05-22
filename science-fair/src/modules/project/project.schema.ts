import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";

export type ProjectDocument = Project & Document

@Schema({
    timestamps: true
})
export class Project {

    @Prop({ type: String, required: true })
    name: String

    @Prop({ type: String, required: true })
    description: String

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Strand' })
    strandId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Strand' })
    subStrandId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
    categoryId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School' })
    schoolId: mongoose.Schema.Types.ObjectId

    @Prop()
    projectCode: String

    @Prop({ type: Number, default: 0, min: 0, })
    averageScore: Number

    @Prop()
    rank: Number

    @Prop({ type: Number, default: 0, min: 0, })
    evaluationCount: Number

    @Prop({ type: Number, default: 0, min: 0, })
    finalEvalCount: Number

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Student', array: true })
    students: [mongoose.Schema.Types.ObjectId]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ScienceFair' })
    scienceFairId: mongoose.Schema.Types.ObjectId

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', array: true })
    judges: [mongoose.Schema.Types.ObjectId]

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    addedBy: mongoose.Schema.Types.ObjectId

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const ProjectSchema = SchemaFactory.createForClass(Project)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
ProjectSchema.plugin(mongoosePaginate);