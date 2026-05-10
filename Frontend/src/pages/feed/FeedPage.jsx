import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../config/api';
import { toast } from 'react-hot-toast';

const postSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(2000, 'Too long'),
  type: z.enum(['resource', 'event', 'doubt', 'marketplace', 'opportunity', 'discussion', 'general']),
});

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: { type: 'general' }
  });

  const fetchFeed = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/posts', data);
      reset();
      fetchFeed();
      toast.success('Post created!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post');
    }
  };

  const handleVote = async (id, action) => {
    try {
      // Optimistic update omitted for speed but the API handles the vote
      await api.post(`/posts/${id}/vote`, { action });
      fetchFeed();
    } catch (err) {
      console.error(err);
      toast.error('Vote failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-dark-100">Feed</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-4 bg-dark-900 rounded-xl border border-dark-800">
        <textarea
          {...register('content')}
          placeholder="What's on your mind?"
          className="w-full bg-dark-950 border border-dark-800 rounded-lg p-3 text-dark-100 resize-none focus:outline-none focus:border-primary-500"
          rows="3"
        />
        {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>}

        <div className="flex justify-between items-center mt-3">
          <select {...register('type')} className="bg-dark-950 border border-dark-800 text-dark-200 text-sm rounded px-2 py-1 focus:outline-none">
            <option value="general">General</option>
            <option value="doubt">Doubt</option>
            <option value="discussion">Discussion</option>
            <option value="resource">Resource</option>
          </select>
          <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-sm">
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-dark-400">Loading posts...</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className="p-4 bg-dark-900 rounded-xl border border-dark-800">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center mr-3 font-bold text-dark-200">
                  {post.author?.fullName?.charAt(0) || post.author?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-dark-100">{post.author?.fullName || post.author?.email}</p>
                  <p className="text-xs text-dark-400">{new Date(post.createdAt).toLocaleString()} • <span className="text-primary-500 capitalize">{post.type}</span></p>
                </div>
              </div>
              <p className="text-dark-200 whitespace-pre-wrap">{post.content}</p>

              <div className="mt-4 pt-3 border-t border-dark-800 flex gap-6 text-sm text-dark-400">
                <button onClick={() => handleVote(post._id, 'upvote')} className="hover:text-primary-500 transition-colors flex items-center gap-1">
                  ▲ {post.upvotes?.length || 0}
                </button>
                <button onClick={() => handleVote(post._id, 'downvote')} className="hover:text-red-500 transition-colors flex items-center gap-1">
                  ▼ {post.downvotes?.length || 0}
                </button>
                <button className="hover:text-primary-500 transition-colors">Comments ({post.comments?.length || 0})</button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-dark-400">No posts yet. Be the first to say hi!</p>}
        </div>
      )}
    </div>
  );
}
