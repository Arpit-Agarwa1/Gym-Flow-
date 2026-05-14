/** Simple modal wrapper — click backdrop to close */
export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] dark:bg-black/75">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-300/80 bg-white p-6 shadow-xl shadow-slate-900/10 dark:border-white/12 dark:bg-elevated dark:shadow-black/40">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-white/[0.12] dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
