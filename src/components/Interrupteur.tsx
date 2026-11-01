"use client";

/**
 * Interrupteur on/off. 52×32px.
 * Accessible : role="switch" aria-checked.
 */
export default function Interrupteur({
  actif,
  onChange,
  label,
}: {
  actif: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      onClick={() => onChange(!actif)}
      className="relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      style={{ backgroundColor: actif ? "#2D2A9E" : "#C9CBC4" }}
    >
      <span
        className="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: actif ? "translateX(22px)" : "translateX(2px)", marginTop: 2 }}
      />
    </button>
  );
}
