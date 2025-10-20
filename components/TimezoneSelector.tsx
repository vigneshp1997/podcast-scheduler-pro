import React from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface TimezoneSelectorProps {
  timezone: string;
  setTimezone: (timezone: string) => void;
}

// A curated list of common IANA timezones
const timezones: { [key: string]: string } = {
  "Etc/GMT+12": "International Date Line West (GMT-12:00)",
  "Pacific/Midway": "Midway Island, Samoa (GMT-11:00)",
  "Pacific/Honolulu": "Hawaii (GMT-10:00)",
  "America/Anchorage": "Alaska (GMT-09:00)",
  "America/Los_Angeles": "Pacific Time (US & Canada) (GMT-08:00)",
  "America/Denver": "Mountain Time (US & Canada) (GMT-07:00)",
  "America/Chicago": "Central Time (US & Canada) (GMT-06:00)",
  "America/New_York": "Eastern Time (US & Canada) (GMT-05:00)",
  "America/Halifax": "Atlantic Time (Canada) (GMT-04:00)",
  "America/Sao_Paulo": "Brasilia (GMT-03:00)",
  "Atlantic/South_Georgia": "South Georgia (GMT-02:00)",
  "Atlantic/Azores": "Azores (GMT-01:00)",
  "Europe/London": "London, Dublin, Lisbon (GMT+00:00)",
  "Europe/Paris": "Paris, Madrid, Amsterdam (GMT+01:00)",
  "Europe/Helsinki": "Helsinki, Kyiv, Riga, Sofia (GMT+02:00)",
  "Asia/Baghdad": "Baghdad, Kuwait, Riyadh (GMT+03:00)",
  "Asia/Dubai": "Abu Dhabi, Muscat (GMT+04:00)",
  "Asia/Karachi": "Karachi, Tashkent (GMT+05:00)",
  "Asia/Dhaka": "Astana, Dhaka (GMT+06:00)",
  "Asia/Bangkok": "Bangkok, Hanoi, Jakarta (GMT+07:00)",
  "Asia/Singapore": "Singapore, Hong Kong, Beijing (GMT+08:00)",
  "Asia/Tokyo": "Tokyo, Seoul, Osaka (GMT+09:00)",
  "Australia/Sydney": "Sydney, Canberra (GMT+10:00)",
  "Pacific/Auckland": "Auckland, Wellington (GMT+12:00)",
};


const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ timezone, setTimezone }) => {
  return (
    <div>
        <label htmlFor="timezone-select" className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
        </label>
        <div className="relative mt-1">
            <select
                id="timezone-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
                {Object.entries(timezones).map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDownIcon />
            </div>
        </div>
    </div>
  );
};

export default TimezoneSelector;