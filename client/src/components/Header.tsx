import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Subjects", path: "/subjects" },
    { label: "Exam Simulator", path: "/exam-simulator" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xl font-bold">B</span>
              </div>
              <span className="ml-2 text-xl font-heading font-bold text-primary-500">BacPrep</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    currentPath === item.path
                      ? "border-primary-500 text-primary-500"
                      : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center">
            {/* Notification icon */}
            <Button variant="ghost" size="icon" className="rounded-full text-neutral-400 hover:text-neutral-500">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Profile */}
            <div className="ml-3 relative">
              <Avatar className="h-8 w-8 bg-primary-100 text-primary-700">
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-xl font-bold">B</span>
                        </div>
                        <span className="ml-2 text-xl font-heading font-bold text-primary-500">BacPrep</span>
                      </div>
                    </SheetTitle>
                    <SheetDescription>
                      AI-powered Bacalaureat preparation
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col mt-6 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`${
                          currentPath === item.path
                            ? "bg-primary-50 border-primary-500 text-primary-500"
                            : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700"
                        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
