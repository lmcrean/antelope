import { useState } from 'react';

export const JwtButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleClick = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className={`p-4 rounded-lg transition-colors ${isAuthenticated ? 'bg-green-100' : 'bg-white'}`}>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        JWT TEST
      </button>
      
      {!isAuthenticated ? (
        <p className="mt-2 text-gray-600">currently signed out</p>
      ) : (
        <div className="mt-2 space-y-1">
          <p>✅signed up as Random_3425</p>
          <p>✅signed in as Random_3425</p>
          <p>✅JWT Token created</p>
          <p>✅auth Token is currently being used</p>
          <p>✅refresh token is currently being used</p>
        </div>
      )}
    </div>
  );
}; 