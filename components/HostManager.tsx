import React from 'react';
import { Host } from '../types';
import UserIcon from './icons/UserIcon';

interface HostManagerProps {
  hosts: Host[];
}

// NOTE: In a real app, the backend URL should come from an environment variable.
const API_BASE_URL = 'http://localhost:3001';

const HostManager: React.FC<HostManagerProps> = ({ hosts }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Host Calendars</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Each host must connect their Google Calendar to make their availability visible for booking.
      </p>

      <ul className="space-y-3">
        {hosts.map((host) => (
          <li key={host.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-slate-200 p-2 rounded-full mr-3">
                <UserIcon />
              </div>
              <div>
                  <p className="text-sm font-medium text-gray-900">{host.name}</p>
                  <p className="text-xs text-gray-500">{host.email}</p>
              </div>
            </div>
            {host.connected ? (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                </span>
            ) : (
                <a
                    href={`${API_BASE_URL}/auth/google?hostId=${host.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Connect Calendar
                </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HostManager;
