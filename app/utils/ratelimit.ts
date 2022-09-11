import rateLimit from "express-rate-limit";

const RateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2,
  message: "You are ratelimited.",
});

export default RateLimit;
