import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  bio: z.string().max(500, 'Bio too long').optional(),
  skills: z.string().optional(),
  github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export default function SettingsPage() {
  const { user } = useAuth();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        department: user.department || '',
        bio: user.bio || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await api.patch('/users/profile', payload);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-dark-100">Settings</h1>

      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-100 mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <input type="text" {...register('fullName')} className={`input-field ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`} />
            {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="label-text">Department</label>
            <input type="text" {...register('department')} className={`input-field ${errors.department ? 'border-red-500 focus:border-red-500' : ''}`} />
            {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
          </div>
          <div>
            <label className="label-text">Bio</label>
            <textarea {...register('bio')} className={`input-field h-24 resize-none ${errors.bio ? 'border-red-500 focus:border-red-500' : ''}`} />
            {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
          </div>
          <div>
            <label className="label-text">Skills (comma separated)</label>
            <input type="text" {...register('skills')} className="input-field" placeholder="React, Node.js, Python" />
          </div>

          <div className="pt-4 border-t border-dark-800">
             <h3 className="text-sm font-medium text-dark-300 mb-3">Links</h3>
             <div className="space-y-3">
               <div>
                 <input type="url" {...register('github')} className={`input-field ${errors.github ? 'border-red-500 focus:border-red-500' : ''}`} placeholder="GitHub URL" />
                 {errors.github && <p className="text-red-400 text-xs mt-1">{errors.github.message}</p>}
               </div>
               <div>
                 <input type="url" {...register('linkedin')} className={`input-field ${errors.linkedin ? 'border-red-500 focus:border-red-500' : ''}`} placeholder="LinkedIn URL" />
                 {errors.linkedin && <p className="text-red-400 text-xs mt-1">{errors.linkedin.message}</p>}
               </div>
               <div>
                 <input type="url" {...register('portfolio')} className={`input-field ${errors.portfolio ? 'border-red-500 focus:border-red-500' : ''}`} placeholder="Portfolio Website" />
                 {errors.portfolio && <p className="text-red-400 text-xs mt-1">{errors.portfolio.message}</p>}
               </div>
             </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn-primary px-6" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
