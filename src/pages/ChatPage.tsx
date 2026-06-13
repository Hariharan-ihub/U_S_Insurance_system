import { useAuthStore } from '@/stores/authStore';

export function ChatPage() {
  const { userToken } = useAuthStore();
  const chatUrl = `https://agents.snsihub.ai/chat/pc_b05828347f884696affc9ac0f18e955c?token=${userToken}`;

  return (
    <div className="h-[calc(100vh-8rem)] w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950">
      {userToken ? (
        <iframe
          src={chatUrl}
          className="w-full h-full border-0"
          title="AI Chat Assistant"
          allow="clipboard-write; microphone"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500">
          Connecting to secure chat agent...
        </div>
      )}
    </div>
  );
}
