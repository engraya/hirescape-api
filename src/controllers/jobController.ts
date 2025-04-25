import { Request, Response } from 'express';
import Job from '../models/jobModel';
import User from '../models/userModel';
import mongoose from 'mongoose';

// Get all jobs
export const getAllJobs = async (_req: Request, res: Response) => {
    try {
        const jobs = await Job.find().populate('createdBy', 'email').populate('applicants', 'email');
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve jobs' });
    }
};

// Get job by ID
export const getJobById = async (req: Request, res: Response) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('createdBy', 'email')
            .populate('applicants', 'email');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve job' });
    }
};

// Create a new job
export const createJob = async (req: Request, res: Response) => {
    try {
        const { title, company, salary, location, matchScore, requiredSkills } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Create and save the job
        const newJob = new Job({ title, company, salary, location, matchScore, requiredSkills, createdBy: userId });
        const savedJob = await newJob.save();

        // Update the user's createdJobs array with the full job object
        await User.findByIdAndUpdate(
            userId,
            { $push: { createdJobs: savedJob.toObject() } } // Save the entire job object
        );

        res.status(201).json({ success: true, message: 'Job created successfully', job: savedJob });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create a job' });
    }
};



// Update a job (only creator can update)
export const updateJob = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Assuming req.user is populated from authentication middleware
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this job' });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: 'Job updated successfully', job: updatedJob });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update job' });
    }
};

// Delete a job (only creator can delete)
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Assuming req.user is populated from authentication middleware
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.createdBy.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this job' });
        }

        await Job.findByIdAndDelete(req.params.id);

        // Remove job from user's createdJobs list
        await User.findByIdAndUpdate(userId, { $pull: { createdJobs: req.params.id } });

        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
};

// Apply for a job
export const applyForJob = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Assuming req.user is populated from authentication middleware
        const jobId = req.params.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if user has already applied
        if (job.applicants.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        // Add user to job's applicants list
        await Job.findByIdAndUpdate(jobId, { $push: { applicants: userId } });

        // Add job to user's appliedJobs list
        await User.findByIdAndUpdate(userId, { $push: { appliedJobs: jobId } });

        res.status(200).json({ success: true, message: 'Applied to job successfully..!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to apply for job' });
    }
};


// Get jobs created by the logged-in user
export const getUserCreatedJobs = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Assuming `req.user` is set by the auth middleware

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const createdJobs = await Job.find({ createdBy: userId }).populate('applicants', 'email');

        res.status(200).json({ success: true, jobs: createdJobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve created jobs' });
    }
};

// Get jobs the user has applied for
export const getUserAppliedJobs = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Assuming `req.user` is set by the auth middleware

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const appliedJobs = await Job.find({ applicants: userId }).populate('createdBy', 'email');

        res.status(200).json({ success: true, jobs: appliedJobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve applied jobs' });
    }
};


// Delete a job (Only if the user is the creator)
export const deleteOwnJob = async (req: Request, res: Response) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if the logged-in user is the creator
        if (job.createdBy.toString() !== req?.user?.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own job' });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
};

// Remove a job from user's applied jobs list
export const removeJobFromApplied = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req?.user?.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Remove the job ID from the appliedJobs array
        user.appliedJobs = user.appliedJobs.filter(jobId => jobId.toString() !== req.params.id);
        await user.save();

        res.status(200).json({ success: true, message: 'Job removed from applied list' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove job from applied list' });
    }
};
