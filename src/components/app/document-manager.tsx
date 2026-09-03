"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import {
  addDocumentAction,
  deleteDocumentAction,
  verifyDocumentAction,
} from "@/lib/actions/documents";
import type { DocumentItem, DocumentStatus } from "@/lib/types";

const STATUS: Record<
  DocumentStatus,
  { label: string; variant: "success" | "warning" | "danger"; icon: typeof CheckCircle2 }
> = {
  VERIFIED: { label: "Verified", variant: "success", icon: CheckCircle2 },
  PENDING: { label: "Pending", variant: "warning", icon: Clock },
  NEEDS_REVIEW: { label: "Needs review", variant: "danger", icon: TriangleAlert },
};

const CATEGORIES = [
  "Marksheet",
  "ID Proof",
  "Certificate",
  "Application Asset",
  "Recommendation Letter",
  "Other",
];

export function DocumentManager({ documents }: { documents: DocumentItem[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    category: "Marksheet",
    fileType: "pdf" as "pdf" | "jpg" | "png",
    sizeKb: "512",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addDocumentAction({
        name: form.name,
        category: form.category,
        fileType: form.fileType,
        sizeKb: Number(form.sizeKb),
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setForm({ name: "", category: "Marksheet", fileType: "pdf", sizeKb: "512" });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {open ? (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-semibold">Add a document</h3>
          </div>
          {error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/[0.07] px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium">Document name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. 10th Marksheet"
                className="focus-ring h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="focus-ring h-10 rounded-lg border border-input bg-card px-2.5 text-sm outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">File type</span>
              <select
                value={form.fileType}
                onChange={(e) =>
                  setForm({ ...form, fileType: e.target.value as typeof form.fileType })
                }
                className="focus-ring h-10 rounded-lg border border-input bg-card px-2.5 text-sm outline-none"
              >
                <option value="pdf">PDF</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add to vault
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This demo records document metadata. Wire object storage (S3 / UploadThing /
            Vercel Blob) to accept real files.
          </p>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:hover:bg-brand-500/5"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold">Add new document</span>
          <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10 MB</span>
        </button>
      )}

      {documents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Your vault is empty. Add your marksheets, ID proof and photograph to speed up
          applications.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {documents.map((doc, i) => {
            const s = STATUS[doc.status];
            const FileIcon = doc.fileType === "pdf" ? FileText : ImageIcon;
            return (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-4",
                  i > 0 && "border-t border-border",
                )}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                  <FileIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.category} · {doc.fileType.toUpperCase()} ·{" "}
                    {(doc.sizeKb / 1024).toFixed(1)} MB · {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <Badge variant={s.variant}>
                  <s.icon className="h-3 w-3" />
                  {s.label}
                </Badge>
                <RowActions
                  id={doc.id}
                  verified={doc.status === "VERIFIED"}
                  onDone={() => router.refresh()}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RowActions({
  id,
  verified,
  onDone,
}: {
  id: string;
  verified: boolean;
  onDone: () => void;
}) {
  const [pending, start] = React.useTransition();
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {!verified ? (
        <button
          type="button"
          title="Mark verified"
          disabled={pending}
          onClick={() => start(async () => {
            await verifyDocumentAction(id);
            onDone();
          })}
          className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-success"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        </button>
      ) : null}
      <button
        type="button"
        title="Delete"
        disabled={pending}
        onClick={() => start(async () => {
          await deleteDocumentAction(id);
          onDone();
        })}
        className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-danger"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
