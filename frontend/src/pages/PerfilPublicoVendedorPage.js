import { loadTemplate } from "../utils/templateLoader.js";
import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { createVerificacionBadge } from "../components/VerificacionBadge.js";
import ListingCard from "../components/listing/ListingCard.js";
import { useGeolocation } from "../hooks/useGeolocation.js";
import { getIcon } from "../utils/icons.js";

const PerfilPublicoVendedorPage = async () => {
  const template = loadTemplate("PerfilPublicoVendedorPage");
  const section = document.createElement("section");
  section.className = "mx-auto max-w-6xl px-4 py-8";
  section.innerHTML = template;

  const pathParts = window.location.pathname.split("/");
  const sellerId = pathParts[pathParts.length - 1];

  const nameEl = section.querySelector("#profile-name");
  const neighborhoodEl = section.querySelector("#profile-neighborhood");
  const distanceEl = section.querySelector("#profile-distance");
  const badgeEl = section.querySelector("#profile-badge");
  const ratingEl = section.querySelector("#profile-rating");
  const bioEl = section.querySelector("#profile-bio");
  const whatsappBtn = section.querySelector("#whatsapp-btn");
  const avatarEl = section.querySelector("#profile-avatar");
  const listingsGrid = section.querySelector("#listings-grid");
  const backBtn = section.querySelector("#back-btn");

  const statActive = section.querySelector("#stat-active");
  const statReviews = section.querySelector("#stat-reviews");
  const statRating = section.querySelector("#stat-rating");

  backBtn.addEventListener("click", () => {
    window.history.back();
  });

  try {
    const res = await api.getPublicProfile(sellerId);
    const { profile, stats, publications } = res;

    nameEl.textContent = profile.name || "Unknown";
    if (profile.neighborhood_name) {
      neighborhoodEl.textContent = profile.neighborhood_name + (profile.locality ? `, ${profile.locality}` : "");
    }

    if (profile.is_verified_badge) {
      badgeEl.innerHTML = createVerificacionBadge({ verified: true, size: "md" });
    } else {
      badgeEl.innerHTML = createVerificacionBadge({ verified: false, status: profile.verification_status, size: "md" });
    }

    if (profile.bio) {
      bioEl.textContent = profile.bio;
    } else {
      bioEl.textContent = "No bio available.";
    }

    if (profile.avg_rating > 0) {
      ratingEl.innerHTML = `<span class="text-sm font-medium text-gray-700 flex items-center gap-1">${getIcon("star")} ${profile.avg_rating.toFixed(1)} (${profile.total_reviews} reviews)</span>`;
    } else {
      ratingEl.innerHTML = `<span class="text-sm font-medium text-gray-500">No reviews yet</span>`;
    }

    if (profile.whatsapp) {
      const encodedText = encodeURIComponent(`Hello, I saw your listing on MUISKA. I'm interested in your services.`);
      whatsappBtn.href = `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}?text=${encodedText}`;
    } else {
      whatsappBtn.style.display = "none";
    }

    if (profile.profile_image_url) {
      avatarEl.innerHTML = `<img src="${profile.profile_image_url}" alt="${profile.name}" class="h-24 w-24 rounded-full object-cover" />`;
    }

    statActive.textContent = stats.active_listings || 0;
    statReviews.textContent = stats.total_reviews || 0;
    statRating.textContent = stats.avg_rating ? stats.avg_rating.toFixed(1) : "0.0";

    if (publications.length === 0) {
      listingsGrid.innerHTML = '<p class="text-gray-500">No active listings.</p>';
    } else {
      listingsGrid.innerHTML = "";
      publications.forEach((pub) => listingsGrid.appendChild(ListingCard(pub)));
    }

    // Calculate distance if user has location
    try {
      const geo = useGeolocation();
      const pos = await geo.getCurrentPosition();
      if (profile.lat && profile.lng) {
        const dist = calculateDistance(pos.lat, pos.lng, parseFloat(profile.lat), parseFloat(profile.lng));
        distanceEl.textContent = `A ${dist.toFixed(1)} km de ti`;
      }
    } catch {
      // User didn't share location - skip distance
    }
  } catch (err) {
    nameEl.textContent = "Error loading profile";
    listingsGrid.innerHTML = `<p class="text-red-600">Error: ${err.message || "Could not load profile"}</p>`;
  }

  return section;
};

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default PerfilPublicoVendedorPage;
