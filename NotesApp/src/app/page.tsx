'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import NoteForm from '@/components/NoteForm';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; note: Note | null }>({
    isOpen: false,
    note: null
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData: { title: string; content: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNote = async (noteData: { title: string; content: string }) => {
    if (!editingNote) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/notes?id=${editingNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      setNotes(prev => prev.map(note =>
        note._id === editingNote._id ? updatedNote : note
      ));
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteDialog.note) return;

    try {
      setDeleteError(null);
      const response = await fetch(`/api/notes?id=${deleteDialog.note._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to delete note (${response.status})`);
      }

      setNotes(prev => prev.filter(note => note._id !== deleteDialog.note!._id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
      setDeleteError(errorMessage);
      throw err;
    }
  };

  const openCreateForm = () => {
    setEditingNote(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (note: Note) => {
    setDeleteDialog({ isOpen: true, note });
    setDeleteError(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingNote(undefined);
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, note: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={fetchNotes}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Notes</h1>
          <p className="text-gray-600">Create and manage your notes</p>
        </div>

        <div className="mb-6">
          <button
            onClick={openCreateForm}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            + Create New Note
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600">Create your first note to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {note.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {note.content}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(note)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteDialog(note)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NoteForm
        note={editingNote}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={editingNote ? handleUpdateNote : handleCreateNote}
        isLoading={isSubmitting}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteNote}
        noteTitle={deleteDialog.note?.title}
        error={deleteError}
      />
    </div>
  );
}
