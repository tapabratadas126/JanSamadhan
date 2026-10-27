import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div
      className="min-h-screen bg-[#faf9f6] text-[#171e19] flex flex-col selection:bg-[#ffe17c]"
      style={{
        backgroundImage: `radial-gradient(#171e19 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      <Navbar role={session.role} userName={session.name} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
