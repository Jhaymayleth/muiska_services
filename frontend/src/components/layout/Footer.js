import { isAuthenticated } from "../../utils/auth.js";

const linkClass =
  "inline-flex items-center gap-1.5 text-sm text-text/60 transition-colors hover:text-primary";

const Footer = () => {
  const footer = document.createElement("footer");
  footer.className = "mt-auto border-t border-border/70 bg-background";

  const authenticated = isAuthenticated();
  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div class="max-w-sm">
          <a href="/" class="inline-flex items-center gap-2.5" aria-label="MUISKA — Home">
            <img src="/Logo.png" alt="" width="40" height="40" class="h-10 w-10 rounded-xl object-contain" />
            <span class="font-display text-xl font-bold tracking-tight text-primary">MUISKA</span>
          </a>
          <p class="mt-4 text-sm leading-relaxed text-text/60">
            A community marketplace to buy, sell and share with the people around you — from everyday finds to services and donations.
          </p>
          <p class="mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-text/60">
            <span class="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true"></span>
            Built for local communities
          </p>
        </div>

        <nav aria-labelledby="footer-marketplace">
          <h2 id="footer-marketplace" class="text-xs font-semibold uppercase tracking-[0.16em] text-text/40">Marketplace</h2>
          <ul class="mt-4 space-y-2.5">
            <li><a href="/explore" class="${linkClass}">Explore listings</a></li>
            <li><a href="/#Categories" class="${linkClass}">Categories</a></li>
            <li><a href="/#Listings" class="${linkClass}">Featured</a></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-community">
          <h2 id="footer-community" class="text-xs font-semibold uppercase tracking-[0.16em] text-text/40">Community</h2>
          <ul class="mt-4 space-y-2.5">
            <li><a href="/create" class="${linkClass}">Publish a listing</a></li>
            <li><a href="/chat" class="${linkClass}">Messages</a></li>
            <li><a href="/dashboard" class="${linkClass}">Dashboard</a></li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-account">
          <h2 id="footer-account" class="text-xs font-semibold uppercase tracking-[0.16em] text-text/40">Account</h2>
          <ul class="mt-4 space-y-2.5">
            ${
              authenticated
                ? `
                  <li><a href="/profile" class="${linkClass}">Your profile</a></li>
                  <li><a href="/dashboard" class="${linkClass}">Your listings</a></li>
                `
                : `
                  <li><a href="/login" class="${linkClass}">Log in</a></li>
                  <li><a href="/register" class="${linkClass}">Create an account</a></li>
                `
            }
          </ul>
        </nav>
      </div>

      <div class="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center">
        <p class="text-xs text-text/50">MUISKA &copy; ${year}. All rights reserved.</p>
        <button type="button" id="footer-top" class="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-text/60 transition-colors hover:border-primary/40 hover:text-primary">
          Back to top
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      </div>
    </div>
  `;

  footer.querySelector("#footer-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  return footer;
};

export default Footer;
