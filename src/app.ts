import express, { RequestHandler } from "express";
import cors from "cors";
import logger from "morgan";

import { pageRoute } from "./routes/page";
import { tableRoute } from "./routes/table";
import { userRoute } from "./routes/user";
import { searchRoute } from "./routes/search";

const CORS_HOST = process.env.CORS_HOST || "*";
const PORT = Number(process.env.PORT || 8787);

const app = express();

app.use(
  cors({
    origin: CORS_HOST,
    optionsSuccessStatus: 200,
    methods: ["GET", "OPTIONS"],
  })
);

app.use(logger("combined"));

const crashSafeWrapper: (handler: RequestHandler) => RequestHandler = (
  handler: RequestHandler
) => async (req, res, next) => {
  try {
    return await handler(req, res, next);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
};

app.get("/v1/page/:pageId", crashSafeWrapper(pageRoute));
app.get("/v1/table/:pageId", crashSafeWrapper(tableRoute));
app.get("/v1/user/:userId", crashSafeWrapper(userRoute));
app.get("/v1/search", crashSafeWrapper(searchRoute));

app.get("*", (req, res) =>
  res.status(404).json({
    error: `Route not found!`,
    routes: ["/v1/page/:pageId", "/v1/table/:pageId", "/v1/user/:pageId"],
  })
);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`App is now running on port ${PORT}.`);
});

function shutdownHandler() {
  console.log("Shutdown server ...");
  server.close();
  process.exit(0);
}

process.on("SIGTERM", shutdownHandler);
process.on("SIGINT", shutdownHandler);
