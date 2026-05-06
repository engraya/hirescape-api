# HireIQ — Frontend Implementation Prompt

> Use this prompt with any AI coding assistant (Claude, GPT-4, Cursor, etc.) to implement the complete frontend for HireIQ.

---

## MASTER PROMPT

You are a Senior Fullstack Engineer building the frontend for **HireIQ** — an AI-powered job matching SaaS platform.

This is a **frontend-only task**. The backend REST API is already built and running. Your job is to implement a complete, modern, production-quality frontend that integrates with every backend endpoint.

---

## BACKEND OVERVIEW

**Base URL:** `http://localhost:5000` (development)

**Authentication:** JWT stored in httpOnly cookies. The backend sets the cookie automatically on login/register. All protected requests should use `credentials: 'include'` (or `withCredentials: true`).

### Auth Endpoints
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | `{email, password, confirmPassword, firstName, lastName}` | Register |
| POST | `/api/auth/login` | `{email, password}` | Login (sets cookie) |
| POST | `/api/auth/logout` | — | Logout (clears cookie) |
| GET | `/api/auth/users` | — | Get all users |
| GET | `/api/auth/users/:id` | — | Get user by ID |

### Job Endpoints
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| GET | `/api/jobs` | — | Get all jobs |
| GET | `/api/jobs/:id` | — | Get job by ID |
| POST | `/api/jobs` | `{title, company, salary, location, description, jobType, experienceLevel, industry, applicationDeadline}` | Create job |
| PUT | `/api/jobs/:id` | same fields (partial) | Update job |
| DELETE | `/api/jobs/:id` | — | Delete job |
| POST | `/api/jobs/apply/:id` | — | Apply for job |
| GET | `/api/jobs/user/created` | — | My posted jobs |
| GET | `/api/jobs/user/applied` | — | Jobs I've applied to |
| DELETE | `/api/jobs/created/:id` | — | Delete own job |
| DELETE | `/api/jobs/applied/:id` | — | Withdraw application |

### AI Endpoints
| Method | URL | Body/Params | Auth | Description |
|--------|-----|-------------|------|-------------|
| POST | `/api/ai/match-score` | `{jobId}` | Yes | Match % for a job |
| POST | `/api/ai/generate-jd` | `{title, seniority, responsibilities[], tone}` | Yes | AI job description |
| POST | `/api/ai/cover-letter` | `{jobId}` | Yes | AI cover letter |
| GET | `/api/ai/semantic-search?q=` | `q` query param | No | Semantic search |
| POST | `/api/ai/parse-resume` | FormData `resume` (PDF) | Yes | Parse resume |
| POST | `/api/ai/screen-applicants/:jobId` | — | Yes (creator) | Screen applicants |
| GET | `/api/ai/skill-gap/:jobId` | — | Yes | Skill gap analysis |
| GET | `/api/ai/interview-prep/:jobId` | — | Yes | Interview questions |
| POST | `/api/ai/salary-estimate` | `{title, location, experienceLevel, industry}` | No | Salary estimate |
| GET | `/api/ai/insights` | — | No | Market insights |

### Job Field Enums
```
jobType: 'full-time' | 'part-time' | 'contract' | 'internship'
experienceLevel: 'junior' | 'mid' | 'senior'
```

### Standard Response Shape
```json
{ "success": true, "data": ... }
{ "success": false, "message": "Error description" }
```

---

## TECH STACK REQUIREMENTS

Use this exact stack:

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand (global auth state) + React Query (server state / API calls)
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios (with a configured instance that includes `withCredentials: true`)
- **File Uploads:** Native `<input type="file">` + FormData
- **Icons:** Lucide React
- **Notifications:** react-hot-toast (or sonner)
- **Animations:** Framer Motion (subtle, not excessive)

---

## PROJECT STRUCTURE

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Protected layout with sidebar/navbar
│   │   ├── jobs/
│   │   │   ├── page.tsx        # Job listing page
│   │   │   └── [id]/page.tsx   # Job detail page
│   │   ├── profile/page.tsx    # User profile + resume upload
│   │   ├── my-jobs/page.tsx    # Jobs I posted
│   │   ├── applications/page.tsx  # Jobs I applied to
│   │   ├── post-job/page.tsx   # Create/edit job with AI JD generator
│   │   └── insights/page.tsx   # Market trends dashboard
│   ├── layout.tsx
│   └── page.tsx                # Landing page (redirect to /jobs if logged in)
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── jobs/
│   │   ├── JobCard.tsx         # Card with match score badge
│   │   ├── JobList.tsx         # Grid/list of jobs
│   │   ├── JobFilters.tsx      # Filter sidebar (type, level, industry)
│   │   ├── JobDetail.tsx       # Full job detail view
│   │   └── ApplicantList.tsx   # Recruiter's applicant table with AI tiers
│   ├── ai/
│   │   ├── MatchScoreBadge.tsx # Score pill (green/yellow/red)
│   │   ├── CoverLetterModal.tsx # Generate + edit cover letter
│   │   ├── SkillGapPanel.tsx   # Matched vs missing skills
│   │   ├── InterviewPrepCard.tsx # Flashcard-style question
│   │   ├── SalaryEstimator.tsx # Inline salary suggestion
│   │   └── ResumeUploader.tsx  # Drag-and-drop PDF upload
│   ├── profile/
│   │   └── ProfileForm.tsx     # Edit profile (skills, title, etc.)
│   └── shared/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── LoadingSkeleton.tsx
├── hooks/
│   ├── useAuth.ts              # Auth state from Zustand
│   ├── useJobs.ts              # React Query hooks for jobs
│   └── useAI.ts               # React Query/mutation hooks for AI endpoints
├── lib/
│   ├── axios.ts                # Axios instance with baseURL + withCredentials
│   ├── queryClient.ts          # React Query client
│   └── utils.ts               # cn(), formatSalary(), formatDate()
├── store/
│   └── authStore.ts            # Zustand store: user, isAuthenticated, setUser
└── types/
    └── index.ts                # All TypeScript interfaces
```

---

## TYPE DEFINITIONS (types/index.ts)

```typescript
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  isAdmin: boolean;
  skills: string[];
  experienceSummary: string;
  currentTitle: string;
  education: string;
  createdJobs: string[];
  appliedJobs: string[];
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  description: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'junior' | 'mid' | 'senior';
  industry: string;
  applicationDeadline: string;
  createdBy: { _id: string; email: string };
  applicants: { _id: string; email: string }[];
  requirements: string[];
  createdAt: string;
}

export interface MatchScore {
  score: number;
  strengths: string[];
  gaps: string[];
  summary: string;
}

export interface SkillGap {
  matched: string[];
  missing: string[];
  suggestions: { skill: string; resource: string }[];
}

export interface InterviewQuestion {
  category: string;
  question: string;
  tip: string;
}

export interface ApplicantResult {
  userId: string;
  name: string;
  email: string;
  fitTier: 'strong' | 'potential' | 'weak';
  summary: string;
}

export interface MarketInsights {
  insights: string[];
  topSkills: string[];
  topIndustries: string[];
}

export interface SalaryEstimate {
  min: number;
  max: number;
  currency: string;
  rationale: string;
}
```

---

## PAGE-BY-PAGE IMPLEMENTATION

---

### PAGE 1: Landing Page (`/`)

A clean, modern landing page for unauthenticated users.

**Layout:**
- Hero section: Headline "The Job Platform That Thinks For You", subheadline, CTA buttons (Get Started, Browse Jobs)
- Feature highlights: 3 cards — AI Match Scoring, Smart Search, Resume AI
- Stats bar: "10,000+ jobs · 500+ companies · AI-powered matching"
- Footer with links

**Behavior:**
- If user is authenticated (check Zustand store), redirect to `/jobs`
- "Get Started" → `/register`
- "Browse Jobs" → `/jobs`

---

### PAGE 2: Register (`/register`)

**Form fields:** firstName, lastName, email, password, confirmPassword

**Zod schema:**
```typescript
z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(30),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

**On success:** Set user in Zustand store, redirect to `/profile` (to prompt resume upload)

---

### PAGE 3: Login (`/login`)

**Form fields:** email, password

**On success:** Set user in Zustand store, redirect to `/jobs`

Both auth pages should have:
- Link between login/register
- Loading state on submit button
- Error toast on failure

---

### PAGE 4: Job Listing (`/jobs`) — CORE PAGE

This is the most important page.

**Layout:**
- Left sidebar: Filters (jobType, experienceLevel, industry, search bar)
- Main area: Job cards grid
- Top bar: Result count, sort options, semantic search toggle

**Two search modes:**
1. **Regular filter search:** Client-side filtering on the in-memory jobs list
2. **AI Semantic Search:** Toggle button "AI Search" → shows a different input → calls `GET /api/ai/semantic-search?q=`

**Job Card Component (`JobCard.tsx`):**
```
┌────────────────────────────────────┐
│ [Company Logo Initials]  [87% Match]│  ← MatchScoreBadge (if logged in)
│ Senior Backend Engineer             │
│ Acme Corp · Remote · Full-time      │
│ $120k - $160k                       │
│ Technology · Senior                 │
│ ──────────────────────────────────  │
│ [View Details]  [Quick Apply]       │
└────────────────────────────────────┘
```

**Match Score Badge behavior:**
- Only shown when user is logged in AND has skills in profile
- Shows loading spinner while fetching
- Color coded: ≥75% green, ≥50% yellow, <50% red/gray
- Click badge to expand score panel with strengths/gaps

**Data fetching:**
```typescript
// On page load: fetch all jobs
useQuery(['jobs'], () => api.get('/api/jobs').then(r => r.data.jobs))

// When user is logged in with skills: fetch match scores in parallel
// Batch: for each job, call POST /api/ai/match-score with {jobId}
// Cache results in React Query
```

---

### PAGE 5: Job Detail (`/jobs/[id]`) — FEATURE-RICH

**Layout:**
- Left: Full job description, company info, requirements
- Right sticky sidebar: Action panel

**Action panel (for job seekers):**
- [Apply Now] button — calls `POST /api/jobs/apply/:id`
- [Generate Cover Letter] button — opens `CoverLetterModal`
- [Analyze My Fit] button — expands `SkillGapPanel`
- [Prepare for Interview] button — opens prep modal
- Match Score display (large, prominent)

**Action panel (for job creator):**
- [Edit Job] button
- [Screen Applicants] button → calls `POST /api/ai/screen-applicants/:jobId` → shows `ApplicantList`
- [Delete Job] button

**CoverLetterModal:**
- Loading state: "Gemini is writing your cover letter..." with animated dots
- On success: Editable textarea with the generated letter
- [Copy] and [Regenerate] buttons
- [Regenerate] just recalls the API

**SkillGapPanel:**
- Two columns: Matched Skills (green checkmarks) | Missing Skills (red X marks)
- Below: Suggestions list with "Learn [Skill] on [Platform]" links

**InterviewPrep Modal:**
- Flashcard layout: Question on front, tip revealed on click/toggle
- Categories shown as colored tags (Technical, Behavioral, Situational)
- Navigation: Previous / Next buttons

---

### PAGE 6: Profile (`/profile`)

**Layout:** Two-column — left: profile info, right: resume upload zone

**Profile Info section:**
- Display: name, email, currentTitle, skills (as tags), experienceSummary, education
- [Edit Profile] → inline form edit mode
- Skills: Tag input (type to add, click X to remove)

**Resume Uploader (`ResumeUploader.tsx`):**
```
┌─────────────────────────────────────────┐
│  📄 Drop your resume here               │
│     or click to browse (PDF, max 5MB)   │
│                                         │
│  [Upload & Auto-Fill Profile]           │
└─────────────────────────────────────────┘
```
- Drag-and-drop using `react-dropzone`
- On upload: POST to `/api/ai/parse-resume` with FormData
- Loading: "Gemini is reading your resume..." with spinner
- On success: Profile fields update + success toast "Profile auto-filled!"
- Show parsed results as a preview before confirming

**Market Value Card:**
- Button "Estimate My Market Value"
- Calls `POST /api/ai/salary-estimate` with user's currentTitle, location (ask for it), experienceLevel, industry
- Shows animated salary range: `$120,000 — $160,000 / year`

---

### PAGE 7: Post a Job (`/post-job`)

**Layout:** Two-column form with AI-assist panel

**Form fields:**
- Title, Company, Salary, Location (text inputs)
- Industry (text input)
- Job Type (select: full-time, part-time, contract, internship)
- Experience Level (select: junior, mid, senior)
- Application Deadline (date picker)
- Description (large textarea)

**AI JD Generator panel (right side):**
```
┌──────────────────────────────────────┐
│ ✨ Generate with AI                  │
│                                      │
│ Key responsibilities (one per line): │
│ [textarea]                           │
│                                      │
│ Tone: [Professional ▾]              │
│                                      │
│ [Generate Job Description]           │
└──────────────────────────────────────┘
```
- On generate: calls `POST /api/ai/generate-jd`
- On success: Streams/fills the main Description textarea
- Also populates requirements list

**Salary Intelligence:**
- Below salary field: "Suggest salary range" link
- Calls `POST /api/ai/salary-estimate` using the filled title, level, industry
- Shows: `Suggested: $90,000 — $130,000` → click to use

---

### PAGE 8: My Posted Jobs (`/my-jobs`)

**Layout:** Table view of jobs the recruiter posted

**Columns:** Title, Applications count, Status, Deadline, Actions

**Row actions:**
- [View Applicants] → opens a slide-over panel with `ApplicantList`
- [Edit] → navigate to edit form
- [Delete] → confirmation dialog

**ApplicantList component:**
- "Screen with AI" button at top → calls `/api/ai/screen-applicants/:jobId`
- Loading: "Gemini is ranking your applicants..." with progress bar animation
- Results: Sorted table with color-coded fit tiers
  - Strong: Green badge
  - Potential: Yellow badge
  - Weak: Gray badge
- Each row shows: name, email, fitTier badge, 2-line AI summary

---

### PAGE 9: My Applications (`/applications`)

**Layout:** List of jobs the seeker has applied to

**Each item shows:**
- Job title, company, applied date
- Current match score badge
- [Prepare for Interview] quick action → opens interview prep modal
- [Withdraw] → calls `DELETE /api/jobs/applied/:id` with confirmation

---

### PAGE 10: Market Insights (`/insights`)

**Layout:** Dashboard with insight cards

**Sections:**

1. **AI Insights panel** — calls `GET /api/ai/insights`
   - 3 insight bullet cards with icons
   - "Last updated: weekly" indicator

2. **Top Skills card** — horizontal bar chart of top skills
   (rendered from `topSkills` array using a simple visual component)

3. **Top Industries card** — pie/donut chart or horizontal bars
   (rendered from `topIndustries` array)

4. **Trending Jobs** — pulls from regular `/api/jobs` endpoint, shows 5 most recent

---

## COMPONENT SPECIFICATIONS

### MatchScoreBadge
```tsx
// Props: score: number, loading: boolean
// 0-49 → gray "–%", 50-74 → yellow "XX%", 75-100 → green "XX%"
// On hover: tooltip showing summary
// On click: opens score detail popover with strengths[] and gaps[]
```

### LoadingSkeleton
- Use for all data-loading states (cards, tables, text)
- Pulse animation (Tailwind `animate-pulse`)
- Match the shape of the content being loaded

### AI Action Buttons
- Always show a sparkle ✨ icon prefix
- Show loading spinner replacing icon while AI processes
- Disable during loading
- Never show raw error — show "Something went wrong, try again"

---

## STATE MANAGEMENT

### Zustand Auth Store (`store/authStore.ts`)
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}
```

Initialize by calling `GET /api/auth/users/:id` on app load (if cookie present). Handle 401 by clearing store.

### React Query Patterns
```typescript
// Jobs list
useQuery({ queryKey: ['jobs'], queryFn: fetchAllJobs })

// Match score (per job)
useQuery({
  queryKey: ['matchScore', jobId],
  queryFn: () => fetchMatchScore(jobId),
  enabled: !!user?.skills?.length && !!jobId,
  staleTime: 5 * 60 * 1000, // cache 5 min
})

// AI mutations
const coverLetterMutation = useMutation({
  mutationFn: (jobId: string) => generateCoverLetter(jobId),
})
```

---

## AXIOS CONFIGURATION (`lib/axios.ts`)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth store and redirect to /login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## UI/UX DESIGN GUIDELINES

### Color Palette
- Primary: Indigo (`indigo-600` / `#4F46E5`)
- Success/Strong match: Green (`green-500`)
- Warning/Potential match: Amber (`amber-500`)
- Neutral/Weak match: Gray (`gray-400`)
- Background: `gray-50` / `white`
- Text: `gray-900` / `gray-600`

### Typography
- Headings: `font-bold` or `font-semibold`
- Body: `text-sm` to `text-base`
- Labels: `text-xs text-gray-500 uppercase tracking-wide`

### AI Feature Visual Language
- All AI-triggered actions use a sparkle ✨ icon (Lucide: `Sparkles`)
- AI badges have a subtle purple gradient background
- AI loading states use smooth skeleton animations, never raw spinners for content
- AI-generated text appears with a subtle "typewriter" or fade-in effect

### Responsiveness
- Mobile-first design
- Job cards: 1 col mobile, 2 col tablet, 3 col desktop
- Sidebar collapses to top filter sheet on mobile (use shadcn Sheet component)

### Empty States
- "No jobs yet" → AI-generated suggestion: "Try searching for 'remote developer' or 'product manager'"
- "No applicants yet" → "Share this job to attract candidates"
- "Profile incomplete" → Prompt to upload resume with clear benefit messaging

---

## KEY IMPLEMENTATION NOTES

1. **Never block on AI calls.** Load the page immediately with job data; match scores load asynchronously and slot in when ready. Show skeleton badges while loading.

2. **Batch match score fetching carefully.** Don't call `/api/ai/match-score` for all 50 jobs on page load simultaneously. Fetch for the first 6 visible jobs, then use IntersectionObserver to fetch as cards enter viewport.

3. **Cache AI responses aggressively.** Match scores and skill gap results are expensive — cache in React Query with `staleTime: 10 * 60 * 1000` (10 min).

4. **Resume upload UX.** Show a clear preview of what was extracted before saving. Let users confirm/edit before the profile is updated.

5. **Error handling.** Every AI endpoint can fail (quota, timeout, model error). Catch all errors gracefully. Never show raw API errors — show friendly messages with a retry option.

6. **Auth guard.** Wrap all `/dashboard` routes in a layout that checks `isAuthenticated` from Zustand. If false, redirect to `/login`.

7. **Profile completeness indicator.** Show a progress bar on the profile page: "70% complete — add your skills to unlock AI features." AI match score, cover letter, and skill gap require at least `skills[]` and `experienceSummary` to be populated.

---

## ENVIRONMENT VARIABLES

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## SUGGESTED PACKAGE INSTALL

```bash
npx create-next-app@latest hireiq-frontend --typescript --tailwind --app --eslint
cd hireiq-frontend
npx shadcn@latest init
npx shadcn@latest add button card badge input label select textarea dialog sheet toast tabs progress skeleton
npm install axios @tanstack/react-query zustand react-hook-form zod @hookform/resolvers framer-motion lucide-react react-hot-toast react-dropzone
```

---

## DELIVERABLE CHECKLIST

- [ ] Landing page with hero + feature cards
- [ ] Register and Login pages with form validation
- [ ] Job listing with filters + AI semantic search toggle
- [ ] Job cards with async match score badges
- [ ] Job detail with cover letter modal, skill gap panel, interview prep
- [ ] Profile page with resume uploader and auto-fill
- [ ] Post Job page with AI JD generator and salary suggester
- [ ] My Jobs page with AI applicant screener
- [ ] My Applications page
- [ ] Market Insights dashboard
- [ ] Responsive on mobile + tablet + desktop
- [ ] Loading skeletons on all async operations
- [ ] Empty states with helpful messaging
- [ ] Error handling with toast notifications
- [ ] Auth guard on all protected pages
