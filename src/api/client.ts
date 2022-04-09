import axios from "axios";

const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;

export const apiClient = axios.create({
  baseURL: "https://www.notion.so/api/v3",
  headers: {
    "Content-Type": "application/json",
    ...(NOTION_API_TOKEN && { Cookie: `token_v2=${NOTION_API_TOKEN}` }),
  },
});
