"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { 
  Code, 
  ImageIcon, 
  LayoutDashboard, 
  MessageSquare, 
  Music, 
  Settings, 
  VideoIcon,
  Plus,
  Trash2
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

type Conversation = {
  id: string;
  title: string;
  messages: {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }[];
  createdAt: number;
  updatedAt: number;
};

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
  },

 
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  const createNewConversation = async () => {
    setIsLoading(true);
    try {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: "New Conversation",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
      
      router.push(`/conversation?id=${newConversation.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    // If we're currently viewing the deleted conversation, redirect
    if (pathname.includes(id)) {
      router.push('/conversation');
    }
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <Image fill alt="logo" src="/next.svg" />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            Genius
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link 
              key={route.href} 
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default Sidebar;