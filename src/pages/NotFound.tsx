
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="animation-panel rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gray-100 p-4">
            <FileQuestion className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-6">
          We couldn't find the page you're looking for
        </p>
        
        <div className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-md">
          <p>Path: <code>{location.pathname}</code></p>
        </div>
        
        <Button asChild className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
