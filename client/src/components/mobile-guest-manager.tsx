import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, Search, Edit, Trash2, Mail, Phone,
  CheckCircle, XCircle, Clock, UserPlus, MessageSquare
} from 'lucide-react';
import { AddGuestDialog } from '@/components/add-guest-dialog';
import type { Guest } from '@shared/schema';

interface MobileGuestManagerProps {
  weddingId: number;
  weddingTitle?: string;
  className?: string;
}

export function MobileGuestManager({ weddingId, weddingTitle = "Wedding", className = '' }: MobileGuestManagerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch guests
  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: [`/api/guests/wedding/${weddingId}`],
    enabled: !!weddingId,
  });

  // Update guest status mutation
  const updateGuestMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Guest['rsvpStatus'] }) => 
      apiRequest('PATCH', `/api/guests/${id}`, { 
        rsvpStatus: status,
        respondedAt: new Date(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guests/wedding/${weddingId}`] });
      toast({
        title: t('guestList.guestUpdated'),
        description: t('guestList.guestUpdatedSuccess'),
      });
    },
  });

  // Delete guest mutation
  const deleteGuestMutation = useMutation({
    mutationFn: (guestId: number) => apiRequest('DELETE', `/api/guests/${guestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guests/wedding/${weddingId}`] });
      toast({
        title: t('guestList.guestDeleted'),
        description: t('guestList.guestDeletedSuccess'),
      });
    },
  });

  const handleStatusUpdate = (guestId: number, status: Guest['rsvpStatus']) => {
    updateGuestMutation.mutate({ id: guestId, status });
  };

  // Filter guests
  const filteredGuests = guests.filter((guest: Guest) => {
    if (!guest || !guest.name) return false; // Safety check
    
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.phone?.includes(searchTerm) ||
                         guest.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guest.rsvpStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: guests.length,
    confirmed: guests.filter((g: Guest) => g.rsvpStatus === 'confirmed').length,
    declined: guests.filter((g: Guest) => g.rsvpStatus === 'declined').length,
    pending: guests.filter((g: Guest) => g.rsvpStatus === 'pending').length,
    maybe: guests.filter((g: Guest) => g.rsvpStatus === 'maybe').length,
    withComments: guests.filter((g: Guest) => g.message && g.message.trim()).length,
  };

  const getStatusBadge = (status: Guest['rsvpStatus']) => {
    const statusConfig = {
      confirmed: { 
        variant: 'default' as const, 
        label: t('guestList.confirmed'),
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      declined: { 
        variant: 'destructive' as const, 
        label: t('guestList.declined'),
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      pending: { 
        variant: 'secondary' as const, 
        label: t('guestList.pending'),
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      maybe: { 
        variant: 'outline' as const, 
        label: t('guestList.maybe'),
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
    };

    const config = statusConfig[status] || statusConfig.pending; // Fallback to pending if status is invalid
    return (
      <Badge 
        variant={config.variant}
        className={`text-xs font-semibold px-3 py-1 rounded-full ${config.className}`}
      >
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: Guest['rsvpStatus']) => {
    const icons = {
      confirmed: <CheckCircle className="h-4 w-4 text-green-500" />,
      declined: <XCircle className="h-4 w-4 text-red-500" />,
      pending: <Clock className="h-4 w-4 text-yellow-500" />,
      maybe: <Clock className="h-4 w-4 text-blue-500" />,
    };

    return icons[status] || icons.pending; // Fallback to pending icon if status is invalid
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const responseRate = stats.total > 0 ? Math.round(((stats.confirmed + stats.declined + stats.maybe) / stats.total) * 100) : 0;

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Mobile-First Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{weddingTitle}</h1>
                        <p className="text-sm text-gray-600">{t('manage.guestManagement')}</p>
      </div>

      {/* Mobile-First Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 active:scale-98">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{stats.confirmed}</div>
          <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide font-medium">{t('guestList.confirmed')}</div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 active:scale-98">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide font-medium">{t('guestList.pending')}</div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 active:scale-98">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{stats.maybe}</div>
          <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide font-medium">{t('guestList.maybe')}</div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 active:scale-98">
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">{stats.declined}</div>
          <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide font-medium">{t('guestList.declined')}</div>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 active:scale-98 col-span-2 sm:col-span-1">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">{stats.withComments}</div>
          <div className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide font-medium flex items-center justify-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {t('guestList.comments') || 'Comments'}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-900">{t('guestList.responseRate')}</span>
          <span className="text-green-600 font-bold">{responseRate}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${responseRate}%` }}
          ></div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {stats.confirmed + stats.declined + stats.maybe} out of {stats.total} guests responded
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('guestList.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-5 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          
          {/* Filter Tabs - Mobile Scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { key: 'all', label: 'All' },
              { key: 'confirmed', label: t('guestList.confirmed') },
              { key: 'pending', label: t('guestList.pending') },
              { key: 'maybe', label: t('guestList.maybe') },
              { key: 'declined', label: t('guestList.declined') }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest List */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('guestList.noGuests')}</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No guests have been added yet'
                }
              </p>
            </div>
          ) : (
            filteredGuests.map((guest: Guest) => (
              <div key={guest.id} className="border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                {/* Main Guest Info Row */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(guest.rsvpStatus)}
                      <h4 className="font-semibold text-gray-900 truncate">{guest.name}</h4>
                      {guest.message && (
                        <MessageSquare className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {guest.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                      {guest.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{guest.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(guest.rsvpStatus)}
                    <div className="flex gap-1">
                      {/* Quick Status Update Buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(guest.id, 'confirmed')}
                          disabled={guest.rsvpStatus === 'confirmed'}
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                          title="Mark as confirmed"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(guest.id, 'declined')}
                          disabled={guest.rsvpStatus === 'declined'}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          title="Mark as declined"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteGuestMutation.mutate(guest.id)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                        title="Delete guest"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Guest Message - Separate Row */}
                {guest.message && (
                  <div className="px-4 pb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">Message:</p>
                          <p className="text-sm text-blue-800 leading-relaxed break-words">
                            {guest.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AddGuestDialog weddingId={weddingId} />
      </div>
    </div>
  );
} 