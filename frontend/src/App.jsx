import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import BookmarksPage from './pages/BookmarksPage';
import RecycleBinPage from './pages/RecycleBinPage';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <div className="min-h-screen bg-background text-gray-100 font-sans">
                                <Navbar />
                                <div className="container mx-auto px-4 py-8">
                                    <Routes>
                                        <Route path="/" element={<Navigate to="/notes" replace />} />
                                        <Route path="/notes" element={<NotesPage />} />
                                        <Route path="/bookmarks" element={<BookmarksPage />} />
                                        <Route path="/recycle-bin" element={<RecycleBinPage />} />
                                    </Routes>
                                </div>
                            </div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
}

export default App;
