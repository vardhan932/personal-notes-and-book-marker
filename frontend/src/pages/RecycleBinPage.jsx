import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Trash2, RotateCcw, Loader2, AlertCircle, XCircle } from 'lucide-react';

const RecycleBinPage = () => {
    const [deletedNotes, setDeletedNotes] = useState([]);
    const [deletedBookmarks, setDeletedBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'bookmarks'
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeletedItems();
    }, []);

    const fetchDeletedItems = async () => {
        try {
            setLoading(true);
            const [notesRes, bookmarksRes] = await Promise.all([
                api.get('/notes?deleted=true'),
                api.get('/bookmarks?deleted=true')
            ]);
            setDeletedNotes(notesRes.data);
            setDeletedBookmarks(bookmarksRes.data);
        } catch (err) {
            console.error('Error fetching deleted items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id, type) => {
        try {
            const endpoint = type === 'note' ? `/notes/${id}/restore` : `/bookmarks/${id}/restore`;
            await api.patch(endpoint);

            // Remove from deleted list
            if (type === 'note') {
                setDeletedNotes(deletedNotes.filter(n => n._id !== id));
            } else {
                setDeletedBookmarks(deletedBookmarks.filter(b => b._id !== id));
            }

            alert(`${type === 'note' ? 'Note' : 'Bookmark'} restored successfully!`);
        } catch (err) {
            console.error('Error restoring item:', err);
            alert('Failed to restore item');
        }
    };

    const handlePermanentDelete = async (id, type) => {
        if (!window.confirm('Are you sure? This action cannot be undone!')) {
            return;
        }

        try {
            const endpoint = type === 'note' ? `/notes/${id}/permanent` : `/bookmarks/${id}/permanent`;
            await api.delete(endpoint);

            // Remove from deleted list
            if (type === 'note') {
                setDeletedNotes(deletedNotes.filter(n => n._id !== id));
            } else {
                setDeletedBookmarks(deletedBookmarks.filter(b => b._id !== id));
            }

            alert(`${type === 'note' ? 'Note' : 'Bookmark'} permanently deleted`);
        } catch (err) {
            console.error('Error permanently deleting item:', err);
            alert('Failed to delete item');
        }
    };

    const DeletedItemCard = ({ item, type }) => {
        const isNote = type === 'note';
        const deletedDate = new Date(item.deletedAt).toLocaleDateString();

        return (
            <div className="bg-surface border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-200 mb-1">
                            {isNote ? item.title : (item.title || item.url)}
                        </h3>
                        {!isNote && item.url && (
                            <p className="text-xs text-gray-500 truncate mb-2">{item.url}</p>
                        )}
                        <p className="text-sm text-gray-400 line-clamp-2">
                            {isNote ? item.content : item.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-500">
                        Deleted on {deletedDate}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleRestore(item._id, type)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                        >
                            <RotateCcw size={14} />
                            Restore
                        </button>
                        <button
                            onClick={() => handlePermanentDelete(item._id, type)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                        >
                            <XCircle size={14} />
                            Delete Forever
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const totalDeleted = deletedNotes.length + deletedBookmarks.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-surface p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <Trash2 className="h-8 w-8 text-red-400" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                        Recycle Bin
                    </h1>
                </div>
                <p className="text-gray-400">
                    {totalDeleted === 0
                        ? 'Your recycle bin is empty'
                        : `${totalDeleted} item${totalDeleted !== 1 ? 's' : ''} in recycle bin`}
                </p>
            </div>

            {/* Info Banner */}
            {totalDeleted > 0 && (
                <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200">
                        <p className="font-medium mb-1">Items in the recycle bin</p>
                        <p className="text-yellow-300">
                            You can restore deleted items or permanently delete them. Permanent deletion cannot be undone.
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'notes'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Notes ({deletedNotes.length})
                </button>
                <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'bookmarks'
                            ? 'border-secondary text-secondary'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Bookmarks ({deletedBookmarks.length})
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'notes' ? (
                        deletedNotes.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No deleted notes</p>
                            </div>
                        ) : (
                            deletedNotes.map(note => (
                                <DeletedItemCard key={note._id} item={note} type="note" />
                            ))
                        )
                    ) : (
                        deletedBookmarks.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No deleted bookmarks</p>
                            </div>
                        ) : (
                            deletedBookmarks.map(bookmark => (
                                <DeletedItemCard key={bookmark._id} item={bookmark} type="bookmark" />
                            ))
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default RecycleBinPage;
