import mongoose, { Document } from 'mongoose';
interface IJob extends Document {
    title: string;
    company: string;
    salary: string;
    location: string;
    description: string;
    jobType: string;
    experienceLevel: string;
    industry: string;
    applicationDeadline: Date;
    createdBy: mongoose.Types.ObjectId;
    applicants: mongoose.Types.ObjectId[];
}
declare const Job: mongoose.Model<IJob, {}, {}, {}, mongoose.Document<unknown, {}, IJob> & IJob & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Job;
