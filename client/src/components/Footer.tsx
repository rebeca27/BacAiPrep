import { Link } from "wouter";
import { HelpCircle, Settings, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2 space-x-6">
            <Link href="#" className="text-neutral-400 hover:text-neutral-500">
              <span className="sr-only">Help Center</span>
              <HelpCircle className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-neutral-400 hover:text-neutral-500">
              <span className="sr-only">Settings</span>
              <Settings className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-neutral-400 hover:text-neutral-500">
              <span className="sr-only">Feedback</span>
              <MessageSquare className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} BacPrep. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
