import React from 'react';
import { Edit2, Trash2, Tag, Calendar, Bell } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete }) => {
    return (
        <div className="bg-surface border border-gray-700 rounded-xl p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-1">{note.title}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(note)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(note._id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3 whitespace-pre-wrap">
                {note.content}
            </p>

            {/* Reminder Indicator */}
            {note.reminderDate && new Date(note.reminderDate) > new Date() && (
                <div className="mb-3 flex items-center gap-2 text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-2 rounded-lg">
                    <Bell size={14} className="animate-pulse" />
                    <span>Reminder: {new Date(note.reminderDate).toLocaleString()}</span>
                </div>
            )}

            <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-wrap gap-2">
                    {note.tags && note.tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                            <Tag size={10} />
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto pl-2">
                    <Calendar size={12} />
                    {new Date(note.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
