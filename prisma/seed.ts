import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { OPPORTUNITIES } from "../src/lib/data/opportunities";
import { DEMO_DOCUMENTS, DEMO_STUDENT } from "../src/lib/data/student";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

async function main() {
  console.log("→ Seeding OpSauce …");

  await prisma.deadline.deleteMany();
  await prisma.savedOpportunity.deleteMany();
  await prisma.application.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();

  const bySlug: Record<string, string> = {};
  for (const o of OPPORTUNITIES) {
    const created = await prisma.opportunity.create({
      data: {
        slug: o.slug,
        title: o.title,
        organizer: o.organizer,
        type: o.type,
        shortSummary: o.shortSummary,
        description: o.description,
        location: o.location,
        mode: o.mode,
        status: o.status,
        logoText: o.logoText,
        logoColor: o.logoColor,
        eligibility: JSON.stringify(o.eligibility),
        tags: JSON.stringify(o.tags),
        officialUrl: o.officialUrl,
        featured: o.featured ?? false,
        deadlines: {
          create: o.deadlines.map((d) => ({
            label: d.label,
            date: new Date(d.date),
            priority: d.priority,
            isPrimary: d.isPrimary ?? false,
          })),
        },
      },
    });
    bySlug[o.slug] = created.id;
  }
  console.log(`  ✓ ${OPPORTUNITIES.length} opportunities`);

  const user = await prisma.user.create({
    data: {
      email: DEMO_STUDENT.email,
      name: DEMO_STUDENT.name,
      avatarUrl: DEMO_STUDENT.avatarUrl,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      profile: {
        create: {
          headline: DEMO_STUDENT.headline,
          educationLevel: DEMO_STUDENT.educationLevel,
          fieldOfStudy: DEMO_STUDENT.fieldOfStudy,
          institution: DEMO_STUDENT.institution,
          graduationYear: DEMO_STUDENT.graduationYear,
          cgpa: DEMO_STUDENT.cgpa,
          city: DEMO_STUDENT.city,
          country: DEMO_STUDENT.country,
          interests: JSON.stringify(DEMO_STUDENT.interests),
          careerGoals: JSON.stringify(DEMO_STUDENT.careerGoals),
          preferredTypes: JSON.stringify(DEMO_STUDENT.preferredTypes),
          completeness: DEMO_STUDENT.completeness,
          onboarded: true,
          notificationPrefs: JSON.stringify({
            deadlines: true,
            recommendations: true,
            documents: true,
            digest: false,
          }),
          preferences: JSON.stringify({
            prioritiseExams: true,
            international: false,
            eligibleOnly: true,
            reducedMotion: false,
          }),
        },
      },
      documents: {
        create: DEMO_DOCUMENTS.map((d) => ({
          name: d.name,
          category: d.category,
          fileType: d.fileType,
          sizeKb: d.sizeKb,
          status: d.status,
          uploadedAt: new Date(d.uploadedAt),
        })),
      },
    },
  });
  console.log(`  ✓ demo student: ${user.email} / ${DEMO_PASSWORD}`);

  await prisma.savedOpportunity.createMany({
    data: ["google-ai-essentials", "smart-india-hackathon-2027"].map((slug) => ({
      userId: user.id,
      opportunityId: bySlug[slug],
    })),
  });

  await prisma.application.createMany({
    data: [
      {
        userId: user.id,
        opportunityId: bySlug["gate-2027"],
        stage: "PREPARING",
        readinessScore: 72,
      },
      {
        userId: user.id,
        opportunityId: bySlug["aws-certified-cloud-practitioner"],
        stage: "READY",
        readinessScore: 100,
      },
      {
        userId: user.id,
        opportunityId: bySlug["tcs-nqt-2027"],
        stage: "SUBMITTED",
        readinessScore: 100,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "GATE 2027 registration closes soon",
        body: "Only 3 days left to complete your GATE 2027 registration.",
        kind: "DEADLINE",
      },
      {
        userId: user.id,
        title: "New recommendation",
        body: "Google AI Essentials matches your interest in AI/ML.",
        kind: "RECOMMENDATION",
      },
      {
        userId: user.id,
        title: "Document verified",
        body: "Your 12th Marksheet has been verified and is ready to use.",
        kind: "SYSTEM",
        read: true,
      },
    ],
  });

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
