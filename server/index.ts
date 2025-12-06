// Forçar reload do .env sobrescrevendo variáveis de ambiente do sistema
import dotenv from "dotenv";
import { resolve } from "path";

// Carregar .env com override = true para sobrescrever variáveis do sistema
dotenv.config({ path: resolve(process.cwd(), ".env"), override: true });

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy - necessary when behind nginx/apache
app.set('trust proxy', 1);

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: {
      id: number;
      username: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

// Configurar MemoryStore para evitar problemas de sessão em memória
// que causavam logout após ~24 horas
const MemoryStore = createMemoryStore(session);

app.use(
  session({
    // Store persistente com limpeza automática
    store: new MemoryStore({
      checkPeriod: 86400000, // Limpar sessões expiradas a cada 24h (em ms)
      ttl: 604800000, // TTL de 7 dias (em ms)
      stale: false, // Não retornar sessões expiradas
    }),
    secret: process.env.SESSION_SECRET || "zatplant-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renovar cookie a cada requisição (evita expiração durante uso)
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_MAX_AGE || String(1000 * 60 * 60 * 24 * 7)), // 7 dias ao invés de 1
      sameSite: 'lax',
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
