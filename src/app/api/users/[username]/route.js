import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const user = await User.findOne({ username: params.username });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const videos = await Video.find({ uploader: user._id })
      .sort({ createdAt: -1 })
      .populate("uploader", "username");

    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        joined: user.createdAt,
      },
      videos: videos,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
