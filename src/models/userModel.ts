import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  createdJobs: mongoose.Types.ObjectId[]; // Jobs created by the user
  appliedJobs: mongoose.Types.ObjectId[]; // Jobs the user has applied for
  isAdmin: boolean; // Admin field
}

const userSchema = new Schema<IUser>(
  {
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
    isAdmin: {
      type: Boolean,
      default: false, // By default, all users are NOT admin
    },
    createdJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to the Job model
      }
    ],
    appliedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to the Job model
      }
    ]
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
