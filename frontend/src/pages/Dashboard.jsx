import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUsers, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Opportunities',
      value: '24',
      icon: FiBriefcase,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Connections',
      value: '156',
      icon: FiUsers,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Messages',
      value: '42',
      icon: FiMessageSquare,
      color: 'bg-purple-500',
      change: '+23%',
    },
    {
      title: 'Profile Views',
      value: '89',
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      change: '+15%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className="text-green-600 text-sm font-semibold">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Opportunities */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Opportunities
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiBriefcase className="text-blue-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    Software Engineer
                  </h3>
                  <p className="text-sm text-gray-600">Tech Corp</p>
                  <p className="text-xs text-gray-500 mt-1">Posted 2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Messages
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  J
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    John Doe
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    Hey, I saw your profile and wanted to connect...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <FiBriefcase className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-700">
              Browse Jobs
            </span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <FiUsers className="mx-auto mb-2 text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-700">
              Find Mentors
            </span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <FiMessageSquare className="mx-auto mb-2 text-purple-600" size={24} />
            <span className="text-sm font-medium text-gray-700">
              Send Message
            </span>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
            <FiTrendingUp className="mx-auto mb-2 text-orange-600" size={24} />
            <span className="text-sm font-medium text-gray-700">
              View Analytics
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
