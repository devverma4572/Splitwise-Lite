import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Navbar userName={session.name} />
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
    </>
  );
}
