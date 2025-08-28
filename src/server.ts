import express from "express";
import cors from "cors";
import routes from "./routes/index.ts";

import { errorMiddleware } from "./middleware/errorMiddleware.ts";
import { ENV } from "./config/env.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/api", routes);
app.use(errorMiddleware);

app.get("/", (_req, res) => res.send("Backend is running"));

app.listen(ENV.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${ENV.PORT}`);
});
