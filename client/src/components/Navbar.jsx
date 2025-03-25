import React from "react";
import { Bell, Settings, User } from "lucide-react";

function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-blue-400">
              Drone Command System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-200">
              <Bell className="h-6 w-6" />
            </button>
            <button className="text-gray-400 hover:text-gray-200">
              <Settings className="h-6 w-6" />
            </button>
            <button className="flex items-center text-gray-400 hover:text-gray-200">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
