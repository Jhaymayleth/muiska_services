const Badge = () => {
  const badge = document.createElement("span");
  badge.className =
    "inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent";
  badge.textContent = "Badge";
  return badge;
};

export default Badge;
