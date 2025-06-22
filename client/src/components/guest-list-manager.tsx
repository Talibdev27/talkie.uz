import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, Search, Edit, Trash2, Mail, Phone,
  CheckCircle, XCircle, Clock, UserPlus
} from 'lucide-react';
import { insertGuestSchema, type Guest, type InsertGuest } from '@shared/schema';
import { z } from 'zod';

interface GuestListManagerProps {
  weddingId: number;
  className?: string;
}

const guestSchema = insertGuestSchema.omit({ weddingId: true });
type GuestFormData = z.infer<typeof guestSchema>;

export function GuestListManager({ weddingId, className = '' }: GuestListManagerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      plusOne: false,
      plusOneName: '',
      additionalGuests: 0,
      category: 'family',
      side: 'both',
      dietaryRestrictions: '',
      address: '',
      notes: '',
    },
  });

  // Fetch guests using the correct endpoint
  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ['/api/guests/wedding', weddingId],
    enabled: !!weddingId,
  });

  // Add guest mutation
  const addGuestMutation = useMutation({
    mutationFn: (data: GuestFormData) => {
      const guestData: InsertGuest = {
        name: data.name,
        weddingId,
        email: data.email || null,
        phone: data.phone || null,
        rsvpStatus: data.rsvpStatus,
        plusOne: data.plusOne,
        plusOneName: data.plusOneName || null,
        additionalGuests: data.additionalGuests,
        category: data.category,
        side: data.side,
        dietaryRestrictions: data.dietaryRestrictions || null,
        address: data.address || null,
        notes: data.notes || null,
      };
      return apiRequest('POST', '/api/guests', guestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests/wedding', weddingId] });
      setIsAddDialogOpen(false);
      setEditingGuest(null);
      form.reset();
      toast({
        title: t('guestList.guestAdded'),
        description: t('guestList.guestAddedSuccess'),
      });
    },
  });

  // Update guest mutation
  const updateGuestMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Guest> }) => apiRequest('PATCH', `/api/guests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests/wedding', weddingId] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/guests/wedding', weddingId] });
      toast({
        title: t('guestList.guestDeleted'),
        description: t('guestList.guestDeletedSuccess'),
      });
    },
  });

  const onSubmit = (data: GuestFormData) => {
    if (editingGuest) {
      updateGuestMutation.mutate({ id: editingGuest.id, data });
    } else {
      addGuestMutation.mutate(data);
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    form.reset({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      rsvpStatus: guest.rsvpStatus,
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName || '',
      additionalGuests: guest.additionalGuests,
      category: guest.category,
      side: guest.side,
      dietaryRestrictions: guest.dietaryRestrictions || '',
      address: guest.address || '',
      notes: guest.notes || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleStatusUpdate = (guestId: number, status: Guest['rsvpStatus']) => {
    updateGuestMutation.mutate({ 
      id: guestId, 
      data: { 
        rsvpStatus: status,
        respondedAt: new Date(),
      }
    });
  };

  // Filter guests
  const filteredGuests = guests.filter((guest: Guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || guest.rsvpStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || guest.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Statistics
  const stats = {
    total: guests.length,
    confirmed: guests.filter((g: Guest) => g.rsvpStatus === 'confirmed').length,
    declined: guests.filter((g: Guest) => g.rsvpStatus === 'declined').length,
    pending: guests.filter((g: Guest) => g.rsvpStatus === 'pending').length,
    maybe: guests.filter((g: Guest) => g.rsvpStatus === 'maybe').length,
  };

  const getStatusBadge = (status: Guest['rsvpStatus']) => {
    const variants = {
      confirmed: 'default',
      declined: 'destructive',
      pending: 'secondary',
      maybe: 'outline',
    } as const;

    const labels = {
      confirmed: t('guestList.confirmed'),
      declined: t('guestList.declined'),
      pending: t('guestList.pending'),
      maybe: t('guestList.maybe'),
    };

    return (
      <Badge variant={variants[status]} className="text-xs font-semibold px-3 py-1 rounded-full">
        {labels[status]}
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

    return icons[status];
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
      {/* Mobile-First Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
          <Input
            type="text"
            placeholder={t('guestList.searchGuests')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 px-5 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
          />
          
          {/* Filter Tabs - Mobile Scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { key: 'all', label: t('guestList.all') },
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
              <p className="text-gray-600 mb-4">{t('guestList.noGuestsDesc')}</p>
            </div>
          ) : (
            filteredGuests.map((guest: Guest) => (
              <div key={guest.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(guest.rsvpStatus)}
                    <h4 className="font-semibold text-gray-900 truncate">{guest.name}</h4>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(guest)}
                      className="h-9 w-9 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteGuestMutation.mutate(guest.id)}
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-200 active:scale-95"
              onClick={() => {
                setEditingGuest(null);
                form.reset();
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGuest ? t('guestList.editGuest') : t('guestList.addGuest')}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>{t('guestList.name')}</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('guestList.email')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('guestList.phone')}</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rsvpStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('guestList.status')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">{t('guestList.pending')}</SelectItem>
                            <SelectItem value="confirmed">{t('guestList.confirmed')}</SelectItem>
                            <SelectItem value="maybe">{t('guestList.maybe')}</SelectItem>
                            <SelectItem value="declined">{t('guestList.declined')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('guestList.category')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="family">{t('guestList.family')}</SelectItem>
                            <SelectItem value="friends">{t('guestList.friends')}</SelectItem>
                            <SelectItem value="colleagues">{t('guestList.colleagues')}</SelectItem>
                            <SelectItem value="other">{t('guestList.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="plusOne"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('guestList.plusOne')}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('plusOne') && (
                  <FormField
                    control={form.control}
                    name="plusOneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('guestList.plusOneName')}</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1 h-12"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addGuestMutation.isPending || updateGuestMutation.isPending}
                    className="flex-1 h-12"
                  >
                    {editingGuest ? t('guestList.updateGuest') : t('guestList.addGuest')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}