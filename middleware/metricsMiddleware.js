// middleware/metricsMiddleware.js
import { httpRequestCounter } from "../config/prometheus.js";

const metricsMiddleware = (req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
};

export default metricsMiddleware;
