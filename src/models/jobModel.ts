import mongoose, { Document, Schema } from 'mongoose';

interface IJob extends Document {
  title: string;
  company: string;
  salary: string;
  location: string;
  matchScore: number;
  requiredSkills: string[];
  createdBy: mongoose.Types.ObjectId; // Reference to the user who created the job
  applicants: mongoose.Types.ObjectId[]; // List of users who applied
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    salary: {
      type: String,
      required: [true, "Salary range is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: [0, "Match score must be at least 0"],
      max: [100, "Match score cannot exceed 100"],
    },
    requiredSkills: {
      type: [String],
      required: [true, "At least one skill is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model<IJob>('Job', jobSchema);

export default Job;
