"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
// Routers
const authRouter = require("./routers/authRouter");
const jobRouter = require("./routers/jobRouter");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', authRouter);
app.use('/api', jobRouter);
app.get('/', (_req, res) => {
    res.json({ message: "Welcome to the Hirescape API" });
});
const PORT = process.env.PORT || 3000;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('MongoDB Database connected successfully..!!');
        app.listen(PORT, () => {
            console.log(`App Listening on Port ${PORT}`);
        });
    });
}
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
