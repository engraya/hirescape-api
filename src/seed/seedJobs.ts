import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import Job from '../models/jobModel';
import User from '../models/userModel';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
const EXP_LEVELS = ['junior', 'mid', 'senior'] as const;
const INDUSTRIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Marketing',
    'Engineering',
    'Design',
    'Sales',
    'Legal',
    'Human Resources',
];

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Upsert seed recruiter user
    const hashedPassword = await bcrypt.hash('Seed@1234', 10);
    let recruiter = await User.findOne({ email: 'seed@jobnest.dev' });
    if (!recruiter) {
        recruiter = await User.create({
            email: 'seed@jobnest.dev',
            password: hashedPassword,
            firstName: 'Seed',
            lastName: 'Recruiter',
            verified: true,
            isAdmin: false,
        });
        console.log('Created seed recruiter user: seed@jobnest.dev');
    } else {
        console.log('Seed recruiter already exists, reusing');
    }

    const jobs = Array.from({ length: 20 }, () => {
        const minSalary = faker.number.int({ min: 40, max: 80 });
        const maxSalary = faker.number.int({ min: minSalary + 20, max: 200 });
        return {
            title: faker.person.jobTitle(),
            company: faker.company.name(),
            salary: `$${minSalary}k - $${maxSalary}k`,
            location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
            description: faker.lorem.paragraphs(2),
            jobType: pick(JOB_TYPES),
            experienceLevel: pick(EXP_LEVELS),
            industry: pick(INDUSTRIES),
            applicationDeadline: faker.date.future({ years: 0.5 }),
            createdBy: recruiter!._id,
            applicants: [],
        };
    });

    const inserted = await Job.insertMany(jobs);

    await User.findByIdAndUpdate(recruiter._id, {
        $push: { createdJobs: { $each: inserted.map((j) => j._id) } },
    });

    console.log(`Seeded ${inserted.length} jobs successfully`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
