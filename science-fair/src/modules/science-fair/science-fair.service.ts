import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { paginate } from 'src/helper/paginate';
import { Project, ProjectDocument } from '../project/project.schema';
import { Result, ResultDocument } from '../result/result.schema';
import { School, SchoolDocument } from '../school/school.schema';
import { Student, StudentDocument } from '../student/student.schema';
import { User, UserDocument } from '../user/user.schema';
import { CreateScienceFairDto } from './dto/createScienceFair.dto';
import { ScienceFair, ScienceFairDocument } from './science-fair.schema';

@Injectable()
export class ScienceFairService {
  constructor(@InjectModel(ScienceFair.name) private scienceFairModel: PaginateModel<ScienceFairDocument>,
    @InjectModel(Student.name) private studentModel: PaginateModel<StudentDocument>,
    @InjectModel(Project.name) private projectModel: PaginateModel<ProjectDocument>,
    @InjectModel(Result.name) private resultModel: PaginateModel<ResultDocument>,
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
    @InjectModel(School.name) private schoolModel: PaginateModel<SchoolDocument>,
  ) {
  }

  async create(data: CreateScienceFairDto, file?) {
    try {
      const model = new this.scienceFairModel();
      model.name = data.name
      model.date = data.date
      model.location1 = data.location
      model.description = data.description
      if (file) {
        model.image = file
      }
      model.image = "science-fair.webp"
      const scienceFair = await model.save();
      if (scienceFair) {
        return { message: "Science Fair added successfully!!" }
      }
      return { message: "Science Fair not added!!" }
    } catch (error) {
      return { message: error.message }
    }
  }

  async update(body, id, file?) {
    try {
      if (file) {
        body.image = file
      }
      console.log('Body data ==>', body)
      const updateScienceFair = await this.scienceFairModel.findOneAndUpdate({ _id: id }, body)
      if (updateScienceFair !== null) {
        return { message: "Science Fair updated successfully!!" };
      }
      return { message: "Science Fair not updated!!" };
    } catch (error) {
      return { message: error.message }
    }
  }

  async delete(id) {
    try {
      const status = await this.scienceFairModel.findOne({ _id: id })
      if (!status) {
        return { message: "This User is not exist!!" };
      }
      const checkStudent = await this.studentModel.find({ $and: [{ scienceFairId: status._id }, { isDeleted: false }] })
      const checkUser = await this.userModel.find({ $and: [{ scienceFairId: status._id }, { isDeleted: false }] })
      const checkProject = await this.projectModel.find({ $and: [{ scienceFairId: status._id }, { isDeleted: false }] })
      if (checkProject.length !== 0 && checkStudent.length !== 0 && checkUser.length !== 0) {
        return { message: "You cannot delete the science fair which already has assigned students, projects or users!!" };
      }
      if (status.isDeleted === true) {
        return { message: "This Science Fair is already deleted!!!" };
      }

      const check = await this.scienceFairModel.findOneAndUpdate({ _id: id },
        {
          isActive: false,
          isDeleted: true
        })
      if (!check) {
        return { message: "Science not deleted!!" };
      }
      return { message: "Science Fair Deleted Successfully!!" };
    } catch (error) {
      return { message: error.message };
    }
  }

  async getScienceFairById(id) {
    try {
      const getById = await this.scienceFairModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
      if (getById) {
        return getById;
      }
      return { message: "No data found!!" };
    } catch (error) {
      return { message: error.message };
    }
  }

  async getData(body) {
    try {
      const option = { ...body };
      if (!option.hasOwnProperty('query')) {
        option['query'] = {};
      }
      option.query['isDeleted'] = false;
      const scienceFairData = await paginate(option, this.scienceFairModel)
      if (!scienceFairData) {
        return { message: "No Data!!" }
      }
      return scienceFairData;
    } catch (error) {
      return { message: error.message };
    }
  }

  async lockScienceFair(id) {
    try {
      let toggle = true
      const locked = await this.scienceFairModel.findOne({ $and: [{ _id: id }, { isDeleted: false }] })
      if (locked.isLocked === true) {
        toggle = false
      }
      const check = await this.scienceFairModel.findOneAndUpdate({ _id: id },
        {
          isLocked: toggle
        })
      if (!check) {
        return { message: "Science Fair not fouynd!!" }
      }
      if (toggle === true) {
        return { message: `Science Fair is Locked Now!!` }
      }
      else {
        return { message: `Science Fair is Unlocked Now!!` }
      }

    } catch (error) {
      return { message: error.message }
    }
  }

  async totalCount(auth, id) {
    try {
      const resJson = { student: 0, project: 0 };
      const countFilter: any = [
        { scienceFairId: id }, { isDeleted: false }
      ]
      if (auth.userRole === 1) {
        const school = await this.schoolModel.find({ $and: countFilter });
        const userFilter = countFilter
        userFilter.push({ userRole: { $ne: 1 } })
        const user = await this.userModel.find({ $and: userFilter });
        const results = await this.resultModel.find({ $and: countFilter })
        const topScore = await this.projectModel.find({
          $and: [{ scienceFairId: id }, { isDeleted: false },
          { rank: { $lt: 4 } }, { averageScore: { $ne: 0 } }, { averageScore: { $ne: null } }]
        })
        resJson['school'] = school.length;
        resJson['users'] = user.length;
        resJson['result'] = results.length;
        resJson['topScore'] = topScore.length
      }

      if (auth.userRole === 2) {
        countFilter.push({ schoolId: auth.schoolId });
      }

      const student = await this.studentModel.find({ $and: countFilter })
      const project = await this.projectModel.find({ $and: countFilter })
      resJson['student'] = student.length;
      resJson['project'] = project.length;
      return resJson;
    } catch (error) {
      return { message: error.message };
    }
  }

  async getScienceFairPublic() {
    try {
      const option: any = {};
      option.query['isDeleted'] = false;
      const scienceFairData = await paginate(option, this.scienceFairModel)
      if (!scienceFairData) {
        return { message: "No Data!!" }
      }
      return scienceFairData;
    } catch (error) {
      return { message: error.message };
    }
  }
}