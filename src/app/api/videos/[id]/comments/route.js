import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';
import { verifyJwt } from '@/lib/authUtils';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid video ID format.' }, { status: 400 });
        }

        const comments = await Comment.find({ video: id, parentComment: null })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
            
        return NextResponse.json(comments);
    } catch (error) {
        console.error("ERROR FETCHING COMMENTS:", error); 
        return NextResponse.json({ message: 'Server error while fetching comments' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid video ID format.' }, { status: 400 });
        }
        
        const user = verifyJwt(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { text, parentCommentId } = body; 

        if (!text || text.trim() === '') {
            return NextResponse.json({ message: 'Comment text is required.' }, { status: 400 });
        }

        const newComment = new Comment({
            text,
            author: user.id,
            video: id,
            parentComment: parentCommentId || null,
        });

        await newComment.save();
        const populatedComment = await Comment.findById(newComment._id).populate('author', 'username');
        
        return NextResponse.json(populatedComment, { status: 201 });
    } catch (error) {
        console.error("ERROR POSTING COMMENT:", error);
        return NextResponse.json({ message: 'Server error while posting comment' }, { status: 500 });
    }
}