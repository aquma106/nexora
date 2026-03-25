import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import {
  FiUsers,
  FiSend,
  FiCheck,
  FiX,
  FiClock,
  FiMail,
  FiLinkedin,
  FiMapPin,
  FiCalendar,
  FiAlertCircle,
  FiMessageCircle,
} from 'react-icons/fi';

const Mentorship = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [mentors, setMentors] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestForm, setRequestForm] = useState({
    message: '',
    mentorshipType: 'general',
    duration: 'short-term',
  });

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchMentors();
    } else if (activeTab === 'sent') {
      fetchSentRequests();
    } else if (activeTab === 'received') {
      fetchReceivedRequests();
    }
  }, [activeTab]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/mentorship/mentors');
      setMentors(data.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/mentorship?type=sent');
      setSentRequests(data.data);
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/mentorship?type=received');
      setReceivedRequests(data.data);
    } catch (error) {
      console.error('Error fetching received requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      await axios.post('/mentorship', {
        receiver: selectedMentor._id,
        ...requestForm,
      });
      setShowRequestModal(false);
      setRequestForm({ message: '', mentorshipType: 'general', duration: 'short-term' });
      alert('Mentorship request sent successfully!');
      fetchMentors();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleRespondToRequest = async (requestId, status, responseMessage = '') => {
    try {
      await axios.put(`/mentorship/${requestId}/respond`, {
        status,
        responseMessage,
      });
      alert(`Request ${status} successfully!`);
      fetchReceivedRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to request');
    }
  };

  const handleStartConversation = (userId) => {
    // Navigate to messages page - the conversation will be created when first message is sent
    navigate('/messages', { state: { startConversationWith: userId } });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };

    const icons = {
      pending: FiClock,
      accepted: FiCheck,
      rejected: FiX,
      cancelled: FiX,
    };

    const Icon = icons[status];

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${styles[status]}`}>
        <Icon size={14} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship</h1>
        <p className="text-gray-600">
          {user?.role === 'student'
            ? 'Connect with experienced mentors to guide your career'
            : 'Share your knowledge and help others grow'}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Browse Mentors
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiSend className="inline mr-2" />
              Sent Requests
            </button>
            {user?.role !== 'student' && (
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiMail className="inline mr-2" />
                Received Requests
                {receivedRequests.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {receivedRequests.filter((r) => r.status === 'pending').length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Browse Mentors Tab */}
              {activeTab === 'browse' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors.length > 0 ? (
                    mentors.map((mentor) => (
                      <div
                        key={mentor._id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {mentor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">{mentor.role}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMapPin className="mr-2" size={16} />
                            {mentor.collegeName}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="mr-2" size={16} />
                            Class of {mentor.graduationYear}
                          </div>
                          {mentor.linkedinUrl && (
                            <a
                              href={mentor.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                            >
                              <FiLinkedin className="mr-2" size={16} />
                              LinkedIn Profile
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedMentor(mentor);
                            setShowRequestModal(true);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                        >
                          <FiSend size={16} />
                          <span>Send Request</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">No mentors available at the moment</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sent Requests Tab */}
              {activeTab === 'sent' && (
                <div className="space-y-4">
                  {sentRequests.length > 0 ? (
                    sentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {request.receiver.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {request.receiver.name}
                              </h3>
                              <p className="text-sm text-gray-600 capitalize">
                                {request.receiver.role}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Type:</span>{' '}
                            <span className="capitalize">{request.mentorshipType}</span>
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Duration:</span>{' '}
                            <span className="capitalize">{request.duration}</span>
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Message:</span> {request.message}
                          </p>
                        </div>

                        {request.responseMessage && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
                            <p className="text-sm text-gray-600">{request.responseMessage}</p>
                          </div>
                        )}

                        {request.status === 'accepted' && (
                          <button
                            onClick={() => handleStartConversation(request.receiver._id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2 mb-4"
                          >
                            <FiMessageCircle size={18} />
                            <span>Message {request.receiver.name}</span>
                          </button>
                        )}

                        <p className="text-xs text-gray-500">
                          Sent {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FiSend className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">No sent requests yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Received Requests Tab */}
              {activeTab === 'received' && (
                <div className="space-y-4">
                  {receivedRequests.length > 0 ? (
                    receivedRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {request.sender.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {request.sender.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {request.sender.collegeName} • Class of{' '}
                                {request.sender.graduationYear}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Type:</span>{' '}
                            <span className="capitalize">{request.mentorshipType}</span>
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Duration:</span>{' '}
                            <span className="capitalize">{request.duration}</span>
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Message:</span> {request.message}
                          </p>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleRespondToRequest(request._id, 'accepted', 'I would be happy to mentor you!')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                            >
                              <FiCheck size={18} />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(request._id, 'rejected', 'Sorry, I am not available at the moment.')}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                            >
                              <FiX size={18} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}

                        {request.status === 'accepted' && (
                          <button
                            onClick={() => handleStartConversation(request.sender._id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2"
                          >
                            <FiMessageCircle size={18} />
                            <span>Message {request.sender.name}</span>
                          </button>
                        )}

                        <p className="text-xs text-gray-500 mt-4">
                          Received {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FiMail className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">No received requests yet</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Send Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Send Mentorship Request</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedMentor?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMentor?.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{selectedMentor?.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mentorship Type
                </label>
                <select
                  value={requestForm.mentorshipType}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, mentorshipType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="career">Career</option>
                  <option value="technical">Technical</option>
                  <option value="academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  value={requestForm.duration}
                  onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="one-time">One-time</option>
                  <option value="short-term">Short-term</option>
                  <option value="long-term">Long-term</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  placeholder="Introduce yourself and explain why you'd like mentorship..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={!requestForm.message.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
