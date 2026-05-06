import { Request, Response } from 'express';
import Job from '../models/jobModel';
import User from '../models/userModel';
import { callLLM, generateEmbedding } from '../ai/aiService';
import { extractTextFromPdf, parseResumeText } from '../ai/resumeParser';
import {
  SYSTEM_INSTRUCTION,
  matchScorePrompt,
  jdGeneratorPrompt,
  coverLetterPrompt,
  skillGapPrompt,
  interviewPrepPrompt,
  salaryEstimatePrompt,
  applicantScreeningPrompt,
  marketInsightsPrompt,
} from '../ai/prompts';




// ─── Feature 1: Smart Job Match Score ────────────────────────────────────────
export const getMatchScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.body;

    if (!jobId) { res.status(400).json({ success: false, message: 'jobId is required' }); return; }

    const [user, job] = await Promise.all([User.findById(userId), Job.findById(jobId)]);

    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    if (!job)  { res.status(404).json({ success: false, message: 'Job not found' });  return; }

    const userProfile = `Name: ${user.firstName} ${user.lastName}
Title: ${user.currentTitle || 'Not specified'}
Skills: ${user.skills.join(', ') || 'None listed'}
Experience: ${user.experienceSummary || 'Not provided'}
Education: ${user.education || 'Not specified'}`;

    const jobDescription = `Title: ${job.title} at ${job.company}
Level: ${job.experienceLevel} | Type: ${job.jobType} | Industry: ${job.industry}
Location: ${job.location}
Description: ${job.description}`;

    const raw = await callLLM(matchScorePrompt(userProfile, jobDescription), SYSTEM_INSTRUCTION);
    res.status(200).json({ success: true, ...JSON.parse(raw) });
  } catch (error) {
    console.error('[AI] getMatchScore error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate match score' });
  }
};

// ─── Feature 2: AI Job Description Generator ─────────────────────────────────
export const generateJobDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, seniority, responsibilities, tone } = req.body;

    if (!title || !seniority || !Array.isArray(responsibilities) || responsibilities.length === 0) {
      res.status(400).json({ success: false, message: 'title, seniority, and responsibilities[] are required' });
      return;
    }

    const raw = await callLLM(
      jdGeneratorPrompt(title, seniority, responsibilities, tone || 'professional'),
      SYSTEM_INSTRUCTION
    );
    res.status(200).json({ success: true, ...JSON.parse(raw) });
  } catch (error) {
    console.error('[AI] generateJobDescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate job description' });
  }
};

// ─── Feature 3: Personalized Cover Letter Generator ──────────────────────────
export const generateCoverLetter = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.body;

    if (!jobId) { res.status(400).json({ success: false, message: 'jobId is required' }); return; }

    const [user, job] = await Promise.all([User.findById(userId), Job.findById(jobId)]);

    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    if (!job)  { res.status(404).json({ success: false, message: 'Job not found' });  return; }

    const userProfile = `Name: ${user.firstName} ${user.lastName}
Title: ${user.currentTitle || 'Professional'}
Skills: ${user.skills.join(', ') || 'Not listed'}
Experience: ${user.experienceSummary || 'Not provided'}
Education: ${user.education || 'Not specified'}`;

    const jobDescription = `Role: ${job.title} at ${job.company}
Industry: ${job.industry} | Level: ${job.experienceLevel}
Description: ${job.description}`;

    const raw = await callLLM(coverLetterPrompt(userProfile, jobDescription), SYSTEM_INSTRUCTION);
    const result = JSON.parse(raw);
    res.status(200).json({ success: true, coverLetter: result.coverLetter });
  } catch (error) {
    console.error('[AI] generateCoverLetter error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate cover letter' });
  }
};

// ─── Feature 4: Semantic Job Search ──────────────────────────────────────────
export const semanticSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, message: 'Query parameter q is required' });
      return;
    }

    const queryEmbedding = await generateEmbedding(q);

    const jobs = await (Job as any).aggregate([
      {
        $vectorSearch: {
          index: 'job_embedding_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: {
          title: 1, company: 1, salary: 1, location: 1, description: 1,
          jobType: 1, experienceLevel: 1, industry: 1, applicationDeadline: 1,
          createdAt: 1, score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('[AI] semanticSearch error:', error);
    res.status(500).json({ success: false, message: 'Semantic search failed. Ensure Atlas Vector Search index is configured.' });
  }
};

// ─── Feature 5: Resume Parser & Profile Auto-Fill ────────────────────────────
export const parseResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!req.file) {
      res.status(400).json({ success: false, message: 'PDF file is required' });
      return;
    }

    const resumeText = await extractTextFromPdf(req.file.buffer);
    const parsed = await parseResumeText(resumeText);

    await User.findByIdAndUpdate(userId, {
      skills: parsed.skills,
      experienceSummary: parsed.experienceSummary,
      currentTitle: parsed.currentTitle,
      education: parsed.education,
      resumeText,
    });

    res.status(200).json({
      success: true,
      message: 'Resume parsed and profile updated',
      parsed: {
        currentTitle: parsed.currentTitle,
        skills: parsed.skills,
        experienceSummary: parsed.experienceSummary,
        education: parsed.education,
      },
    });
  } catch (error) {
    console.error('[AI] parseResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to parse resume' });
  }
};

// ─── Feature 6: Applicant Screening Summary ──────────────────────────────────
export const screenApplicants = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) { res.status(404).json({ success: false, message: 'Job not found' }); return; }

    if (job.createdBy.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Only the job creator can screen applicants' });
      return;
    }

    const applicants = await User.find({ _id: { $in: job.applicants } });

    if (applicants.length === 0) {
      res.status(200).json({ success: true, results: [] });
      return;
    }

    const jobDescription = `Title: ${job.title} at ${job.company}
Level: ${job.experienceLevel} | Industry: ${job.industry}
Description: ${job.description}`;

    const results = await Promise.all(
      applicants.map(async (applicant) => {
        const applicantProfile = `Name: ${applicant.firstName} ${applicant.lastName}
Title: ${applicant.currentTitle || 'Not specified'}
Skills: ${applicant.skills.join(', ') || 'None listed'}
Experience: ${applicant.experienceSummary || 'Not provided'}
Education: ${applicant.education || 'Not specified'}`;

        const raw = await callLLM(applicantScreeningPrompt(jobDescription, applicantProfile), SYSTEM_INSTRUCTION);
        const { fitTier, summary } = JSON.parse(raw);
        return {
          userId: applicant._id,
          name: `${applicant.firstName} ${applicant.lastName}`,
          email: applicant.email,
          fitTier,
          summary,
        };
      })
    );

    const tierOrder: Record<string, number> = { strong: 0, potential: 1, weak: 2 };
    results.sort((a, b) => (tierOrder[a.fitTier] ?? 3) - (tierOrder[b.fitTier] ?? 3));

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('[AI] screenApplicants error:', error);
    res.status(500).json({ success: false, message: 'Failed to screen applicants' });
  }
};

// ─── Feature 7: Skill Gap Analysis ───────────────────────────────────────────
export const getSkillGap = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const jobId = req.params.jobId;

    const [user, job] = await Promise.all([User.findById(userId), Job.findById(jobId)]);

    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    if (!job)  { res.status(404).json({ success: false, message: 'Job not found' });  return; }

    const raw = await callLLM(skillGapPrompt(user.skills, job.description), SYSTEM_INSTRUCTION);
    res.status(200).json({ success: true, ...JSON.parse(raw) });
  } catch (error) {
    console.error('[AI] getSkillGap error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze skill gap' });
  }
};

// ─── Feature 8: Interview Prep Kit Generator ─────────────────────────────────
export const getInterviewPrep = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) { res.status(404).json({ success: false, message: 'Job not found' }); return; }

    const raw = await callLLM(interviewPrepPrompt(job.title, job.company, job.description), SYSTEM_INSTRUCTION);
    res.status(200).json({ success: true, jobTitle: job.title, company: job.company, ...JSON.parse(raw) });
  } catch (error) {
    console.error('[AI] getInterviewPrep error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate interview prep' });
  }
};

// ─── Feature 9: Salary Intelligence Estimator ────────────────────────────────
export const estimateSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, location, experienceLevel, industry } = req.body;

    if (!title || !location || !experienceLevel || !industry) {
      res.status(400).json({ success: false, message: 'title, location, experienceLevel, and industry are required' });
      return;
    }

    const raw = await callLLM(salaryEstimatePrompt(title, location, experienceLevel, industry), SYSTEM_INSTRUCTION);
    res.status(200).json({ success: true, ...JSON.parse(raw) });
  } catch (error) {
    console.error('[AI] estimateSalary error:', error);
    res.status(500).json({ success: false, message: 'Failed to estimate salary' });
  }
};

// ─── Feature 10: Market Trend Insights ───────────────────────────────────────
export const getMarketInsights = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [topIndustries, topJobTypes, recentJobCount] = await Promise.all([
      Job.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Job.aggregate([
        { $group: { _id: '$jobType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Job.countDocuments(),
    ]);

    const aggregatedData = `Total jobs posted: ${recentJobCount}
Top industries: ${topIndustries.map((i: any) => `${i._id} (${i.count} jobs)`).join(', ')}
Job types breakdown: ${topJobTypes.map((t: any) => `${t._id}: ${t.count}`).join(', ')}`;

    const raw = await callLLM(marketInsightsPrompt(aggregatedData), SYSTEM_INSTRUCTION);
    res.status(200).json({ success: true, ...JSON.parse(raw) });
  } catch (error) {
    console.error('[AI] getMarketInsights error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate market insights' });
  }
};
