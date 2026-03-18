export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--surface)",
        borderRadius: "1rem",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}
