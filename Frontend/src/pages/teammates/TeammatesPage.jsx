import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const teamSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description required'),
  skillsNeeded: z.string().min(1, 'At least one skill is needed'),
  type: z.enum(['hackathon', 'project', 'startup', 'other']),
});

export default function TeammatesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: { type: 'project' }
  });

  const fetchRequests = async () => {
    try {
      const res = await api.get('/matching');
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        skillsNeeded: data.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean)
      };
      await api.post('/matching', payload);
      toast.success('Request created!');
      setShowModal(false);
      reset();
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create request');
    }
  };

  const handleMatch = async (id) => {
    try {
      await api.post(`/matching/${id}/match`);
      toast.success('Request sent!');
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error sending request');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-100">Find Teammates</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 text-sm">Create Request</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Create Request</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input {...register('title')} className="input-field" placeholder="Looking for Frontend Dev" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="label-text">Type</label>
                <select {...register('type')} className="input-field">
                  <option value="hackathon">Hackathon</option>
                  <option value="project">Project</option>
                  <option value="startup">Startup</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label-text">Skills Needed (comma separated)</label>
                <input {...register('skillsNeeded')} className="input-field" placeholder="React, Tailwind" />
                {errors.skillsNeeded && <p className="text-red-400 text-xs mt-1">{errors.skillsNeeded.message}</p>}
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea {...register('description')} className="input-field resize-none h-20" />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-dark-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-sm">
                  {isSubmitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-dark-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(req => (
            <div key={req._id} className="p-5 bg-dark-900 rounded-xl border border-dark-800">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-dark-100 mb-2">{req.title}</h3>
                <span className="text-xs bg-dark-800 text-dark-300 px-2 py-1 rounded capitalize">{req.type}</span>
              </div>
              <p className="text-dark-300 text-sm mb-4 line-clamp-3">{req.description}</p>

              <div className="mb-4">
                <p className="text-xs text-dark-500 mb-1">Skills Needed:</p>
                <div className="flex flex-wrap gap-2">
                  {req.skillsNeeded.map(skill => (
                    <span key={skill} className="text-xs text-primary-400 bg-primary-900/20 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dark-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-xs text-dark-300">
                    {req.requestedBy.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-dark-400">{req.requestedBy.split('@')[0]}</span>
                </div>
                <button
                  onClick={() => handleMatch(req._id)}
                  className="text-sm bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded-lg transition-colors"
                >
                  Request to Join
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-dark-400 col-span-2">No open teammate requests.</p>}
        </div>
      )}
    </div>
  );
}
