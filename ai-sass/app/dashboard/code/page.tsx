"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heading } from "@/components/Heading";
import { CodeIcon, Loader2, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

const Code = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('code-conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  // Create new conversation if none exists
  useEffect(() => {
    if (conversations.length === 0 && !currentConversation) {
      const newConversation = createNewConversation();
      setCurrentConversation(newConversation);
    }
  }, [conversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  const createNewConversation = (): Conversation => {
    const newConversation = {
      id: Date.now().toString(),
      title: "New Code Session",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return newConversation;
  };

  const saveConversation = (conversation: Conversation) => {
    const updatedConversations = [
      conversation,
      ...conversations.filter(c => c.id !== conversation.id)
    ].slice(0, 20); // Keep only last 20 conversations
    
    setConversations(updatedConversations);
    localStorage.setItem('code-conversations', JSON.stringify(updatedConversations));
  };

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    localStorage.setItem('code-conversations', JSON.stringify(updatedConversations));
    
    if (currentConversation?.id === id) {
      const newConversation = createNewConversation();
      setCurrentConversation(newConversation);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create new conversation if none exists
      let conversation = currentConversation || createNewConversation();
      
      const userMessage: ChatMessage = {
        role: "user",
        content: values.prompt,
        timestamp: Date.now()
      };

      // Update conversation title if it's the first message
      if (conversation.messages.length === 0) {
        conversation.title = values.prompt.slice(0, 50);
      }

      // Add user message
      conversation.messages.push(userMessage);
      conversation.updatedAt = Date.now();
      
      setCurrentConversation({...conversation});
      saveConversation(conversation);

      const response = await axios.post(
        "/api/code",
        {
          contents: [
            {
              role: "user",
              parts: [{ text: values.prompt }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.candidates[0].content.parts[0].text,
        timestamp: Date.now()
      };

      // Add assistant message
      conversation.messages.push(assistantMessage);
      conversation.updatedAt = Date.now();
      
      setCurrentConversation({...conversation});
      saveConversation(conversation);
      form.reset();

    } catch (error: any) {
      let errorMessage = "Failed to get response";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response) {
        errorMessage = `Error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with toggle button */}
      <div 
        className={`transition-all duration-300 ease-in-out ${isHistoryOpen ? 'w-64' : 'w-0'} border-r bg-gray-50 overflow-y-auto relative`}
      >
        <div className="p-4">
          <h2 className="font-bold text-lg mb-4">Code History</h2>
          <Button 
            onClick={() => {
              const newConversation = createNewConversation();
              setCurrentConversation(newConversation);
            }}
            className="w-full mb-4"
          >
            New Session
          </Button>
          <div className="space-y-1">
            {conversations.map(conversation => (
              <div 
                key={conversation.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-200 ${
                  currentConversation?.id === conversation.id ? 'bg-gray-300' : ''
                }`}
                onClick={() => setCurrentConversation(conversation)}
              >
                <div className="truncate flex-1">
                  {conversation.title}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        
        
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 lg:px-8">
          <Heading
            title="Code Generation"
            description="Execute Code using Genius AI"
            icon={CodeIcon}
            iconColor="text-green-500"
            bgColor="bg-green-500/10"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4 mt-4 pb-4">
            {currentConversation?.messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Your generated code will appear here
              </div>
            ) : (
              currentConversation?.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 p-4 rounded-lg ${
                    message.role === "user" 
                      ? "bg-gray-50 border border-gray-200" 
                      : "bg-violet-50 border border-violet-200"
                  }`}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold">
                        {message.role === "user" ? "You" : "Genius AI"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="mt-1">
                      {message.role === "assistant" ? (
                        <>
                          <SyntaxHighlighter
                            language="javascript"
                            style={oneDark}
                            className="rounded-md text-sm"
                            showLineNumbers
                          >
                            {message.content}
                          </SyntaxHighlighter>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="mt-2"
                          >
                            Copy Code
                          </Button>
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 lg:px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg w-full p-4 border px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        {...field}
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="e.g. Create a React toggle button component"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Code;