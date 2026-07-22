const icons = {
  dress: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13.7A9 9 0 1 1 6.3 6 9 9 0 0 0 12 19l6-6z"></path><path d="M12 12V3"></path><path d="M9 11l3 3 3-3"></path></svg>',
  food: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2"></path><path d="M6 12h12"></path><path d="M6 12a6 6 0 0 0 12 0"></path><path d="M6 12V6a6 6 0 0 1 12 0v6"></path></svg>',
  tech: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="2" y1="7" x2="22" y2="7"></line><line x1="2" y1="13" x2="12" y2="13"></line><line x1="2" y1="17" x2="12" y2="17"></line><polyline points="18 13 18 21 12 21 12 17"></polyline></svg>',
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9M5 10v10h14V10"></path><path d="M9 21V12h6v9"></path></svg>',
  art: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c5-9 13-9 22 0-5 4-11 4-22 0z"></path><path d="M12 12c-2 0-4-1-4-3s2-3 4-3 4 1 4 3-2 3-4 3z"></path></svg>',
  health: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c.6 0 1.1-.5 1.4-1.2A3 3 0 0 0 18 8a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3 3 3 0 0 0 2 2.7c.2.7.7 1.3 1.4 1.5A3 3 0 1 0 12 21a3 3 0 0 0 1-5.83z"></path></svg>',
  education: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3v18h20V6a2 2 0 0 0-2-2H8H2z"></path><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path><path d="M6 6h12"></path><path d="M6 10h12"></path><path d="M6 14h6"></path></svg>',
  services: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-5.9 4.2 6 6 0 0 1-1.9-12 6 6 0 0 1 2.2 1.5z"></path><path d="M10.6 10.6a1 1 0 0 0 1.4 0l1.6-1.6a1 1 0 0 0 0-1.4l-3.7-3.7a6 6 0 0 1 4.2 5.9 6 6 0 0 1-5.9 5.9 6 6 0 0 1-4.2-1.5z"></path></svg>',
  package: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-8-5a2 2 0 0 0-2 0l-8 5a2 2 0 0 0-1 1.73v8a2 2 0 0 0 1 1.73l8 5a2 2 0 0 0 2 0l8-5a2 2 0 0 0 1-1.73z"></path><path d="M12 2v20"></path><path d="M3.5 7l8.5 5 8.5-5"></path><path d="M12 12l8.5 5"></path></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  location: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  phone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.41 9.91a16 16 0 0 0 6.68 6.68l1.5-1.5a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
  verified: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-2-2"></path></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 11 24 11 17 17 20 26 12 20 4 26 7 17 0 11 9 11"></polygon></svg>',
  distance: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.26 10.26a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2 .6 2.84a4.77 4.77 0 0 1 1.41 2.5"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2 .6 2.84a4.77 4.77 0 0 1 1.41 2.5"></path></svg>',
};

export const getIcon = (name) => icons[name] || "";

export const getCategoryIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("clothing") || lower.includes("fashion")) return icons.dress;
  if (lower.includes("food") || lower.includes("beverage")) return icons.food;
  if (lower.includes("electronics") || lower.includes("tech")) return icons.tech;
  if (lower.includes("home") || lower.includes("garden") || lower.includes("real estate")) return icons.home;
  if (lower.includes("art") || lower.includes("craft")) return icons.art;
  if (lower.includes("health") || lower.includes("beauty")) return icons.health;
  if (lower.includes("education")) return icons.education;
  if (lower.includes("service")) return icons.services;
  return icons.package;
};

export default icons;
