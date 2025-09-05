import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Playlist from '@/models/Playlist';
import mongoose from 'mongoose';
import { verifyJwt } from '@/lib/authUtils';

// GET: Fetch a single playlist by its ID, with privacy checks
export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Playlist ID' }, { status: 400 });
        }

        const playlist = await Playlist.findById(id).populate({
            path: 'videos',
            populate: {
                path: 'uploader',
                select: 'username'
            }
        });

        if (!playlist) {
            return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
        }

        // Privacy Check: Allow access if the playlist is public OR if the viewer is the owner
        const user = verifyJwt(request);
        if (!playlist.isPublic && playlist.owner.toString() !== user?.id) {
            return NextResponse.json({ message: 'This playlist is private' }, { status: 403 });
        }
        
        return NextResponse.json(playlist);
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// DELETE: Delete a single playlist by its ID
export async function DELETE(request, { params }) {
    await dbConnect();
    try {
        const user = verifyJwt(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const playlist = await Playlist.findById(params.id);
        if (!playlist) {
            return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
        }
        
        if (playlist.owner.toString() !== user.id) {
            return NextResponse.json({ message: 'User not authorized to delete this playlist' }, { status: 403 });
        }

        await Playlist.deleteOne({ _id: params.id });

        return NextResponse.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error("Error deleting playlist:", error);
        return NextResponse.json({ message: 'Server error while deleting playlist' }, { status: 500 });
    }
}