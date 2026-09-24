import { NextRequest } from "next/server";
import { handleRegistration } from "../signup/route";

export async function POST(request: NextRequest) {
  return handleRegistration(request);
}
