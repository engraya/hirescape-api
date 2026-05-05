import mongoose, { Document } from 'mongoose';
interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    verified: boolean;
    createdJobs: mongoose.Types.ObjectId[];
    appliedJobs: mongoose.Types.ObjectId[];
    isAdmin: boolean;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
