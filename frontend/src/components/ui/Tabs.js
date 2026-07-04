const Tabs = () => {
  const tabs = document.createElement("div");
  tabs.className = "flex gap-2";
  tabs.innerHTML =
    '<button class="rounded-full border border-border px-3 py-2 text-sm">Tab</button>';
  return tabs;
};

export default Tabs;
