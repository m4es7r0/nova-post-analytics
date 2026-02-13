import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth-guard";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
