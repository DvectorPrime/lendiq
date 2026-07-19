import { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormInput({ label, error, helperText, className = "", id, ...props }: FormInputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 ${
          error ? "border-red-400" : "border-gray-300"
        }`}
        onWheel={(e) => e.currentTarget.blur()}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export function FormSelect({ label, error, helperText, children, className = "", id, ...props }: FormSelectProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 ${
          error ? "border-red-400" : "border-gray-300"
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
