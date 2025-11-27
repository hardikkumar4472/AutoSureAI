import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../utils/api";
import { Loader, AlertCircle, TrendingUp, MapPin, AlertTriangle } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const mockHotspots = [
  { 
    geometry: { coordinates: [77.2090, 28.6139] }, 
    properties: { count: 5, severityBreakdown: { severe: 2, moderate: 2, minor: 1 } } 
  },
  { 
    geometry: { coordinates: [72.8777, 19.0760] }, 
    properties: { count: 3, severityBreakdown: { severe: 0, moderate: 3, minor: 0 } } 
  },
];

const HotspotMap = () => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.min-h-screen');

    if (!container) return;

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.3';

    container.style.position = 'relative';
    container.appendChild(canvas);

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.2 + 0.1;
        this.color = document.documentElement.classList.contains('dark') 
          ? Math.random() > 0.7 ? '#ef4444' : '#dc2626' 
          : Math.random() > 0.7 ? '#dc2626' : '#b91c1c';
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.reset();
          this.y = -10;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 20 }, () => new Particle());

    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      setError(null);
      console.log("Fetching hotspots from:", "/admin/hotspots/hotspots");

      const res = await api.get("/admin/hotspots/hotspots?precision=3&minCount=1");
      console.log("Hotspots API response:", res.data);

      if (res.data && res.data.success && res.data.features) {

        const validHotspots = res.data.features.filter(feature => 
          feature.geometry && 
          feature.geometry.coordinates && 
          feature.geometry.coordinates[0] !== null && 
          feature.geometry.coordinates[1] !== null &&
          !isNaN(feature.geometry.coordinates[0]) &&
          !isNaN(feature.geometry.coordinates[1])
        );

        console.log(`Filtered ${validHotspots.length} valid hotspots from ${res.data.features.length} total`);

        if (validHotspots.length === 0) {
          throw new Error("No valid hotspot coordinates found in response");
        }

        setHotspots(validHotspots);
        setUsingMockData(false);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching hotspots:", err);
      console.error("Error details:", err.response?.data);

      setHotspots(mockHotspots);
      setUsingMockData(true);
      setError(`API Error: ${err.message}. Using demo data.`);
    } finally {
      setLoading(false);
    }
  };

  const createCustomIcon = (count, severityBreakdown) => {
    const totalSevere = severityBreakdown?.severe || 0;
    const totalModerate = severityBreakdown?.moderate || 0;

    let color = '#22c55e'; 
    if (totalSevere > 0) color = '#dc2626'; 
    else if (totalModerate > 0) color = '#f59e0b'; 

    return L.divIcon({
      html: `
        <div class="relative">
          <div style="
            background-color: ${color};
            width: ${20 + Math.min(count, 10) * 2}px;
            height: ${20 + Math.min(count, 10) * 2}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${12 + Math.min(count, 5)}px;
            transition: all 0.3s ease;
          ">${count}</div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const getSeverityText = (severityBreakdown) => {
    if (!severityBreakdown) return "No severity data";

    const severe = severityBreakdown.severe || 0;
    const moderate = severityBreakdown.moderate || 0;

    if (severe > 0) return "High Risk Area";
    if (moderate > 0) return "Moderate Risk Area";
    return "Low Risk Area";
  };

  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined || isNaN(coord)) {
      return "N/A";
    }
    return coord.toFixed(4);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800 space-y-4">
        <Loader className="w-12 h-12 animate-spin text-primary-600" />
        <p className="text-gray-600 dark:text-gray-300 text-lg">Loading accident hotspots...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing global accident data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
            <MapPin className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-red-700 dark:from-white dark:to-red-400 bg-clip-text text-transparent">
            Accident Hotspot Map
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 max-w-3xl mx-auto">
            Explore real-time accident hotspots and risk areas worldwide. Stay informed about high-risk locations.
          </p>
        </div>

        {}
        <div className="space-y-4 mb-8">
          {error && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">{error}</p>
                <button
                  onClick={fetchHotspots}
                  className="mt-2 text-yellow-900 dark:text-yellow-300 underline text-sm hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors"
                >
                  Retry API connection
                </button>
              </div>
            </div>
          )}

          {usingMockData && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="flex items-center space-x-3 text-blue-800 dark:text-blue-200">
                <TrendingUp className="w-5 h-5" />
                <div>
                  <span className="text-sm font-medium">Demo Mode</span>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Showing sample hotspot data for demonstration purposes
                  </p>
                </div>
              </div>
            </div>
          )}

          {!usingMockData && hotspots.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
              <div className="flex items-center space-x-3 text-green-800 dark:text-green-200">
                <TrendingUp className="w-5 h-5" />
                <div>
                  <span className="text-sm font-medium">Live Data Active</span>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {hotspots.length} active hotspot{hotspots.length !== 1 ? 's' : ''} detected worldwide
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="card rounded-3xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <div className="w-full h-[700px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600">
            <MapContainer
              center={[23.2599, 77.4126]}
              zoom={4.5}
              minZoom={3}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {hotspots.map((feature, idx) => {
                const coordinates = feature.geometry.coordinates; 
                const properties = feature.properties;

                if (!coordinates || coordinates[0] === null || coordinates[1] === null) {
                  console.warn('Skipping invalid coordinates:', coordinates);
                  return null;
                }

                return (
                  <Marker
                    key={idx}
                    position={[coordinates[1], coordinates[0]]}
                    icon={createCustomIcon(properties.count, properties.severityBreakdown)}
                  >
                    <Popup className="custom-popup">
                      <div className="text-sm min-w-[280px] p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-4 h-4 rounded-full ${
                            properties.severityBreakdown?.severe ? 'bg-red-500' : 
                            properties.severityBreakdown?.moderate ? 'bg-orange-500' : 'bg-green-500'
                          }`}></div>
                          <h3 className="font-bold text-gray-900 text-lg">{getSeverityText(properties.severityBreakdown)}</h3>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Total Accidents:</span>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">{properties.count}</span>
                          </div>

                          {properties.severityBreakdown && (
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Severe</p>
                                <p className="font-bold text-red-700 dark:text-red-300">{properties.severityBreakdown.severe || 0}</p>
                              </div>
                              <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Moderate</p>
                                <p className="font-bold text-orange-700 dark:text-orange-300">{properties.severityBreakdown.moderate || 0}</p>
                              </div>
                              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Minor</p>
                                <p className="font-bold text-green-700 dark:text-green-300">{properties.severityBreakdown.minor || 0}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
                          <p>Coordinates: {formatCoordinate(coordinates[1])}, {formatCoordinate(coordinates[0])}</p>
                          {usingMockData && <p className="text-yellow-600 mt-1">• Demo data for visualization</p>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {}
        <div className="mt-8 card rounded-3xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Level Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">High Risk</p>
                <p className="text-sm text-red-600 dark:text-red-400">Contains severe accidents</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div>
                <p className="font-medium text-orange-700 dark:text-orange-300">Moderate Risk</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">Contains moderate accidents</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">Low Risk</p>
                <p className="text-sm text-green-600 dark:text-green-400">Minor accidents only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotMap;