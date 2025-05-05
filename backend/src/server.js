import express from "express"; 
import cors from "cors"; 
import fs from "fs"; 
import path from "path";
import { fileURLToPath } from 'url';
import { ENV_VARS } from "./config/envVars.config.js";
import userRoutes from "./routes/users.route.js";

const app = express();
const PORT = ENV_VARS.PORT;

app.use(cors({
  origin: ENV_VARS.CLIENT_URL || "http://localhost:5173", 
  methods: ["GET"]
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf-8')
);

app.use(express.json());

app.use("/api/v1", userRoutes)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});