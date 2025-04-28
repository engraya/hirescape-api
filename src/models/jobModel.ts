import mongoose, { Document, Schema } from 'mongoose';

interface IJob extends Document {
  title: string;
  company: string;
  salary: string;
  location: string;
  description: string;  // Replacing matchScore with job description
  requiredSkills: string[];
  jobType: string;  // Full-time, part-time, etc.
  experienceLevel: string;  // Junior, Mid, Senior
  industry: string;  // Industry of the job
  applicationDeadline: Date;  // Deadline for applying to the job
  benefits: string[];  // Optional benefits the company provides
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
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      required: [true, "At least one skill is required"],
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: ['full-time', 'part-time', 'contract', 'internship'],  // Limited to common job types
    },
    experienceLevel: {
      type: String,
      required: [true, "Experience level is required"],
      enum: ['junior', 'mid', 'senior'],  // Common experience levels
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
    benefits: {
      type: [String],
      default: [],  // Empty array by default
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
    timestamps: true,  // Automatically adds createdAt and updatedAt
  }
);

const Job = mongoose.model<IJob>('Job', jobSchema);

export default Job;
