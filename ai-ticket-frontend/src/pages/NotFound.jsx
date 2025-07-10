import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="card-body text-center">
          <h1 className="text-5xl font-bold">404</h1>
          <p className="mt-4">Sorry, the page you are looking for does not exist.</p>
          <div className="card-actions justify-center mt-6">
            <Link to="/" className="btn btn-primary">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
