import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default async function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "CITIZEN") redirect("/login");

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <Navbar role={session.role} userName={session.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
