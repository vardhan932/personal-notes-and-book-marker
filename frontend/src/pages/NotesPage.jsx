import React, { useState, useEffect } from 'react';
import api from '../api';
import NoteCard from '../components/NoteCard';
import Modal from '../components/Modal';
import { Plus, Search, Loader2, Bell, Calendar, Trash2, CheckSquare, Square } from 'lucide-react';
import { requestNotificationPermission, scheduleAllNotifications, showNotification } from '../utils/notifications';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        reminderDate: ''
    });

    useEffect(() => {
        fetchNotes();
    }, [search]);

    // Request notification permission and schedule notifications
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    useEffect(() => {
        if (notes.length > 0) {
            scheduleAllNotifications(notes);
        }
    }, [notes]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/notes?q=${search}`);
            setNotes(res.data);
        } catch (err) {
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            tags: note.tags ? note.tags.join(', ') : '',
            reminderDate: note.reminderDate ? new Date(note.reminderDate).toISOString().slice(0, 16) : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await api.delete(`/notes/${id}`);
                setNotes(notes.filter((note) => note._id !== id));
            } catch (err) {
                console.error('Error deleting note:', err);
            }
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === notes.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notes.map(n => n._id));
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} notes?`)) {
            try {
                await api.post('/notes/bulk-delete', { ids: selectedIds });
                setNotes(notes.filter(note => !selectedIds.includes(note._id)));
                setSelectedIds([]);
                setIsSelectionMode(false);
            } catch (err) {
                console.error('Error in bulk delete:', err);
                alert('Failed to delete some notes.');
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
            if (editingNote) {
                const res = await api.put(`/notes/${editingNote._id}`, data);
                setNotes(notes.map((note) => (note._id === editingNote._id ? res.data : note)));
            } else {
                console.log('Sending POST request to /notes with data:', data);
                const res = await api.post('/notes', data);
                setNotes([res.data, ...notes]);
            }
            closeModal();
        } catch (err) {
            console.error('Error saving note:', err);
            const errMsg = err.response?.data?.message || err.message || 'Unknown error';
            alert(`Error saving note: ${errMsg}\nCheck console for details.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNote(null);
        setFormData({ title: '', content: '', tags: '', reminderDate: '' });
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-xl border border-gray-700 shadow-sm">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    My Notes
                </h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => showNotification('Test Notification', 'It works! This is a test notification from LinkVault.')}
                        className="flex items-center gap-2 bg-surface hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
                    >
                        <Bell size={18} />
                        <span className="hidden sm:inline">Test Notice</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">New Note</span>
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {(notes.length > 0) && (
                <div className="flex items-center justify-between bg-surface/50 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                if (isSelectionMode) setSelectedIds([]);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${isSelectionMode ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:bg-gray-700'
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
                                {selectedIds.length === notes.length ? 'Deselect All' : 'Select All'}
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
                    <Loader2 className="animate-spin text-primary h-8 w-8" />
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <div className="bg-surface inline-block p-4 rounded-full mb-4">
                        <Plus className="h-8 w-8 opacity-50" />
                    </div>
                    <p>No notes found. Create your first note!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isSelected={selectedIds.includes(note._id)}
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
                title={editingNote ? 'Edit Note' : 'Create New Note'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg bg-background border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Meeting Details"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full rounded-lg bg-background border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                            placeholder="Write your note here..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full rounded-lg bg-background border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="work, idea, important"
                        />
                    </div>

                    {/* Reminder Date/Time */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Bell className="w-4 h-4 text-yellow-400" />
                            Set Reminder (Optional)
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="datetime-local"
                                value={formData.reminderDate}
                                onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                            />
                        </div>
                        {formData.reminderDate && (
                            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                You'll be notified on {new Date(formData.reminderDate).toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
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
                            className="px-4 py-2 text-sm font-medium bg-primary hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg shadow-primary/20"
                        >
                            {editingNote ? 'Save Changes' : 'Create Note'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default NotesPage;
