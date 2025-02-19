"use client";
import { useEffect, useState } from "react";

export default function Debug() {
  const [message, setMessage] = useState("Waiting for message...");

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.1.6:8765"); // Use `ws://` for WebSockets

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      socket.send("Hello, server!"); // Send an initial message
    };

    socket.onmessage = (event) => {
      console.log("Received from server:", event.data);
      setMessage(event.data); // Update state with received message
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close(); // Clean up connection on unmount
    };
  }, []);

  return <div>Message from server: {message}</div>;
}