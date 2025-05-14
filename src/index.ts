import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from "dotenv"
import mongoose from 'mongoose';
dotenv.config();
import cors from "cors"
import cookieParser from 'cookie-parser';
import helmet from 'helmet';


const app = express();

// Routers
const authRouter = require("./routers/authRouter");
const jobRouter = require("./routers/jobRouter")


app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
app.use(helmet());
app.use(cookieParser());



app.use('/api/auth', authRouter);
app.use('/api', jobRouter);
app.get('/', (_req : Request, res : Response) => {
    res.json({ message : "Welcome to the Hirescape API" });
});


app.listen(process.env.PORT, () => {
    console.log(`App Listening on Port ${process.env.PORT}`)
});

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('MongoDB Database connected successfully..!!'))
      .catch(err => console.error('MongoDB connection error:', err));
  } else {
    throw new Error('MONGODB_URI environment variable is not defined');
  }