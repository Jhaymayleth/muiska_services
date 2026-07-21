// Middleware to require verified seller (for creating publications)
export const requireVerifiedSeller = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Admin and verifier can create publications (for testing/admin)
  if (req.user.role === "admin" || req.user.role === "verifier") {
    return next();
  }

  // Only verified sellers
  if (req.user.user_type !== "seller") {
    return res.status(403).json({ 
      message: "Only sellers can create publications",
      code: "NOT_SELLER"
    });
  }

  if (req.user.verification_status !== "approved") {
    return res.status(403).json({ 
      message: "Your profile is under verification. You cannot create publications until it is approved.",
      code: "NOT_VERIFIED",
      status: req.user.verification_status,
      reason: req.user.rejection_reason
    });
  }

  if (!req.user.is_verified_badge) {
    return res.status(403).json({ 
      message: "Your profile is not verified",
      code: "NOT_VERIFIED"
    });
  }

  next();
};