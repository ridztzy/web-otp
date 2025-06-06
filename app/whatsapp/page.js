import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ClientWhatsAppContent from "./ClientWhatsAppContent";

export default async function WhatsAppPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <ClientWhatsAppContent />;
}