"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Code, ImageIcon, MessageSquare, Music, VideoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";  


const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/dashboard/conversation",
  },
 
  {
    label: "Code Generation",
    icon: Code,
    href: "/dashboard/code",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];


export default function DashboardPage() {

  const router = useRouter();
 
  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">Explore the power of AI</h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Chat with the smartest AI - Experience the power of AI.
        </p>
      </div>
      <div className="px-4 md:px-20 lg:px-32 space-y-4">
      {tools.map((tool) => (
  <Card 
    onClick={() => router.push(tool.href)}
    key={tool.href}
    className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
  >
    {/* Whole card is a flex row with justify-between */}
    <div className="flex items-center gap-x-4">
      <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
        <tool.icon className={cn("w-8 h-8", tool.color)} />
      </div>
      {/* Wrap label and arrow in a flex row */}
      <div className="flex items-center gap-x-2">
        <div className="font-semibold">{tool.label}</div>
        <ArrowRight className="w-5 h-5" />
      </div>
    </div>
  </Card>
))}

      </div>
     </div>
  );
}
