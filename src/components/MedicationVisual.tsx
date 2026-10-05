import React from 'react';
import { MedicationForm } from '../types/medication';
import { 
  Pill, 
  FlaskConical, 
  Syringe, 
  Droplet, 
  Wind, 
  Square, 
  Sparkles,
  CircleDot
} from 'lucide-react';

interface MedicationVisualProps {
  form: MedicationForm;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MedicationVisual: React.FC<MedicationVisualProps> = ({
  form,
  color = '#0d9488',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  const renderIcon = () => {
    switch (form) {
      case 'tablet':
        return <CircleDot className={iconSizes} />;
      case 'capsule':
        return <Pill className={iconSizes} />;
      case 'liquid':
        return <FlaskConical className={iconSizes} />;
      case 'injection':
        return <Syringe className={iconSizes} />;
      case 'drops':
        return <Droplet className={iconSizes} />;
      case 'inhaler':
        return <Wind className={iconSizes} />;
      case 'patch':
        return <Square className={iconSizes} />;
      case 'spray':
        return <Sparkles className={iconSizes} />;
      default:
        return <Pill className={iconSizes} />;
    }
  };

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-medium shrink-0 transition-transform ${sizeClasses} ${className}`}
      style={{
        backgroundColor: `${color}18`, // 10% opacity background
        color: color,
        border: `1.5px solid ${color}40`,
      }}
    >
      {renderIcon()}
    </div>
  );
};
