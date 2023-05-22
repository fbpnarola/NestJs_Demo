import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../modules/user/user.schema';
import { user } from './user.seeder'
import { Seeder } from 'nestjs-seeder';

@Injectable()
export class UserSeederService implements Seeder {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async seed(): Promise<any> {
        let UpdatedUser
        for (let userIndex = 0; userIndex < user.length; userIndex++) {
            const user1 = user[userIndex];
            UpdatedUser = await this.userModel.findByIdAndUpdate(user1._id, user1, { upsert: true });
        }
        return UpdatedUser;
    }
    async drop(): Promise<any> {
        // return await this.userModel.deleteMany({});
    }
}