"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, User } from "lucide-react";
import MobileSidebar from './mobile-sidebar';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="flex items-center p-4">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button variant="outline">
            Sign In
          </Button>
        )}
      </div>
    </div>
  )
}

export default Navbar;