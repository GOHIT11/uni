import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const listingSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  price: z.string().transform(v => Number(v)),
  category: z.string().default('other'),
  imageUrls: z.string().optional() // we'll treat it as a comma separated string for simplicity
});

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(listingSchema)
  });

  const fetchListings = async () => {
    try {
      const res = await api.get('/marketplace');
      setListings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        imageUrls: data.imageUrls ? data.imageUrls.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await api.post('/marketplace', payload);
      toast.success('Listing created!');
      setShowModal(false);
      reset();
      fetchListings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create listing');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-100">Marketplace</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 text-sm">Create Listing</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Create Listing</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input {...register('title')} className="input-field" placeholder="E.g., Engineering Drawing Kit" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="label-text">Price (₹)</label>
                  <input type="number" {...register('price')} className="input-field" placeholder="500" />
                </div>
                <div className="flex-1">
                  <label className="label-text">Category</label>
                  <select {...register('category')} className="input-field">
                    <option value="electronics">Electronics</option>
                    <option value="books">Books</option>
                    <option value="stationery">Stationery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">Image URLs (Cloudinary, comma separated)</label>
                <input {...register('imageUrls')} className="input-field" placeholder="https://res.cloudinary.com/... , https://..." />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea {...register('description')} className="input-field resize-none h-20" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-dark-300 hover:text-dark-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-sm">
                  {isSubmitting ? 'Posting...' : 'Post Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-dark-400">Loading listings...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map(item => (
            <div key={item._id} className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
              <div className="h-48 bg-dark-800 flex items-center justify-center">
                {item.imageUrls?.length > 0 ? (
                  <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-dark-500">No Image</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-dark-100 line-clamp-1">{item.title}</h3>
                  <span className="text-primary-400 font-bold ml-2">₹{item.price}</span>
                </div>
                <p className="text-sm text-dark-400 line-clamp-2 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-dark-800 text-dark-300 px-2 py-1 rounded">{item.category}</span>
                  <a href={`mailto:${item.seller}`} className="text-sm text-primary-500 hover:text-primary-400 font-medium">Contact</a>
                </div>
              </div>
            </div>
          ))}
          {listings.length === 0 && <p className="text-dark-400 col-span-3">No active listings found.</p>}
        </div>
      )}
    </div>
  );
}
