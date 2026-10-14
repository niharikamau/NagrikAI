
import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Inbox,
  Eye,
  LoaderCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

const API_BASE = 'http://localhost:5000';

export default function MyComplaints({
  setActiveTab,
  setSelectedComplaintId,
}) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchComplaints() {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('nagrikai_token');

        if (!token) {
          throw new Error('Please log in again to view your complaints.');
        }

        const response = await fetch(`${API_BASE}/api/complaints`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || 'Could not load your complaints.'
          );
        }

        // Supports the common { success: true, complaints: [...] }
        // response, as well as a direct array response.
        const records = Array.isArray(result)
          ? result
          : result.complaints ?? result.data?.complaints ?? result.data;

        if (!Array.isArray(records)) {
          throw new Error(
            'The server response did not contain a complaints list.'
          );
        }

        if (!cancelled) {
          setComplaints(records);
        }
      } catch (err) {
        console.error('Failed to load complaints:', err);

        if (!cancelled) {
          setError(err.message || 'Something went wrong.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchComplaints();

    return () => {
      cancelled = true;
    };
  }, []);

  const getId = (complaint) => complaint.id ?? complaint._id;

  const getStatus = (complaint) =>
    (complaint.status || 'Pending Review').trim();

  const getEvidence = (complaint) => {
    const evidence = complaint.evidence;

    if (Array.isArray(evidence)) {
      return evidence.filter((item) => typeof item === 'string' && item);
    }

    return typeof evidence === 'string' && evidence ? [evidence] : [];
  };

  const getImageUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;

    return `${API_BASE}/${path.replace(/^\/+/, '')}`;
  };

  const filtered = complaints.filter((c) => {
    const status = getStatus(c).toLowerCase();

    const matchesStatus =
      filter === 'All' ||
      (filter === 'Active' &&
        status !== 'resolved' &&
        status !== 'closed' &&
        status !== 'rejected') ||
      (filter === 'Resolved' && status === 'resolved');

    const title = c.title || c.issue || 'Untitled complaint';
    const category = c.category || 'Uncategorized';
    const id = String(getId(c) ?? '');

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (id) => {
    setSelectedComplaintId(id);
    setActiveTab('complaint-details');
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
      case 'pending review':
        return <span className="badge badge-review">{status}</span>;

      case 'in progress':
        return <span className="badge badge-progress">{status}</span>;

      case 'resolved':
        return <span className="badge badge-resolved">{status}</span>;

      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="my-complaints-container container animate-fade-in">
      <div className="section-header">
        <div>
          <h2>My Complaints</h2>
          <p>Track your submitted reports and official department resolutions</p>
        </div>
      </div>

      <div className="complaints-controls-bar glass-card">
        <div className="status-tabs-group">
          {['All', 'Active', 'Resolved'].map((tabName) => (
            <button
              key={tabName}
              className={`status-tab-btn ${
                filter === tabName ? 'active' : ''
              }`}
              onClick={() => setFilter(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, title, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="complaints-list-wrapper">
        {loading ? (
          <div className="empty-state-card glass-card">
            <LoaderCircle size={36} className="empty-icon" />
            <h3>Loading complaints...</h3>
            <p>Fetching your reports from the server.</p>
          </div>
        ) : error ? (
          <div className="empty-state-card glass-card">
            <h3>Couldn't load complaints</h3>
            <p>{error}</p>
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-card glass-card animate-scale-in">
            <Inbox size={48} className="empty-icon" />
            <h3>No complaints found</h3>
            <p>
              {complaints.length === 0
                ? 'You have not submitted any complaints yet.'
                : 'No complaints match your current search filters.'}
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setFilter('All');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="complaints-list-grid">
            {filtered.map((c) => {
              const id = getId(c);
              const title = c.title || c.issue || 'Untitled complaint';
              const description = c.description || c.aiSummary || '';
              const category = c.category || 'Uncategorized';
              const location = c.locationName || 'Location not provided';
              const evidence = getEvidence(c);

              return (
                <div
                  key={id}
                  className="complaint-card glass-card animate-fade-up"
                >
                  <div className="card-top">
                    <span className="complaint-id-badge">#{id}</span>
                    {getStatusBadge(getStatus(c))}
                  </div>

                  <h3 className="complaint-card-title">{title}</h3>

                  <p className="complaint-card-description">
                    {description.length > 140
                      ? `${description.slice(0, 140)}...`
                      : description}
                  </p>

                  {evidence.length > 0 && (
                    <div className="complaint-evidence">
                      {evidence.map((path, index) => (
                        <a
                          key={`${path}-${index}`}
                          href={getImageUrl(path)}
                          target="_blank"
                          rel="noreferrer"
                          title="Open evidence image"
                        >
                          <img
                            src={getImageUrl(path)}
                            alt={`Evidence for complaint ${id}`}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="complaint-card-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>
                        Filed: {c.submittedDate || 'Date unavailable'}
                      </span>
                    </div>

                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{location.split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  <div className="card-bottom">
                    <span className="category-label">{category}</span>

                    <button
                      className="btn-secondary compact-btn"
                      onClick={() => handleViewDetails(id)}
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
