import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import {
  FiUsers,
  FiBriefcase,
  FiMessageSquare,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiExternalLink,
  FiPower,
} from 'react-icons/fi';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchStats();
    fetchPendingAlumni();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, filters, searchQuery]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/admin/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (searchQuery) params.append('search', searchQuery);

      const { data } = await axios.get(`/admin/users?${params.toString()}`);
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAlumni = async () => {
    try {
      const { data } = await axios.get('/admin/alumni/pending');
      setPendingAlumni(data.data);
    } catch (error) {
      console.error('Error fetching pending alumni:', error);
    }
  };

  const handleApprove = async (userId, userName) => {
    try {
      await axios.put(`/admin/users/${userId}/approve`);
      alert(`${userName} has been approved!`);
      fetchPendingAlumni();
      fetchStats();
      if (activeTab === 'users') fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`/admin/users/${selectedUser._id}/reject`, {
        reason: rejectReason,
      });
      alert(`${selectedUser.name} has been rejected`);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedUser(null);
      fetchPendingAlumni();
      fetchStats();
      if (activeTab === 'users') fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(`/admin/users/${selectedUser._id}`);
      alert(`${selectedUser.name} has been deleted`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (userId, isActive, userName) => {
    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      await axios.put(`/admin/users/${userId}/${endpoint}`);
      alert(`${userName} has been ${isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-sm text-gray-500 mt-2">{subtext}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">Manage users, approve alumni, and monitor platform activity</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'All Users' },
              { id: 'pending', label: 'Pending Alumni', badge: pendingAlumni.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* User Stats */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">User Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    icon={FiUsers}
                    color="bg-blue-500"
                  />
                  <StatCard
                    title="Students"
                    value={stats.users.students}
                    icon={FiUsers}
                    color="bg-green-500"
                  />
                  <StatCard
                    title="Alumni"
                    value={stats.users.alumni}
                    icon={FiUsers}
                    color="bg-purple-500"
                  />
                  <StatCard
                    title="Pending Alumni"
                    value={stats.users.pendingAlumni}
                    icon={FiAlertCircle}
                    color="bg-orange-500"
                  />
                </div>
              </div>

              {/* Content Stats */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Opportunities"
                    value={stats.content.opportunities.total}
                    icon={FiBriefcase}
                    color="bg-indigo-500"
                    subtext={`${stats.content.opportunities.active} active`}
                  />
                  <StatCard
                    title="Applications"
                    value={stats.content.applications}
                    icon={FiUserCheck}
                    color="bg-teal-500"
                  />
                  <StatCard
                    title="Mentorships"
                    value={stats.content.mentorships.total}
                    icon={FiUsers}
                    color="bg-pink-500"
                    subtext={`${stats.content.mentorships.accepted} accepted`}
                  />
                  <StatCard
                    title="Messages"
                    value={stats.content.messages}
                    icon={FiMessageSquare}
                    color="bg-cyan-500"
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">New Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.recentActivity.newUsersThisWeek}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">New Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.recentActivity.newOpportunitiesThisWeek}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">New Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.recentActivity.newApplicationsThisWeek}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="senior">Senior</option>
                  <option value="alumni">Alumni</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
                >
                  <FiRefreshCw size={16} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          College
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : user.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.status}
                            </span>
                            {!user.isActive && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.collegeName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {user.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(user._id, user.name)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Approve"
                                  >
                                    <FiCheck size={18} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowRejectModal(true);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Reject"
                                  >
                                    <FiX size={18} />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() =>
                                  handleToggleActive(user._id, user.isActive, user.name)
                                }
                                className={`${
                                  user.isActive
                                    ? 'text-orange-600 hover:text-orange-900'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <FiPower size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No users found matching your criteria
                </div>
              )}
            </div>
          )}

          {/* Pending Alumni Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingAlumni.length > 0 ? (
                <div className="space-y-4">
                  {pendingAlumni.map((alumni) => (
                    <div
                      key={alumni._id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {alumni.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{alumni.name}</h3>
                            <p className="text-sm text-gray-600">{alumni.email}</p>
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">College</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {alumni.collegeName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Graduation Year</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {alumni.graduationYear}
                                </p>
                              </div>
                            </div>
                            {alumni.linkedinUrl && (
                              <a
                                href={alumni.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <FiExternalLink size={14} />
                                <span>View LinkedIn Profile</span>
                              </a>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                              Registered: {new Date(alumni.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => handleApprove(alumni._id, alumni.name)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center space-x-2"
                          >
                            <FiUserCheck size={16} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(alumni);
                              setShowRejectModal(true);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center space-x-2"
                          >
                            <FiUserX size={16} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUserCheck size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No pending alumni to review</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>? This will
              permanently delete their account and all related data (profile, opportunities,
              applications, messages). This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject User</h3>
            <p className="text-gray-600 mb-4">
              You are about to reject <strong>{selectedUser.name}</strong>. Please provide a
              reason (optional):
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedUser(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
