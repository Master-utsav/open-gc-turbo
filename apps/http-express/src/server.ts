import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user.route.js";
import { messageRoute } from "./routes/message.route.js";
import { mediaRouter } from "./routes/media.route.js";
 
const app = express();
const PORT = process.env.HTTP_PORT || 8080;
 
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" })); // media uploads come through here
 
app.use("/api/v1/auth",     userRouter);
app.use("/api/v1/messages", messageRoute);
app.use("/api/v1/media",   mediaRouter);
 
app.listen(PORT, () => {
  console.log(`[http] API running on http://localhost:${PORT}`);
});
 