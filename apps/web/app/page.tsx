import { cookies } from "next/headers";
import ChatRoom from "../components/ChatRoom";
import AuthForm from "../components/AuthForm";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("chat_token")?.value;
  const username = cookieStore.get("chat_username")?.value;

  // If valid token + username cookie exist, go straight to chat
  if (token && username) {
    return <ChatRoom token={token} username={username} />;
  }

  // Otherwise show the single-field auth form
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">master-global-chat</h1>
          <p className="text-sm text-muted-foreground">
            {"One room. Everyone's in it."}
          </p>
        </div>
        <AuthForm/>
      </div>
    </div>
  );
}