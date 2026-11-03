/**
 * OpSauce — single source of truth for brand + attribution.
 * Referenced by the About page, Splash screen, Footer and Settings → About.
 */

export const BRAND = {
  name: "OpSauce",
  shortName: "OpSauce",
  tagline: "Never Miss the Opportunity Meant for You.",
  subtitle: "Empowering students to discover opportunities before they miss them.",
  version: "1.0",
  year: 2026,
  description:
    "OpSauce is a premium AI-powered student opportunity discovery and application assistance platform designed to help students discover, track, prepare for, and apply to relevant opportunities.",
  mission:
    "No student should miss an opportunity simply because they did not know it existed or missed its deadline.",
  missionLong:
    "To ensure that no student misses an exam, certification, scholarship, internship, hackathon, fellowship, research opportunity, or career opportunity simply because they did not know it existed or missed its deadline.",
  vision: [
    "Our vision is to build a world where every student has equal access to information about opportunities that can shape their future.",
    "We believe opportunities should not be missed because of a lack of awareness.",
  ],
} as const;

export const DEVELOPERS = [
  {
    name: "Prakrati Jain",
    role: "Developer",
    description:
      "Passionate about technology, innovation, and creating impactful digital solutions for students and society.",
    focus: ["Engineering", "Design Systems", "Experience"],
    socials: { github: "#", linkedin: "#", email: "#" },
  },
] as const;

export const DEVELOPED_BY = "Prakrati Jain";
export const COPYRIGHT = `© ${BRAND.year} ${BRAND.name}. All rights reserved.`;

export const OPPORTUNITY_CATEGORIES = [
  "Competitive Exams",
  "Professional Certifications",
  "Scholarships",
  "Internships",
  "Hackathons",
  "Fellowships",
  "Research Opportunities",
  "Workshops",
  "Higher Education Opportunities",
  "Government Opportunities",
  "Career Programs",
] as const;

export const WHAT_WE_DO = [
  {
    icon: "Compass",
    title: "Discover Opportunities",
    body: "Find exams, certifications, scholarships, internships, hackathons, fellowships, and other opportunities relevant to your profile.",
  },
  {
    icon: "CalendarClock",
    title: "Smart Deadline Tracking",
    body: "Never miss important registration dates, application deadlines, exam schedules, and important updates.",
  },
  {
    icon: "ShieldCheck",
    title: "AI Eligibility Analysis",
    body: "Understand whether you may be eligible for an opportunity based on your academic profile.",
  },
  {
    icon: "ClipboardCheck",
    title: "AI Readiness Check",
    body: "Identify missing documents and incomplete information before starting an application.",
  },
  {
    icon: "FolderLock",
    title: "Secure Document Vault",
    body: "Organize important academic and application documents securely in one place.",
  },
  {
    icon: "Sparkles",
    title: "AI Application Assistant",
    body: "Get intelligent assistance while preparing application information, with the student always maintaining control over review and final submission.",
  },
] as const;
