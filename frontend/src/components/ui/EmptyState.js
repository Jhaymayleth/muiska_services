const EmptyState = () => {
  const empty = document.createElement("div");
  empty.className =
    "rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center";
  empty.innerHTML =
    '<h3 class="text-lg font-semibold">No content yet</h3><p class="mt-2 text-sm text-text/70">This view will be implemented later.</p>';
  return empty;
};

export default EmptyState;
