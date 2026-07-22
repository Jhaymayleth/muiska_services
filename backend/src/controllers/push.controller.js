import { pushService } from "../services/push.service.js";

export const getPublicKey = (req, res) => {
  res.json({ publicKey: pushService.getPublicKey() });
};

export const subscribe = async (req, res, next) => {
  try {
    const { endpoint, p256dh, auth } = req.body;
    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({ message: "endpoint, p256dh, and auth are required" });
    }
    await pushService.subscribe(req.user.id, { endpoint, p256dh, auth });
    res.json({ message: "Subscribed" });
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: "endpoint is required" });
    await pushService.unsubscribe(req.user.id, endpoint);
    res.json({ message: "Unsubscribed" });
  } catch (error) {
    next(error);
  }
};
