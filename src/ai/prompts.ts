export const SYSTEM_INSTRUCTION =
  'You are an expert HR AI assistant for HireIQ, an AI-powered job matching platform. ' +
  'Always respond with valid JSON only. Never include markdown, code fences, or extra text.';

export const matchScorePrompt = (userProfile: string, jobDescription: string): string =>
  `Evaluate how well this candidate fits this job posting.
Return JSON: {"score": <integer 0-100>, "strengths": [<string>], "gaps": [<string>], "summary": <string (1 sentence)>}

---CANDIDATE PROFILE---
${userProfile}

---JOB POSTING---
${jobDescription}`;

export const jdGeneratorPrompt = (
  title: string,
  seniority: string,
  responsibilities: string[],
  tone: string
): string =>
  `Write a professional job description for a ${seniority} ${title} role with a ${tone} tone.
Key responsibilities: ${responsibilities.join('; ')}
Return JSON: {"title": <string>, "description": <string>, "requirements": [<string>], "benefits": [<string>]}`;

export const coverLetterPrompt = (userProfile: string, jobDescription: string): string =>
  `Write a tailored, first-person cover letter (3 paragraphs) for this candidate applying to this job.
Return JSON: {"coverLetter": <string>}

---CANDIDATE PROFILE---
${userProfile}

---JOB POSTING---
${jobDescription}`;

export const resumeParserPrompt = (resumeText: string): string =>
  `Extract structured information from this resume text.
Return JSON: {
  "firstName": <string>,
  "lastName": <string>,
  "currentTitle": <string>,
  "skills": [<string>],
  "experienceSummary": <string (2-3 sentences summarizing work history)>,
  "education": <string>
}

---RESUME---
${resumeText}`;

export const skillGapPrompt = (userSkills: string[], jobDescription: string): string =>
  `Compare the candidate's skills against this job description and identify gaps.
Candidate skills: ${userSkills.join(', ') || 'None listed'}
Return JSON: {
  "matched": [<string>],
  "missing": [<string>],
  "suggestions": [{"skill": <string>, "resource": <string (course/platform name)>}]
}

---JOB DESCRIPTION---
${jobDescription}`;

export const interviewPrepPrompt = (title: string, company: string, description: string): string =>
  `Generate 8 tailored interview questions for a ${title} role at ${company}.
Include a mix of technical, behavioral, and situational questions.
Return JSON: {"questions": [{"category": <string>, "question": <string>, "tip": <string (1 sentence answering tip)>}]}

---JOB DESCRIPTION---
${description}`;

export const salaryEstimatePrompt = (
  title: string,
  location: string,
  experienceLevel: string,
  industry: string
): string =>
  `Estimate a realistic annual salary range for a ${experienceLevel} ${title} in the ${industry} industry based in ${location}.
Return JSON: {"min": <integer (USD/year)>, "max": <integer (USD/year)>, "currency": "USD", "rationale": <string (1-2 sentences)>}`;

export const applicantScreeningPrompt = (
  jobDescription: string,
  applicantProfile: string
): string =>
  `Evaluate this applicant for the given job and classify their fit.
Return JSON: {"fitTier": <"strong"|"potential"|"weak">, "summary": <string (2 sentences max)>}

---JOB DESCRIPTION---
${jobDescription}

---APPLICANT PROFILE---
${applicantProfile}`;

export const marketInsightsPrompt = (aggregatedData: string): string =>
  `Analyze this job board data and produce 3 concise market insight bullets for job seekers.
Return JSON: {"insights": [<string>], "topSkills": [<string>], "topIndustries": [<string>]}

---DATA---
${aggregatedData}`;
