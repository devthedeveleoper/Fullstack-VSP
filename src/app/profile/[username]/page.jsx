"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import API from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';

const ProfilePage = () => {
    const params = useParams();
    const username = params.username;
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;
            try {
                setLoading(true);
                const response = await API.get(`/users/${username}`);
                setProfile(response.data);
            } catch (err) {
                setError('Could not load user profile.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, [username]);

    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <main className="container mx-auto px-6 py-8">
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-10 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/4 mb-8"></div>
                </div>
            ) : profile && (
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">{profile.user.username}</h1>
                    <p className="text-gray-600 mt-2">
                        Joined on {new Date(profile.user.joined).toLocaleDateString()} • {profile.videos.length} videos
                    </p>
                </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Uploads</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <VideoCardSkeleton key={index} />
                    ))
                ) : (
                    profile?.videos.length > 0 ? (
                        profile.videos.map(video => (
                            <VideoCard key={video._id} video={video} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-600">This user hasn't uploaded any videos yet.</p>
                    )
                )}
            </div>
        </main>
    );
};

export default ProfilePage;