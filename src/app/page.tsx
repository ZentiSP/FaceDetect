"use client";
import { useState, useCallback, useRef } from "react";
import Webcam from "@/components/Webcam";
import DetectionOverlay from "@/components/DetectionOverlay";
import LogBox from "@/components/LogBox";

type LogEntry = {
  timestamp: string;
  detection: { name: string }[]; // we only care about name
};

export default function HomePage() {
  const [detections, setDetections] = useState<[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const lastSentRef = useRef<number>(0);
  const delayMs = 200; // 5 FPS → 1000ms / 5 = 200ms

  const sendFrame = useCallback(async (video: HTMLVideoElement) => {
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const now = Date.now();
    if (now - lastSentRef.current < delayMs) return; // skip if less than delay
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
      const res = await fetch("https://api.zendezvous.com/detect", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.detections && data.detections.length > 0) {
        const newLogEntry = {
          timestamp: new Date().toLocaleTimeString(),
          detection: data.detections,
        };
        setLogs((prevLogs) => [newLogEntry, ...prevLogs]);
      }
      setDetections(data.detections || []);
    } catch (err) {
      console.error("Detection error:", err);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 text-green-300">
      <nav className="bg-black bg-opacity-80 p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-green-400">Object Detection</h1>
        </div>
      </nav>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="flex space-x-6">
          <div className="relative w-[640px] h-[480px] rounded-lg shadow-lg overflow-hidden border-2 border-green-500">
            <Webcam onFrame={sendFrame} isActive={isWebcamOn} />
            <DetectionOverlay detections={detections} width={640} height={480} />
          </div>
          <div className="flex flex-col space-y-4 w-96">
            <div className="flex space-x-2">
              <button
                onClick={() => setIsWebcamOn(true)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-color text-white"
              >
                Start Webcam
              </button>
              <button
                onClick={() => setIsWebcamOn(false)}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/50 rounded-lg shadow-md transition-colors"
              >
                Stop Webcam
              </button>
            </div>
            <LogBox logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}
