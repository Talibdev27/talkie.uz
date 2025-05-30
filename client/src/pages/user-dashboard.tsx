import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Users, Eye, Settings, Plus } from 'lucide-react';
import type { Wedding } from '@shared/schema';

export default function UserDashboard() {
  const { t } = useTranslation();
  
  // Get current user ID from localStorage or session
  const currentUserId = parseInt(localStorage.getItem('currentUserId') || '1');
  
  const { data: weddings = [], isLoading } = useQuery<Wedding[]>({
    queryKey: ['/api/weddings/user', currentUserId],
    queryFn: () => fetch(`/api/weddings/user/${currentUserId}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-soft-white to-sage-green/10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-white to-sage-green/10 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold text-charcoal mb-4">
            {t('dashboard.myWeddings')}
          </h1>
          <p className="text-lg text-charcoal/70 mb-8">
            {t('dashboard.manageYourWeddings')}
          </p>
          
          <Link href="/get-started">
            <Button className="wedding-button text-lg px-8 py-3">
              <Plus className="w-5 h-5 mr-2" />
              {t('dashboard.createNewWedding')}
            </Button>
          </Link>
        </div>

        {/* Weddings Grid */}
        {weddings.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <Calendar className="w-24 h-24 text-romantic-gold mx-auto mb-6" />
              <h2 className="text-2xl font-playfair font-semibold text-charcoal mb-4">
                {t('dashboard.noWeddingsYet')}
              </h2>
              <p className="text-charcoal/70 mb-8 max-w-md mx-auto">
                {t('dashboard.startCreating')}
              </p>
              <Link href="/get-started">
                <Button className="wedding-button">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.createFirstWedding')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((wedding) => (
              <Card key={wedding.id} className="wedding-card hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-playfair font-semibold text-charcoal group-hover:text-romantic-gold transition-colors">
                      {wedding.bride} & {wedding.groom}
                    </CardTitle>
                    <Badge variant={wedding.isPublic ? "default" : "secondary"}>
                      {wedding.isPublic ? t('dashboard.public') : t('dashboard.private')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-charcoal/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-romantic-gold" />
                      <span>{formatDate(wedding.weddingDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-romantic-gold" />
                      <span className="truncate">{wedding.venue}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Link href={`/wedding/${wedding.uniqueUrl}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          {t('dashboard.viewSite')}
                        </Button>
                      </Link>
                      <Link href={`/manage/${wedding.uniqueUrl}`} className="flex-1">
                        <Button size="sm" className="wedding-button w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          {t('dashboard.manage')}
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-charcoal/60">
                        <span>{t('dashboard.created')}: {formatDate(wedding.createdAt)}</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>0 {t('dashboard.guests')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {weddings.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="wedding-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-romantic-gold mb-2">
                  {weddings.length}
                </div>
                <div className="text-charcoal/70">
                  {t('dashboard.totalWeddings')}
                </div>
              </CardContent>
            </Card>
            
            <Card className="wedding-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-sage-green mb-2">
                  {weddings.filter(w => w.isPublic).length}
                </div>
                <div className="text-charcoal/70">
                  {t('dashboard.publicWeddings')}
                </div>
              </CardContent>
            </Card>
            
            <Card className="wedding-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-charcoal mb-2">
                  {weddings.filter(w => new Date(w.weddingDate) > new Date()).length}
                </div>
                <div className="text-charcoal/70">
                  {t('dashboard.upcomingWeddings')}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}