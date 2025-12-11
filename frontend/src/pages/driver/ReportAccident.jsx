import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  MapPin,
  Loader,
  Camera,
  Navigation,
  AlertTriangle,
  Wifi,
} from "lucide-react";
import api from "../../utils/api";
import { getCurrentLocation } from "../../utils/locationService";
import toast from "react-hot-toast";

const ReportAccident = () => {
  const [formData, setFormData] = useState({
    image: null,
    lat: "",
    lon: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationSource, setLocationSource] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const container = document.querySelector(".min-h-screen");

    if (!container) return;

    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";
    canvas.style.opacity = "0.6";

    container.style.position = "relative";
    container.appendChild(canvas);

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = document.documentElement.classList.contains("dark")
          ? Math.random() > 0.7
            ? "#ef4444"
            : "#dc2626"
          : Math.random() > 0.7
          ? "#dc2626"
          : "#b91c1c";
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

    class CarParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.color = document.documentElement.classList.contains("dark")
          ? "#f59e0b"
          : "#d97706";
        this.life = 80;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = (this.life / 80) * 0.6;

        if (
          this.life <= 0 ||
          this.x < 0 ||
          this.x > canvas.width ||
          this.y < 0 ||
          this.y > canvas.height
        ) {
          this.reset();
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

    const particles = Array.from({ length: 40 }, () => new Particle());
    const carParticles = Array.from({ length: 15 }, () => new CarParticle());

    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      carParticles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      toast.success("Image uploaded successfully");
    }
  };

  // const getCurrentLocation = async () => {
  //   if (!navigator.geolocation) {
  //     toast.error("Geolocation is not supported by your browser");
  //     return;
  //   }

  //   setGettingLocation(true);

  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       const lat = position.coords.latitude;
  //       const lon = position.coords.longitude;

  //       setFormData((prev) => ({
  //         ...prev,
  //         lat: lat.toString(),
  //         lon: lon.toString(),
  //       }));

  //       toast.success("Location captured successfully");

  //       try {
  //         const res = await fetch(
  //           `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  //         );
  //         const data = await res.json();
  //         const address = data.display_name || "Address not found";

  //         setFormData((prev) => ({
  //           ...prev,
  //           address,
  //         }));

  //         toast.success("Address auto-filled");
  //       } catch (err) {
  //         console.error(err);
  //         toast.error("Failed to fetch address details");
  //       } finally {
  //         setGettingLocation(false);
  //       }
  //     },
  //     (error) => {
  //       setGettingLocation(false);
  //       if (error.code === error.PERMISSION_DENIED) {
  //         toast.error("Location access denied. Please enable location permissions.");
  //       } else {
  //         toast.error("Failed to get current location");
  //         console.log(error);
  //       }
  //     },
  //     {
  //       timeout: 10000,
  //       enableHighAccuracy: true
  //     }
  //   );
  // };
  const handleGetLocation = async () => {
    setGettingLocation(true);
    setLocationSource(null);

    try {
      const location = await getCurrentLocation();
      
      setFormData((prev) => ({
        ...prev,
        lat: location.lat,
        lon: location.lon,
        address: location.address,
      }));

      setLocationSource(location.source || 'gps');
      
      if (location.source === 'ip') {
        toast.success("Location found using IP address");
      } else {
        toast.success("GPS location captured successfully");
      }
      
    } catch (error) {
      console.error("Location error:", error);
      toast.error(error.message || "Failed to get location");
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error("Please upload an accident image");
      return;
    }

    if (!formData.lat || !formData.lon) {
      toast.error("Please capture your location before submitting");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.image);
      formDataToSend.append("lat", formData.lat);
      formDataToSend.append("lon", formData.lon);
      formDataToSend.append(
        "address",
        formData.address || "Location not specified"
      );

      const response = await api.post("/accidents/report", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        "Accident reported successfully! AI analysis in progress..."
      );
      navigate("/my-reports");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to report accident. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-red-700 dark:from-white dark:to-red-400 bg-clip-text text-transparent">
            Report Accident
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
            Upload accident images and provide location details for immediate AI
            analysis and insurance processing
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl relative z-10"
        >
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Accident Evidence
              </h2>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 bg-gray-50 dark:bg-gray-700/50">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Accident preview"
                    className="mx-auto h-80 object-contain rounded-2xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors duration-200"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="btn-primary rounded-2xl px-6 py-3 inline-flex items-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span>Upload Accident Image</span>
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      Supported formats: JPG, PNG, WEBP • Max size: 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Location Details
              </h2>
            </div>

            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="btn-secondary rounded-2xl px-8 py-4 flex items-center space-x-3 font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                {gettingLocation ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : locationSource === 'ip' ? (
                  <Wifi className="w-5 h-5" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
                <span>
                  {gettingLocation
                    ? "Getting Location..."
                    : "Get Current Location"}
                </span>
              </button>
            </div>

            {locationSource && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                  {locationSource === 'ip' ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>Location detected using IP address (approximate)</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>GPS location captured (precise)</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Latitude
                </label>
                <div className="input-field rounded-2xl bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                  {formData.lat || "Not captured"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Longitude
                </label>
                <div className="input-field rounded-2xl bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                  {formData.lon || "Not captured"}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Address
              </label>
              <div className="input-field rounded-2xl bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 min-h-[80px] flex items-start">
                {formData.address ||
                  "Address will appear here after location capture"}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading || !formData.image || !formData.lat}
              className="btn-primary rounded-2xl px-8 py-4 font-semibold flex items-center justify-center space-x-3 disabled:opacity-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex-1"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing Report...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Submit Accident Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/my-reports")}
              className="btn-secondary rounded-2xl px-8 py-4 font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex-1"
            >
              Cancel Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportAccident;
