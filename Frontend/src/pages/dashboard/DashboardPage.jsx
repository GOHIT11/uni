import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
          Welcome, {user?.fullName?.split(' ')[0] || 'there'} 👋
        </h2>
        <p className="text-dark-400 mt-1">Here's your UniCampus dashboard.</p>
      </div>

      {user?.profileCompletionPercent < 100 && (
        <div className="mb-8 p-6 bg-dark-900 border border-dark-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-dark-200 font-medium mb-1">Complete your profile</p>
            <p className="text-dark-400 text-sm">
              Your profile is {user?.profileCompletionPercent || 0}% complete.
            </p>
          </div>
          <div className="w-48 flex items-center gap-4">
            <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                style={{ width: `${user?.profileCompletionPercent || 0}%` }}
              />
            </div>
            <Link to="/settings" className="text-primary-400 text-sm font-medium hover:text-primary-300">
              Edit
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-dark-900 border border-dark-800 rounded-xl">
          <h3 className="text-dark-400 text-sm font-medium mb-2">Role</h3>
          <p className="text-dark-100 text-lg font-semibold capitalize">{user?.role || 'Student'}</p>
        </div>
        <div className="p-6 bg-dark-900 border border-dark-800 rounded-xl">
          <h3 className="text-dark-400 text-sm font-medium mb-2">Department</h3>
          <p className="text-dark-100 text-lg font-semibold">{user?.department || 'Not set'}</p>
        </div>
        <div className="p-6 bg-dark-900 border border-dark-800 rounded-xl">
          <h3 className="text-dark-400 text-sm font-medium mb-2">Year</h3>
          <p className="text-dark-100 text-lg font-semibold">
            {user?.yearOfStudy ? `${user.yearOfStudy}${['st', 'nd', 'rd', 'th'][user.yearOfStudy - 1] || 'th'} Year` : 'Not set'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 bg-dark-900 border border-dark-800 rounded-xl">
           <h3 className="text-lg font-semibold text-dark-100 mb-4">Quick Links</h3>
           <div className="flex flex-wrap gap-3">
             <Link to="/resources" className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 hover:text-primary-400">View Resources</Link>
             <Link to="/events" className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 hover:text-primary-400">Campus Events</Link>
             <Link to="/teammates" className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-dark-200 hover:text-primary-400">Find Teammates</Link>
           </div>
         </div>
         <div className="p-6 bg-dark-900 border border-dark-800 rounded-xl">
           <h3 className="text-lg font-semibold text-dark-100 mb-4">Recent Activity</h3>
           <p className="text-dark-400 text-sm">No recent activity yet. Go explore the feed!</p>
         </div>
      </div>
    </div>
  );
}
