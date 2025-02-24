import express, { Request, Response } from 'express';
import dotenv from "dotenv"
import mongoose from 'mongoose';
dotenv.config();

// Routers
const authRouter = require('./routers/authRouter');

const cors = require('cors')
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();




app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended : true }));


app.use('/api/auth', authRouter);
app.get('/', (_req : Request, res : Response) => {
    res.json({ message : "Hello from Express"})
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