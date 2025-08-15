import express, { type Express } from "express";
import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, createLogger, type InlineConfig } from "vite";
import { type Server } from "node:http";
import viteUserConfig from "../vite.config";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Mount Vite in middleware mode for development.
 * IMPORTANT: Pass the real Node HTTP `Server` for HMR.
 */
export async function setupVite(app: Express, httpServer: Server): Promise<void> {
  const vite = await createViteServer({
    ...(viteUserConfig as InlineConfig),
    configFile: false,
    appType: "custom",
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
      allowedHosts: true,
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
  });

  // Attach Vite middlewares
  app.use(vite.middlewares);

  // HTML entry point (dev — always read & transform)
  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const clientTemplate = resolve(__dirname, "..", "client", "index.html");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/**
 * Production static serving (after `vite build`)
 */
export function serveStatic(app: Express): void {
  const distPath = resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Make sure to build the client first.`
    );
  }

  app.use(express.static(distPath));

  // SPA fallback to index.html
  app.use("*", (_req, res) => {
    res.sendFile(resolve(distPath, "index.html"));
  });
}
