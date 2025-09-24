"use client";
import { useEffect, useRef } from 'react';

type LogBoxProps = {
  detections: any[];
};

export default function LogBox({ detections }: LogBoxProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [detections]);

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Detection Log</h2>
      <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2">
        {detections.length === 0 ? (
          <p className="text-gray-400">No detections yet. Start the webcam to begin.</p>
        ) : (
          detections.map((detection, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-700 rounded-md text-sm">
              <p><span className="font-semibold">Object:</span> {detection.label}</p>
              <p><span className="font-semibold">Confidence:</span> {(detection.score * 100).toFixed(2)}%</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}