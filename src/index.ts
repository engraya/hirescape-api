import express, { Request, Response } from 'express';
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


const PORT = process.env.PORT || 3000;

async function start() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Database connected successfully..!!');
    app.listen(PORT, () => {
        console.log(`App Listening on Port ${PORT}`)
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
