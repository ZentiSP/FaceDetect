"use client";

type LogEntry = {
  timestamp: string;
  detection: { name: string }[]; // we only care about name
};

type LogBoxProps = {
  logs: LogEntry[];
};

export default function LogBox({ logs }: LogBoxProps) {
  // Take only the latest 20 logs
  const displayLogs = logs.slice(0, 20);

  return (
    <div
      className="
        w-full sm:w-96
        h-64 sm:h-[420px]
        bg-gray-800 rounded-lg shadow-lg p-4
        overflow-y-auto
      "
    >
      <h2 className="text-lg font-bold mb-4 text-green-400">Detection Logs</h2>
      <div className="space-y-2">
        {displayLogs.map((log, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded">
            <span className="font-mono text-sm text-green-400">
              [{log.timestamp}]
            </span>
            <span className="ml-2 text-sm text-green-200">
              - Detected: {log.detection.map((d) => d.name).join(", ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
