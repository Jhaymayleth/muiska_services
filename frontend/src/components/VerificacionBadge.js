export function createVerificacionBadge({ verified = false, status = "pending", size = "md" }) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  if (verified) {
    return `<span class="inline-flex items-center gap-1 rounded-full bg-green-100 font-medium text-green-800 ${sizeClass}">
      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414 l-8 8a1 1 0 01-1.414 0 l-4-4a1 1 0 011.414-1.414 L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
      Verified
    </span>`;
  }

  if (status === "rejected") {
    return `<span class="inline-flex items-center gap-1 rounded-full bg-red-100 font-medium text-red-800 ${sizeClass}">
      Not Verified
    </span>`;
  }

  return `<span class="inline-flex items-center gap-1 rounded-full bg-yellow-100 font-medium text-yellow-800 ${sizeClass}">
    Pending Verification
  </span>`;
}
