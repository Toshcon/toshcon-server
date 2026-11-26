import cors from "cors";
import express from "express";
import { healthRouter } from "./api/v1/modules/health/health.route.js";
import { env } from "./env.js";

export const app = express();

app.use(cors({ origin: env.ADMIN_ORIGIN }));
app.use(express.json());
app.use("/health", healthRouter);
