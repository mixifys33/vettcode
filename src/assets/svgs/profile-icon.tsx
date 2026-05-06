import React from "react";
import { User } from "lucide-react"; // Profile icon

interface ProfileIconProps {
  size?: number;            // Icon size
  onClick?: () => void;     // Optional click handler
  className?: string;       // Additional Tailwind classes
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  size = 20,
  onClick,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <User size={size} color="#1f2937" /> {/* dark-gray icon */}
    </div>
  );
};

export default ProfileIcon;

