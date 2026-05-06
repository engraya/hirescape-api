import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import * as aiController from '../controllers/aiController';

const router = Router();

const aiRateLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT_MAX) || 20,
  message: { success: false, message: 'Too many AI requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  },
});

router.use(aiRateLimiter);

// Feature 1 — Match Score
router.post('/match-score', isAuthenticated, aiController.getMatchScore);

// Feature 2 — Job Description Generator
router.post('/generate-jd', isAuthenticated, aiController.generateJobDescription);

// Feature 3 — Cover Letter Generator
router.post('/cover-letter', isAuthenticated, aiController.generateCoverLetter);

// Feature 4 — Semantic Job Search (public)
router.get('/semantic-search', aiController.semanticSearch);

// Feature 5 — Resume Parser
router.post('/parse-resume', isAuthenticated, upload.single('resume'), aiController.parseResume);

// Feature 6 — Applicant Screening
router.post('/screen-applicants/:jobId', isAuthenticated, aiController.screenApplicants);

// Feature 7 — Skill Gap Analysis
router.get('/skill-gap/:jobId', isAuthenticated, aiController.getSkillGap);

// Feature 8 — Interview Prep Kit
router.get('/interview-prep/:jobId', isAuthenticated, aiController.getInterviewPrep);

// Feature 9 — Salary Estimator
router.post('/salary-estimate', aiController.estimateSalary);

// Feature 10 — Market Insights (public)
router.get('/insights', aiController.getMarketInsights);

export default router;
