"use client";

import Input from "./Input";

type Props<T> = {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  suggestions: T[];
  onSelect: (item: T) => void;
  renderSuggestion: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export default function AutocompleteInput<T>({
  value,
  onChange,
  onFocus,
  onBlur,
  suggestions,
  onSelect,
  renderSuggestion,
  getKey,
  placeholder,
  required,
  className = "",
}: Props<T>) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={`w-full ${className}`}
      />
      {suggestions.length > 0 && (
        <ul
          className="absolute z-10 left-0 right-0 rounded-xl shadow-lg mt-1 overflow-hidden max-h-40 overflow-y-auto border"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {suggestions.map((s) => (
            <li key={getKey(s)}>
              <button
                type="button"
                onPointerDown={() => onSelect(s)}
                className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 active:opacity-70"
                style={{ color: "var(--text)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--input-bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "")
                }
              >
                {renderSuggestion(s)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
