export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{ backgroundColor: "var(--input-bg)" }}
      className={`rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] ${className}`}
      {...props}
    />
  );
}
