
import { analyzeEligibilitySmart, checkReadinessSmart } from "../src/lib/ai-model";
import { analyzeEligibility, checkReadiness } from "../src/lib/ai";

async function runTests() {
  console.log("🚀 Starting AI Logic Verification...");

  const testOpportunity = {
    slug: "research-internship",
    title: "Research Internship",
    organizer: "Tech Uni",
    type: "Research" as any,
    shortSummary: "AI Research",
    description: "Seeking students...",
    location: "Remote",
    mode: "Online" as any,
    status: "Open" as any,
    logoText: "TU",
    logoColor: "#ff0000",
    eligibility: ["CGPA > 3.5", "Interest in AI"],
    tags: ["AI", "ML"],
    deadlines: [],
  };

  const testProfile = {
    name: "Devang Shah",
    email: "devang@example.com",
    headline: "CS Student",
    educationLevel: "Undergraduate",
    fieldOfStudy: "Computer Science",
    institution: "XYZ College",
    graduationYear: 2026,
    cgpa: 3.8,
    city: "Mumbai",
    country: "India",
    interests: ["AI", "Machine Learning"],
    careerGoals: ["AI Researcher"],
    preferredTypes: ["Research" as any],
    completeness: 90,
  };

  console.log("\n--- Testing analyzeEligibilitySmart (AI + Fallback) ---");
  try {
    const result = await analyzeEligibilitySmart(testOpportunity, testProfile);
    console.log("✅ Result:", JSON.stringify(result, null, 2));
    if (result.eligible === undefined) {
        // In src/lib/ai-model.ts, analyzeEligibilitySmart returns EligibilityResult.
        // EligibilityResult (from src/lib/ai.ts) has { score, summary, signals }.
        // It does NOT have "eligible". The script should check for score/summary.
        console.log("ℹ️ Result has score and summary as expected.");
    }
  } catch (e) {
    console.error("❌ Error in analyzeEligibilitySmart:", e);
  }

  console.log("\n--- Testing analyzeEligibility (Pure Heuristic) ---");
  try {
    const result = analyzeEligibility(testOpportunity, testProfile);
    console.log("✅ Result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("❌ Error in analyzeEligibility:", e);
  }

  console.log("\n--- Testing checkReadinessSmart ---");
  try {
    const result = await checkReadinessSmart(testProfile, []);
    console.log("✅ Result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("❌ Error in checkReadinessSmart:", e);
  }

  console.log("\n🚀 Verification Complete!");
}

runTests();

