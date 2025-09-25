"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Video,
  Edit3,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { generateRandomString } from "@/utils/roomUtils";

interface ScrapedContentDetail {
  id: string;
  url: string;
  name: string;
  mainImage?: string;
  description: string;
  price?: string;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
  }>;
  videos: Array<{
    id: string;
    url: string;
  }>;
}

export default function ContentEdit() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;

  const [content, setContent] = useState<ScrapedContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    mainImage: string;
    images: Array<{ id: string; url: string }>;
    videos: Array<{ id: string; url: string }>;
  }>({
    name: "",
    description: "",
    price: "",
    mainImage: "",
    images: [],
    videos: [],
  });

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/${contentId}`);
      const data = await response.json();

      if (data.success) {
        setContent(data.data);
        setFormData({
          name: data.data.name || "",
          description: data.data.description || "",
          price: data.data.price || "",
          mainImage: data.data.mainImage || "",
          images: data.data.images || [],
          videos: data.data.videos || [],
        });
      } else {
        toast.error("Content not found");
        router.push("/dashboard/content");
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
      router.push("/dashboard/content");
    } finally {
      setLoading(false);
    }
  }, [contentId, router]);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId, fetchContent]);

  const handleInputChange = (field: string, value: string, index?: number) => {
    if (field === "images" && index !== undefined) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img, i) =>
          i === index ? { ...img, url: value } : img
        ),
      }));
    } else if (field === "videos" && index !== undefined) {
      setFormData((prev) => ({
        ...prev,
        videos: prev.videos.map((vid, i) =>
          i === index ? { ...vid, url: value } : vid
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { id: `temp-${Date.now()}`, url: "" }],
    }));
  };

  const addVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videos: [...prev.videos, { id: `temp-${Date.now()}`, url: "" }],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/content/${contentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Content updated successfully");
        setContent(data.data);
      } else {
        toast.error("Failed to update content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this content? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/content/${contentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Content deleted successfully");
        router.push("/dashboard/content");
      } else {
        toast.error("Failed to delete content");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleTalkToAgent = useCallback(async () => {
    if (!content?.url || content.url === "") {
      toast.error("Content URL not found");
      return;
    }
    setTimeout(() => {
      const roomId = generateRandomString();
      router.push(
        `/agent_room/${roomId}?url=${content?.url}`
      );
    }, 1000);
  }, [router, content?.url]);
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading content..." variant="card" />
        </div>
      </DashboardLayout>
    );
  }

  if (!content) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">Content not found</div>
          <Button
            onClick={() => router.push("/dashboard/content")}
            className="bg-gradient-to-r from-green-400 to-cyan-400 text-white"
          >
            Back to Content
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/content")}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Content</h1>
              <p className="text-gray-300 mt-1">
                Modify and manage your scraped content
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.open(content.url, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="font-semibold"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleTalkToAgent}
            >
              <Bot className="w-4 h-4 mr-2" />
              Talk to Agent
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/95 border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Edit3 className="w-5 h-5 mr-2 text-green-400" />
                  Content Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-gray-300">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Enter price (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="mainImage" className="text-gray-300">
                    Main Image URL
                  </Label>
                  <Input
                    id="mainImage"
                    type="url"
                    value={formData.mainImage}
                    onChange={(e) =>
                      handleInputChange("mainImage", e.target.value)
                    }
                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Enter main image URL (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={6}
                    className="mt-1 w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400"
                    placeholder="Enter product description"
                  />
                </div>
              </CardContent>
            </Card>

           
              <Card className="bg-gray-800/95 border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-green-400" />
                    Images ({content.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formData.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="flex items-center space-x-2"
                      >
                        <Input
                          type="url"
                          value={image.url}
                          onChange={(e) =>
                            handleInputChange("images", e.target.value, index)
                          }
                          className="flex-1 bg-gray-700/50 border-gray-600 text-white"
                          placeholder="Enter image URL"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        {image.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(image.url, "_blank")}
                            className="bg-gray-600/50 border-gray-500 text-gray-300 hover:bg-gray-500/50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addImage}
                      className="bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30"
                    >
                      <ImageIcon className="w-3 h-3 mr-2" />
                      Add Image
                    </Button>
                  </div>
                </CardContent>
              </Card>

            <Card className="bg-gray-800/95 border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Video className="w-5 h-5 mr-2 text-purple-400" />
                  Add Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.videos.map((video, index) => (
                    <div key={video.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="url"
                          value={video.url}
                          onChange={(e) =>
                            handleInputChange("videos", e.target.value, index)
                          }
                          className="flex-1 bg-gray-700/50 border-gray-600 text-white"
                          placeholder="Enter video URL"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVideo(index)}
                          className="bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        {video.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(video.url, "_blank")}
                            className="bg-gray-600/50 border-gray-500 text-gray-300 hover:bg-gray-500/50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addVideo}
                    className="bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30"
                  >
                    <Video className="w-3 h-3 mr-2" />
                    Add Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800/95 border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white">Content Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-400 text-sm">Original URL</Label>
                  <div className="mt-1 p-2 bg-gray-700/50 rounded border text-gray-300 text-sm break-all">
                    {content.url}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-gray-400 text-sm">Created</Label>
                  <div className="flex items-center space-x-1 text-gray-300 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(content.createdAt)}</span>
                  </div>
                </div>

                {content.updatedAt !== content.createdAt && (
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-400 text-sm">
                      Last Updated
                    </Label>
                    <div className="flex items-center space-x-1 text-gray-300 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(content.updatedAt)}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {content.images.length}
                      </div>
                      <div className="text-xs text-gray-400">Images</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {content.videos.length}
                      </div>
                      <div className="text-xs text-gray-400">Videos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {formData.mainImage && (
              <Card className="bg-gray-800/95 border-gray-700/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm">
                    Main Image Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden relative">
                    {formData.mainImage && formData.mainImage.startsWith('http') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.mainImage}
                        alt="Main image preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', formData.mainImage);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
