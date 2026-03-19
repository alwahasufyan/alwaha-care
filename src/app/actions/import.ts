"use server";

import { getSession } from "@/lib/auth";
import { createImportJob } from "@/lib/import-jobs";

export async function queueBeneficiariesImport(data: unknown[]) {
  const session = await getSession();
  if (!session) {
    return { error: "غير مصرح" };
  }
  if (!session.is_admin) {
    return { error: "هذه العملية للمشرف فقط" };
  }

  return createImportJob(data, session.username);
}
