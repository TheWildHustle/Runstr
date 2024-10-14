import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './RunTracker.module.css';
import RunHistory from './RunHistory';
import { ndk } from 'irisdb-nostr';

interface Position {
  latitude: number;
  longitude: number;
}

interface Run {
  id: number;
  date: string;
  duration: number;
  distance: number;
  route: [number, number][];
}

const RunTracker: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const positionsRef = useRef<Position[]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Load runs from local storage when the component mounts
    const storedRuns = localStorage.getItem('runHistory');
    if (storedRuns) {
      setRuns(JSON.parse(storedRuns));
    }

    // Check if NDK is initialized
    if (!ndk.isInitialized()) {
      setError('NDK is not initialized. Some features may not work.');
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      startGPSTracking();
    } else {
      clearInterval(interval);
      stopGPSTracking();
    }
    return () => {
      clearInterval(interval);
      stopGPSTracking();
    };
  }, [isRunning]);

  const startGPSTracking = () => {
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition: Position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          positionsRef.current.push(newPosition);
          updateDistance();
          updateRoute();
        },
        (err) => {
          setError(`Error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const stopGPSTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const updateDistance = () => {
    const positions = positionsRef.current;
    if (positions.length < 2) return;

    const lastPos = positions[positions.length - 1];
    const prevPos = positions[positions.length - 2];
    const newDistance = calculateDistance(prevPos, lastPos);
    setDistance((prevDistance) => prevDistance + newDistance);
  };

  const updateRoute = () => {
    const positions = positionsRef.current;
    setRoute(positions.map(pos => [pos.latitude, pos.longitude]));
  };

  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startStop = () => {
    if (isRunning) {
      // Save the completed run
      const newRun: Run = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: time,
        distance: distance,
        route: route,
      };
      const updatedRuns = [...runs, newRun];
      setRuns(updatedRuns);
      
      // Save runs to local storage
      localStorage.setItem('runHistory', JSON.stringify(updatedRuns));

      // If NDK is initialized, you could add Nostr event publishing here
      if (ndk.isInitialized()) {
        // Publish run data to Nostr
        // This is a placeholder and needs to be implemented based on your Nostr integration
        console.log('Publishing run data to Nostr');
      }
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
    setDistance(0);
    positionsRef.current = [];
    setRoute([]);
  };

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.runTracker}>
      <h1>Run Tracker</h1>
      <div className={styles.time}>{formatTime(time)}</div>
      <div className={styles.distance}>
        Distance: {distance.toFixed(2)} meters
      </div>
      <div className={styles.controls}>
        <button onClick={startStop}>{isRunning ? 'Stop' : 'Start'}</button>
        <button onClick={reset}>Reset</button>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.mapContainer}>
        <MapContainer
          center={[0, 0]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {route.length > 0 && (
            <Polyline positions={route} color="red" />
          )}
        </MapContainer>
      </div>
      <RunHistory runs={runs} />
    </div>
  );
};

export default RunTracker;