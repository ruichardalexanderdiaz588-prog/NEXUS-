
export default function PlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The page itself will be a full-screen component, no extra layout needed
    <>{children}</>
  );
}
