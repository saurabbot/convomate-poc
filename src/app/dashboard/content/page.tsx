'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Search, 
  ExternalLink, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  DollarSign,
  Eye,
  Edit,
} from 'lucide-react';

interface ScrapedContent {
  id: string;
  url: string;
  name: string;
  mainImage?: string;
  description: string;
  price?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    images: number;
    videos: number;
  };
}

interface ContentResponse {
  success: boolean;
  data: ScrapedContent[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function Content() {
  const router = useRouter();
  const [content, setContent] = useState<ScrapedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<ContentResponse['pagination'] | null>(null);

  const fetchContent = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search })
      });

      const response = await fetch(`/api/content?${params}`);
      const data: ContentResponse = await response.json();

      if (data.success) {
        setContent(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTileClick = (contentId: string) => {
    router.push(`/dashboard/content/${contentId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && content.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading content..." variant="card" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Content Library</h1>
            <p className="text-gray-300 mt-1">
              Manage all your scraped content in one place
            </p>
          </div>
          
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {pagination && (
          <div className="text-sm text-gray-400">
            Showing {content.length} of {pagination.totalCount} results
          </div>
        )}

        {content.length === 0 ? (
          <Card className="bg-gray-800/95 border-gray-700/30">
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No content found</div>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Start by ingesting your first website'}
              </p>
              <Button
                onClick={() => router.push('/dashboard/ingest_site')}
                className="bg-gradient-to-r from-green-400 to-cyan-400 text-white font-semibold hover:from-green-500 hover:to-cyan-500"
              >
                Ingest Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {content.map((item) => (
              <Card 
                key={item.id}
                className="bg-gray-800/95 border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-cyan-400/10"
                onClick={() => handleTileClick(item.id)}
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-gray-700 rounded-t-lg overflow-hidden">
                    {item.mainImage ? (
                      <img
                        src={item.mainImage}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex space-x-1">
                      <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-white">{item._count.images}</span>
                      </div>
                      {item._count.videos > 0 && (
                        <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                          <Video className="w-3 h-3 text-purple-400" />
                          <span className="text-xs text-white">{item._count.videos}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {truncateText(item.description, 100)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      {item.price && (
                        <div className="flex items-center space-x-1 text-green-400">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">{item.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-xs truncate max-w-[120px]">
                          {new URL(item.url).hostname}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-700/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, '_blank');
                          }}
                        >
                          <Eye className="w-3 h-3 text-gray-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-700/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTileClick(item.id);
                          }}
                        >
                          <Edit className="w-3 h-3 text-green-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={isActive 
                      ? "bg-gradient-to-r from-green-400 to-cyan-400 text-white" 
                      : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}