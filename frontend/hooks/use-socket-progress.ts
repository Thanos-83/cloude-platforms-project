"use client";

import { useEffect, useState } from "react";

interface ProgressUpdate {
  filename: string;
  status: string;
  progress: number;
}

export function useSocketProgress() {
  // progressMap stores the % for each file: { "invoice.pdf": 50 }
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  
  // statusMap stores the text: { "invoice.pdf": "AI Reading..." }
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // Connect to Node-RED WebSocket
    const socket = new WebSocket("ws://localhost:1880/ws/progress");

    socket.onopen = () => {
      console.log("🟢 Connected to Real-time Stream");
    };

    socket.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data);
        
        // Only update if we have a valid filename
        if (data.filename) {
          setProgressMap((prev) => ({ ...prev, [data.filename]: data.progress }));
          setStatusMap((prev) => ({ ...prev, [data.filename]: data.status }));
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return { progressMap, statusMap };
}