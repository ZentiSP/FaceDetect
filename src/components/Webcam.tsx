"use client";
import { useRef, useEffect } from "react";

type WebcamProps = {
  onFrame: (video: HTMLVideoElement) => void;
  isActive: boolean;
};

export default function Webcam({ onFrame, isActive }: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  const delayMs = 1200; // 1.5 seconds

  const captureFrame = () => {
    const now = Date.now();
    if (videoRef.current && now - lastSentRef.current >= delayMs) {
      onFrame(videoRef.current);
      lastSentRef.current = now;
    }
    timeoutRef.current = window.setTimeout(captureFrame, 10); // check frequently, send every 1.5s
  };

  useEffect(() => {
    if (isActive) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play();
            captureFrame();
          };
        }
      });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, onFrame]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      width={640}
      height={480}
      style={{ transform: "scaleX(-1)" }}
      className="rounded-xl shadow-lg bg-black"
    />
  );
}