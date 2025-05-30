// routes/metricsRoute.js
import express from "express";
import { client } from "../config/prometheus.js";

const router = express.Router();

router.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
