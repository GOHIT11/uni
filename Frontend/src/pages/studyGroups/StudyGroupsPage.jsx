import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const groupSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  subject: z.string().min(2, 'Subject is required'),
  department: z.string().optional(),
  semester: z.string().transform(v => Number(v)).optional(),
});

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [showModal, setShowModal] = useState(false);

  const socket = useSocket();
  const { user } = useAuth();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(groupSchema)
  });

  const fetchGroups = async () => {
    try {
      const res = await api.get('/study-groups');
      setGroups(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      const res = await api.get(`/study-groups/${groupId}/messages`);
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (activeGroup && socket) {
      socket.emit('joinGroup', activeGroup._id);
      fetchMessages(activeGroup._id);

      const handleNewMessage = (msg) => {
        if (msg.groupId === activeGroup._id) {
          setMessages(prev => [...prev, msg]);
        }
      };

      socket.on('newMessage', handleNewMessage);
      return () => {
        socket.emit('leaveGroup', activeGroup._id);
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [activeGroup, socket]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeGroup) return;

    // Optimistic UI
    const tempMsg = { _id: Date.now().toString(), sender: user?.email, content: msgInput, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    const inputToSent = msgInput;
    setMsgInput('');

    try {
      await api.post(`/study-groups/${activeGroup._id}/message`, { content: inputToSent });
    } catch (err) {
      console.error(err);
      toast.error('Message failed to send');
    }
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/study-groups/${id}/join`);
      toast.success('Joined group!');
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to join');
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/study-groups', data);
      toast.success('Group created!');
      setShowModal(false);
      reset();
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create group');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-6xl mx-auto border border-dark-800 rounded-xl overflow-hidden mt-4">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-dark-800 bg-dark-900 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-dark-800 flex justify-between items-center bg-dark-900 sticky top-0">
          <h2 className="text-lg font-bold text-dark-100">Study Groups</h2>
          <button onClick={() => setShowModal(true)} className="text-xl text-primary-400 hover:text-primary-300">+</button>
        </div>
        <div className="divide-y divide-dark-800 flex-1">
          {groups.map(g => (
            <button
              key={g._id}
              onClick={() => setActiveGroup(g)}
              className={`w-full text-left p-4 hover:bg-dark-800 transition-colors ${activeGroup?._id === g._id ? 'bg-dark-800' : ''}`}
            >
              <h3 className="font-medium text-dark-100">{g.name}</h3>
              <p className="text-xs text-dark-400 mt-1">{g.subject}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-dark-950">
        {activeGroup ? (
          <>
            <div className="p-4 border-b border-dark-800 bg-dark-900 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-dark-100">{activeGroup.name}</h3>
                <p className="text-xs text-dark-400">{activeGroup.members.length} members</p>
              </div>
              {!activeGroup.members.includes(user?.email) && (
                <button onClick={() => handleJoin(activeGroup._id)} className="btn-primary px-3 py-1 text-xs">Join Group</button>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {!activeGroup.members.includes(user?.email) && (
                <div className="text-center p-4 bg-dark-900 rounded-lg text-dark-400 text-sm">
                  Join the group to view and send messages.
                </div>
              )}
              {activeGroup.members.includes(user?.email) && messages.map(m => (
                <div key={m._id} className={`flex ${m.sender === user?.email ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 ${m.sender === user?.email ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-100'}`}>
                    <p className="text-[10px] opacity-70 mb-0.5">{m.sender.split('@')[0]}</p>
                    <p className="text-sm">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {activeGroup.members.includes(user?.email) && (
              <form onSubmit={sendMessage} className="p-4 border-t border-dark-800 bg-dark-900 flex gap-2">
                <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-field"
                />
                <button type="submit" disabled={!msgInput.trim()} className="btn-primary px-4 py-2">Send</button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-dark-400">
            <div className="w-16 h-16 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mb-4 text-2xl">👥</div>
            Select a group to start chatting
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-dark-100 mb-4">New Study Group</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-text">Group Name</label>
                <input {...register('name')} className="input-field" placeholder="Algorithms 101" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label-text">Subject</label>
                <input {...register('subject')} className="input-field" placeholder="Computer Science" />
                {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="label-text">Department (Optional)</label>
                <input {...register('department')} className="input-field" placeholder="CSE" />
              </div>
              <div>
                <label className="label-text">Semester (Optional)</label>
                <input type="number" {...register('semester')} className="input-field" placeholder="3" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-dark-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-sm">
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
