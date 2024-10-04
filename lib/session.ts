import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  id?: number;
}

export default function getSession() {
  return getIronSession<SessionContent>(cookies(), {
    cookieName: "당근마켓 쿠키",
    password: process.env.COOKIE_PASSWORD!,
  });
}
