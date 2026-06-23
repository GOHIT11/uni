import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const oppSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  type: z.enum(['internship', 'job', 'referral', 'hackathon']),
  company: z.string().optional(),
  deadline: z.string().optional(),
  skills: z.string().optional(),
});

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(oppSchema),
    defaultValues: { type: 'internship' }
  });

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/opportunities');
      setOpportunities(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await api.post('/opportunities', payload);
      toast.success('Opportunity posted!');
      setShowModal(false);
      reset();
      fetchOpportunities();
    } catch (err) {
      console.error(err);
      toast.error('Failed to post');
    }
  };

  const handleApply = async (id) => {
    try {
      await api.post(`/opportunities/${id}/apply`);
      toast.success('Application submitted!');
      fetchOpportunities();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-100">Opportunities</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 text-sm">Post Opportunity</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Post Opportunity</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input {...register('title')} className="input-field" placeholder="Software Engineer Intern" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="label-text">Type</label>
                  <select {...register('type')} className="input-field">
                    <option value="internship">Internship</option>
                    <option value="job">Job</option>
                    <option value="referral">Referral</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="label-text">Company</label>
                  <input {...register('company')} className="input-field" placeholder="Google" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="label-text">Deadline</label>
                  <input type="date" {...register('deadline')} className="input-field" />
                </div>
                <div className="flex-1">
                  <label className="label-text">Skills (comma separated)</label>
                  <input {...register('skills')} className="input-field" placeholder="React, Python" />
                </div>
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea {...register('description')} className="input-field resize-none h-20" />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-dark-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-sm">
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-dark-400">Loading...</p>
      ) : (
        <div className="space-y-4">
          {opportunities.map(opp => (
            <div key={opp._id} className="p-5 bg-dark-900 rounded-xl border border-dark-800 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-dark-100">{opp.title}</h3>
                  <span className="px-2 py-0.5 rounded text-xs bg-dark-800 text-dark-300 capitalize">{opp.type}</span>
                </div>
                <p className="text-dark-300 text-sm mb-3">{opp.company || 'Campus Referral'}</p>
                <p className="text-dark-400 text-sm line-clamp-2 mb-3">{opp.description}</p>
                {opp.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {opp.skills.map(skill => (
                      <span key={skill} className="text-xs text-primary-400 bg-primary-900/20 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between items-end min-w-[120px]">
                <p className="text-xs text-dark-500 mb-2">Deadline: {new Date(opp.deadline).toLocaleDateString()}</p>
                <button onClick={() => handleApply(opp._id)} className="btn-primary px-4 py-2 text-sm w-full md:w-auto">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
          {opportunities.length === 0 && <p className="text-dark-400">No active opportunities.</p>}
        </div>
      )}
    </div>
  );
}
