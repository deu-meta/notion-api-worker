import { RequestHandler } from "express";
import { fetchNotionSearch } from "../api/notion";
import { parsePageId } from "../api/utils";

export const searchRoute: RequestHandler = async (req, res) => {
  const ancestorId = parsePageId((req.query.ancestorId as string) || "");
  const query = (req.query.query as string) || "";
  const limit = Number((req.query.limit as string) || 20);

  if (!ancestorId) {
    return res.status(400).json({ error: 'missing required "ancestorId"' });
  }

  const results = await fetchNotionSearch({
    ancestorId,
    query,
    limit,
  });

  return res.json(results);
};
