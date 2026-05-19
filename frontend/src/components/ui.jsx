import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const styles = {
    primary: "bg-ink text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-700 border border-line hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700"
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
    <input className={`w-full rounded-lg border border-line bg-white px-3 py-2 text-sm transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${className}`} {...props} />
    {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
  </label>
);

export const Textarea = ({ label, error, ...props }) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
    <textarea className="min-h-24 w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100" {...props} />
    {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
  </label>
);

export const Select = ({ label, children, ...props }) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
    <select className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100" {...props}>
      {children}
    </select>
  </label>
);

export const Card = ({ children, className = "" }) => <div className={`rounded-lg border border-line bg-white shadow-sm ${className}`}>{children}</div>;

export const PageHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

export const Badge = ({ children, className = "" }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;

export const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100">x</button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
};

export const Loader = () => (
  <div className="grid min-h-72 place-items-center">
    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
  </div>
);

export const EmptyState = ({ title, description }) => (
  <Card className="p-10 text-center">
    <p className="text-base font-semibold text-slate-800">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </Card>
);

export const Skeleton = () => <div className="h-32 animate-pulse rounded-lg bg-slate-100" />;
