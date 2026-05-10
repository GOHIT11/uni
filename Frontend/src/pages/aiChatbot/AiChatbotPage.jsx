import { useState, useEffect, useRef } from 'react';
import api from '../../config/api';

export default function AiChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { _id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai-chatbot/ask', { message: userMsg.content, sessionId });
      setSessionId(res.data.data.sessionId);
      const aiMsg = { _id: Date.now().toString() + 1, role: 'assistant', content: res.data.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { _id: Date.now().toString() + 2, role: 'system', content: 'Failed to connect to UniBot. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-dark-900 border border-dark-800 rounded-t-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-primary-400 flex items-center justify-center text-white font-bold text-xl">
          U
        </div>
        <div>
          <h1 className="text-lg font-bold text-dark-100">UniBot</h1>
          <p className="text-xs text-dark-400">Campus AI Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-950 border-x border-dark-800">
        {messages.length === 0 && (
          <div className="text-center text-dark-400 mt-10">
            <p className="mb-2 text-xl">👋 Hello there!</p>
            <p>I can help you with campus info, study resources, and general questions. What's on your mind?</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg._id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-none'
                : msg.role === 'system'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-dark-800 text-dark-100 rounded-bl-none border border-dark-700'
            }`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-dark-800 text-dark-400 rounded-2xl rounded-bl-none px-4 py-3 border border-dark-700">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-dark-900 border border-dark-800 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask UniBot something..."
            className="flex-1 input-field bg-dark-950"
            disabled={loading}
          />
          <button type="submit" className="btn-primary px-6" disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
