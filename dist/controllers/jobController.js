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
exports.removeJobFromApplied = exports.deleteOwnJob = exports.getUserAppliedJobs = exports.getUserCreatedJobs = exports.applyForJob = exports.deleteJob = exports.updateJob = exports.createJob = exports.getJobById = exports.getAllJobs = void 0;
const jobModel_1 = __importDefault(require("../models/jobModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get all jobs
const getAllJobs = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobs = yield jobModel_1.default.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'email')
            .populate('applicants', 'email');
        res.status(200).json({ success: true, jobs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve jobs' });
    }
});
exports.getAllJobs = getAllJobs;
// Get job by ID
const getJobById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield jobModel_1.default.findById(req.params.id)
            .populate('createdBy', 'email')
            .populate('applicants', 'email');
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, job });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve job' });
    }
});
exports.getJobById = getJobById;
// Create a new job
const createJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Destructure the job fields from the request body (excluding requiredSkills and benefits)
        const { title, company, salary, location, description, jobType, experienceLevel, industry, applicationDeadline } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Assuming user info is attached to req.user (e.g., from JWT middleware)
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // Validate required fields
        if (!title || !company || !salary || !location || !description || !jobType || !experienceLevel || !industry || !applicationDeadline) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        // Create and save the new job object
        const newJob = new jobModel_1.default({
            title,
            company,
            salary,
            location,
            description,
            jobType,
            experienceLevel,
            industry,
            applicationDeadline,
            createdBy: userId
        });
        const savedJob = yield newJob.save();
        // Optionally: Update the user's createdJobs array with the new job's ID
        yield userModel_1.default.findByIdAndUpdate(userId, {
            $push: { createdJobs: savedJob._id }
        });
        res.status(201).json({ success: true, message: 'Job created successfully', job: savedJob });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create job' });
    }
});
exports.createJob = createJob;
// Update a job (only creator can update)
const updateJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const jobId = req.params.id;
        // Find the job by ID
        const job = yield jobModel_1.default.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        // Check if the user is authorized to update this job
        if (job.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this job' });
        }
        // Destructure only existing fields
        const { title, company, salary, location, description, jobType, experienceLevel, industry, applicationDeadline } = req.body;
        // Prepare the fields to be updated
        const updateFields = {};
        if (title)
            updateFields.title = title;
        if (company)
            updateFields.company = company;
        if (salary)
            updateFields.salary = salary;
        if (location)
            updateFields.location = location;
        if (description)
            updateFields.description = description;
        if (jobType)
            updateFields.jobType = jobType;
        if (experienceLevel)
            updateFields.experienceLevel = experienceLevel;
        if (industry)
            updateFields.industry = industry;
        if (applicationDeadline)
            updateFields.applicationDeadline = applicationDeadline;
        // Update the job document
        const updatedJob = yield jobModel_1.default.findByIdAndUpdate(jobId, updateFields, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, message: 'Job updated successfully', job: updatedJob });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update job' });
    }
});
exports.updateJob = updateJob;
// Delete a job (only creator can delete)
const deleteJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Assuming req.user is populated from authentication middleware
        const job = yield jobModel_1.default.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        if (job.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this job' });
        }
        yield jobModel_1.default.findByIdAndDelete(req.params.id);
        // Remove job from user's createdJobs list
        yield userModel_1.default.findByIdAndUpdate(userId, { $pull: { createdJobs: req.params.id } });
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
});
exports.deleteJob = deleteJob;
// Apply for a job
const applyForJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Assuming req.user is populated from authentication middleware
        const jobId = req.params.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const job = yield jobModel_1.default.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        // Check if user has already applied
        if (job.applicants.includes(new mongoose_1.default.Types.ObjectId(userId))) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }
        // Add user to job's applicants list
        yield jobModel_1.default.findByIdAndUpdate(jobId, { $push: { applicants: userId } });
        // Add job to user's appliedJobs list
        yield userModel_1.default.findByIdAndUpdate(userId, { $push: { appliedJobs: jobId } });
        res.status(200).json({ success: true, message: 'Applied to job successfully..!' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to apply for job' });
    }
});
exports.applyForJob = applyForJob;
// Get jobs created by the logged-in user
const getUserCreatedJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Assuming `req.user` is set by the auth middleware
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const createdJobs = yield jobModel_1.default.find({ createdBy: userId }).populate('applicants', 'email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobs: createdJobs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve created jobs' });
    }
});
exports.getUserCreatedJobs = getUserCreatedJobs;
// Get jobs the user has applied for
const getUserAppliedJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Assuming `req.user` is set by the auth middleware
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const appliedJobs = yield jobModel_1.default.find({ applicants: userId }).populate('createdBy', 'email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobs: appliedJobs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve applied jobs' });
    }
});
exports.getUserAppliedJobs = getUserAppliedJobs;
// Delete a job (Only if the user is the creator)
const deleteOwnJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const job = yield jobModel_1.default.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        // Check if the logged-in user is the creator
        if (job.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own job' });
        }
        yield jobModel_1.default.findByIdAndDelete(req.params.id);
        if (userId) {
            yield userModel_1.default.findByIdAndUpdate(userId, { $pull: { createdJobs: req.params.id } });
        }
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
});
exports.deleteOwnJob = deleteOwnJob;
// Remove a job from user's applied jobs list
const removeJobFromApplied = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        yield userModel_1.default.findByIdAndUpdate(userId, { $pull: { appliedJobs: req.params.id } });
        yield jobModel_1.default.findByIdAndUpdate(req.params.id, { $pull: { applicants: userId } });
        res.status(200).json({ success: true, message: 'Job removed from applied list' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove job from applied list' });
    }
});
exports.removeJobFromApplied = removeJobFromApplied;
