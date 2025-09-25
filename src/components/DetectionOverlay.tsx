"use client";
import { useRef, useEffect } from "react";

type Detection = {
  model: string;
  bbox: [number, number, number, number]; // x1, y1, x2, y2
  confidence: number;
  name?: string;
};

type Props = {
  detections: Detection[];
  width: number;
  height: number;
};

export default function DetectionOverlay({ detections, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;

      // Mirror X coordinates
      const mirroredX1 = width - x2;
      const mirroredX2 = width - x1;

      // Draw bounding box
      ctx.strokeStyle = det.model === "person" ? "lime" : "cyan";
      ctx.lineWidth = 2;
      ctx.strokeRect(mirroredX1, y1, mirroredX2 - mirroredX1, y2 - y1);

      // Draw label
      ctx.fillStyle = "lime";
      ctx.font = "16px Arial bold";
      ctx.fillText(
        det.name
          ? `${det.name} (${det.confidence.toFixed(2)})`
          : `${det.model} (${det.confidence.toFixed(2)})`,
        mirroredX1,
        y1 > 10 ? y1 - 5 : 20
      );
    });
  }, [detections, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
}
