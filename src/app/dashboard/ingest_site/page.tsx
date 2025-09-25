"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { generateRandomString, validateUrl } from "@/utils/roomUtils";
import { Loader2, ExternalLink, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProcessUrlResponse {
  success: boolean;
  message: string;
  url: string;
  timestamp: string;
  data?: {
    title: string;
    description: string;
    text: string;
    images: Array<unknown>;
    videos: Array<unknown>;
    audio: Array<unknown>;
    embeds: Array<unknown>;
    total_images: number;
    total_videos: number;
    total_audio: number;
    total_embeds: number;
    screenshot?: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false);
  const [scrapeType, setScrapeType] = useState("product");

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = event.target.value;
      setUrl(newUrl);
      if (newUrl.trim()) {
        setIsValidUrl(validateUrl(newUrl));
      } else {
        setIsValidUrl(false);
      }
      setMessage("");
      setIsSuccess(false);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!isValidUrl) {
      setMessage("Please enter a valid URL");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/url/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, scrapeType }),
      });

      const data: ProcessUrlResponse = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        if (data.data) {
          setMessage(
            `Content extracted successfully! Found ${data.data.total_images} images, ${data.data.total_videos} videos, ${data.data.total_audio} audio files, ${data.data.total_embeds} embeds`
          );
        } else {
          setMessage(data.message);
        }
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Failed to process URL");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [isValidUrl, url, scrapeType]);

  const clearInput = useCallback(() => {
    setUrl("");
    setMessage("");
    setIsValidUrl(false);
    setIsSuccess(false);
    setIsLoading(false);
  }, []);

  const handleTalkToAgent = useCallback(async () => {
    setIsJoiningMeeting(true);

    setTimeout(() => {
      const roomId = generateRandomString();
      router.push(`/agent_room/${roomId}?url=${encodeURIComponent(url)}`);
    }, 1000);
  }, [router, url]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && isValidUrl && !isLoading) {
        handleSubmit();
      }
    },
    [isValidUrl, isLoading, handleSubmit]
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800/95 border-gray-700/30 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-semibold text-white tracking-tight">
              Content Ingestion
            </CardTitle>
            <p className="text-center text-base font-normal text-gray-300 mb-8 tracking-tight">
              Extract and analyze content from any website URL
            </p>
          </CardHeader>
        <CardContent className="p-10">
          <div className="input-section flex flex-col gap-5">
            <div className="input-wrapper relative flex items-center">
              <Input
                type="text"
                value={url}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Enter a URL (e.g., https://example.com)"
                className={`py-4 px-4 pr-12 text-base bg-gray-900/80 text-gray-200 placeholder-gray-500 border-2 transition-all duration-300 ${
                  isValidUrl && url.trim()
                    ? "border-green-400 shadow-green-400/10 shadow-[0_0_0_3px_rgba(74,222,128,0.1)]"
                    : url.trim() && !isValidUrl
                    ? "border-red-400 shadow-red-400/10 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                    : "border-gray-600 focus:border-gray-500 focus:bg-gray-800/90 focus:shadow-[0_0_0_3px_rgba(102,102,102,0.1)]"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              />
              <div className="m-2">
                <Select
                  onValueChange={(value) => setScrapeType(value)}
                  defaultValue={scrapeType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                    <SelectContent position="popper">
                      <SelectItem value="product">product</SelectItem>
                      <SelectItem value="product_list">product_list</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </div>

              <div
                className={`input-indicator absolute right-4 text-lg font-bold transition-opacity duration-200 flex items-center justify-center w-5 h-5 ${
                  url.trim() && !isLoading
                    ? isValidUrl
                      ? "text-green-400 opacity-100"
                      : "text-red-400 opacity-100"
                    : "opacity-0"
                }`}
              >
                {url.trim() && !isLoading && (isValidUrl ? "✓" : "✗")}
                {isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>

            <div className="button-group flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!isValidUrl || isLoading}
                className="flex-1 py-3.5 px-6 text-base font-medium hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Submit URL
                  </>
                )}
              </Button>

              <Button
                onClick={clearInput}
                disabled={isLoading}
                variant="outline"
                className="py-3.5 px-6 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                size="lg"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>

          {message && (
            <div className="mt-5">
              <div
                className={`message p-4 rounded-xl text-center font-medium animate-fade-in ${
                  isSuccess
                    ? "bg-green-400/10 border border-green-400/30 text-green-400"
                    : "bg-red-400/10 border border-red-400/30 text-red-400"
                }`}
              >
                {message}
              </div>

              {isSuccess && (
                <Button
                  onClick={handleTalkToAgent}
                  disabled={isLoading || isJoiningMeeting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-green-400 to-cyan-400 mt-5 text-white font-semibold uppercase tracking-wider hover:from-green-500 hover:to-cyan-500 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(74,222,128,0.4)] disabled:bg-gray-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none relative overflow-hidden"
                  size="lg"
                >
                  {isJoiningMeeting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining Meeting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      🚀 Talk to Agent
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
