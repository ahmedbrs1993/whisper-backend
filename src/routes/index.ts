import { Router } from "express";
import authRoutes from "./authRoutes.ts";
import fileRoutes from "./fileRoutes.ts";

const router = Router();
router.use("/auth", authRoutes);
router.use("/files", fileRoutes);

export default router;