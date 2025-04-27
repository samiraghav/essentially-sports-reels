import { useEffect, useRef, useState } from 'react';

export default function AdminPanel() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [playerSuggestions, setPlayerSuggestions] = useState<any[]>([]);
  const [selectedThumb, setSelectedThumb] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!name.trim()) return setStatus('Please enter sports celebrity name.');

    setStatus('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sport', selectedSport);
      formData.append('thumbnail', selectedThumb);
      selectedImages.forEach((file) => {
        formData.append('images', file);
      });

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      setStatus(data.message || 'Done!');
      setTimeout(() => setStatus(''), 5000);
    } catch (err: any) {
      console.error('Generate failed:', err);
      setStatus('Failed to generate. Please try again later.');
    }

    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!showDropdown || name.length < 2) {
				setPlayerSuggestions([]);
				return;
			}

      try {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.player) {
          setPlayerSuggestions(data.player);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Failed to fetch player suggestions:', err);
      }
    };

    const timeout = setTimeout(() => {
      fetchPlayers();
    }, 300);

    return () => clearTimeout(timeout);
  }, [name]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-screen-sm flex justify-center m-2">
      <div className="p-8 w-full aspect-w-9 aspect-h-16 p-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-1 text-center">
          Generate Reels with AI
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter a sports player's name to automatically generate a compelling narrative using Google Gemini AI. The system fetches five relevant images from the Pexels API and uses Amazon Polly to create a realistic voiceover, which is then combined with visuals via FFmpeg to produce a dynamic sports history reel.
        </p>

        <label className="block mb-2 font-medium text-sm text-gray-700">
          Enter Sports Celebrity Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="e.g. Virat Kohli"
          className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {showDropdown && playerSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto max-w-[300px] rounded-md shadow-lg"
          >
            {playerSuggestions.map((player) => (
              <div
                key={player.idPlayer}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm text-gray-800 flex items-center gap-2"
                onClick={() => {
									setName(player.strPlayer);
									setSelectedSport(player.strSport || '');
									setSelectedThumb(player.strThumb || '');
								
									setPlayerSuggestions([]);
									setShowDropdown(false);
								
									setTimeout(() => {
										setPlayerSuggestions([]);
									}, 0);
								}}
              >
                {player.strThumb && (
                  <img src={player.strThumb} alt={player.strPlayer} className="w-6 h-6 rounded-full object-cover" />
                )}
                {player.strPlayer} ({player.strSport})
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
          <input
            type="text"
            value={selectedSport}
            readOnly
            className="block w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (PNG or JPG) (Optional)
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  aria-hidden="true"
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16V8m0 0l4-4m-4 4l-4-4m13 8h-3m0 0a4 4 0 01-4 4m4-4a4 4 0 014-4m0 0h3"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG (Max 5MB)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".png, .jpg, .jpeg"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="mt-1 text-xs text-gray-500 truncate text-center">
                    {img.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          className={`mt-6 w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm ${
            loading ? 'cursor-not-allowed opacity-70' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Loading...
            </div>
          ) : (
            'Generate'
          )}
        </button>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {status}
          </p>
        )}
        <button
					onClick={() => (window.location.href = '/')}
					className="mt-6 w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm "
					>
					View Reels
        </button>
      </div>
    </div>
  );
}
