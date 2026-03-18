export default function PageSkeleton({ title }: { title: string }) {
  return (
    <div>
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
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 rounded-2xl animate-pulse"
            style={{
              backgroundColor: "var(--surface)",
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
