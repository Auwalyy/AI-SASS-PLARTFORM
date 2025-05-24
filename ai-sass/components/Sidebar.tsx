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

      {/* Conversation History Section */}
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Conversation History</h2>
          <Button 
            onClick={createNewConversation}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-xs text-zinc-400 px-3">No conversations yet</p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => router.push(`/conversation?id=${conversation.id}`)}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-white/10 transition",
                  pathname.includes(conversation.id) ? "bg-white/10" : ""
                )}
              >
                <div className="flex-1 truncate text-sm">
                  {conversation.title}
                </div>
                <button
                  onClick={(e) => deleteConversation(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;