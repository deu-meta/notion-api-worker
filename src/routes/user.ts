import { RequestHandler } from "express";
import { fetchNotionUsers } from "../api/notion";

export const userRoute: RequestHandler = async (req, res) => {
  const users = await fetchNotionUsers([req.params.userId]);

  return res.json(users[0]);
};
