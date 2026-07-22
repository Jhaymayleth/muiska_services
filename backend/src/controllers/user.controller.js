import { userService } from "../services/user.service.js";

export const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await userService.getPublicProfile(id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const [stats, publications] = await Promise.all([
      userService.getUserStats(id),
      userService.getUserActivePublications(id),
    ]);

    res.json({ profile, stats, publications });
  } catch (error) {
    next(error);
  }
};
