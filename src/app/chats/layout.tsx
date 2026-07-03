import BottomNav from "@/components/shared/bottom-nav";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
