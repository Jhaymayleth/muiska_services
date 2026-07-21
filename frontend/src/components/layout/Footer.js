const Footer = () => {
  const footer = document.createElement("footer");
  footer.className =
    "border-t border-border bg-background px-4 py-6 text-sm text-text/70 md:px-8";
  footer.innerHTML = `
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <p>MUISKA • Community Trading Platform</p>
      <p>Initial architectural base</p>
    </div>
  `;
  return footer;
};

export default Footer;
