import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const resourceSchema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().optional(),
  department: z.string().min(2, 'Department required'),
  semester: z.string().transform(v => Number(v)),
  subject: z.string().optional(),
  pdfUrl: z.string().url('Must be a valid Cloudinary URL'),
});

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resourceSchema)
  });

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources');
      setResources(res.data.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/resources', data);
      toast.success('Resource uploaded!');
      setShowModal(false);
      reset();
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
  };

  const handleDownload = async (id, url) => {
    try {
      await api.patch(`/resources/${id}/download`);
      window.open(url, '_blank');
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-100">Academic Resources</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 text-sm">Upload Resource</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Upload Resource</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input {...register('title')} className="input-field" placeholder="E.g., OS Midterm Notes" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="label-text">Department</label>
                  <input {...register('department')} className="input-field" placeholder="CSE" />
                </div>
                <div className="flex-1">
                  <label className="label-text">Semester (1-8)</label>
                  <input type="number" {...register('semester')} className="input-field" placeholder="3" />
                </div>
              </div>
              <div>
                <label className="label-text">Subject</label>
                <input {...register('subject')} className="input-field" placeholder="Operating Systems" />
              </div>
              <div>
                <label className="label-text">Cloudinary URL</label>
                <input {...register('pdfUrl')} className="input-field" placeholder="https://res.cloudinary.com/..." />
                {errors.pdfUrl && <p className="text-red-400 text-xs mt-1">{errors.pdfUrl.message}</p>}
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea {...register('description')} className="input-field resize-none h-20" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-dark-300 hover:text-dark-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-sm">
                  {isSubmitting ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-dark-400">Loading resources...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(res => (
            <div key={res._id} className="p-5 bg-dark-900 rounded-xl border border-dark-800 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-dark-100 mb-1 line-clamp-1">{res.title}</h3>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded">{res.department}</span>
                  <span className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded">Sem {res.semester}</span>
                </div>
                <p className="text-sm text-dark-300 line-clamp-2 mb-4">{res.description}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dark-800">
                <span className="text-xs text-dark-500">{res.downloadCount} downloads</span>
                <button onClick={() => handleDownload(res._id, res.pdfUrl)} className="text-primary-400 hover:text-primary-300 text-sm font-medium">Download</button>
              </div>
            </div>
          ))}
          {resources.length === 0 && <p className="text-dark-400 col-span-full">No resources found.</p>}
        </div>
      )}
    </div>
  );
}
