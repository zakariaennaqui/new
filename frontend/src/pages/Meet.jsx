import React, { useState } from 'react';
import { assets } from '../assets/assets';

const Meet = () => {
  const [meetCode, setMeetCode] = useState('');
  const [joinUrl, setJoinUrl] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (meetCode.trim()) {
      setJoinUrl(`https://meet.google.com/${meetCode.trim()}`);
    }
  };

  return (
    <div>
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b-gray-400'>
      <img className='' src={assets.logo_meet} alt="" />
    </div>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-4 text-primary">G<span className='text-green-500 font-medium'>o</span><span className='text-yellow-500 font-medium'>o</span><span className='text-blue-500 font-medium'>g</span><span className='text-red-500 font-medium'>l</span><span className='text-gray-700 font-medium'>e</span> <span className='text-yellow-500 font-medium'>m</span><span className='text-red-500 font-medium'>e</span><span className='text-blue-500 font-medium'>e</span><span className='text-green-500 font-medium'>t</span></h1>
      <form onSubmit={handleJoin} className="bg-white p-6 rounded shadow w-full max-w-md mb-8">
        <label className="block mb-2 font-medium">Enter Google Meet Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={meetCode}
            onChange={e => setMeetCode(e.target.value)}
            placeholder="e.g. abc-defg-hij"
            className="flex-1 border px-3 py-2 rounded"
            required
          />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Join</button>
        </div>
        {joinUrl && (
          <div className="mt-4">
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Join Meet</a>
          </div>
        )}
      </form>

      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Upcoming Meetings</h2>
        <p className="text-gray-600">No meetings scheduled yet.</p>
        {/* Future: List meetings here */}
      </div>
    </div>
    </div>
  );
};

export default Meet;
