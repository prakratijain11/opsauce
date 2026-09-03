import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { ApplyAssistant, type AssistantField } from "@/components/app/apply-assistant";
import { findOpportunity } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import {
  getApplicationForSlug,
  getUnreadCount,
  getUserDocuments,
} from "@/lib/user-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const o = await findOpportunity(params.slug);
  return { title: o ? `Apply · ${o.title}` : "Apply" };
}

export default async function ApplyPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireUser(`/opportunities/${params.slug}/apply`);
  const opportunity = await findOpportunity(params.slug);
  if (!opportunity) notFound();

  const [application, documents, unread] = await Promise.all([
    getApplicationForSlug(params.slug),
    getUserDocuments(),
    getUnreadCount(),
  ]);

  if (!application) redirect(`/opportunities/${params.slug}`);

  const p = user.profile;
  const hasDoc = (re: RegExp) =>
    documents.some((d) => re.test(d.name) && d.status === "VERIFIED");

  const fields: AssistantField[] = [
    { key: "fullName", label: "Full name", value: user.name, confidence: 99, source: "Profile" },
    { key: "email", label: "Email address", value: user.email, confidence: 99, source: "Profile" },
    {
      key: "institution",
      label: "Institution",
      value: p.institution,
      confidence: p.institution ? 96 : 0,
      source: "Profile",
    },
    {
      key: "course",
      label: "Course / Field of study",
      value: p.fieldOfStudy,
      confidence: p.fieldOfStudy ? 95 : 0,
      source: "Profile",
    },
    {
      key: "gradYear",
      label: "Year of graduation",
      value: p.graduationYear ? String(p.graduationYear) : "",
      confidence: p.graduationYear ? 92 : 0,
      source: "Profile",
    },
    {
      key: "cgpa",
      label: "CGPA / Percentage",
      value: p.cgpa ? p.cgpa.toFixed(1) : "",
      confidence: p.cgpa ? 88 : 0,
      source: "Profile",
    },
    {
      key: "city",
      label: "City",
      value: p.city,
      confidence: p.city ? 90 : 0,
      source: "Profile",
    },
    {
      key: "idProof",
      label: "Identity proof",
      value: hasDoc(/aadhaar|passport|id/i) ? "Aadhaar Card (verified)" : "",
      confidence: hasDoc(/aadhaar|passport|id/i) ? 84 : 0,
      source: "Document Vault",
    },
    {
      key: "marksheet",
      label: "Latest marksheet",
      value: hasDoc(/12th|marksheet/i) ? "12th Marksheet (verified)" : "",
      confidence: hasDoc(/12th|marksheet/i) ? 82 : 0,
      source: "Document Vault",
    },
    {
      key: "statement",
      label: "Statement of purpose",
      value: "",
      confidence: 0,
      source: "Needs your input",
    },
  ];

  return (
    <>
      <AppTopbar title="AI Application Assistant" user={user} unread={unread} />
      <div className="flex-1 px-5 py-8 sm:px-8">
        <Link
          href={`/opportunities/${params.slug}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to opportunity
        </Link>
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {opportunity.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {opportunity.organizer} · {opportunity.type}
          </p>
        </div>
        <ApplyAssistant
          slug={params.slug}
          opportunityTitle={opportunity.title}
          officialUrl={opportunity.officialUrl}
          fields={fields}
        />
      </div>
    </>
  );
}
