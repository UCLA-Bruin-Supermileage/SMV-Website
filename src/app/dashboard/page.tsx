'use client';

import { useRef, useEffect, useState } from 'react';
import GetMqttSpeed from '@/components/mqtt/MQTTClient';

export default function SpeedometerPage() {
  const speed = GetMqttSpeed();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Draw the speedometer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 400;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define colors based on mode
    const colors = darkMode ? {
      background: '#1e293b',
      gaugeBackground: '#334155',
      tickMarks: '#94a3b8',
      tickText: '#e2e8f0',
      needleColor: '#f87171',
      needleCap: '#0f172a',
      needleCapBorder: '#475569'
    } : {
      background: '#e5e7eb',
      gaugeBackground: '#9ca3af',
      tickMarks: '#374151',
      tickText: '#1f2937',
      needleColor: '#dc2626',
      needleCap: '#1f2937',
      needleCapBorder: '#6b7280'
    };

    // Constants for drawing
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 100;
    const radius = 150;
    // FIXED: The correct angles for a semicircular gauge from left to right
    const startAngle = 5/6 * Math.PI; // 144 degrees (in the lower left quadrant)
    const endAngle = Math.PI/6;   // 36 degrees (in the upper right quadrant)
    const maxSpeed = 60; // Maximum speed on speedometer (MPH)

    // Draw the gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 25;
    ctx.strokeStyle = colors.gaugeBackground;
    ctx.stroke();

    // Draw the speed value on the gauge
    if (speed !== null) {
      const speedRatio = Math.min(speed / maxSpeed, 1);
      const speedAngle = startAngle + speedRatio * (2 * Math.PI + endAngle - startAngle)
      
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, speedAngle);
      ctx.lineWidth = 25;
      
      // Color based on speed
      // if (speed < 20) {
      //   ctx.strokeStyle = '#22c55e'; // Green
      // } else if (speed < 40) {
      //   ctx.strokeStyle = '#eab308'; // Yellow
      // } else {
      //   ctx.strokeStyle = '#ef4444'; // Red
      // }

      // Manual Color
      ctx.strokeStyle = '#22c55e'
      
      ctx.stroke();
    }

    // FIXED: Properly draw tick marks
    for (let i = 0; i <= 6; i++) {
      const tickSpeed = (maxSpeed / 6) * i;
      const tickRatio = i / 6;
      // const tickAngle = startAngle + tickRatio * (endAngle - startAngle);
      const tickAngle = startAngle + tickRatio * (2 * Math.PI + endAngle - startAngle)
      
      // Calculate tick mark positions
      const innerRadius = radius - 20;
      const outerRadius = radius + 20;
      
      const innerX = centerX + innerRadius * Math.cos(tickAngle);
      const innerY = centerY + innerRadius * Math.sin(tickAngle);
      const outerX = centerX + outerRadius * Math.cos(tickAngle);
      const outerY = centerY + outerRadius * Math.sin(tickAngle);
      
      // Draw tick line
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.tickMarks;
      ctx.stroke();
      
      // Draw tick label
      const textRadius = radius + 35;
      const textX = centerX + textRadius * Math.cos(tickAngle);
      const textY = centerY + textRadius * Math.sin(tickAngle);
      
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = colors.tickText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better readability in light mode
      if (!darkMode) {
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 4;
      }
      
      ctx.fillText(tickSpeed.toString(), textX, textY);
      ctx.shadowBlur = 0; // Reset shadow
    }
    
    // FIXED: Draw needle with correct orientation
    if (speed !== null) {
      // Calculate needle angle
      const speedRatio = Math.min(speed / maxSpeed, 1);
      const needleAngle = startAngle + speedRatio * (2 * Math.PI + endAngle - startAngle);
      
      // Draw the needle (main part pointing to speed)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const needleLength = radius - 20;
      const needleX = centerX + needleLength * Math.cos(needleAngle);
      const needleY = centerY + needleLength * Math.sin(needleAngle);
      ctx.lineTo(needleX, needleY);
      ctx.lineWidth = 4;
      ctx.strokeStyle = colors.needleColor;
      ctx.stroke();
      
      // Add a smaller counterweight on the opposite side
      const counterweightLength = 30;
      const counterweightX = centerX + counterweightLength * Math.cos(needleAngle + Math.PI);
      const counterweightY = centerY + counterweightLength * Math.sin(needleAngle + Math.PI);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(counterweightX, counterweightY);
      ctx.lineWidth = 6;
      ctx.strokeStyle = colors.needleColor;
      ctx.stroke();
      
      // Draw needle center cap
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fillStyle = colors.needleCap;
      ctx.fill();
      ctx.strokeStyle = colors.needleCapBorder;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [speed, darkMode]);

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`p-8 rounded-lg shadow-lg w-full max-w-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            MQTT Speedometer
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-md ${
              darkMode 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-slate-800 text-white hover:bg-slate-900'
            } transition-colors`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <canvas 
            ref={canvasRef} 
            className="w-full max-w-md h-64" 
            style={{ maxWidth: '400px', height: '300px' }}
          />
        </div>
        
        <div className="text-center mt-8">
          <p className={`text-6xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {speed !== null ? Math.round(speed) : '--'}
            <span className={`text-2xl font-normal ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>MPH</span>
          </p>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
            {speed === null ? 'Waiting for speed data...' : `Current speed: ${speed.toFixed(1)} MPH`}
          </p>
        </div>
      </div>
    </div>
  );
}