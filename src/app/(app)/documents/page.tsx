import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { DocumentManager } from "@/components/app/document-manager";
import { requireUser } from "@/lib/session";
import { getUnreadCount, getUserDocuments } from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Document Vault",
  description: "Organize important academic and application documents securely.",
};
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requireUser("/documents");
  const [documents, unread] = await Promise.all([
    getUserDocuments(),
    getUnreadCount(),
  ]);
  const verified = documents.filter((d) => d.status === "VERIFIED").length;

  return (
    <>
      <AppTopbar title="Document Vault" user={user} unread={unread} />
      <div className="flex-1 space-y-6 px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-500" />
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Secure Document Vault
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {verified} of {documents.length || 0} documents verified and ready to use in
            applications.
          </p>
        </div>

        <DocumentManager documents={documents} />

        <p className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
          Documents are stored privately in your vault. The AI Application Assistant can
          reference them while helping you prepare an application, but you always review
          and confirm before anything is submitted.
        </p>
      </div>
    </>
  );
}
