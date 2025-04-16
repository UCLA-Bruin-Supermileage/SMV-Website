import React from 'react';
import Image from "next/Image";
import renewAble from "../../public/renewableEnergySymbol.jpg"
// Custom Card components to replace shadcn/ui
const Card = ({ children, className, style, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg border shadow-sm ${className || ''}`} 
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={`p-6 ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

const MissionValuesChart = () => {
  const values = [
    {
      title: "Technical Excellence",
      description: "With an award winning chassis and data telemetry system, our team is dedicated to providing innovative technical knowledge and a context in which to apply it.",
      icon: renewAble, // Replace with actual image path
      color: "bg-blue-500"
    },
    {
      title: "Environmental Leadership",
      description: "We recognize the urgency of the global warming crisis, and we are dedicated to combatting this by evolving transportation through renewable energy sources.",
      icon: renewAble, // Replace with actual image path
      color: "bg-green-500"
    },
    {
      title: "Community Engagement",
      description: "We prioritize creating a welcoming environment for engineers to collaborate, share ideas, and apply concepts learned in classes in a practical setting.",
      icon: renewAble, // Replace with actual image path
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-center mb-6">Our Core Values</h2>
      
      <div className="flex flex-nowrap overflow-x-auto gap-4">
        {values.map((value, index) => (
          <Card key={index} className="flex-1 min-w-64 overflow-hidden border-t-4 shadow-lg" style={{ borderTopColor: value.color.replace('bg-', '') }}>
            <div className="p-3 flex justify-center">
              {/* <img 
                src={`/api/placeholder/60/60`} 
                alt={value.title} 
                className="h-12 w-12 object-contain"
              /> */}
              <Image
              src = {value.icon}
              alt = "Little Symbol"
              className= "h-12 w-12 object-contain"
              />
            </div>
            <CardContent className="px-3 pb-4 pt-0">
              <h3 className="text-lg font-bold mb-1 text-center">{value.title}</h3>
              <p className="text-gray-700 text-xs">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 flex justify-center">
        <div className="flex flex-wrap items-center gap-2 justify-center text-xs">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium mr-3">Technical</span>
          
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium mr-3">Environmental</span>
          
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="font-medium">Community</span>
        </div>
      </div>
    </div>
  );
};

export default MissionValuesChart;