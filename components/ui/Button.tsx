export default function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      style={{ backgroundColor: "var(--green)" }}
      className={`text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 active:opacity-80 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
