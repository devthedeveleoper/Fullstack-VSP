import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { verifyJwt } from '@/lib/authUtils';

// GET: Fetch the user's notifications
export async function GET(request) {
    await dbConnect();
    try {
        const user = verifyJwt(request);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const notifications = await Notification.find({ recipient: user.id })
            .populate('sender', 'username')
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(20);
        
        const unreadCount = await Notification.countDocuments({ recipient: user.id, isRead: false });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// POST: Mark all notifications as read
export async function POST(request) {
    await dbConnect();
    try {
        const user = verifyJwt(request);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await Notification.updateMany({ recipient: user.id, isRead: false }, { $set: { isRead: true } });

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}