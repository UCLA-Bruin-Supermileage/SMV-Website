'use client';

import { useRef, useEffect, useState } from 'react';
import GetMqttSpeed from '@/components/mqtt/MQTTClient';

export default function SpeedometerPage() {
  const speed = GetMqttSpeed();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    containerHeight: 0,
    canvasWidth: 0,
    canvasHeight: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle window resize and update all dimensions
  useEffect(() => {
    const updateDimensions = () => {
      // Get container dimensions from ref
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      
      // Use a more reliable approach for height
      // Reserve space for header (50px) and speed display (110px)
      const headerAndSpeedHeight = 160;
      
      // Calculate available height for the canvas
      const availableHeight = Math.max(300, window.innerHeight - 40);
      const containerHeight = Math.min(availableHeight, 600);
      
      // Canvas dimensions - prioritize giving it as much space as possible
      const canvasHeight = Math.max(180, containerHeight - headerAndSpeedHeight);
      // For width, respect container boundaries while maintaining proportion
      const canvasWidth = Math.min(containerWidth - 16, canvasHeight * 1.2);
      
      setDimensions({
        containerWidth,
        containerHeight,
        canvasWidth,
        canvasHeight
      });
    };

    // Initial update
    updateDimensions();

    // Set up a ResizeObserver for more reliable size detection
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Also listen for orientation changes
    window.addEventListener('orientationchange', updateDimensions);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Draw the speedometer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.canvasWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = dimensions.canvasWidth;
    canvas.height = dimensions.canvasHeight;

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

    // Calculate all dimensions relative to canvas size
    const centerX = canvas.width / 2;
    // Position the center of the gauge higher in the canvas to give more space for tick labels
    const centerY = Math.min(canvas.height * 0.55, canvas.height - 60);
    // Make radius responsive to the smaller dimension
    const radius = Math.min(centerX * 0.85, centerY * 0.7);
    
    // Angles for the gauge
    const startAngle = 5/6 * Math.PI; // 144 degrees (in the lower left quadrant)
    const endAngle = Math.PI/6;   // 36 degrees (in the upper right quadrant)
    const maxSpeed = 60; // Maximum speed on speedometer (MPH)

    // Scale elements based on canvas size, with minimums to ensure visibility on small screens
    const gaugeThickness = Math.max(8, Math.min(15, radius * 0.15));
    const tickWidth = Math.max(2, radius * 0.02);
    const needleWidth = Math.max(2, radius * 0.025);
    const fontSizeBase = Math.max(10, Math.min(16, radius * 0.12));

    // Draw the gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = gaugeThickness;
    ctx.strokeStyle = colors.gaugeBackground;
    ctx.stroke();

    // Draw the speed value on the gauge
    if (speed !== null) {
      const speedRatio = Math.min(speed / maxSpeed, 1);
      const speedAngle = startAngle + speedRatio * (2 * Math.PI + endAngle - startAngle);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, speedAngle);
      ctx.lineWidth = gaugeThickness;
      ctx.strokeStyle = '#22c55e';
      ctx.stroke();
    }

    // Draw tick marks and labels
    for (let i = 0; i <= 6; i++) {
      const tickSpeed = (maxSpeed / 6) * i;
      const tickRatio = i / 6;
      const tickAngle = startAngle + tickRatio * (2 * Math.PI + endAngle - startAngle);
      
      // Calculate tick mark positions
      const innerRadius = radius - gaugeThickness * 0.8;
      const outerRadius = radius + gaugeThickness * 0.8;
      
      const innerX = centerX + innerRadius * Math.cos(tickAngle);
      const innerY = centerY + innerRadius * Math.sin(tickAngle);
      const outerX = centerX + outerRadius * Math.cos(tickAngle);
      const outerY = centerY + outerRadius * Math.sin(tickAngle);
      
      // Draw tick line
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.lineWidth = tickWidth;
      ctx.strokeStyle = colors.tickMarks;
      ctx.stroke();
      
      // Draw tick label with adjusted positioning
      const textRadius = radius + gaugeThickness * 1.6;
      
      // Calculate base text position
      let textX = centerX + textRadius * Math.cos(tickAngle);
      let textY = centerY + textRadius * Math.sin(tickAngle);
      
      // Adjust edge labels to prevent clipping
      if (i === 0) { // Leftmost label (0)
        textX -= fontSizeBase * 0.8;
        textY += fontSizeBase * 0.3;
      } else if (i === 6) { // Rightmost label (60)
        textX += fontSizeBase * 0.8;
        textY += fontSizeBase * 0.3;
      }
      
      ctx.font = `bold ${fontSizeBase}px Arial`;
      ctx.fillStyle = colors.tickText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better readability in light mode
      if (!darkMode) {
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 2;
      }
      
      ctx.fillText(tickSpeed.toString(), textX, textY);
      ctx.shadowBlur = 0; // Reset shadow
    }
    
    // Draw needle
    if (speed !== null) {
      // Calculate needle angle
      const speedRatio = Math.min(speed / maxSpeed, 1);
      const needleAngle = startAngle + speedRatio * (2 * Math.PI + endAngle - startAngle);
      
      // Draw the needle (main part pointing to speed)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      // const needleLength = radius - gaugeThickness * 0.8;
      const needleLength = radius + gaugeThickness;
      const needleX = centerX + needleLength * Math.cos(needleAngle);
      const needleY = centerY + needleLength * Math.sin(needleAngle);
      ctx.lineTo(needleX, needleY);
      ctx.lineWidth = needleWidth;
      ctx.strokeStyle = colors.needleColor;
      ctx.stroke();
      
      // Add a smaller counterweight on the opposite side
      const counterweightLength = radius * 0.2;
      const counterweightX = centerX + counterweightLength * Math.cos(needleAngle + Math.PI);
      const counterweightY = centerY + counterweightLength * Math.sin(needleAngle + Math.PI);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(counterweightX, counterweightY);
      ctx.lineWidth = needleWidth * 1.5;
      ctx.strokeStyle = colors.needleColor;
      ctx.stroke();
      
      // Draw needle center cap
      const capRadius = Math.max(4, radius * 0.07);
      ctx.beginPath();
      ctx.arc(centerX, centerY, capRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors.needleCap;
      ctx.fill();
      ctx.strokeStyle = colors.needleCapBorder;
      ctx.lineWidth = Math.max(1, radius * 0.01);
      ctx.stroke();
    }
  }, [speed, darkMode, dimensions]);

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-1 sm:p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div 
        ref={containerRef}
        className={`relative flex flex-col rounded-lg shadow-lg w-full max-w-2xl mx-auto overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
        style={{
          minHeight: '320px',
          height: 'calc(100vh - 16px)',
          maxHeight: '90vh'
        }}
      >
        {/* Header with fixed height */}
        <div className="flex justify-between items-center px-3 py-2 sm:px-4 sm:py-3">
          <h1 className={`text-lg sm:text-xl md:text-2xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            MQTT Speedometer
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm whitespace-nowrap ${
              darkMode 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-slate-800 text-white hover:bg-slate-900'
            } transition-colors`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        
        {/* Canvas container with flex-grow to take available space */}
        <div className="flex-grow flex justify-center items-center px-2">
          <canvas 
            ref={canvasRef} 
            style={{ 
              width: dimensions.canvasWidth > 0 ? `${dimensions.canvasWidth}px` : '100%',
              height: dimensions.canvasHeight > 0 ? `${dimensions.canvasHeight}px` : '100%',
            }}
          />
        </div>
        
        {/* Speed display with fixed height */}
        <div className="px-4 pb-3 pt-1 text-center">
          <p className={`text-2xl sm:text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {speed !== null ? Math.round(speed) : '--'}
            <span className={`text-sm sm:text-base md:text-lg font-normal ml-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>MPH</span>
          </p>
          <p className={`mt-1 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
            {speed === null ? 'Waiting for speed data...' : `Current speed: ${speed.toFixed(1)} MPH`}
          </p>
        </div>
      </div>
    </div>
  );
}