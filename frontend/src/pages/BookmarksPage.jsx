import React, { useState, useEffect } from 'react';
import api from '../api';
import BookmarkCard from '../components/BookmarkCard';
import Modal from '../components/Modal';
import { Plus, Search, Loader2, Trash2, CheckSquare, Square } from 'lucide-react';

const BookmarksPage = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBookmark, setEditingBookmark] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        url: '',
        title: '',
        description: '',
        tags: '',
    });

    useEffect(() => {
        fetchBookmarks();
    }, [search]);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/bookmarks?q=${search}`);
            setBookmarks(res.data);
        } catch (err) {
            console.error('Error fetching bookmarks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (bookmark) => {
        setEditingBookmark(bookmark);
        setFormData({
            url: bookmark.url,
            title: bookmark.title || '',
            description: bookmark.description || '',
            tags: bookmark.tags ? bookmark.tags.join(', ') : '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bookmark?')) {
            try {
                await api.delete(`/bookmarks/${id}`);
                setBookmarks(bookmarks.filter((b) => b._id !== id));
            } catch (err) {
                console.error('Error deleting bookmark:', err);
            }
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === bookmarks.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(bookmarks.map(b => b._id));
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} bookmarks?`)) {
            try {
                await api.post('/bookmarks/bulk-delete', { ids: selectedIds });
                setBookmarks(bookmarks.filter(b => !selectedIds.includes(b._id)));
                setSelectedIds([]);
                setIsSelectionMode(false);
            } catch (err) {
                console.error('Error in bulk delete:', err);
                alert('Failed to delete some bookmarks.');
            }
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const tagsArray = formData.tags.split(',').map((tag) => tag.trim()).filter(t => t);
        const data = { ...formData, tags: tagsArray };

        try {
            setIsSubmitting(true);
            if (editingBookmark) {
                const res = await api.put(`/bookmarks/${editingBookmark._id}`, data);
                setBookmarks(bookmarks.map((b) => (b._id === editingBookmark._id ? res.data : b)));
            } else {
                const res = await api.post('/bookmarks', data);
                setBookmarks([res.data, ...bookmarks]);
            }
            closeModal();
        } catch (err) {
            console.error('Error saving bookmark:', err);
            const errMsg = err.response?.data?.message || err.message || 'Unknown error';
            alert(`Failed to save bookmark: ${errMsg}\nCheck console for details.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBookmark(null);
        setFormData({ url: '', title: '', description: '', tags: '' });
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-xl border border-gray-700 shadow-sm">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-pink-400">
                    My Bookmarks
                </h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-secondary hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-secondary/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">New Bookmark</span>
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {(bookmarks.length > 0) && (
                <div className="flex items-center justify-between bg-surface/50 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                if (isSelectionMode) setSelectedIds([]);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${isSelectionMode ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {isSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
                            {isSelectionMode ? 'Exit Selection' : 'Select Multiple'}
                        </button>

                        {isSelectionMode && (
                            <button
                                onClick={handleSelectAll}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                {selectedIds.length === bookmarks.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>

                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-1.5 rounded-lg text-sm font-medium border border-red-500/20 transition-all"
                        >
                            <Trash2 size={16} />
                            Delete Selected ({selectedIds.length})
                        </button>
                    )}
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-secondary h-8 w-8" />
                </div>
            ) : bookmarks.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <div className="bg-surface inline-block p-4 rounded-full mb-4">
                        <Plus className="h-8 w-8 opacity-50" />
                    </div>
                    <p>No bookmarks found. Save your first link!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map((bookmark) => (
                        <BookmarkCard
                            key={bookmark._id}
                            bookmark={bookmark}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isSelected={selectedIds.includes(bookmark._id)}
                            onSelect={handleSelect}
                            isSelectionMode={isSelectionMode}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                        <input
                            type="url"
                            required
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full rounded-lg bg-background border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            placeholder="https://example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg bg-background border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            placeholder="My Favorite Site"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full rounded-lg bg-background border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary resize-none"
                            placeholder="Stats and analytics dashboard..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full rounded-lg bg-background border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            placeholder="tool, reference, blog"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-sm font-medium bg-secondary hover:bg-pink-600 text-white rounded-lg transition-colors shadow-lg shadow-secondary/20 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
                            {isSubmitting ? 'Saving...' : (editingBookmark ? 'Save Changes' : 'Save Bookmark')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BookmarksPage;
