import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processImportJob } from "@/lib/import-jobs";
import { logger } from "@/lib/logger";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { jobId } = await params;
  // fire-and-forget: مناسب لـ Node.js server دائم — أي خطأ غير متوقع يُسجَّل في console
  void Promise.resolve().then(async () => {
    await processImportJob(jobId, session.username);
  }).catch((err: unknown) => {
    logger.error("Import job uncaught error", { jobId, error: String(err) });
  });

  return NextResponse.json({ accepted: true, jobId }, { status: 202 });
}