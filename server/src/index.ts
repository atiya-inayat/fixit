import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRouter from "./routes/auth";
import issueRouter from "./routes/issues";
import fundingRouter from "./routes/funding";
import dashboardRouter from "./routes/dashboard";
import verificationRouter from "./routes/verification";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(
  Boolean,
) as string[];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);
app.use("/api/issues", fundingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/issues", verificationRouter);

app.get("/health", (req: any, res: any) => {
  res.send("hello");
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
