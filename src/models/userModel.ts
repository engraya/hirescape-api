import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  verified: boolean;
  verificationCode: string | undefined;
  forgotPasswordCode: string | undefined;
  verificationCodeValidation : Number | undefined
  forgotPasswordCodeValidation: Number | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "Email must be unique"],
      minlength: [5, "Eamil must have 5 characters"],
      lowercase: true, 
      trim: true, 
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'], 
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be 6 characters in Length"],
      trim : true,
      select : false
    },
    verified: {
      type: Boolean,
      default: false, 
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
        type: Number,
        select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a User model based on the schema
const User = mongoose.model<IUser>('User', userSchema);

export default User;
