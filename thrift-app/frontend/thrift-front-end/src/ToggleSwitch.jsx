import { useState } from "react";

function ToggleSwitch() {
  const [enabled, setEnabled] = useState(false);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
        enabled ? "bg-orange-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default ToggleSwitch;
