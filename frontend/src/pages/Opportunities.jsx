import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiPlus,
  FiX,
  FiFilter,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

const Opportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    locationType: '',
  });
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    locationType: 'on-site',
    type: 'job',
    skills: [],
    requirements: [],
    salary: { min: '', max: '', currency: 'USD' },
    duration: '',
    applicationDeadline: '',
    applicationUrl: '',
  });
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  // Check if user can post opportunities
  const canPost = ['senior', 'alumni', 'faculty', 'admin'].includes(user?.role);

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.locationType) params.append('locationType', filters.locationType);

      const { data } = await axios.get(`/opportunities?${params.toString()}`);
      setOpportunities(data.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostOpportunity = async () => {
    try {
      await axios.post('/opportunities', postForm);
      setShowPostModal(false);
      resetPostForm();
      alert('Opportunity posted successfully!');
      fetchOpportunities();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to post opportunity');
    }
  };

  const handleApply = async () => {
    try {
      await axios.post('/applications', {
        opportunityId: selectedOpportunity._id,
        coverLetter: applyForm.coverLetter,
      });
      setShowApplyModal(false);
      setApplyForm({ coverLetter: '' });
      alert('Application submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      description: '',
      company: '',
      location: '',
      locationType: 'on-site',
      type: 'job',
      skills: [],
      requirements: [],
      salary: { min: '', max: '', currency: 'USD' },
      duration: '',
      applicationDeadline: '',
      applicationUrl: '',
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !postForm.skills.includes(newSkill.trim())) {
      setPostForm({ ...postForm, skills: [...postForm.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setPostForm({ ...postForm, skills: postForm.skills.filter((s) => s !== skill) });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setPostForm({
        ...postForm,
        requirements: [...postForm.requirements, newRequirement.trim()],
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setPostForm({
      ...postForm,
      requirements: postForm.requirements.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunities</h1>
          <p className="text-gray-600">Discover jobs and internships</p>
        </div>
        {canPost && (
          <button
            onClick={() => setShowPostModal(true)}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <FiPlus size={20} />
            <span>Post Opportunity</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiSearch className="inline mr-2" />
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by title or company..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline mr-2" />
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="job">Jobs</option>
              <option value="internship">Internships</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline mr-2" />
              Location Type
            </label>
            <select
              value={filters.locationType}
              onChange={(e) => setFilters({ ...filters, locationType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              <option value="on-site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.length > 0 ? (
            opportunities.map((opp) => (
              <div
                key={opp._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiBriefcase className="text-blue-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{opp.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              opp.type === 'job'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {opp.type === 'job' ? 'Job' : 'Internship'}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">{opp.company}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <FiMapPin className="mr-1" size={16} />
                            {opp.location} • {opp.locationType}
                          </span>
                          {opp.salary?.min && (
                            <span className="flex items-center">
                              <FiDollarSign className="mr-1" size={16} />
                              ${opp.salary.min.toLocaleString()} - $
                              {opp.salary.max.toLocaleString()}
                            </span>
                          )}
                          {opp.applicationDeadline && (
                            <span className="flex items-center">
                              <FiClock className="mr-1" size={16} />
                              Apply by {new Date(opp.applicationDeadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{opp.description}</p>

                        {opp.skills && opp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {opp.skills.slice(0, 5).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {opp.skills.length > 5 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                +{opp.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-500">
                          <span>Posted by {opp.postedBy?.name}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{opp.applicationsCount} applicants</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setShowApplyModal(true);
                      }}
                      className="w-full lg:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FiBriefcase className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No opportunities found</p>
            </div>
          )}
        </div>
      )}

      {/* Post Opportunity Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Post Opportunity</h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={postForm.company}
                    onChange={(e) => setPostForm({ ...postForm, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={postForm.type}
                    onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={postForm.location}
                    onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <select
                    value={postForm.locationType}
                    onChange={(e) => setPostForm({ ...postForm, locationType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="on-site">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <FiPlus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {postForm.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      <button onClick={() => removeSkill(skill)}>
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    value={postForm.salary.min}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        salary: { ...postForm.salary, min: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    value={postForm.salary.max}
                    onChange={(e) =>
                      setPostForm({
                        ...postForm,
                        salary: { ...postForm.salary, max: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={postForm.applicationDeadline}
                  onChange={(e) =>
                    setPostForm({ ...postForm, applicationDeadline: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPostModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePostOpportunity}
                disabled={!postForm.title || !postForm.company || !postForm.description}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Opportunity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedOpportunity.title}
              </h3>
              <p className="text-gray-600">{selectedOpportunity.company}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                  placeholder="Explain why you're a great fit for this position..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!applyForm.coverLetter.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
