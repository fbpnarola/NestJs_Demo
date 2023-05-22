import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { User, UserDocument } from './user.schema';
import { dataCheck } from '../../utils/data';
import * as bcrypt from 'bcryptjs'
import config from 'src/config/config';
import { paginate } from 'src/helper/paginate';
import { School, SchoolDocument } from '../school/school.schema';
import { ScienceFair, ScienceFairDocument } from '../science-fair/science-fair.schema';
import { Project, ProjectDocument } from '../project/project.schema';
import { Result, ResultDocument } from '../result/result.schema';
import { convertIntoCSV } from 'src/middleware/csvConvert.middleware';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
    @InjectModel(School.name) private schoolModel: PaginateModel<SchoolDocument>,
    @InjectModel(Result.name) private resultModel: PaginateModel<ResultDocument>,
    @InjectModel(ScienceFair.name) private scienceFairModel: PaginateModel<ScienceFairDocument>,
    @InjectModel(Project.name) private projectModel: PaginateModel<ProjectDocument>,
    // @InjectModel(Result.name) private resultModel: PaginateModel<ResultDocument>
  ) { }
  async hashPassword(password: String, salt_rounds = config.SALT_ROUNDS): Promise<string> {
    const salt: number = +salt_rounds
    return bcrypt.hash(password, salt);
  }
  async create(data: CreateUserDto, user, fileName?: String) {
    try {
      const model = new this.userModel();
      const { firstName, lastName, email, password, userRole, schoolId, scienceFairId, proficient_languages } = data

      const checkUser = await this.userModel.findOne({ email })
      if (checkUser) {
        return "User already exits!!"
      }
      model.password = await this.hashPassword(password)
      model.firstName = firstName
      model.lastName = lastName
      model.email = email
      model.userRole = userRole
      model.scienceFairId = scienceFairId
      model.addedBy = user._id
      if (schoolId) {
        model.schoolId = schoolId
      }
      if (proficient_languages) {
        model.proficient_languages = proficient_languages
      }
      if (fileName) {
        model.avatar = fileName
      }
      model.avatar = "def.png"
      const userData = await model.save();
      if (userData) {
        return { message: "User added successfully!!" }
      }
      return { message: "User not added!!" }
    } catch (error) {
      return { message: error.message }
    }
  }

  async update(body, id, file?) {
    try {
      if (file) {
        body.avatar = file
      }
      if (body.hasOwnProperty('password')) {
        const hash = await this.hashPassword(body.password)
        body.password = hash
      }
      const updateUser = await this.userModel.findOneAndUpdate({ _id: id }, body)
      if (updateUser !== null) {
        return { message: "User updated successfully!!" };
      }
      return { message: "User not updated!!" };
    } catch (error) {
      return { message: error.message }
    }
  }

  async delete(id, auth) {
    try {
      const status = await this.userModel.findOne({ _id: id })
      if (!status) {
        return { message: "This User is not exist!!" };
      }

      if (auth.userRole === 1) {
        const checkUser = await this.userModel.find({ $and: [{ addedBy: id }, { isDeleted: false }] })
        if (checkUser.length !== 0) {
          return { message: "You cannot delete the admin who added other users!!" };
        }
      }
      if (auth.userRole === 3) {
        const checkUser = await this.resultModel.find({ userId: id })
        if (checkUser.length !== 0) {
          return { message: "You cannot delete the judge who evaluated projects!!" };
        }
      }
      if (auth.userRole === 2) {
        const checkProject = await this.projectModel.find({ addedBy: id })
        if (checkProject.length !== 0) {
          return { message: "You cannot delete the school admin who has assigned projects!!" };
        }
      }

      if (status.isDeleted === true) {
        return { message: "This User is already deleted!!!" };
      }
      else {
        const check = await this.userModel.findOneAndRemove({ _id: id })
        if (!check) {
          return { message: "User is not deleted!!" };
        }
        return { message: `User Deleted Successfully!!` };
      }
    } catch (error) {
      return { message: error.message };
    }
  }


  async getUserById(id) {
    try {
      const getById = await this.userModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
      if (getById) {
        return getById;
      }
      return { message: "No data found!!" }

    } catch (error) {
      return { message: error.message }
    }
  }

  async getData(body) {
    try {
      const option = { ...body };
      if (!option.hasOwnProperty('query')) {
        option['query'] = {};
      }
      option.query['addedBy'] = { $ne: null }

      const userData = await paginate(option, this.userModel)
      if (!userData) {
        return { message: "No Data!!" };
      }
      return userData;
    } catch (error) {
      return { message: error.message }
    }
  }

  async userCSV(auth, id) {
    try {
      const scienceFair = await this.scienceFairModel.findById(id)
      let data = await this.userModel.find()
        .select('-__v -createdAt -updatedAt -isActive -isDeleted')
        .populate('schoolId', 'name')
        .where('addedBy').equals(auth._id)
        .where('isDeleted').equals(false)
        .where('scienceFairId').equals(auth._id)
      if (!data) {
        return { message: "Science fair not found!!" }
      }
      let csvData = []

      if (data.length === 0) {
        return { message: 'Cannot download the empty file!!' }
      }
      data.forEach(element => {
        let role, sch = "", lang = ""
        if (element.userRole === dataCheck.ROLE.ADMIN) {
          role = 'Admin'
        }
        if (element.userRole === dataCheck.ROLE['SCHOOL-ADMIN']) {
          role = 'School Admin'
          sch = element.schoolId['name']
        }
        if (element.userRole === dataCheck.ROLE.JUDGE) {
          role = 'Judge'
          element.proficient_languages.forEach(element1 => {
            lang = lang + element1['value'] + ","
          });

        }
        csvData.push({
          "User Id ": element._id.toString(), "User's firstname": element.firstName, "User's lastname": element.lastName,
          "Email": element.email, "User Role": role, "School": sch, "Proficient Languages": lang
        })
      });

      const fileNM = scienceFair.name.replace(/\s/g, '_') + "_" + '_UserList'
      await convertIntoCSV(csvData, fileNM)
      return { fileName: `${fileNM}.csv` }

    } catch (error) {
      return { message: error.message }
    }
  }
}