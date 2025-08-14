// Load environment variables first
import { config } from "dotenv";
config({ path: ".env" });

import express, { type Request, type Response, type NextFunction } from "express";
import { createServer as createHttpServer } from "node:http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { connectDB } from "./db";

const app = express();

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Tiny API logger (no tuple-spread => no TS2556)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let captured: unknown;

  const originalJson = res.json.bind(res) as (body: any) => Response;
  (res as any).json = (body: any) => {
    captured = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (captured !== undefined) line += ` :: ${JSON.stringify(captured)}`;
      if (line.length > 80) line = line.slice(0, 79) + "…";
      console.log(line);
    }
  });

  next();
});

(async () => {
  try {
    // 1) DB first
    await connectDB();

    // 2) App routes (includes session setup)
    await registerRoutes(app);

    // 3) Create the Node HTTP server ONCE
    const httpServer = createHttpServer(app);

    // 4) Dev vs Prod
    if (process.env.NODE_ENV === "production") {
      // serve prebuilt static assets
      serveStatic(app);
    } else {
      // wire Vite in middleware mode; Vite HMR needs the **httpServer**
      await setupVite(app, httpServer);
    }

    // 5) Listen using the httpServer (not something returned by setupVite)
    const PORT = Number(process.env.PORT) || 5000;
    const HOST = process.env.HOST || "0.0.0.0";

    httpServer.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();