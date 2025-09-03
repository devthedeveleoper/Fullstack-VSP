import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const sanitizeUser = (user) => {
  const { _id, username, email } = user;
  return { id: _id, username, email };
};

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return NextResponse.json({
      message: "Logged in successfully",
      token: `Bearer ${token}`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
