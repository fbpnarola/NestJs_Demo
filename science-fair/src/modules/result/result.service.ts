import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Result, ResultDocument } from './result.schema';
import { paginate } from 'src/helper/paginate';
import { dataCheck } from '../../utils/data';
import { convertIntoCSV, fileDownload } from 'src/middleware/csvConvert.middleware';
import { Project, ProjectDocument } from '../project/project.schema';
import { ScienceFair, ScienceFairDocument } from '../science-fair/science-fair.schema';
import { Strand, StrandDocument } from '../strand/strand.schema';
import { Category, CategoryDocument } from '../category/category.schema';
import { School, SchoolDocument } from '../school/school.schema';

@Injectable()
export class ResultService {
    constructor(@InjectModel(Result.name) private readonly resultModel: PaginateModel<ResultDocument>,
        @InjectModel(Project.name) private readonly projectModel: PaginateModel<ProjectDocument>,
        @InjectModel(ScienceFair.name) private readonly scienceFairModel: PaginateModel<ScienceFairDocument>,
        @InjectModel(School.name) private readonly schoolModel: PaginateModel<SchoolDocument>,
        @InjectModel(Strand.name) private readonly strandModel: PaginateModel<StrandDocument>,
        @InjectModel(Category.name) private readonly categoryModel: PaginateModel<CategoryDocument>,
    ) { }

    async create(body, auth) {
        try {
            const { scienceFairId, projectId, score1, score2, score3, feedback } = body
            const checkCount = await this.projectModel.findById(projectId)
            if (!checkCount) {
                return { message: "Project Not Found!!" }
            } else {
                const PrevApprovedPendingResults = await this.resultModel.find({ $and: [{ projectId: projectId, status: { $ne: dataCheck.STATUS.REJECTED } }] });
                if (PrevApprovedPendingResults.length >= 3) {
                    return { message: "This project has been already evaluated by 3 judges, so you can not evaluate at this moment!!" }
                }
                const strand = await this.strandModel.findById(checkCount.strandId)
                let finalScore, result, judgesList = []
                judgesList = checkCount.judges;
                judgesList.push(auth._id)
                if (strand.strandName === dataCheck.STRAND['INDIGENOUS-WAYS']) {
                    finalScore = score3;
                    result = new this.resultModel({ scienceFairId, userId: auth._id, projectId, score3, finalScore: finalScore, feedback })
                }
                else {
                    finalScore = (score1 * 5) + (score2 * 5) + score3;
                    result = new this.resultModel({ scienceFairId, userId: auth._id, projectId, score1: (score1 * 5), score2: (score2 * 5), score3, finalScore: finalScore, feedback })

                }
                const check = await result.save();
                const ApprovedPendingResults = await this.resultModel.find({ $and: [{ projectId: projectId, status: { $ne: dataCheck.STATUS.REJECTED } }] });
                await this.projectModel.findByIdAndUpdate(projectId, { finalEvalCount: ApprovedPendingResults.length, judges: judgesList });

                if (!check) {
                    return { message: "Something went wrong!! Not able to add the data!" }
                }
                return { message: "Evaluation is added and waiting for an admin to approve it!!" }
            }
        } catch (error) {
            return { message: error.message }
        }
    }

    async getAllResult(body, auth) {
        try {
            const option = { ...body };
            if (!option.hasOwnProperty('query')) {
                option['query'] = {};
            }
            option.query['isDeleted'] = false;
            if (auth.userRole === 2) {
                const schoolCheck = await this.schoolModel.findOne({ _id: auth.schoolId });
                option.query['scienceFairId'] = schoolCheck.scienceFairId;
            }
            const result = await paginate(option, Result);
            return (result);
        } catch (error) {
            return { message: error.message }
        }
    }

    async projectData(scienceFairId, catId, strId) {
        const data = await this.projectModel.find(
            {
                $and: [
                    { scienceFairId: scienceFairId },
                    { averageScore: { $ne: 0 } },
                    { averageScore: { $ne: null } },
                    { categoryId: catId },
                    { strandId: strId },
                    { isDeleted: false },
                ]
            }
        )
            .sort({ averageScore: -1 })
            .populate('categoryId', 'name')
            .populate('students', 'firstName lastName')
            .select('-isActive -isDeleted -createdAt -updatedAt -__v')

        for (let i = 0; i < data.length; i++) {
            if (data[i]) {
                await this.projectModel.findOneAndUpdate({ _id: data[i]._id }, { rank: 0 })
            }
        }
        if (data.length === 1) {
            await this.projectModel.findByIdAndUpdate(data[0]._id, { rank: 1 })
        }
        else {
            for (let i = 0, j = 1; i < data.length, j < data.length; i++) {
                if (data[i + 1]) {
                    if (data[i].averageScore === data[i + 1].averageScore) {
                        await this.projectModel.findByIdAndUpdate(data[i]._id, { rank: j })
                        await this.projectModel.findByIdAndUpdate(data[i + 1]._id, { rank: j })
                    }
                    else {
                        if (j < data.length) {
                            await this.projectModel.findByIdAndUpdate(data[i]._id, { rank: j })
                            j++
                            await this.projectModel.findByIdAndUpdate(data[i + 1]._id, { rank: j })
                        }
                        else if (j === data.length) {
                            break;
                        }
                    }
                }
                else {
                    j = data.length + 1
                    i = data.length + 1
                }
            }
        }

        const data1 = await this.projectModel.find(
            {
                $and: [
                    { scienceFairId: scienceFairId },
                    { averageScore: { $ne: 0 } },
                    { averageScore: { $ne: null } },
                    { categoryId: catId },
                    { strandId: strId },
                    { rank: { $gt: 0 } },
                    { isDeleted: false }
                ]
            }
        )
            .sort({ averageScore: -1 })
            .populate('categoryId', 'name')
            .populate('scienceFairId', 'name')
            .populate('schoolId', 'name schoolCode')
            .populate('students', 'firstName lastName')
            .populate('judges', 'firstName lastName')
            .select('-isActive -isDeleted -createdAt -updatedAt -__v')

        return data1
    }

    async allProjectData(scienceFairId, catId, strId) {
        const data = await this.projectModel.find(
            {
                $and: [
                    { scienceFairId: scienceFairId },
                    { averageScore: { $ne: 0 } },
                    { averageScore: { $ne: null } },
                    { categoryId: catId },
                    { strandId: strId },
                    { isDeleted: false },
                ]
            }
        )
            .sort({ averageScore: -1 })
            .populate('categoryId', 'name')
            .populate('scienceFairId', 'name')
            .populate('schoolId', 'name schoolCode')
            .populate('students', 'firstName lastName')
            .populate('judges', 'firstName lastName')
            .select('-isActive -isDeleted -createdAt -updatedAt -__v')

        return data
    }

    async averageScoreCal(id) {
        const countResults = await this.projectModel.findById(id)
        const resCount = await this.resultModel.find({ $and: [{ projectId: id }, { status: dataCheck.STATUS.APPROVED }] })
        if (resCount.length === 3) {
            let avg: any = 0, avgScore: any, judgeList = []
            resCount.forEach(judge => {
                judgeList.push(judge)
            });
            const result = await this.resultModel.find({ $and: [{ projectId: countResults._id }, { status: dataCheck.STATUS.APPROVED }] })
            result.forEach(res1 => {
                avg = avg + res1.finalScore
            });

            avgScore = avg / resCount.length
            await this.projectModel.findByIdAndUpdate(id, { averageScore: Math.round(avgScore), judges: judgeList })
            await this.projectData(countResults.scienceFairId, countResults.categoryId, countResults.strandId)
        }
    }

    async approveEvaluation(body, id) {
        try {
            const { projectId, status } = body;
            const possibleStatus = Object.values(dataCheck.STATUS);
            let message = 'Evaluation Request Approved!!'
            if (possibleStatus.indexOf(status) > -1) {
                const project = await this.projectModel.findById(projectId);
                let judgesList: any = project.judges
                const existingApprovedResults = await this.resultModel.find({ $and: [{ projectId: projectId }, { status: dataCheck.STATUS.APPROVED }] });
                const oldResultObj = await this.resultModel.findById(id);
                if (status === dataCheck.STATUS.APPROVED) {
                    if (existingApprovedResults.length < 3) {
                        if (judgesList.indexOf(oldResultObj.userId) === -1) {
                            judgesList.push(oldResultObj.userId);
                        }
                    } else {
                        return { message: "Sorry!! This result could not be approved as 3 results are already approved." }
                    }
                } else if (status === dataCheck.STATUS.REJECTED) {
                    let remainignJudges = judgesList.filter(j => j.toString() !== oldResultObj.userId.toString());
                    judgesList = remainignJudges;
                    message = 'Evaluation Request Rejected!!'
                } else {
                    if (judgesList.indexOf(oldResultObj.userId) === -1) {
                        judgesList.push(oldResultObj.userId);
                    }
                    message = 'Evaluation Request Needs Approval!!'
                }
                await this.resultModel.findByIdAndUpdate(id, { status: status });
                const ApprovedPendingResults = await this.resultModel.find({ $and: [{ projectId: projectId, status: { $ne: dataCheck.STATUS.REJECTED } }] });
                const ApprovedResults = await this.resultModel.find({ $and: [{ projectId: projectId, status: dataCheck.STATUS.APPROVED }] });
                const projectUpdateObj = { finalEvalCount: ApprovedPendingResults.length, judges: judgesList };
                if (ApprovedResults.length === 3) {
                    await this.averageScoreCal(projectId);
                } else {
                    projectUpdateObj['rank'] = 0;
                    projectUpdateObj['averageScore'] = 0;
                }
                await this.projectModel.findByIdAndUpdate(projectId, projectUpdateObj);
                return { message: message }
            } else {
                return { message: "Please pass valid status!!" }
            }
        } catch (error) {
            return { message: error.message }
        }
    }

    async getResultById(id) {
        try {
            const result = await this.resultModel.findOne({ _id: id })
                .select('-__v -createdAt -updatedAt -password')
            if (!result) {
                return { result: "Result not fount for this ID!!!" }
            }
            return { result: result }
        } catch (error) {
            return { message: error.message }
        }
    }

    async getAllScore(body) {
        try {
            const { scienceFairId } = body
            const IndigenousStrand = await this.strandModel.findOne({ strandName: dataCheck.STRAND['INDIGENOUS-WAYS'] })
            const EuroScienceStrand = await this.strandModel.findOne({ strandName: dataCheck.STRAND['EURO-SCIENCE'] })
            const Youth = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.YOUTH })
            const Junior = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.JUNIOR })
            const Senior = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.SENIOR })
            const Intermediate = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.INTERMEDIATE })

            const indigenousYouthProject = await this.allProjectData(scienceFairId, Youth._id, IndigenousStrand._id)

            const euroScienceYouthProject = await this.allProjectData(scienceFairId, Youth._id, EuroScienceStrand._id)

            const indigenousJuniorProject = await this.allProjectData(scienceFairId, Junior._id, IndigenousStrand._id)

            const euroScienceJuniorProject = await this.allProjectData(scienceFairId, Junior._id, EuroScienceStrand._id)

            const indigenousSeniorProject = await this.allProjectData(scienceFairId, Senior._id, IndigenousStrand._id)

            const euroScienceSeniorProject = await this.allProjectData(scienceFairId, Senior._id, EuroScienceStrand._id)

            const indigenousIntermediateProject = await this.allProjectData(scienceFairId, Intermediate._id, IndigenousStrand._id)

            const euroScienceIntermediateProject = await this.allProjectData(scienceFairId, Intermediate._id, EuroScienceStrand._id)


            const TopScores = {
                Youth: { indigenousYouthProject, euroScienceYouthProject },
                Junior: { indigenousJuniorProject, euroScienceJuniorProject },
                Senior: { indigenousSeniorProject, euroScienceSeniorProject },
                Intermediate: { indigenousIntermediateProject, euroScienceIntermediateProject }
            }
            return TopScores;
        } catch (error) {
            return { message: error.message }
        }
    }

    async getAllProject(body) {
        try {
            const option = { ...body };
            if (!option.hasOwnProperty('query')) {
                option['query'] = {};
            }
            option.query['averageScore'] = { $ne: 0 }
            option.query['rank'] = { $ne: 0 }
            option.query['averageScore'] = { $ne: null }
            const project = await paginate(option, Project);

            return project;
        } catch (error) {
            return { message: error.message }
        }
    }

    async getTopScore(body) {
        try {
            const { scienceFairId } = body
            const IndigenousStrand = await this.strandModel.findOne({ strandName: dataCheck.STRAND['INDIGENOUS-WAYS'] })
            const EuroScienceStrand = await this.strandModel.findOne({ strandName: dataCheck.STRAND['EURO-SCIENCE'] })
            const Youth = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.YOUTH })
            const Junior = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.JUNIOR })
            const Senior = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.SENIOR })
            const Intermediate = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.INTERMEDIATE })

            const indigenousYouthProject = await this.projectData(scienceFairId, Youth._id, IndigenousStrand._id)

            const euroScienceYouthProject = await this.projectData(scienceFairId, Youth._id, EuroScienceStrand._id)

            const indigenousJuniorProject = await this.projectData(scienceFairId, Junior._id, IndigenousStrand._id)

            const euroScienceJuniorProject = await this.projectData(scienceFairId, Junior._id, EuroScienceStrand._id)

            const indigenousSeniorProject = await this.projectData(scienceFairId, Senior._id, IndigenousStrand._id)

            const euroScienceSeniorProject = await this.projectData(scienceFairId, Senior._id, EuroScienceStrand._id)

            const indigenousIntermediateProject = await this.projectData(scienceFairId, Intermediate._id, IndigenousStrand._id)

            const euroScienceIntermediateProject = await this.projectData(scienceFairId, Intermediate._id, EuroScienceStrand._id)


            const TopScores = {
                Youth: { indigenousYouthProject, euroScienceYouthProject },
                Junior: { indigenousJuniorProject, euroScienceJuniorProject },
                Senior: { indigenousSeniorProject, euroScienceSeniorProject },
                Intermediate: { indigenousIntermediateProject, euroScienceIntermediateProject }
            }
            return TopScores;
        } catch (error) {
            return { message: error.message }
        }
    }

    async convertToCSVFile(body) {
        try {
            const { scienceFairId } = body
            const scienceFair = await this.scienceFairModel.findOne({ _id: scienceFairId })

            if (scienceFair.isLocked === false) {
                return { message: 'Science Fair is still unlocked!! Cannot download the top score file now!!' }
            }
            else {

                const IndigenousStrand = await this.strandModel.findOne({ strandName: dataCheck.STRAND['INDIGENOUS-WAYS'] })
                const EuroScienceStrand = await this.strandModel.findOne({ strandName: dataCheck.STRAND['EURO-SCIENCE'] })
                const Youth = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.YOUTH })
                const Junior = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.JUNIOR })
                const Senior = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.SENIOR })
                const Intermediate = await this.categoryModel.findOne({ name: dataCheck.CATEGORY.INTERMEDIATE })

                const indigenousYouthProject = await this.allProjectData(scienceFairId, Youth._id, IndigenousStrand._id)

                const euroScienceYouthProject = await this.allProjectData(scienceFairId, Youth._id, EuroScienceStrand._id)

                const indigenousJuniorProject = await this.allProjectData(scienceFairId, Junior._id, IndigenousStrand._id)

                const euroScienceJuniorProject = await this.allProjectData(scienceFairId, Junior._id, EuroScienceStrand._id)

                const indigenousSeniorProject = await this.allProjectData(scienceFairId, Senior._id, IndigenousStrand._id)

                const euroScienceSeniorProject = await this.allProjectData(scienceFairId, Senior._id, EuroScienceStrand._id)

                const indigenousIntermediateProject = await this.allProjectData(scienceFairId, Intermediate._id, IndigenousStrand._id)

                const euroScienceIntermediateProject = await this.allProjectData(scienceFairId, Intermediate._id, EuroScienceStrand._id)

                let csvData = [], stud = "", jud = "", studid = "", judid = ""

                if (indigenousYouthProject.length === 0 && euroScienceYouthProject.length === 0 &&
                    indigenousJuniorProject.length === 0 && euroScienceJuniorProject.length === 0 &&
                    indigenousSeniorProject.length === 0 && euroScienceSeniorProject.length === 0 &&
                    indigenousIntermediateProject.length === 0 && euroScienceIntermediateProject.length === 0) {
                    return { message: 'Cannot download the empty file!!' }
                }
                else {
                    if (indigenousYouthProject.length === 0) {
                        csvData.push({
                            "Category": Youth.name, "Strand": IndigenousStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        indigenousYouthProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Youth.name, "Strand": IndigenousStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "" || "", "Score": project.averageScore || "" || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    if (euroScienceYouthProject.length === 0) {
                        csvData.push({
                            "Category": Youth.name, "Strand": EuroScienceStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        euroScienceYouthProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Youth.name, "Strand": EuroScienceStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "", "Score": project.averageScore || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    if (indigenousJuniorProject.length === 0) {
                        csvData.push({
                            "Category": Junior.name, "Strand": IndigenousStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        indigenousJuniorProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Junior.name, "Strand": IndigenousStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "", "Score": project.averageScore || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    if (euroScienceJuniorProject.length === 0) {
                        csvData.push({
                            "Category": Junior.name, "Strand": EuroScienceStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        euroScienceJuniorProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Junior.name, "Strand": EuroScienceStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "", "Score": project.averageScore || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    if (indigenousSeniorProject.length === 0) {
                        csvData.push({
                            "Category": Senior.name, "Strand": IndigenousStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        indigenousSeniorProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Senior.name, "Strand": IndigenousStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "", "Score": project.averageScore || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    if (euroScienceSeniorProject.length === 0) {
                        csvData.push({
                            "Category": Senior.name, "Strand": EuroScienceStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        euroScienceSeniorProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Senior.name, "Strand": EuroScienceStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "", "Score": project.averageScore || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    if (indigenousIntermediateProject.length === 0) {
                        csvData.push({
                            "Category": Intermediate.name, "Strand": IndigenousStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        indigenousIntermediateProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Intermediate.name, "Strand": IndigenousStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "", "Score": project.averageScore || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    if (euroScienceIntermediateProject.length === 0) {
                        csvData.push({
                            "Category": Intermediate.name, "Strand": EuroScienceStrand.strandName,
                            "Project Code": "", "Project Name": "", "Description": "", "School Code": "", "School": "",
                            "Rank": "", "Score": "", "Student_ID": "", "Students": "", "Judges_ID": "", "Judges": ""
                        })
                    }
                    else {
                        euroScienceIntermediateProject.forEach(project => {
                            project.students.forEach(element1 => {
                                studid = studid + element1['_id'] + ','
                                stud = stud + element1['firstName'] + ' ' + element1['lastName'] + ','
                            });
                            project.judges.forEach(element2 => {
                                judid = judid + element2['_id'] + ','
                                jud = jud + element2['firstName'] + ' ' + element2['lastName'] + ','
                            });
                            csvData.push({
                                "Category": Intermediate.name, "Strand": EuroScienceStrand.strandName,
                                "Project Code": project.projectCode, "Project Name": project.name, "Description": project.description,
                                "School Code": project.schoolId['schoolCode'], "School": project.schoolId['name'],
                                "Rank": project.rank || "", "Score": project.averageScore || "",
                                "Student_ID": studid || 0, "Students": stud || 0, "Judges_ID": judid || 0, "Judges": jud || 0
                            })
                            studid = ""
                            judid = ""
                            stud = ""
                            jud = ""
                        });
                    }

                    const fileNM = scienceFair.name.replace(/\s/g, '_') + "_" + "Score_List"
                    await convertIntoCSV(csvData, fileNM)
                    return { fileName: `${fileNM}.csv` }
                }
            }
        } catch (error) {
            return { message: error.message }
        }
    }

    async rawResultCSV(auth, id) {
        try {
            const scienceFair = await this.scienceFairModel.findById(id)
            let data = []
            if (auth.userRole === 2) {
                const schoolCheck = await this.schoolModel.findOne({ _id: auth.schoolId });
                data = await this.resultModel.find()
                    .select('-__v -createdAt -updatedAt -isActive -isDeleted')
                    .where('isDeleted').equals(false)
                    .where('scienceFairId').equals(schoolCheck.scienceFairId)
                    .populate('projectId', 'name')
                    .populate('categoryId', 'name')
                    .populate('strandId', 'strandName')
                    .populate('userId', 'firstName lastName')
            }
            data = await this.resultModel.find()
                .select('-__v -createdAt -updatedAt -isActive -isDeleted')
                .where('isDeleted').equals(false)
                .where('scienceFairId').equals(id)
                .populate('projectId', 'name projectCode')
                .populate('userId', 'firstName lastName')

            if (!data) {
                return { message: "" }
            }
            let csvData = []

            if (data.length === 0) {
                return { message: 'Cannot download the empty file!!' }
            }
            data.forEach(element => {
                let judgeNm = element.userId.firstName + ' ' + element.userId.lastName
                csvData.push({
                    "Project Code": element.projectId.projectCode, "Project Name": element.projectId.name,
                    "Judge_ID": element.userId._id.toString(), "Judge Name": judgeNm,
                    "Feedback": element.feedback || "", "Score1": element.score1, "Score2": element.score2,
                    "Score3": element.score3, "Total Score": element.finalScore, "Status": element.status
                })
                judgeNm = ""
            });

            const fileNM = scienceFair.name.replace(/\s/g, '_') + "_" + '_Raw-ResultList'
            await convertIntoCSV(csvData, fileNM)
            return { fileName: `${fileNM}.csv` }

        } catch (error) {
            return { message: error.message }
        }
    }
}
