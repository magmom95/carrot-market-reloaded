import { NextRequest, NextResponse } from "next/server";
import db from "./lib/db";
import getSession from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];

  if (!session.id) {
    // 로그아웃 상태
    if (!exists) {
      // private 페이지에 접속하면
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // 로그인 상태
    if (exists) {
      // public 페이지에 접속하면
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }
}

export const config = {
  matcher: ["/", "/profile", "/create-account"], //middleware가 특정 url에서만 실행되도록 지정
  // "/user/:path*" 이런 식으로 작성하면
  // user로 시작하는 모든 단일 URL에서 실행(/user/profile, /user/review 등등)
};
