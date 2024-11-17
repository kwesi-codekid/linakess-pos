/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

const WelcomeCard = ({ user }: { user: any }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Update the current date and time every second
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Determine the appropriate greeting based on the current time of day
    const hour = currentDateTime.getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    return () => clearInterval(interval);
  }, [currentDateTime]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-700 p-6">
      <div className="text-white">
        <h1 className="text-4xl font-sen font-semibold">{`${greeting}, ${user.username}`}</h1>
        <p className="mt-2 font-quicksand text-sm flex items-center gap-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
            />
          </svg>
          {currentDateTime.toLocaleDateString("en-GB")}
        </p>
        <p className="font-quicksand text-sm flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          {currentDateTime.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default WelcomeCard;
