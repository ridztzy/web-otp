import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ClientPengaturanContent from "./ClientPengaturanContent";

export default async function PengaturanPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <ClientPengaturanContent />;
}