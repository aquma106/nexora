import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiBriefcase,
  FiCode,
  FiBook,
  FiLinkedin,
  FiGithub,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    socialLinks: {
      github: '',
      portfolio: '',
      twitter: '',
    },
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/profiles/me/profile');
      setProfile(data.data);
      setFormData({
        bio: data.data.bio || '',
        skills: data.data.skills || [],
        socialLinks: data.data.socialLinks || {
          github: '',
          portfolio: '',
          twitter: '',
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (profile) {
        await axios.put('/profiles/me', formData);
      } else {
        await axios.post('/profiles', formData);
      }
      await fetchProfile();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={() => (editMode ? handleSave() : setEditMode(true))}
                  className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editMode ? (
                    <>
                      <FiSave size={18} />
                      <span>Save Profile</span>
                    </>
                  ) : (
                    <>
                      <FiEdit2 size={18} />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <FiMail size={18} />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <FiMapPin size={18} />
              <span className="text-sm">{user?.collegeName}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <FiCalendar size={18} />
              <span className="text-sm">Class of {user?.graduationYear}</span>
            </div>
            {user?.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <FiLinkedin size={18} />
                <span className="text-sm">LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
        {editMode ? (
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
          />
        ) : (
          <p className="text-gray-600">
            {profile?.bio || 'No bio added yet. Click Edit Profile to add one.'}
          </p>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiCode className="mr-2" />
            Skills
          </h2>
        </div>

        {editMode && (
          <div className="mb-4 flex space-x-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="Add a skill..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <FiPlus size={20} />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {formData.skills.length > 0 ? (
            formData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center space-x-2"
              >
                <span>{skill}</span>
                {editMode && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-600"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <p className="text-gray-500">No skills added yet.</p>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Social Links</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiGithub className="inline mr-2" />
              GitHub
            </label>
            {editMode ? (
              <input
                type="url"
                value={formData.socialLinks.github}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, github: e.target.value },
                  })
                }
                placeholder="https://github.com/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <a
                href={profile?.socialLinks?.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                {profile?.socialLinks?.github || 'Not provided'}
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiGlobe className="inline mr-2" />
              Portfolio
            </label>
            {editMode ? (
              <input
                type="url"
                value={formData.socialLinks.portfolio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, portfolio: e.target.value },
                  })
                }
                placeholder="https://yourportfolio.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <a
                href={profile?.socialLinks?.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                {profile?.socialLinks?.portfolio || 'Not provided'}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiCode className="mr-2" />
            Projects
          </h2>
        </div>

        {profile?.projects && profile.projects.length > 0 ? (
          <div className="space-y-4">
            {profile.projects.map((project, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                {project.technologies && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No projects added yet.</p>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiBriefcase className="mr-2" />
            Experience
          </h2>
        </div>

        {profile?.experience && profile.experience.length > 0 ? (
          <div className="space-y-6">
            {profile.experience.map((exp, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiBriefcase className="text-blue-600" size={20} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(exp.startDate).toLocaleDateString()} -{' '}
                    {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No experience added yet.</p>
        )}
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiBook className="mr-2" />
            Education
          </h2>
        </div>

        {profile?.education && profile.education.length > 0 ? (
          <div className="space-y-6">
            {profile.education.map((edu, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiBook className="text-purple-600" size={20} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-sm text-gray-500">{edu.fieldOfStudy}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(edu.startDate).getFullYear()} -{' '}
                    {new Date(edu.endDate).getFullYear()}
                  </p>
                  {edu.grade && (
                    <p className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No education added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
