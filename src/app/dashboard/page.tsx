import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { DeductForm } from "@/components/deduct-form";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Shell facilityName={session.name} isAdmin={session.is_admin}>
      <DeductForm />
    </Shell>
  );
}


