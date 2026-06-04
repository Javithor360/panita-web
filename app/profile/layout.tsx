export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="text-foreground min-h-[calc(100vh-4rem)]">
      {children}
    </div>
  )
}
