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
const jobRouter = require("./routers/jobRouter");
import aiRouter from "./routers/aiRouter";


const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/api/auth', authRouter);
app.use('/api', jobRouter);
app.use('/api/ai', aiRouter);
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
