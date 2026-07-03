
export default function TextChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // No extra layout components, page handles its own header/footer
    <>{children}</>
  );
}
