import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import { verifyJwt } from "@/lib/authUtils";
import { Types } from "mongoose";

export async function POST(request, { params }) {
  await dbConnect();
  try {
    const user = verifyJwt(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    if (!video.likes) {
      video.likes = [];
    }

    const userIdAsObjectId = new Types.ObjectId(user.id);
    const userIndex = video.likes.findIndex((id) =>
      id.equals(userIdAsObjectId)
    );

    if (userIndex === -1) {
      video.likes.push(userIdAsObjectId);
    } else {
      video.likes.splice(userIndex, 1);
    }

    await video.save();
    return NextResponse.json({
      likes: video.likes.length,
      isLiked: userIndex === -1,
    });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
