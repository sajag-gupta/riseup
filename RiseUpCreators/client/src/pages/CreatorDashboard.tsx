
import { useState } from "react";
import { useLocation } from "wouter";
import { CreatorDashboard as CreatorDashboardComponent } from "@/components/creators/CreatorDashboard";

export default function CreatorDashboard() {
  const [, setLocation] = useLocation();

  const handleClose = () => {
    setLocation("/");
  };

  return (
    <CreatorDashboardComponent isOpen={true} onClose={handleClose} />
  );
}
