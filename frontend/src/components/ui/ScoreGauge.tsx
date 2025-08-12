'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  rating: string;
  minScore?: number;
  maxScore?: number;
}

export default function ScoreGauge({ 
  score, 
  rating, 
  minScore = 0, 
  maxScore = 100 
}: ScoreGaugeProps) {
  // Calculate angle for the score (semicircle gauge)
  const normalizedScore = Math.max(minScore, Math.min(maxScore, score));
  const percentage = (normalizedScore - minScore) / (maxScore - minScore);
  const angle = percentage * 180; // 180 degrees for semicircle
  
  // Define color segments aligned with quintile system
  const getScoreColor = (currentScore: number) => {
    if (currentScore >= 80) return '#16a34a'; // Dark Green (Excellent)
    if (currentScore >= 60) return '#22c55e'; // Light Green (Good)
    if (currentScore >= 40) return '#eab308'; // Yellow (Average)
    if (currentScore >= 20) return '#f97316'; // Orange (Below Average)
    return '#dc2626'; // Red (Poor)
  };
  
  const scoreColor = getScoreColor(score);
  
  // SVG dimensions
  const size = 300;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Create path for background arc (semicircle)
  const startAngle = -90; // Start at top
  const endAngle = 90;    // End at bottom right
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  const createArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };
  
  // Background arc path
  const backgroundPath = createArcPath(center, center, radius, startAngle, endAngle);
  
  // Score arc path (partial arc based on score)
  const scoreEndAngle = startAngle + (angle);
  const scorePath = createArcPath(center, center, radius, startAngle, scoreEndAngle);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size * 0.6} className="transform">
          {/* Background arc */}
          <path
            d={backgroundPath}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Score arc */}
          <path
            d={scorePath}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Score indicator dot */}
          {angle > 0 && (
            <circle
              cx={polarToCartesian(center, center, radius, scoreEndAngle).x}
              cy={polarToCartesian(center, center, radius, scoreEndAngle).y}
              r={strokeWidth / 2}
              fill={scoreColor}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
        
        {/* Score text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {score}
          </div>
          <div className="text-md font-medium text-gray-600 uppercase tracking-wide">
            {rating}
          </div>
        </div>
      </div>
      
    </div>
  );
}