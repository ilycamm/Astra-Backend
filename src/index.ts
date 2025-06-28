import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HandleNotFound } from "./utils/handling/errorHandler";
import { Log } from "./utils/handling/logging";
import { Connect } from "./db/connect";
import LoadRoutes from "./utils/routing/loadRoutes";
import path from "path";
import { createCatalog } from "./utils/creationTools/createShop";

const app = new Hono({ strict: false });

app.use(cors());
app.use(logger());

app.notFound(async (c) => {
  return HandleNotFound(c);
});

export default app;

Log(`Running on port ` + process.env.PORT);
Connect(process.env.MONGO || "mongodb://localhost:27017/crystal");

await LoadRoutes.loadRoutes(path.join(__dirname, "app"), app);

await createCatalog();
await import("./bot/index");
