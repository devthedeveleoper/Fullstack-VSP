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
    const { username, email, password } = body;

    let user = await User.findOne({ email });
    if (user) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    user = new User({ username, email, password });
    await user.save();

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        token: `Bearer ${token}`,
        user: sanitizeUser(user),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
