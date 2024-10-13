import React from 'react';
import styles from './RunHistory.module.css';

interface Run {
  id: number;
  date: string;
  duration: number;
  distance: number;
  route: [number, number][];
}

interface RunHistoryProps {
  runs: Run[];
}

const RunHistory: React.FC<RunHistoryProps> = ({ runs }) => {
  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.runHistory}>
      <h2>Run History</h2>
      {runs.length === 0 ? (
        <p>No runs recorded yet.</p>
      ) : (
        <ul>
          {runs.map((run) => (
            <li key={run.id} className={styles.runItem}>
              <div>Date: {new Date(run.date).toLocaleString()}</div>
              <div>Duration: {formatTime(run.duration)}</div>
              <div>Distance: {run.distance.toFixed(2)} meters</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RunHistory;
