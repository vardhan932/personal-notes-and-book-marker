import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Notebook, Bookmark } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-surface';
    };

    return (
        <nav className="bg-surface border-b border-gray-700 static top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <Notebook className="w-6 h-6 text-primary" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            Personal Manager
                        </span>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            to="/notes"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 \${isActive('/notes')}`}
                        >
                            <Notebook className="w-4 h-4" />
                            Notes
                        </Link>
                        <Link
                            to="/bookmarks"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 \${isActive('/bookmarks')}`}
                        >
                            <Bookmark className="w-4 h-4" />
                            Bookmarks
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
