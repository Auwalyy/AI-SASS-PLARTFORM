"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useState } from "react";

export const UserAvatar = () => {
  const [user] = useState({
    name: "Guest User",
    image: "" // Leave empty for fallback
  });

  return (
    <Avatar className="h-8 w-8">
      {user.image ? (
        <AvatarImage src={user.image} alt="User Avatar" />
      ) : (
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};