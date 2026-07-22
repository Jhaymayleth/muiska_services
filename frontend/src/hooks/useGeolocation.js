export function useGeolocation() {
  let currentWatchId = null;

  const getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
          ...options,
        }
      );
    });
  };

  const watchPosition = (callback, errorCallback, options = {}) => {
    if (!navigator.geolocation) {
      errorCallback(new Error("Geolocation is not supported by this browser"));
      return;
    }

    currentWatchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
        ...options,
      }
    );
  };

  const clearWatch = () => {
    if (currentWatchId !== null) {
      navigator.geolocation.clearWatch(currentWatchId);
      currentWatchId = null;
    }
  };

  const isSupported = () => {
    return !!navigator.geolocation;
  };

  return {
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isSupported,
  };
}
