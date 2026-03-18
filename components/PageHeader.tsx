export default function PageHeader({ title }: { title: string }) {
  return (
    <header
      className="px-5 py-5"
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <h1 className="text-2xl" style={{ color: "var(--text)" }}>
        {title}
      </h1>
    </header>
  );
}
