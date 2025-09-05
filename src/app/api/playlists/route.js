import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Playlist from '@/models/Playlist';
import { verifyJwt } from '@/lib/authUtils';

// GET handler to fetch the current user's playlists (used by the "Save to" modal)
export async function GET(request) {
    await dbConnect();
    try {
        const user = verifyJwt(request);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const playlists = await Playlist.find({ owner: user.id }).select('title videos');
        return NextResponse.json(playlists);
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// POST handler to create a new playlist
export async function POST(request) {
    await dbConnect();
    try {
        const user = verifyJwt(request);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { title, description, isPublic } = await request.json();
        if (!title) return NextResponse.json({ message: 'Title is required' }, { status: 400 });

        const newPlaylist = new Playlist({
            title,
            description,
            owner: user.id,
            isPublic,
        });
        await newPlaylist.save();
        return NextResponse.json(newPlaylist, { status: 201 });
    } catch (error) {
        console.error("Error creating playlist:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// PUT handler to add/remove a video from a playlist or reorder videos
export async function PUT(request) {
    await dbConnect();
    try {
        const user = verifyJwt(request);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { playlistId, videoId, title, description, newVideoOrder } = await request.json();
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
        if (playlist.owner.toString() !== user.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

        // Logic for adding/removing a single video
        if (videoId) {
            const videoIndex = playlist.videos.indexOf(videoId);
            if (videoIndex > -1) {
                playlist.videos.splice(videoIndex, 1); // Remove video
            } else {
                playlist.videos.push(videoId); // Add video
            }
        }

        // Logic for updating playlist title/description
        if (title) playlist.title = title;
        if (description) playlist.description = description;

        // Logic for reordering the entire video list
        if (newVideoOrder) {
            playlist.videos = newVideoOrder;
        }
        
        await playlist.save();
        return NextResponse.json(playlist);
    } catch (error) {
        console.error("Error updating playlist:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}