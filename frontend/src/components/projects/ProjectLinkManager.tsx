import React, { useState, useEffect } from 'react';
import { 
  Link, Plus, ExternalLink, Edit2, Trash2, 
  FileText, Video, Image, Calendar, Loader2, X, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface ProjectLink {
  id: number;
  title: string;
  description: string;
  url: string;
  link_type: string;
  category: string;
  created_by_name: string;
  created_at: string;
}

interface ProjectLinkManagerProps {
  projectId: number;
  projectName: string;
  linkType: 'document' | 'meeting' | 'drawing' | 'photo' | 'report';
  title: string;
}

const linkTypeLabels = {
  document: 'Documents',
  meeting: 'Meeting Minutes',
  drawing: 'Drawings',
  photo: 'Photos',
  report: 'Reports'
};

export function ProjectLinkManager({ projectId, projectName, linkType, title }: ProjectLinkManagerProps) {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<ProjectLink | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    linkType: linkType,
    category: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLinks();
  }, [projectId, linkType]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/links?type=${linkType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setLinks(data);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = editingLink 
        ? `${API_BASE_URL}/projects/${projectId}/links/${editingLink.id}`
        : `${API_BASE_URL}/projects/${projectId}/links`;
      
      const response = await fetch(url, {
        method: editingLink ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSuccess(editingLink ? 'Link updated successfully' : 'Link added successfully');
        setTimeout(() => setSuccess(''), 3000);
        setShowModal(false);
        resetForm();
        fetchLinks();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (link: ProjectLink) => {
    if (!confirm(`Delete "${link.title}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/links/${link.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setSuccess('Link deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchLinks();
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      setError('Failed to delete link');
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetForm = () => {
    setEditingLink(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      linkType: linkType,
      category: ''
    });
  };

  const openEditModal = (link: ProjectLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      description: link.description || '',
      url: link.url,
      linkType: link.link_type,
      category: link.category || ''
    });
    setShowModal(true);
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    // Convert Google Drive sharing link to embed link
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/(.*?)\//)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Link size={20} className="text-amber-500" />
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Share Google Drive links for {title.toLowerCase()} with stakeholders
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLinks}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg border"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
          >
            <Plus size={16} />
            Add {title.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
          <Link size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No {title.toLowerCase()} added yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Share Google Drive links for {title.toLowerCase()}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <div key={link.id} className="bg-white dark:bg-gray-800 rounded-lg border p-4 hover:shadow-sm transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{link.title}</h3>
                    <a
                      href={getGoogleDriveEmbedUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink size={12} />
                      Open
                    </a>
                  </div>
                  {link.description && (
                    <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Added by {link.created_by_name} on {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(link)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(link)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-semibold">
                {editingLink ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., Site Meeting 2024-01-15"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Google Drive Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://drive.google.com/file/d/... or https://docs.google.com/..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Share a Google Drive link (make sure it's accessible to stakeholders)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    placeholder="Brief description of this document..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 p-5 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingLink ? 'Update' : 'Add'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}