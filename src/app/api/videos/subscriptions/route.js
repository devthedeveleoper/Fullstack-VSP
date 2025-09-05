import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Video from '@/models/Video';
import { verifyJwt } from '@/lib/authUtils';

export async function GET(request) {
    await dbConnect();
    try {
        const userPayload = verifyJwt(request);
        if (!userPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userPayload.id);
        if (!user || !user.subscriptions) {
            return NextResponse.json({ videos: [] });
        }
        
        // Find all videos where the uploader is in the user's subscriptions list
        const videos = await Video.find({ uploader: { $in: user.subscriptions } })
            .sort({ createdAt: -1 })
            .populate('uploader', 'username');

        return NextResponse.json(videos);

    } catch (error) {
        console.error('Error fetching subscription feed:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}