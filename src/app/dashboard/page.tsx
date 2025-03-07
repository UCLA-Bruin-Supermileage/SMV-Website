import MinimalMqttSpeed from '@/components/mqtt/MQTTClient';
export default function DashBoard() {
    return (
        <div>
          Current Speed: <MinimalMqttSpeed /> MPH
        </div>
      );
  }