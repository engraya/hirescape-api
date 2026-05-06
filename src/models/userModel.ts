import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  createdJobs: mongoose.Types.ObjectId[];
  appliedJobs: mongoose.Types.ObjectId[];
  isAdmin: boolean;
  skills: string[];
  experienceSummary: string;
  currentTitle: string;
  education: string;
  resumeText: string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: [true, "Email must be unique"],
    minlength: [5, "Email must have 5 characters"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be 6 characters in length"],
    trim: true,
    select: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  }],
  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  }],
  skills: {
    type: [String],
    default: [],
  },
  experienceSummary: {
    type: String,
    default: '',
  },
  currentTitle: {
    type: String,
    default: '',
  },
  education: {
    type: String,
    default: '',
  },
  resumeText: {
    type: String,
    default: '',
    select: false,
  },
}, { timestamps: true });

const User = mongoose.model<IUser>('User', userSchema);
export default User;
