"use client";
import { useRef, useEffect } from "react";

type WebcamProps = {
  onFrame: (video: HTMLVideoElement) => void;
};

export default function Webcam({ onFrame }: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  const delayMs = 10; // 1.5 seconds

  const captureFrame = () => {
    const now = Date.now();
    if (videoRef.current && now - lastSentRef.current >= delayMs) {
      onFrame(videoRef.current);
      lastSentRef.current = now;
    }
    timeoutRef.current = window.setTimeout(captureFrame, 1); // check frequently, send every 1.5s
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current!.play();
        captureFrame(); // start capturing frames
      }
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onFrame]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      width={640}
      height={480}
      style={{ transform: "scaleX(-1)" }} // mirror video
      className="rounded-xl shadow-lg"
    />
  );
}
