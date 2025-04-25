import { useState } from 'react';

export default function AdminPanel() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!name.trim()) return setStatus('Please enter a name.');
    setStatus('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ name }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      setStatus(data.message || 'Done!');
    } catch (err) {
      setStatus('Failed to generate. Try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">🎬 Generate Sports Reel</h1>

        <div className="flex flex-col">
            <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter sports celebrity name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full mt-4 py-2 text-white font-semibold rounded-md transition ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            >
            {loading ? 'Generating...' : 'Generate'}
            </button>
        </div>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
