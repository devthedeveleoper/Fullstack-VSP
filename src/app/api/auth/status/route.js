import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyJwt } from "@/lib/authUtils";

export async function GET(request) {
  await dbConnect();
  try {
    const userPayload = verifyJwt(request);
    if (!userPayload) {
      return NextResponse.json({ isAuthenticated: false, user: null });
    }

    const user = await User.findById(userPayload.id).select("-password");
    if (!user) {
      return NextResponse.json({ isAuthenticated: false, user: null });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Auth status check failed:", error);
    return NextResponse.json({ isAuthenticated: false, user: null });
  }
}
