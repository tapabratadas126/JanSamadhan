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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar role={session.role} userName={session.name} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
