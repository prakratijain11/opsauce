export type OpportunityType =
  | "Competitive Exam"
  | "Certification"
  | "Scholarship"
  | "Internship"
  | "Hackathon"
  | "Fellowship"
  | "Research"
  | "Workshop"
  | "Higher Education"
  | "Government"
  | "Career Program";

export type OpportunityStatus = "Open" | "Upcoming" | "Closed";
export type DeadlinePriority = "HIGH" | "MEDIUM" | "LOW";
export type ApplicationStage =
  | "SAVED"
  | "PREPARING"
  | "READY"
  | "SUBMITTED"
  | "RESULT";
export type DocumentStatus = "VERIFIED" | "PENDING" | "NEEDS_REVIEW";

export interface DeadlineItem {
  label: string;
  date: string; // ISO
  priority: DeadlinePriority;
  isPrimary?: boolean;
}

export interface Opportunity {
  slug: string;
  title: string;
  organizer: string;
  type: OpportunityType;
  shortSummary: string;
  description: string;
  location: string;
  mode: "Online" | "Offline" | "Hybrid";
  status: OpportunityStatus;
  logoText: string;
  logoColor: string;
  eligibility: string[];
  tags: string[];
  officialUrl?: string;
  featured?: boolean;
  deadlines: DeadlineItem[];
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  fileType: "pdf" | "jpg" | "png";
  sizeKb: number;
  status: DocumentStatus;
  uploadedAt: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  headline: string;
  educationLevel: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
  cgpa: number;
  city: string;
  country: string;
  interests: string[];
  careerGoals: string[];
  preferredTypes: OpportunityType[];
  completeness: number;
}
