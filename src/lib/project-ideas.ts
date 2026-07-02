// Curated project idea library — hand-picked to be portfolio-worthy and recruiter-friendly.
// Scored dynamically against the user's chosen role + skill level.

export type Role = "frontend" | "backend" | "fullstack" | "mobile" | "data" | "ml" | "devops";
export type Level = "beginner" | "intermediate" | "advanced";

export interface ProjectIdea {
  id: string;
  title: string;
  tagline: string;             // one-liner shown on the card
  roles: Role[];               // roles this fits
  minLevel: Level;             // easiest level allowed
  difficulty: 1 | 2 | 3 | 4 | 5;
  estWeeks: number;            // realistic solo build time
  stack: string[];             // 3-5 chips
  hiringSignal: string;        // why recruiters care (free preview)
  // ---- Pro-only fields ----
  problem: string;             // real-world problem it solves
  coreFeatures: string[];      // 5-8 features to build
  milestones: { week: string; goal: string }[];
  stretchGoals: string[];      // 3-5 ideas to make it stand out
  deploy: string;              // where + how to deploy
  readmeHook: string;          // opening line for the README
  interviewTalkingPoints: string[]; // things to say in interviews about it
}

const IDEAS: ProjectIdea[] = [
  {
    id: "smart-expense-splitter",
    title: "Smart Expense Splitter with Receipts OCR",
    tagline: "Splitwise, but it reads the receipt for you.",
    roles: ["fullstack", "frontend", "backend"],
    minLevel: "intermediate",
    difficulty: 3,
    estWeeks: 4,
    stack: ["React", "TypeScript", "Node/Express", "PostgreSQL", "Tesseract.js"],
    hiringSignal: "Real database modelling, auth, image processing, and money math — recruiters see full-stack judgment in one project.",
    problem: "Groups splitting bills lose money to typos and forgotten items. Reading a photo of the receipt removes 90% of the friction.",
    coreFeatures: [
      "Email/password auth with sessions",
      "Create groups, invite members via link",
      "Upload receipt photo, OCR to line items",
      "Assign each line item to one or more people",
      "Balance sheet: who owes whom, minimised transfers",
      "Settle-up flow with history",
    ],
    milestones: [
      { week: "Week 1", goal: "Auth, groups, add-expense form (no OCR yet)." },
      { week: "Week 2", goal: "Balances engine + settle-up. Ship the boring math first." },
      { week: "Week 3", goal: "OCR upload flow, item assignment UI." },
      { week: "Week 4", goal: "Polish, mobile pass, deploy, write the README." },
    ],
    stretchGoals: [
      "Currency conversion with live rates",
      "Recurring expenses (rent, subscriptions)",
      "Export to CSV / PDF summary",
      "Push notifications on new expenses",
    ],
    deploy: "Frontend on Vercel, API on Railway/Render, Postgres on Neon. Add a Loom demo to the README.",
    readmeHook: "Ever argued with friends over a $3 mistake on the dinner bill? So did I.",
    interviewTalkingPoints: [
      "How you kept money math in integers (no float drift).",
      "Trade-off between server-side OCR vs on-device Tesseract.js.",
      "How you designed the minimised-transfer graph algorithm.",
    ],
  },
  {
    id: "focus-timer-analytics",
    title: "Focus Timer with Deep-Work Analytics",
    tagline: "A Pomodoro app that shows you when you actually do your best work.",
    roles: ["frontend", "fullstack", "mobile"],
    minLevel: "beginner",
    difficulty: 2,
    estWeeks: 2,
    stack: ["React", "TypeScript", "Zustand", "Recharts", "IndexedDB"],
    hiringSignal: "Clean state management, real charts, and a product mind — perfect first portfolio piece.",
    problem: "Pomodoro apps track time but never tell you what actually worked. Students never learn their peak hours.",
    coreFeatures: [
      "25/5 timer with keyboard shortcuts",
      "Tag each session with subject/task",
      "Persist sessions in IndexedDB (offline-first)",
      "Daily & weekly focus heatmap",
      "Best-time-of-day chart per subject",
      "Distraction log button during a session",
    ],
    milestones: [
      { week: "Week 1", goal: "Timer + session persistence + basic list view." },
      { week: "Week 2", goal: "Analytics dashboard, heatmap, polish, PWA install." },
    ],
    stretchGoals: [
      "Sync across devices via Supabase",
      "Spotify integration for focus playlists",
      "Weekly email summary",
    ],
    deploy: "Deploy as a PWA on Vercel. Add an 'Install' button in the header.",
    readmeHook: "I built this because I kept studying at 11pm and wondering why nothing stuck.",
    interviewTalkingPoints: [
      "Why you chose IndexedDB over localStorage.",
      "How the heatmap handles timezones.",
      "Perf: keeping the timer smooth on low-end devices.",
    ],
  },
  {
    id: "resume-tailor-ai",
    title: "AI Resume Tailor for a Job Description",
    tagline: "Paste a JD, get a rewritten resume with matched keywords.",
    roles: ["fullstack", "backend", "ml"],
    minLevel: "intermediate",
    difficulty: 4,
    estWeeks: 5,
    stack: ["Next.js", "TypeScript", "LLM API", "pdf-parse", "Postgres"],
    hiringSignal: "Solves your own hiring problem while you apply. Recruiters LOVE self-aware projects.",
    problem: "Students send the same resume to 200 jobs. ATS systems reject 75% of them for missing keywords.",
    coreFeatures: [
      "PDF resume upload + parse",
      "Job description input",
      "Keyword gap analysis with match score",
      "AI-rewritten bullet points per role",
      "Downloadable ATS-friendly PDF",
      "History of tailored resumes",
    ],
    milestones: [
      { week: "Week 1", goal: "Auth + PDF upload + parse to structured JSON." },
      { week: "Week 2", goal: "Keyword extractor and gap scoring." },
      { week: "Week 3", goal: "LLM rewrite pipeline with guardrails (no hallucinated experience)." },
      { week: "Week 4", goal: "PDF export that survives ATS parsers." },
      { week: "Week 5", goal: "Polish, rate-limit, deploy, write launch post." },
    ],
    stretchGoals: [
      "Chrome extension: 'Tailor to this JD' on LinkedIn",
      "Cover letter generator",
      "Interview question predictor from the JD",
    ],
    deploy: "Deploy on Vercel with Postgres on Neon. Rate-limit LLM calls with Upstash.",
    readmeHook: "I built this after my 47th rejection email — turns out my resume was the problem, not me.",
    interviewTalkingPoints: [
      "How you keep the LLM from inventing job experience.",
      "Prompt engineering choices for ATS keyword injection.",
      "Cost per tailored resume and how you kept it under $0.01.",
    ],
  },
  {
    id: "study-group-matcher",
    title: "Study Group Matcher for Your Campus",
    tagline: "Tinder for finding people cramming the same course as you.",
    roles: ["fullstack", "mobile", "backend"],
    minLevel: "intermediate",
    difficulty: 3,
    estWeeks: 4,
    stack: ["React Native / Next.js", "Supabase", "PostgreSQL", "TailwindCSS"],
    hiringSignal: "Two-sided marketplace mechanics, real-time chat, matching algorithms — genuinely hard problem.",
    problem: "Students in the same course never meet. Study groups form randomly and often fail.",
    coreFeatures: [
      "Sign up with .edu email verification",
      "Add courses you're taking + your study style",
      "Swipe-style match on shared courses",
      "Group chat once matched",
      "Schedule study sessions with calendar sync",
      "Rate sessions to improve matching",
    ],
    milestones: [
      { week: "Week 1", goal: "Auth, edu verification, profile setup." },
      { week: "Week 2", goal: "Matching engine + swipe UI." },
      { week: "Week 3", goal: "Realtime chat + session scheduling." },
      { week: "Week 4", goal: "Ratings, notifications, deploy, get 10 friends to try it." },
    ],
    stretchGoals: [
      "Location-based library check-ins",
      "Shared Kanban board per group",
      "Attendance streaks and gamification",
    ],
    deploy: "Frontend on Vercel/Expo, backend on Supabase (auth + realtime + DB). Great story for interviews.",
    readmeHook: "I failed a class because my study group ghosted me. Now no one else has to.",
    interviewTalkingPoints: [
      "Cold-start problem: how you seeded the first users.",
      "Matching algorithm trade-offs (shared classes vs study style).",
      "How you handled abuse and moderation.",
    ],
  },
  {
    id: "personal-cli-dashboard",
    title: "Personal Terminal Dashboard (open-source CLI)",
    tagline: "One command, all your stats: GitHub, weather, calendar, todo.",
    roles: ["backend", "devops", "fullstack"],
    minLevel: "beginner",
    difficulty: 2,
    estWeeks: 2,
    stack: ["Node.js / Rust / Go", "REST APIs", "TUI library", "npm publish"],
    hiringSignal: "A published CLI on npm/crates.io is instant proof you ship. Great for backend/DevOps roles.",
    problem: "Developers open 8 tabs every morning for the same info. A single-command dashboard is faster and looks cool.",
    coreFeatures: [
      "Config file for API keys",
      "GitHub commits + notifications panel",
      "Weather panel",
      "Todoist / Notion tasks panel",
      "Calendar next-3-events panel",
      "Beautiful TUI with themes",
    ],
    milestones: [
      { week: "Week 1", goal: "CLI scaffolding, config loader, GitHub + weather panels." },
      { week: "Week 2", goal: "TUI layout, themes, publish to npm, screencast GIF." },
    ],
    stretchGoals: [
      "Plugin system so others can add panels",
      "Rust rewrite for speed",
      "Homebrew formula",
    ],
    deploy: "Publish on npm (or crates.io) with GitHub Actions release automation. Add stars badge to README.",
    readmeHook: "My morning routine used to take 8 tabs and 4 minutes. Now it takes one command.",
    interviewTalkingPoints: [
      "How you handled API key security in a CLI.",
      "Choosing between Ink, Blessed, or writing raw ANSI.",
      "Getting first stars: how you shared it.",
    ],
  },
  {
    id: "realtime-collab-whiteboard",
    title: "Real-Time Collaborative Whiteboard",
    tagline: "Miro-lite you can actually understand end-to-end.",
    roles: ["fullstack", "frontend", "backend"],
    minLevel: "advanced",
    difficulty: 5,
    estWeeks: 6,
    stack: ["React", "TypeScript", "WebSockets", "Yjs / CRDT", "Canvas API"],
    hiringSignal: "CRDTs, low-latency websockets, canvas rendering — this is a senior-signal project on a junior resume.",
    problem: "Every remote study group needs a shared whiteboard, but existing tools are locked-down or paid.",
    coreFeatures: [
      "Room creation with shareable link",
      "Freehand drawing, shapes, sticky notes",
      "Real-time cursor + presence",
      "Undo/redo per user",
      "Persistent room state",
      "Export to PNG / PDF",
    ],
    milestones: [
      { week: "Week 1-2", goal: "Local drawing app on canvas, no networking." },
      { week: "Week 3", goal: "Introduce Yjs, get two tabs syncing." },
      { week: "Week 4", goal: "Presence, cursors, sticky notes." },
      { week: "Week 5", goal: "Persistence, auth-optional rooms." },
      { week: "Week 6", goal: "Perf pass for 20+ users, deploy, write engineering blog post." },
    ],
    stretchGoals: [
      "Voice chat via WebRTC",
      "AI shape recognition ('turn my scribble into a rectangle')",
      "Infinite canvas with viewport culling",
    ],
    deploy: "Frontend on Vercel, WebSocket server on Fly.io or Railway. Blog post about CRDT choice will 10x reach.",
    readmeHook: "I wanted to understand how Figma really works. So I built a tiny version of it.",
    interviewTalkingPoints: [
      "Yjs vs Automerge vs custom OT.",
      "How you handle high-frequency cursor updates without hammering the server.",
      "Persistence strategy and conflict resolution.",
    ],
  },
  {
    id: "college-market-place",
    title: "Campus Marketplace (Craigslist for one college)",
    tagline: "Hyperlocal buy/sell/lease with verified students only.",
    roles: ["fullstack", "mobile", "backend"],
    minLevel: "intermediate",
    difficulty: 3,
    estWeeks: 5,
    stack: ["Next.js", "TypeScript", "Supabase", "Stripe Connect", "Cloudinary"],
    hiringSignal: "Real marketplace with payments, trust/safety, image handling — checks every full-stack box.",
    problem: "Facebook groups are chaos, Craigslist is unsafe. Students need a trusted place to sell textbooks, sublet rooms, sell furniture at semester's end.",
    coreFeatures: [
      ".edu verification",
      "Post listing with photos + category",
      "Search + filters (price, category, distance)",
      "In-app chat between buyer/seller",
      "Optional in-app payment via Stripe Connect",
      "Report + block flow",
    ],
    milestones: [
      { week: "Week 1", goal: "Auth + edu verification + basic listing CRUD." },
      { week: "Week 2", goal: "Image upload + search + filters." },
      { week: "Week 3", goal: "Chat + notifications." },
      { week: "Week 4", goal: "Payments (Stripe Connect) + safety flow." },
      { week: "Week 5", goal: "Polish, deploy, onboard your dorm floor." },
    ],
    stretchGoals: [
      "Textbook ISBN scanner + auto price suggest",
      "Roommate finder as a second vertical",
      "Semester-end 'move-out' bundle listings",
    ],
    deploy: "Deploy on Vercel + Supabase. Screenshot real listings from your college in the README.",
    readmeHook: "My dorm had 200 people trying to sell furniture in one week and a group chat that was pure spam.",
    interviewTalkingPoints: [
      "Trust & safety design: reports, blocks, edu verification.",
      "Stripe Connect vs. off-app payments trade-off.",
      "How you got your first 50 real users.",
    ],
  },
  {
    id: "spotify-vibe-recommender",
    title: "Spotify Vibe Recommender (ML side project)",
    tagline: "Feed it a song, get 20 that match the exact vibe — not just the genre.",
    roles: ["ml", "data", "fullstack"],
    minLevel: "intermediate",
    difficulty: 4,
    estWeeks: 4,
    stack: ["Python", "FastAPI", "Spotify API", "scikit-learn", "React"],
    hiringSignal: "End-to-end ML: data collection, features, model, API, UI. Recruiters for ML roles want proof of the full loop.",
    problem: "Spotify's recommendations are trained for retention, not for matching a specific vibe you're in right now.",
    coreFeatures: [
      "Spotify OAuth login",
      "Fetch audio features for user's library",
      "Nearest-neighbour search on feature vectors",
      "'Seed song → 20 matches' UI",
      "Save match playlist back to Spotify",
      "Explain-why panel (which features matched)",
    ],
    milestones: [
      { week: "Week 1", goal: "Auth + fetch audio features for 1000 tracks." },
      { week: "Week 2", goal: "Feature engineering + KNN model + evaluation notebook." },
      { week: "Week 3", goal: "FastAPI service + React UI." },
      { week: "Week 4", goal: "Playlist export, explain-why, deploy, ship demo video." },
    ],
    stretchGoals: [
      "Replace KNN with a small autoencoder",
      "Mood classifier (chill / hype / sad / focus)",
      "Weekly auto-generated playlist",
    ],
    deploy: "API on Fly.io, UI on Vercel. Demo video on Twitter is worth 10 stars.",
    readmeHook: "Spotify kept recommending sad songs after one bad night. I built my own recommender.",
    interviewTalkingPoints: [
      "Why KNN was the right first model.",
      "How you evaluated recommendation quality without ground truth.",
      "Cold-start problem for new users.",
    ],
  },
  {
    id: "leetcode-tracker",
    title: "LeetCode Progress Tracker with Spaced Repetition",
    tagline: "Anki for algorithms — resurface problems right before you forget them.",
    roles: ["fullstack", "frontend"],
    minLevel: "beginner",
    difficulty: 2,
    estWeeks: 3,
    stack: ["React", "TypeScript", "Supabase", "Recharts"],
    hiringSignal: "Solves a real pain for anyone prepping for interviews — instant credibility with student peers.",
    problem: "Students grind 200 LeetCode problems, forget 190, then panic-review the week before interviews.",
    coreFeatures: [
      "Log a solved problem (topic, difficulty, notes, code)",
      "SM-2 spaced repetition schedule",
      "'Review due today' queue",
      "Topic mastery heatmap",
      "Import from LeetCode profile URL",
      "Streak + weekly report",
    ],
    milestones: [
      { week: "Week 1", goal: "Auth + log-a-problem + list view." },
      { week: "Week 2", goal: "SM-2 scheduling + review queue." },
      { week: "Week 3", goal: "LeetCode import + charts + polish + deploy." },
    ],
    stretchGoals: [
      "Company-specific problem sets",
      "Weekly email digest",
      "AI hint generator when stuck",
    ],
    deploy: "Vercel + Supabase. Post on r/cscareerquestions, expect real users in days.",
    readmeHook: "I did 200 LeetCodes for FAANG. Failed my first onsite because I couldn't remember any of them.",
    interviewTalkingPoints: [
      "Why SM-2 over naive spaced repetition.",
      "How the LeetCode import handles the unofficial API.",
      "Data model for revision history.",
    ],
  },
  {
    id: "ai-flashcards-from-pdf",
    title: "AI Flashcards from any PDF or lecture video",
    tagline: "Upload your slides, get ready-to-study Anki decks.",
    roles: ["fullstack", "ml", "backend"],
    minLevel: "intermediate",
    difficulty: 3,
    estWeeks: 4,
    stack: ["Next.js", "LLM API", "pdf-parse", "Whisper", "Postgres"],
    hiringSignal: "Practical AI product with clear value — the exact profile early-stage startups hire for.",
    problem: "Making flashcards takes longer than studying them. Students skip the step and score worse.",
    coreFeatures: [
      "Upload PDF or paste YouTube link",
      "Parse to sections",
      "LLM generates Q/A pairs per section",
      "Edit + approve deck",
      "Study mode with spaced repetition",
      "Export to Anki .apkg",
    ],
    milestones: [
      { week: "Week 1", goal: "PDF upload + parse + LLM generate for text." },
      { week: "Week 2", goal: "YouTube transcript via Whisper + chunking strategy." },
      { week: "Week 3", goal: "Study UI + spaced repetition." },
      { week: "Week 4", goal: "Anki export + polish + deploy + Product Hunt launch." },
    ],
    stretchGoals: [
      "Image occlusion cards for diagrams",
      "Cloze deletions from lecture transcripts",
      "Chrome extension for any web article",
    ],
    deploy: "Vercel + Neon + S3 for uploads. Rate-limit generously — students share and it goes viral fast.",
    readmeHook: "I lost 6 hours making flashcards for one exam. Never again.",
    interviewTalkingPoints: [
      "Chunking strategy for long PDFs within context limits.",
      "How you validated flashcard quality.",
      "Cost model per deck and how you kept the free tier sustainable.",
    ],
  },
];

// ---- Scoring / selection ----

const LEVEL_RANK: Record<Level, number> = { beginner: 1, intermediate: 2, advanced: 3 };

export interface RankedIdea {
  idea: ProjectIdea;
  fitScore: number; // 0-100
  fitReason: string;
}

export function recommendIdeas(role: Role, level: Level, count = 10): RankedIdea[] {
  const userRank = LEVEL_RANK[level];

  const ranked = IDEAS.map((idea) => {
    let score = 40;
    const reasons: string[] = [];

    if (idea.roles.includes(role)) { score += 35; reasons.push(`Great fit for a ${prettyRole(role)} portfolio`); }
    else { score += 8; reasons.push(`Adjacent to ${prettyRole(role)} — shows range`); }

    const ideaRank = LEVEL_RANK[idea.minLevel];
    const gap = userRank - ideaRank;
    if (gap === 0) { score += 20; reasons.push(`Matched to your ${level} level`); }
    else if (gap === 1) { score += 15; reasons.push(`One step easier — high chance of finishing`); }
    else if (gap === -1) { score += 12; reasons.push(`One step above — great stretch project`); }
    else if (gap >= 2) { score += 5; reasons.push(`Below your level — good weekend win`); }
    else { score += 2; reasons.push(`Ambitious — expect to learn a lot`); }

    // Cap and shape
    score = Math.max(30, Math.min(99, score));
    return { idea, fitScore: score, fitReason: reasons.join(" · ") };
  });

  ranked.sort((a, b) => b.fitScore - a.fitScore);
  return ranked.slice(0, count);
}

export function prettyRole(r: Role): string {
  return {
    frontend: "Frontend Developer",
    backend: "Backend Developer",
    fullstack: "Full-Stack Developer",
    mobile: "Mobile Developer",
    data: "Data Engineer / Analyst",
    ml: "ML Engineer",
    devops: "DevOps / Platform Engineer",
  }[r];
}

export const ALL_ROLES: { value: Role; label: string; emoji: string }[] = [
  { value: "frontend",  label: "Frontend",       emoji: "🎨" },
  { value: "backend",   label: "Backend",        emoji: "⚙️" },
  { value: "fullstack", label: "Full-Stack",     emoji: "🧱" },
  { value: "mobile",    label: "Mobile",         emoji: "📱" },
  { value: "data",      label: "Data",           emoji: "📊" },
  { value: "ml",        label: "ML / AI",        emoji: "🧠" },
  { value: "devops",    label: "DevOps",         emoji: "🛠️" },
];

export const ALL_LEVELS: { value: Level; label: string; desc: string }[] = [
  { value: "beginner",     label: "Beginner",     desc: "Built a couple of small projects." },
  { value: "intermediate", label: "Intermediate", desc: "Comfortable with a full stack." },
  { value: "advanced",     label: "Advanced",     desc: "Ship complex systems end-to-end." },
];
