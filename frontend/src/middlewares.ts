import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const refreshAccessToken = async (refresh_token: string) => {
  const res = await fetch(`${API_URL}/user/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh_token }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log("error from refreshAccessToken", err);
      return null;
    });

  console.log("response from refreshAccessToken", res);

  return res;
};

export const middleware = async (request: NextRequest) => {
  const access_token = request.cookies.get("access_token")?.value || "";
  const refresh_token = request.cookies.get("refresh_token")?.value || "";

  const decoded_access = jwt.decode(access_token) as jwt.JwtPayload | null;
  const decoded_refresh = jwt.decode(refresh_token) as jwt.JwtPayload | null;

  const expired_refresh =
    decoded_refresh?.exp && decoded_refresh.exp * 1000 < Date.now();
  const expired_access =
    decoded_access?.exp && decoded_access.exp * 1000 < Date.now();

  console.log("expired_refresh", expired_refresh);
  console.log("expired_access", expired_access);
  console.log("decoded_access", decoded_access);
  console.log("decoded_refresh", decoded_refresh);

  if ((!decoded_access && !decoded_refresh) || expired_refresh) {
    console.log("No access token in middleware. Redirecting from middleware");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (decoded_access && decoded_access.role === "user") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const res = NextResponse.next();

  if (decoded_refresh && (!decoded_access || expired_access)) {
    const data = await refreshAccessToken(refresh_token);
    if (data?.access_token) {
      res.cookies.set("access_token", data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
    } else {
      console.log("Yes refresh, ");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return res;
};

export const config = {
  matcher: ["/admin/:path*"],
};
