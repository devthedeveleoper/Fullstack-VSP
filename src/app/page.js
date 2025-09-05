"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRouter, useSearchParams } from 'next/navigation';
import API from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';
import useSearchStore from '@/stores/searchStore';
import CATEGORIES from '@/constants/categories';

const HomePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || "All");

    const searchTerm = useSearchStore((state) => state.searchTerm);
    const { ref, inView } = useInView({ threshold: 0.5 });

    const fetchVideos = useCallback(async (currentPage, currentSortBy, category, currentSearchTerm) => {
        if (currentPage === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = { sort: currentSortBy, page: currentPage, limit: 12 };
            let response;
            
            if (currentSearchTerm.trim() !== '') {
                params.q = currentSearchTerm;
                response = await API.get('/videos/search', { params });
                setVideos(response.data.results || response.data);
                setHasMore(response.data.currentPage < response.data.totalPages);
            } else {
                if (category !== "All") {
                    params.category = category;
                }
                response = await API.get('/videos', { params });
                setVideos(prev => currentPage === 1 ? response.data.videos : [...prev, ...response.data.videos]);
                setHasMore(response.data.currentPage < response.data.totalPages);
            }
            setError('');
        } catch (err) {
            setError('Could not fetch videos.');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        fetchVideos(1, sortBy, activeCategory, searchTerm);
    }, [sortBy, activeCategory, searchTerm, fetchVideos]);

    useEffect(() => {
        if (inView && hasMore && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchVideos(nextPage, sortBy, activeCategory, searchTerm);
        }
    }, [inView, hasMore, loadingMore, page, sortBy, activeCategory, searchTerm, fetchVideos]);

    const handleCategoryClick = (category) => {
        const newCategory = activeCategory === category ? "All" : category;
        setActiveCategory(newCategory);

        const params = new URLSearchParams(window.location.search);
        if (newCategory !== "All") {
            params.set('category', newCategory);
        } else {
            params.delete('category');
        }
        router.push(`/?${params.toString()}`);
    };

    const pageTitle = searchTerm ? `Results for "${searchTerm}"` : 'Trending Videos';

    return (
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {!searchTerm && (
                 <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                                activeCategory === cat 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 self-start sm:self-center">
                    {pageTitle}
                </h2>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                    <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                    <select 
                        id="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-8 py-2 text-sm"
                    >
                        <option value="date_desc">Newest</option>
                        <option value="views_desc">Most Views</option>
                        <option value="likes_desc">Most Likes</option>
                        <option value="comments_desc">Most Comments</option>
                        {searchTerm && <option value="relevance">Relevance</option>}
                    </select>
                </div>
            </div>

            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {loading
                  ? Array.from({ length: 8 }).map((_, index) => <VideoCardSkeleton key={index} />)
                  : (
                    videos.length > 0 ? (
                        videos.map((video) => <VideoCard key={video._id} video={video} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-600">No videos found.</p>
                    )
                  )}
            </div>

            <div ref={ref} className="h-10 mt-8">
                {loadingMore && <p className="text-center text-gray-600">Loading more videos...</p>}
            </div>
        </main>
    );
};

export default HomePage;