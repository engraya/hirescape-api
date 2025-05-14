import mongoose, { Document, Schema } from 'mongoose';

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
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: ['full-time', 'part-time', 'contract', 'internship'],
    },
    experienceLevel: {
      type: String,
      required: [true, "Experience level is required"],
      enum: ['junior', 'mid', 'senior'],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model<IJob>('Job', jobSchema);

export default Job;
