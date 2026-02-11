import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link2, Bookmark, Trash2, LogOut, User, StickyNote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-surface';
    };

    return (
        <nav className="bg-surface border-b border-gray-700 static top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <Link2 className="w-6 h-6 text-purple-400" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                            LinkVault
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <RouterLink
                            to="/notes"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/notes')}`}
                        >
                            <StickyNote className="w-4 h-4" />
                            Notes
                        </RouterLink>
                        <RouterLink
                            to="/bookmarks"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/bookmarks')}`}
                        >
                            <Bookmark className="w-4 h-4" />
                            Bookmarks
                        </RouterLink>
                        <RouterLink
                            to="/recycle-bin"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/recycle-bin')}`}
                        >
                            <Trash2 className="w-4 h-4" />
                            Recycle Bin
                        </RouterLink>

                        {/* User Info and Logout */}
                        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                            <div className="flex items-center gap-2 text-gray-300">
                                <User className="w-4 h-4" />
                                <span className="text-sm">{user?.username}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
