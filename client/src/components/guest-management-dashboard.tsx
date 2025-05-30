import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  PieChart,
  Download,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { insertGuestSchema, type Guest } from '@shared/schema';
import { z } from 'zod';

interface GuestManagementProps {
  weddingId: number;
}

const addGuestSchema = insertGuestSchema.extend({
  weddingId: z.number()
});

type AddGuestFormData = z.infer<typeof addGuestSchema>;

export function GuestManagementDashboard({ weddingId }: GuestManagementProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: guests = [] } = useQuery<Guest[]>({
    queryKey: ['/api/guests/wedding', weddingId],
    enabled: !!weddingId,
  });

  const form = useForm<AddGuestFormData>({
    resolver: zodResolver(addGuestSchema),
    defaultValues: {
      weddingId,
      name: '',
      email: '',
      phone: '',
      rsvpStatus: 'pending',
      plusOne: false,
      dietaryRestrictions: '',
      notes: '',
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: (data: AddGuestFormData) => apiRequest('/api/guests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: t('guests.guestAdded'),
        description: t('guests.guestAddedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guests/wedding', weddingId] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('guests.addGuestError'),
        variant: 'destructive',
      });
    },
  });

  // Analytics calculations
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending').length;
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length;
  const responseRate = totalGuests > 0 ? ((confirmedGuests + declinedGuests) / totalGuests) * 100 : 0;

  // Filter guests based on search and status
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || guest.rsvpStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (data: AddGuestFormData) => {
    addGuestMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'default',
      pending: 'secondary',
      declined: 'destructive',
      maybe: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {t(`guests.status.${status}`)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              {t('guests.totalGuests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {t('guests.confirmed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedGuests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              {t('guests.pending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingGuests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              {t('guests.responseRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate.toFixed(1)}%</div>
            <Progress value={responseRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('guests.guestManagement')}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t('guests.exportList')}
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="wedding-button">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('guests.addGuest')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('guests.addNewGuest')}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('guests.guestName')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('guests.enterName')} />
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
                            <FormLabel>{t('guests.email')}</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder={t('guests.enterEmail')} />
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
                            <FormLabel>{t('guests.phone')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('guests.enterPhone')} />
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
                            <FormLabel>{t('guests.rsvpStatus')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">{t('guests.status.pending')}</SelectItem>
                                <SelectItem value="confirmed">{t('guests.status.confirmed')}</SelectItem>
                                <SelectItem value="declined">{t('guests.status.declined')}</SelectItem>
                                <SelectItem value="maybe">{t('guests.status.maybe')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          className="flex-1"
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          disabled={addGuestMutation.isPending}
                          className="wedding-button flex-1"
                        >
                          {addGuestMutation.isPending ? t('common.saving') : t('guests.addGuest')}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">{t('guests.guestList')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('guests.analytics')}</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('guests.searchGuests')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('guests.allStatuses')}</SelectItem>
                    <SelectItem value="pending">{t('guests.status.pending')}</SelectItem>
                    <SelectItem value="confirmed">{t('guests.status.confirmed')}</SelectItem>
                    <SelectItem value="declined">{t('guests.status.declined')}</SelectItem>
                    <SelectItem value="maybe">{t('guests.status.maybe')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Guest List */}
              <div className="space-y-2">
                {filteredGuests.map((guest) => (
                  <Card key={guest.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(guest.rsvpStatus)}
                          <div>
                            <div className="font-medium">{guest.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-4">
                              {guest.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {guest.email}
                                </span>
                              )}
                              {guest.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {guest.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {guest.plusOne && (
                          <Badge variant="outline">+1</Badge>
                        )}
                        {getStatusBadge(guest.rsvpStatus)}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredGuests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? t('guests.noGuestsFound') 
                    : t('guests.noGuestsYet')
                  }
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      {t('guests.rsvpBreakdown')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          {t('guests.status.confirmed')}
                        </span>
                        <span className="font-medium">{confirmedGuests}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          {t('guests.status.pending')}
                        </span>
                        <span className="font-medium">{pendingGuests}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          {t('guests.status.declined')}
                        </span>
                        <span className="font-medium">{declinedGuests}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('guests.responseProgress')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold">{responseRate.toFixed(1)}%</div>
                      <Progress value={responseRate} className="h-3" />
                      <p className="text-sm text-gray-600">
                        {confirmedGuests + declinedGuests} {t('guests.outOf')} {totalGuests} {t('guests.guestsResponded')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}