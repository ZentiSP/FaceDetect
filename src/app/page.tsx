"use client";
import { useState, useCallback, useRef } from "react";
import Webcam from "@/components/Webcam";
import DetectionOverlay from "@/components/DetectionOverlay";

export default function HomePage() {
  const [detections, setDetections] = useState<any[]>([]);
  const lastSentRef = useRef<number>(0);
  const delayMs = 200; // 5 FPS → 1000ms / 5 = 200ms

  const sendFrame = useCallback(async (video: HTMLVideoElement) => {
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const now = Date.now();
    if (now - lastSentRef.current < delayMs) return; // skip if less than 200ms
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
      setDetections(data.detections || []);
    } catch (err) {
      console.error("Detection error:", err);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="relative w-[640px] h-[480px]">
        <Webcam onFrame={sendFrame} />
        <DetectionOverlay detections={detections} width={640} height={480} />
      </div>
    </div>
  );
}
