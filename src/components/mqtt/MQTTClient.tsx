'use client'
import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import styles from './speedometer.module.css'

export default function MinimalMqttSpeed() {
  const [speed, setSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [avgSpeed, setAvgSpeed] = useState<number>(0);
  const [travelTime, setTravelTime] = useState<string>('00:00:00');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [speedUnit, setSpeedUnit] = useState<'mph' | 'kmh'>('mph');
  
  const gaugeRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const mqttClient = useRef<mqtt.MqttClient | null>(null);
  const speedSumRef = useRef<number>(0);
  const speedCountRef = useRef<number>(0);
  const travelSecondsRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Constants
  const MAX_SPEED = 160;
  const GAUGE_ANGLE = 240;
  const START_ANGLE = -120;
  
  // Format travel time (HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [hrs, mins, secs]
      .map(val => val.toString().padStart(2, '0'))
      .join(':');
  };
  
  // Update the needle position based on current speed
  const updateNeedle = (currentSpeed: number) => {
    if (needleRef.current) {
      const angle = START_ANGLE + (GAUGE_ANGLE * (Math.min(Math.max(0, currentSpeed), MAX_SPEED) / MAX_SPEED));
      needleRef.current.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }
  };
  
  // Update statistics
  const updateStats = (currentSpeed: number) => {
    // Update max speed
    if (currentSpeed > maxSpeed) {
      setMaxSpeed(currentSpeed);
    }
    
    // Update average speed
    speedSumRef.current += currentSpeed;
    speedCountRef.current++;
    const avg = speedSumRef.current / speedCountRef.current;
    setAvgSpeed(Math.round(avg));
  };
  
  // Update travel time
  const updateTravelTime = () => {
    travelSecondsRef.current++;
    setTravelTime(formatTime(travelSecondsRef.current));
  };
  
  // Toggle connection status
  const toggleConnection = () => {
    if (isConnected) {
      // Disconnect
      if (mqttClient.current) {
        mqttClient.current.end();
        mqttClient.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsConnected(false);
    } else {
      // Connect to MQTT broker
      connectMqtt();
      
      // Start timer for travel time
      timerRef.current = setInterval(updateTravelTime, 1000);
      
      setIsConnected(true);
    }
  };
  
  // Reset all statistics
  const resetStats = () => {
    setMaxSpeed(0);
    setAvgSpeed(0);
    setTravelTime('00:00:00');
    speedSumRef.current = 0;
    speedCountRef.current = 0;
    travelSecondsRef.current = 0;
  };
  
  // Toggle between mph and km/h
  const toggleUnit = () => {
    if (speedUnit === 'mph') {
      // Convert to km/h
      const conversionFactor = 1.60934;
      const convertedSpeed = speed * conversionFactor;
      const convertedMaxSpeed = maxSpeed * conversionFactor;
      const convertedAvgSpeed = avgSpeed * conversionFactor;
      
      setSpeed(convertedSpeed);
      setMaxSpeed(convertedMaxSpeed);
      setAvgSpeed(Math.round(convertedAvgSpeed));
      updateNeedle(convertedSpeed);
      
      setSpeedUnit('kmh');
    } else {
      // Convert to mph
      const conversionFactor = 0.621371;
      const convertedSpeed = speed * conversionFactor;
      const convertedMaxSpeed = maxSpeed * conversionFactor;
      const convertedAvgSpeed = avgSpeed * conversionFactor;
      
      setSpeed(convertedSpeed);
      setMaxSpeed(convertedMaxSpeed);
      setAvgSpeed(Math.round(convertedAvgSpeed));
      updateNeedle(convertedSpeed);
      
      setSpeedUnit('mph');
    }
  };
  
  // Create gauge ticks and labels
  const createGaugeTicks = () => {
    if (!gaugeRef.current) return;
    
    // Clear existing ticks
    gaugeRef.current.querySelectorAll('.tick, .tickLabel').forEach(el => el.remove());
    
    const tickCount = 9; // 0, 20, 40, ... 160
    const tickStep = MAX_SPEED / (tickCount - 1);
    
    for (let i = 0; i < tickCount; i++) {
      const tickSpeed = i * tickStep;
      const angle = START_ANGLE + (GAUGE_ANGLE * (tickSpeed / MAX_SPEED));
      const radians = angle * (Math.PI / 180);
        

      // Create tick
      const tick = document.createElement('div');
      tick.className = styles.tick;
      tick.style.height = i % 2 === 0 ? '15px' : '8px';
      tick.style.transform = `rotate(${angle}deg) translateX(50%)`;
      gaugeRef.current.appendChild(tick);

      // Create label for major ticks
      if (i % 2 === 0) {
        const label = document.createElement('div');
        label.className = styles.tickLabel;
        label.textContent = tickSpeed.toString();
        
        // Position the label
        const labelDistance = 130; // Distance from center
        const x = Math.sin(radians) * labelDistance;
        const y = -Math.cos(radians) * labelDistance;
        
        label.style.left = `calc(50% + ${x}px)`;
        label.style.top = `calc(50% + ${y}px)`;
        label.style.transform = 'translate(-50%, -50%)';
        
        gaugeRef.current.appendChild(label);
      }
    }
  };
  
  // Connect to MQTT broker
  const connectMqtt = () => {
    // Get broker configuration
    const brokerHost = process.env.NEXT_PUBLIC_MQTT_HOST || 'apt.howard-zhu.com';
    const brokerPort = process.env.NEXT_PUBLIC_MQTT_PORT || '9001';
    const brokerProtocol = process.env.NEXT_PUBLIC_MQTT_PROTOCOL || 'ws';
    const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || '/DAQMessage/Speed';
    
    // Connect to broker
    const client = mqtt.connect(`${brokerProtocol}://${brokerHost}:${brokerPort}`);
    mqttClient.current = client;

    client.on('connect', () => {
      client.subscribe(topic);
    });

    client.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        try {
          // Try to parse the message
          const parsed = JSON.parse(message.toString());
          let newSpeed = null;
          
          if (typeof parsed === 'object' && parsed !== null) {
            if ('speed' in parsed) {
              newSpeed = Number(parsed.speed);
            } else if ('value' in parsed) {
              newSpeed = Number(parsed.value);
            } else {
              const firstNumber = Object.values(parsed).find(val => !isNaN(Number(val)));
              if (firstNumber !== undefined) {
                newSpeed = Number(firstNumber);
              }
            }
          } else if (!isNaN(Number(parsed))) {
            newSpeed = Number(parsed);
          }
          
          if (newSpeed !== null) {
            // Apply unit conversion if needed
            if (speedUnit === 'kmh') {
              newSpeed = newSpeed * 1.60934;
            }
            
            setSpeed(newSpeed);
            updateNeedle(newSpeed);
            updateStats(newSpeed);
          }
        } catch {
          const numValue = Number(message.toString());
          if (!isNaN(numValue)) {
            // Apply unit conversion if needed
            const newSpeed = speedUnit === 'kmh' ? numValue * 1.60934 : numValue;
            
            setSpeed(newSpeed);
            updateNeedle(newSpeed);
            updateStats(newSpeed);
          }
        }
      }
    });
  };
  
  // Initialize the speedometer
  useEffect(() => {
    createGaugeTicks();
    
    // Add click event on gauge for manual testing
    if (gaugeRef.current) {
      gaugeRef.current.addEventListener('click', (e) => {
        if (!isConnected) return;
        
        const rect = gaugeRef.current!.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        const angle = Math.atan2(clickX - centerX, -(clickY - centerY)) * (180 / Math.PI);
        const normalizedAngle = angle - START_ANGLE;
        
        if (normalizedAngle >= 0 && normalizedAngle <= GAUGE_ANGLE) {
          const speedPercentage = normalizedAngle / GAUGE_ANGLE;
          const newSpeed = speedPercentage * MAX_SPEED;
          
          setSpeed(newSpeed);
          updateNeedle(newSpeed);
          updateStats(newSpeed);
        }
      });
    }
    
    return () => {
      // Cleanup
      if (mqttClient.current) {
        mqttClient.current.end();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className={styles.dashboard}>
      <div className={styles.connectionStatus}>
        <div className={`${styles.statusIndicator} ${isConnected ? styles.connected : ''}`}></div>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      <div className={styles.speedometer}>
        <div className={styles.gauge} ref={gaugeRef}></div>
        <div className={styles.gaugeCenter}></div>
        <div className={styles.needle} ref={needleRef}></div>
        <div className={styles.speedValue}>
          <span>{Math.round(speed)}</span>
          <span className={styles.unit}>{speedUnit === 'mph' ? 'mph' : 'km/h'}</span>
        </div>
      </div>
      
      <div className={styles.sideStats}>
        <div className={styles.statBox}>
          <div className={styles.statTitle}>MAX SPEED</div>
          <div className={styles.statValue}>
            <span>{Math.round(maxSpeed)}</span> {speedUnit === 'mph' ? 'mph' : 'km/h'}
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statTitle}>AVERAGE SPEED</div>
          <div className={styles.statValue}>
            <span>{avgSpeed}</span> {speedUnit === 'mph' ? 'mph' : 'km/h'}
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statTitle}>TRAVEL TIME</div>
          <div className={styles.statValue}>{travelTime}</div>
        </div>
      </div>
      
      <div className={styles.controls}>
        <button onClick={toggleConnection}>
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
        <button onClick={resetStats}>Reset Stats</button>
        <button onClick={toggleUnit}>
          Switch to {speedUnit === 'mph' ? 'KM/H' : 'MPH'}
        </button>
      </div>
    </div>
  );
}