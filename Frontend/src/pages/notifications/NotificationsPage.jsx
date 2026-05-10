import { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-dark-100">Notifications</h1>

      {loading ? (
        <p className="text-dark-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n._id} className={`p-4 rounded-xl border ${n.isRead ? 'bg-dark-900 border-dark-800' : 'bg-primary-900/10 border-primary-500/20'} flex justify-between items-center`}>
              <div>
                <p className={`text-sm ${n.isRead ? 'text-dark-200' : 'text-dark-100 font-medium'}`}>{n.message}</p>
                <p className="text-xs text-dark-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {!n.isRead && (
                  <button onClick={() => markAsRead(n._id)} className="text-xs text-primary-500 hover:text-primary-400">Mark Read</button>
                )}
                <button onClick={() => deleteNotification(n._id)} className="text-xs text-red-500 hover:text-red-400">Delete</button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-10 bg-dark-900 rounded-xl border border-dark-800">
              <p className="text-dark-400">You're all caught up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
