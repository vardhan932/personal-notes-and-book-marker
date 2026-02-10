import React from 'react';
import { Edit2, Trash2, Tag, ExternalLink, Globe } from 'lucide-react';

const BookmarkCard = ({ bookmark, onEdit, onDelete }) => {
    return (
        <div className="bg-surface border border-gray-700 rounded-xl p-5 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5 group">
            <div className="flex justify-between items-start mb-2">
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-white hover:text-secondary truncate flex-1 pr-4 flex items-center gap-2"
                >
                    <Globe size={18} className="text-gray-500" />
                    {bookmark.title || bookmark.url}
                    <ExternalLink size={14} className="opacity-50" />
                </a>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(bookmark)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(bookmark._id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 mb-3 block truncate hover:underline hover:text-gray-400"
            >
                {bookmark.url}
            </a>

            {bookmark.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {bookmark.description}
                </p>
            )}

            <div className="flex flex-wrap gap-2 mt-auto">
                {bookmark.tags && bookmark.tags.map((tag, index) => (
                    <span key={index} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                        <Tag size={10} />
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default BookmarkCard;
