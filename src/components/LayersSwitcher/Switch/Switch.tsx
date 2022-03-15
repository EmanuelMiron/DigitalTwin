// Import Dependencies
import React from "react";
import { getId, Toggle, Label } from "@fluentui/react";

// Import Styles
import "./Switch.scss";

// interfaces
interface LayerSwitchProps {
  name: string
  isVisible: boolean
  onSetVisibility(on: boolean): void
}

// Export Switch Component
export const Switch: React.FC<LayerSwitchProps> = ({ name, isVisible, onSetVisibility, children }) => {
  const handleChanged = (ev: any, checked?: boolean) => onSetVisibility(!!checked);
  const toggleId = getId('toggle');
  return (
    <div className="switch-container">
      <Label
        htmlFor={toggleId}
        className="switch-label"
      >
        {name}
      </Label>
      {children}
      <Toggle
        id={toggleId}
        checked={isVisible}
        onText=" " offText=" "
        onChange={handleChanged}
      />
    </div>
  );
};
