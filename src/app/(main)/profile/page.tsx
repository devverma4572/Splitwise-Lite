import { getSession } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();

  return <ProfileClient name={session!.name} email={session!.email} />;
}
