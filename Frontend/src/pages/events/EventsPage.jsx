import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description required'),
  date: z.string(),
  location: z.string().min(3, 'Location required'),
  bannerUrl: z.string().url('Must be a valid Cloudinary URL').optional().or(z.literal('')),
});

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventSchema)
  });

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.data.items || res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/events', data);
      toast.success('Event created!');
      setShowModal(false);
      reset();
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create event');
    }
  };

  const handleRSVP = async (id) => {
    try {
      await api.patch(`/events/${id}/rsvp`);
      toast.success('RSVP updated!');
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error('RSVP failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-100">Campus Events</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary px-4 py-2 text-sm">Create Event</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Create Event</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-text">Event Title</label>
                <input {...register('title')} className="input-field" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="label-text">Date & Time</label>
                  <input type="datetime-local" {...register('date')} className="input-field" />
                </div>
                <div className="flex-1">
                  <label className="label-text">Location</label>
                  <input {...register('location')} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label-text">Banner Image URL (Cloudinary)</label>
                <input {...register('bannerUrl')} className="input-field" placeholder="https://res.cloudinary.com/..." />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea {...register('description')} className="input-field resize-none h-24" />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-dark-300 hover:text-dark-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-sm">
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-dark-400">Loading events...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event._id} className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden flex flex-col">
              <div className="h-40 bg-dark-800 relative">
                {event.bannerUrl ? (
                  <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-500">No Banner</div>
                )}
                <div className="absolute top-2 right-2 bg-dark-950/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary-400">
                  {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-dark-100 mb-1 line-clamp-1">{event.title}</h3>
                <p className="text-xs text-dark-400 mb-2">📍 {event.location}</p>
                <p className="text-sm text-dark-300 line-clamp-2 mb-3 flex-1">{event.description}</p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-dark-800">
                  <span className="text-xs text-dark-500">{event.rsvps?.length || 0} attending</span>
                  <button
                    onClick={() => handleRSVP(event._id)}
                    className="text-sm font-medium text-primary-500 hover:text-primary-400"
                  >
                    RSVP
                  </button>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-dark-400 col-span-3">No upcoming events found.</p>}
        </div>
      )}
    </div>
  );
}
