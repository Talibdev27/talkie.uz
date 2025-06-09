import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, Plus, Settings, ArrowLeft, Languages } from "lucide-react";
import { Link } from "wouter";
import type { Wedding, User } from "@shared/schema";

interface RestrictedAdminDashboardProps {
  user: User;
}

export function RestrictedAdminDashboard({ user }: RestrictedAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"weddings" | "create">("weddings");
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  // Fetch user's accessible weddings
  const { data: weddings = [], isLoading: weddingsLoading } = useQuery<Wedding[]>({
    queryKey: ['/api/guest-manager/weddings'],
  });

  const restrictedTabs = [
    {
      id: "weddings" as const,
      label: t('guestManager.weddingManagement'),
      icon: Calendar,
      description: t('guestManager.manageAssignedWeddings')
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
                <h1 className="text-2xl font-bold text-gray-900">{t('guestManager.weddingManagement')}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Languages className="h-4 w-4 text-gray-500" />
                <Select value={i18n.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="uz">O'zbekcha</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-gray-600">{t('guestManager.welcome')}, {user.name}</span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('guestManager.backToDashboard')}
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
              <h2 className="text-lg font-medium text-gray-900">{t('guestManager.assignedWeddings')}</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {weddings.length} {t('guestManager.wedding')}{weddings.length !== 1 ? '' : ''}
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
                          <p className="text-sm font-medium text-gray-700">{t('guestManager.venue')}</p>
                          <p className="text-sm text-gray-600">{wedding.venue}</p>
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <Button size="sm" asChild>
                            <Link href={`/manage/${wedding.uniqueUrl}`}>
                              <Users className="h-4 w-4 mr-2" />
                              {t('guestManager.manageGuests')}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('guestManager.noAssignedWeddings')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('guestManager.noAssignedWeddingsDesc')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('guestManager.contactAdmin')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}


      </div>


    </div>
  );
}