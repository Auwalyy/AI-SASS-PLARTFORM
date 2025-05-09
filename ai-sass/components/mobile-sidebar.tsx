"use client"

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";

const MobileSidebar = () => {

  const [isMounted, setIsMounted] = useState(false); 
  useEffect(()=>{
    setIsMounted(true)
  },[])
  if (!isMounted) {
    return null; // Render nothing on the server side
  }


  return (
    <Sheet>
      <SheetTrigger>
      <Button variant="ghost" size="icon" className="md:hidden">
       <Menu />
       </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar