import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../config/api';

export default function PortfolioPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // Assuming email prefix is used as username, adjust as per backend mapping
      const res = await api.get(`/users/${username}@adityauniversity.in`);
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  if (loading) return <div className="p-8 text-center text-dark-400">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-dark-400">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
        {/* Cover & Avatar */}
        <div className="h-32 bg-gradient-to-r from-primary-600/20 to-primary-900/20 relative">
          <div className="absolute -bottom-12 left-6 w-24 h-24 rounded-full border-4 border-dark-900 bg-dark-800 overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-dark-300">
                {profile.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-6 px-6">
          <h1 className="text-2xl font-bold text-dark-100">{profile.fullName}</h1>
          <p className="text-dark-400 text-sm mt-1">{profile.department} • {profile.yearOfStudy} Year</p>

          {profile.bio && (
            <p className="mt-4 text-dark-200 text-sm leading-relaxed max-w-2xl">
              {profile.bio}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.skills?.map(skill => (
               <span key={skill} className="px-3 py-1 bg-dark-800 border border-dark-700 rounded-full text-xs text-dark-200">
                 {skill}
               </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
