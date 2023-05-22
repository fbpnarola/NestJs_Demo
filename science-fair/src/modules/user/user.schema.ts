import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { pagination_data } from "src/utils/pagination.constant";
import * as bcrypt from 'bcryptjs'

export type UserDocument = User & Document

@Schema({
    timestamps: true
})
export class User {
    @Prop({ type: String, required: true })
    firstName: String

    @Prop({ type: String, required: true })
    lastName: String

    @Prop({ type: String, unique: true, required: true })
    email: String

    @Prop()
    password: String

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School' })
    schoolId: mongoose.Schema.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ScienceFair' })
    scienceFairId: mongoose.Schema.Types.ObjectId

    @Prop({ type: Object, array: true })
    proficient_languages: Object[]

    @Prop()
    avatar: String

    @Prop({ type: String, default: null })
    resetPasswordToken: String

    @Prop()
    expireTokenTime: Date

    @Prop()
    userRole: Number

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    addedBy: mongoose.Schema.Types.ObjectId

    @Prop({ type: Boolean, default: true })
    isActive: Boolean

    @Prop({ type: Boolean, default: false })
    isDeleted: Boolean
}

export const UserSchema = SchemaFactory.createForClass(User)

mongoosePaginate.paginate.options = pagination_data.PAGINATE_OPTIONS;
UserSchema.plugin(mongoosePaginate);

// UserSchema1.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 10)
//     }
//     next();
// })
// UserSchema1.pre('findOneAndUpdate', async function (next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 10)
//     }
//     next();
// })
// export const UserSchema = UserSchema1;