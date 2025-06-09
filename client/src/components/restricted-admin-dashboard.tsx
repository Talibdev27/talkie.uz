import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Plus, Settings, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Wedding, User } from "@shared/schema";

interface RestrictedAdminDashboardProps {
  user: User;
}

export function RestrictedAdminDashboard({ user }: RestrictedAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"weddings" | "create">("weddings");

  // Fetch user's accessible weddings
  const { data: weddings = [], isLoading: weddingsLoading } = useQuery<Wedding[]>({
    queryKey: ['/api/guest-manager/weddings'],
  });

  const restrictedTabs = [
    {
      id: "weddings" as const,
      label: "Wedding Management",
      icon: Calendar,
      description: "Manage assigned weddings and guest lists"
    },
    {
      id: "create" as const,
      label: "Create Wedding",
      icon: Plus,
      description: "Create new wedding events"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wedding Management</h1>
                <p className="text-sm text-gray-600">
                  Restricted Access - Guest Management Only
                </p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Guest Manager
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8">
            {restrictedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "weddings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Assigned Weddings</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {weddings.length} Wedding{weddings.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {weddingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : weddings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weddings.map((wedding) => (
                  <Card key={wedding.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {wedding.bride} & {wedding.groom}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(wedding.weddingDate).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Venue</p>
                          <p className="text-sm text-gray-600">{wedding.venue}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Guest Management Only
                          </Badge>
                          <Button size="sm" asChild>
                            <Link href={`/manage/${wedding.uniqueUrl}`}>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Guests
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Weddings</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't been assigned to manage any weddings yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Contact your administrator to get access to wedding guest management.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Create New Wedding</h2>
              <p className="text-sm text-gray-600">
                Create a new wedding event. You'll have guest management access once created.
              </p>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Wedding Creation</h3>
                <p className="text-gray-600 mb-4">
                  Create a new wedding and automatically get guest management access.
                </p>
                <Button asChild>
                  <Link href="/create-wedding">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Wedding
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Restricted Access Mode - Guest Management Only</span>
            </div>
            <div>
              <Badge variant="outline" className="text-xs">
                Role: Guest Manager
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}