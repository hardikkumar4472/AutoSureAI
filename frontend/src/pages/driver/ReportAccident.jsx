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
import DummyPaymentModal from "../../components/DummyPaymentModal";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Particle animation removed
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

    // Trigger payment modal first
    setShowPaymentModal(true);
  };

  const processSubmission = async () => {
    setShowPaymentModal(false);
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
    <div className="py-8 px-4 transition-colors">
      <DummyPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        onSuccess={processSubmission}
        amount={1000}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-4 backdrop-blur-sm">
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
          className="card rounded-3xl p-8 border border-white/20 shadow-xl relative z-10"
        >
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-red-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Accident Evidence
              </h2>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 bg-white/5 dark:bg-white/5">
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
                  <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
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
              <div className="mb-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
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
                <div className="input-field rounded-2xl bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                  {formData.lat || "Not captured"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Longitude
                </label>
                <div className="input-field rounded-2xl bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                  {formData.lon || "Not captured"}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Address
              </label>
              <div className="input-field rounded-2xl bg-transparent border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 min-h-[80px] flex items-start">
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
