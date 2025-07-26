"use client";

import { useApp } from "@/contexts/AppContext";
import Link from "next/link";

const Footer = () => {
  const { isMockMode, toggleMockMode } = useApp();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Honor Purchaser. All Rights Reserved.</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Link href="/ranking" className="hover:text-primary">Ranking</Link>
          <Link href="/profile" className="hover:text-primary">Profile</Link>
          <Link href="/charge" className="hover:text-primary">Charge</Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 md:mt-0">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isMockMode} onChange={toggleMockMode} className="form-checkbox h-5 w-5 text-blue-600"/>
                    <span>Mock Mode</span>
                </label>
            </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
