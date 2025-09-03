import React from "react";
import Link from "next/link";
import VideoThumbnail from "./VideoThumbnail";

const VideoCard = ({ video }) => {
  return (
    <Link href={`/video/${video._id}`} className="block group">
      <div className="flex flex-col gap-2">
        <VideoThumbnail
          customThumbnailUrl={video.thumbnailUrl}
          fileId={video.fileId}
          altText={video.title}
        />
        <div className="flex gap-3">
          <div className="flex flex-col w-0 flex-grow">
            <h3 className="text-md font-bold text-gray-900 leading-snug truncate group-hover:text-blue-600">
              {video.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {video.uploader?.username || "Unknown Uploader"}
            </p>
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <span>{video.views} views</span>
              <span className="mx-2">•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
