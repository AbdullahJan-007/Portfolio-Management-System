import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const unauthorized = () => error("Not authenticated", 401);
export const notFound = (msg = "Not found") => error(msg, 404);
export const serverError = (msg = "Something went wrong") => error(msg, 500);
