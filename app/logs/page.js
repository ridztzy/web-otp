import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogOtpPage from "./LogOtpPage"; // Pastikan komponen utama dipisah ke file ini

export default async function LogsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <LogOtpPage />;
}