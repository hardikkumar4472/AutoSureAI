const TIMEOUT_DURATION = 10000;

export const getCurrentLocation = async () => {
  try {
    const position = await getGeolocation();
    const address = await getAddressFromCoords(position.lat, position.lon);
    return {
      lat: position.lat,
      lon: position.lon,
      address: address || "Address not found"
    };
  } catch (error) {
    console.warn("Geolocation failed, trying IP-based location:", error);
    try {
      const ipLocation = await getIPLocation();
      return ipLocation;
    } catch (ipError) {
      console.error("All location methods failed:", ipError);
      throw new Error("Unable to determine location. Please enter manually.");
    }
  }
};

const getGeolocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Location timeout"));
    }, TIMEOUT_DURATION);

    const success = (position) => {
      clearTimeout(timeoutId);
      resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    };

    const error = (err) => {
      clearTimeout(timeoutId);
      let message = "Location error";
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = "Location access denied";
          break;
        case err.POSITION_UNAVAILABLE:
          message = "Location unavailable";
          break;
        case err.TIMEOUT:
          message = "Location timeout";
          break;
      }
      
      reject(new Error(message));
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: false,
      timeout: TIMEOUT_DURATION - 1000,
      maximumAge: 60000
    });
  });
};

const getAddressFromCoords = async (lat, lon) => {
  const services = [
    {
      name: "Nominatim",
      url: `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      parser: (data) => data.display_name
    },
    {
      name: "BigDataCloud",
      url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      parser: (data) => data.locality ? `${data.locality}, ${data.countryName}` : data.countryName
    }
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url);
      if (response.ok) {
        const data = await response.json();
        const address = service.parser(data);
        if (address) return address;
      }
    } catch (error) {
      console.warn(`${service.name} geocoding failed:`, error);
    }
  }

  return null;
};

const getIPLocation = async () => {
  const services = [
    {
      name: "ipapi.co",
      url: "https://ipapi.co/json/",
      parser: (data) => ({
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
        address: `${data.city}, ${data.region}, ${data.country_name}`
      })
    },
    {
      name: "ip-api.com",
      url: "http://ip-api.com/json/",
      parser: (data) => ({
        lat: data.lat,
        lon: data.lon,
        address: `${data.city}, ${data.regionName}, ${data.country}`
      })
    },
    {
      name: "ipinfo.io",
      url: "https://ipinfo.io/json",
      parser: (data) => {
        const [lat, lon] = data.loc.split(',').map(parseFloat);
        return {
          lat,
          lon,
          address: `${data.city}, ${data.region}, ${data.country}`
        };
      }
    }
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url);
      if (response.ok) {
        const data = await response.json();
        const location = service.parser(data);
        
        if (location.lat && location.lon) {
          return {
            lat: location.lat.toString(),
            lon: location.lon.toString(),
            address: location.address,
            source: 'ip'
          };
        }
      }
    } catch (error) {
      console.warn(`${service.name} IP location failed:`, error);
    }
  }

  throw new Error("All IP location services failed");
};

export const validateCoordinates = (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  return (
    !isNaN(latitude) && 
    !isNaN(longitude) && 
    latitude >= -90 && 
    latitude <= 90 && 
    longitude >= -180 && 
    longitude <= 180
  );
};

export const formatCoordinates = (lat, lon) => {
  return {
    lat: parseFloat(lat).toFixed(6),
    lon: parseFloat(lon).toFixed(6)
  };
};