"use server";

import prisma from "@/lib/prisma";
import { deductionSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireActiveFacilitySession } from "@/lib/session-guard";

export async function deductBalance(formData: {
  card_number: string;
  amount: number;
  type: "MEDICINE" | "SUPPLIES";
}) {
  const session = await requireActiveFacilitySession();
  if (!session) {
    return { error: "غير مصرح لك بهذه العملية" };
  }

  const validated = deductionSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { card_number, amount, type } = validated.data;

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get beneficiary with row-level lock (using raw sql as Prisma interactive tx isn't always enough for specific locking locks)
      // On PostgreSQL, we can use SELECT ... FOR UPDATE
      const beneficiaries = await tx.$queryRaw<Array<{ id: string; remaining_balance: number; status: string }>>`
        SELECT id, remaining_balance, status FROM "Beneficiary" 
        WHERE card_number = ${card_number} 
        AND "deleted_at" IS NULL
        LIMIT 1 
        FOR UPDATE
      `;

      if (beneficiaries.length === 0) {
        throw new Error("المستفيد غير موجود");
      }

      const beneficiary = beneficiaries[0];

      if (beneficiary.status === "FINISHED" || beneficiary.remaining_balance <= 0) {
        throw new Error("رصيد المستفيد صفر أو مكتمل");
      }

      if (amount > beneficiary.remaining_balance) {
        throw new Error(`المبلغ أكبر من الرصيد المتاح (${Number(beneficiary.remaining_balance).toLocaleString("ar-LY")} د.ل)`);
      }

      const newBalance = beneficiary.remaining_balance - amount;
      const newStatus = newBalance <= 0 ? "FINISHED" : "ACTIVE";

      // 2. Update beneficiary
      await tx.beneficiary.update({
        where: { id: beneficiary.id },
        data: {
          remaining_balance: newBalance,
          status: newStatus,
        },
      });

      // 3. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          beneficiary_id: beneficiary.id,
          facility_id: session.id,
          amount,
          type,
        },
      });

      // 4. Create audit log
      await tx.auditLog.create({
        data: {
          facility_id: session.id,
          user: session.username,
          action: "DEDUCT_BALANCE",
          metadata: {
            card_number,
            amount,
            type,
            transaction_id: transaction.id,
          },
        },
      });

      return { success: true, newBalance };
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return result;
  } catch (error: unknown) {
    console.error("Deduction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to process deduction" };
  }
}
