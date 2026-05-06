import Job from '../models/jobModel';
import { generateEmbedding } from './aiService';

export function buildJobEmbeddingText(job: {
  title: string;
  company: string;
  description: string;
  industry: string;
  location: string;
  experienceLevel: string;
  jobType: string;
}): string {
  return `${job.title} at ${job.company}. ${job.industry} industry. ${job.location}. ${job.experienceLevel} level. ${job.jobType}. ${job.description}`;
}

export async function embedAndSaveJob(jobId: string): Promise<void> {
  try {
    const job = await Job.findById(jobId);
    if (!job) return;

    const text = buildJobEmbeddingText(job);
    const embedding = await generateEmbedding(text);

    await Job.findByIdAndUpdate(jobId, { embedding });
  } catch (err) {
    console.error(`[embeddings] Failed to embed job ${jobId}:`, err);
  }
}
