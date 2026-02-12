/* Express app configuration — middleware and route setup */
import express from "express";
import cors from "cors";

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Health check */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* API connectivity test */
app.get("/api/test", (req, res) => {
  res.json({ message: "Frontend ↔ Backend connected 🎉" });
});

export default app;
