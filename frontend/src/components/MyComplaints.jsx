import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, ChevronRight, Inbox, Eye } from 'lucide-react';
import { mockDb } from '../utils/mockDb';

export default function MyComplaints({ setActiveTab, setSelectedComplaintId }) {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All' | 'Active' | 'Resolved'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setComplaints(mockDb.getComplaints());
  }, []);

  const getFilteredComplaints = () => {
    return complaints.filter(c => {
      // Status filter
      const matchesStatus = 
        filter === 'All' || 
        (filter === 'Active' && (c.status === 'Under Review' || c.status === 'In Progress')) ||
        (filter === 'Resolved' && c.status === 'Resolved');
      
      // Search term filter
      const matchesSearch = 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.id.toString().includes(searchTerm) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  };

  const handleViewDetails = (id) => {
    setSelectedComplaintId(id);
    setActiveTab('complaint-details');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Under Review':
        return <span className="badge badge-review">Under Review</span>;
      case 'In Progress':
        return <span className="badge badge-progress">In Progress</span>;
      case 'Resolved':
        return <span className="badge badge-resolved">Resolved</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filtered = getFilteredComplaints();

  return (
    <div className="my-complaints-container container animate-fade-in">
      <div className="section-header">
        <div>
          <h2>My Complaints</h2>
          <p>Track your submitted reports and official department resolutions</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="complaints-controls-bar glass-card">
        {/* Status Filter Tabs */}
        <div className="status-tabs-group">
          {['All', 'Active', 'Resolved'].map((tabName) => (
            <button
              key={tabName}
              className={`status-tab-btn ${filter === tabName ? 'active' : ''}`}
              onClick={() => setFilter(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>

        {/* Search Input */}
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

      {/* Complaints List */}
      <div className="complaints-list-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state-card glass-card animate-scale-in">
            <Inbox size={48} className="empty-icon" />
            <h3>No complaints found</h3>
            <p>We couldn't find any complaint matching your current search filters.</p>
            <button className="btn-primary" onClick={() => { setFilter('All'); setSearchTerm(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="complaints-list-grid">
            {filtered.map((c) => (
              <div key={c.id} className="complaint-card glass-card animate-fade-up">
                <div className="card-top">
                  <span className="complaint-id-badge">#{c.id}</span>
                  {getStatusBadge(c.status)}
                </div>
                
                <h3 className="complaint-card-title">{c.title}</h3>
                
                <p className="complaint-card-description">
                  {c.description.length > 140 ? c.description.slice(0, 140) + '...' : c.description}
                </p>

                <div className="complaint-card-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Filed: {c.submittedDate}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{c.locationName.split(',')[0]}</span>
                  </div>
                </div>

                <div className="card-divider"></div>

                <div className="card-bottom">
                  <span className="category-label">{c.category}</span>
                  <button className="btn-secondary compact-btn" onClick={() => handleViewDetails(c.id)}>
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
