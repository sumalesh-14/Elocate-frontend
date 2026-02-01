"use client";
import React from "react";
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaGithub, 
  FaGoogle, 
  FaLeaf, 
  FaUserPlus, 
  FaArrowRight,
  FaUser,
  FaPhone
} from "react-icons/fa";

// Icon mapping for backward compatibility
const iconMap: { [key: string]: React.ComponentType<any> } = {
  mailOutline: FaEnvelope,
  lockClosedOutline: FaLock,
  eyeOutline: FaEye,
  eyeOffOutline: FaEyeSlash,
  logoGithub: FaGithub,
  logoGoogle: FaGoogle,
  leafOutline: FaLeaf,
  personAddOutline: FaUserPlus,
  arrowForwardOutline: FaArrowRight,
  personOutline: FaUser,
  callOutline: FaPhone,
};

const ClientIonIcon = ({ icon, className, ...props }: any) => {
  // If icon is a string (icon name), map it to React Icon
  if (typeof icon === 'string') {
    const IconComponent = iconMap[icon] || FaLeaf;
    return <IconComponent className={className} {...props} />;
  }
  
  // If icon is already a component, render it
  const IconComponent = icon || FaLeaf;
  return <IconComponent className={className} {...props} />;
};

export default ClientIonIcon;
