"use client";
import { useState, useCallback, useRef } from "react";
import Webcam from "@/components/Webcam";
import DetectionOverlay from "@/components/DetectionOverlay";
import LogBox from "@/components/LogBox";

type LogEntry = {
  timestamp: string;
  detection: { name: string }[];
};

export default function HomePage() {
  const [detections, setDetections] = useState<[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const lastSentRef = useRef<number>(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const delayMs = 200;

  const sendFrame = useCallback(async (video: HTMLVideoElement) => {
  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  const now = Date.now();
  if (now - lastSentRef.current < delayMs) return;
  lastSentRef.current = now;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Failed to create blob from canvas"));
    }, "image/jpeg")
  );

  const formData = new FormData();
  formData.append("file", blob, "frame.jpg");

  try {
    const start = performance.now(); // start timing
    const res = await fetch("https://api.zendezvous.com/detect", {
      method: "POST",
      body: formData,
    });
    const end = performance.now(); // end timing
    console.log("Request latency:", (end - start).toFixed(2), "ms");

    const data = await res.json();
    if (data.detections && data.detections.length > 0) {
      const newLogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        detection: data.detections,
        latency: (end - start).toFixed(2),
      };
      setLogs((prevLogs) => [newLogEntry, ...prevLogs].slice(0, 50));
    }
    setDetections(data.detections || []);
  } catch (err) {
    console.error("Detection error:", err);
  }
}, []);


  const startSession = async () => {
    try {
      const res = await fetch("/api/start-session", { method: "POST" });
      const data = await res.json();
      setSessionId(data.sessionId);
      setIsWebcamOn(true);
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const stopSession = async () => {
    setIsWebcamOn(false);

    try {
      await fetch("/api/end-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const displayLogs = logs.slice(0, 50);

      await fetch("/api/save-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, displayLogs }),
      });
    } catch (err) {
      console.error("Failed to stop session:", err);
    } finally {
      setSessionId(null);
    }
  };

  const saveLogsToDB = async () => {
    const displayLogs = logs.slice(0, 20);
    try {
      const res = await fetch("/api/save-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(displayLogs),
      });
      const data = await res.json();
      console.log("Logs saved:", data);
    } catch (err) {
      console.error("Failed to save logs:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 text-green-300">
      <nav className="bg-black bg-opacity-80 p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-green-400">
            Object Detection
          </h1>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center p-4">
        {/* Responsive container: column on mobile, row on larger screens */}
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 w-full max-w-6xl">
          {/* Webcam box */}
          <div className="relative w-full md:w-[640px] aspect-video rounded-lg shadow-lg overflow-hidden border-2 border-green-500">
            <Webcam onFrame={sendFrame} isActive={isWebcamOn} />
            <DetectionOverlay
              detections={detections}
              width={640}
              height={480}
            />
          </div>

          {/* Controls + Logs */}
          <div className="flex flex-col space-y-4 flex-1">
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <button
                onClick={startSession}
                disabled={isWebcamOn}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-colors text-white"
              >
                Start Webcam
              </button>
              <button
                onClick={stopSession}
                disabled={!isWebcamOn}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/40 rounded-lg shadow-md transition-colors"
              >
                Stop Webcam
              </button>
            </div>

            {/* LogBox */}
            <div className="w-full">
              <LogBox logs={logs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
