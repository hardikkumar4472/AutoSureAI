import { useState } from 'react';
import { getCurrentLocation } from '../utils/locationService';
import { MapPin, Loader, Wifi, Navigation } from 'lucide-react';

const LocationTest = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testLocation = async () => {
    setLoading(true);
    setError(null);
    setLocation(null);

    try {
      const result = await getCurrentLocation();
      setLocation(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <MapPin className="w-5 h-5" />
        <span>Location Service Test</span>
      </h3>

      <button
        onClick={testLocation}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        <span>{loading ? 'Getting Location...' : 'Test Location'}</span>
      </button>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {location && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
            {location.source === 'ip' ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>IP-based location (approximate)</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>GPS location (precise)</span>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Latitude:</span>
              <p className="text-gray-600 dark:text-gray-300">{location.lat}</p>
            </div>
            <div>
              <span className="font-medium">Longitude:</span>
              <p className="text-gray-600 dark:text-gray-300">{location.lon}</p>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-sm">Address:</span>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{location.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTest;