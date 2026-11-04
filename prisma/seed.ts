import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { OPPORTUNITIES } from "../src/lib/data/opportunities";
import { DEMO_DOCUMENTS, DEMO_STUDENT } from "../src/lib/data/student";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo1234";

async function main() {
  console.log("→ Seeding OpSauce …");

  const bySlug: Record<string, string> = {};
  for (const o of OPPORTUNITIES) {
    const existing = await prisma.opportunity.findUnique({
      where: { slug: o.slug },
      include: { deadlines: true },
    });

    if (!existing) {
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
    } else {
      bySlug[o.slug] = existing.id;
    }
  }
  console.log(`  ✓ ${OPPORTUNITIES.length} opportunities synced`);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: DEMO_STUDENT.email },
        { email: { endsWith: "@opsauce.ai" } },
        { email: { endsWith: "@opportunityos.ai" } },
      ],
    },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_STUDENT.email,
        name: DEMO_STUDENT.name,
        avatarUrl: DEMO_STUDENT.avatarUrl,
        passwordHash,
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
      include: { profile: true },
    });

    if (bySlug["google-ai-essentials"] && bySlug["smart-india-hackathon-2027"]) {
      await prisma.savedOpportunity.createMany({
        data: ["google-ai-essentials", "smart-india-hackathon-2027"].map((slug) => ({
          userId: user!.id,
          opportunityId: bySlug[slug],
        })),
      }).catch(() => null);
    }

    if (bySlug["gate-2027"] && bySlug["aws-certified-cloud-practitioner"]) {
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
        ],
      }).catch(() => null);
    }
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: DEMO_STUDENT.email,
        name: DEMO_STUDENT.name,
        passwordHash,
      },
    });
  }

  console.log(`  ✓ demo student verified: ${DEMO_STUDENT.email} / ${DEMO_PASSWORD}`);
  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed error (non-fatal):", e);
  })
  .finally(() => prisma.$disconnect());
