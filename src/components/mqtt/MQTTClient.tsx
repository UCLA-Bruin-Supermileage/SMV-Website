// components/MinimalMqttSpeed.tsx
'use client'
import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

export default function MinimalMqttSpeed() {
  const [speed, setSpeed] = useState<number | null>(null);
  
  useEffect(() => {
    // Get broker configuration
    const brokerHost = process.env.NEXT_PUBLIC_MQTT_HOST || 'apt.howard-zhu.com';
    const brokerPort = process.env.NEXT_PUBLIC_MQTT_PORT || '9001';
    const brokerProtocol = process.env.NEXT_PUBLIC_MQTT_PROTOCOL || 'ws';
    const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || '/DAQMessage/Speed';
    
    // Connect to broker
    const client = mqtt.connect(`${brokerProtocol}://${brokerHost}:${brokerPort}`);

    client.on('connect', () => {
      client.subscribe(topic);
    });

    client.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        try {
          // Try to parse the message
          const parsed = JSON.parse(message.toString());
          if (typeof parsed === 'object' && parsed !== null) {
            if ('speed' in parsed) {
              setSpeed(Number(parsed.speed));
            } else if ('value' in parsed) {
              setSpeed(Number(parsed.value));
            } else {
              const firstNumber = Object.values(parsed).find(val => !isNaN(Number(val)));
              if (firstNumber !== undefined) {
                setSpeed(Number(firstNumber));
              }
            }
          } else if (!isNaN(Number(parsed))) {
            setSpeed(Number(parsed));
          }
        } catch (e) {
          const numValue = Number(message.toString());
          if (!isNaN(numValue)) {
            setSpeed(numValue);
          }
        }
      }
    });

    return () => {
      client.end();
    };
  }, []);
  
  // Just return the speed value
  return speed;
}