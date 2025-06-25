import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GuestListLoading } from '@/components/ui/loading';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  UserCheck, 
  UserX, 
  Clock, 
  Users,
  Edit,
  Trash2,
  Download,
  Send,
  UserPlus,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar,
  Share2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Guest, InsertGuest } from '@shared/schema';

const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  category: z.string().default('family'),
  side: z.enum(['bride', 'groom', 'both']).default('both'),
  dietaryRestrictions: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestListManagerProps {
  weddingId: number;
  className?: string;
}

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
      plusOne: false,
      plusOneName: '',
      category: 'family',
      side: 'both',
      dietaryRestrictions: '',
      address: '',
      notes: '',
    },
  });

  // Fetch guests
  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ['/api/guests/wedding', weddingId],
    enabled: !!weddingId,
  });

  // Add guest mutation
  const addGuestMutation = useMutation({
    mutationFn: (data: GuestFormData) => {
      const guestData: InsertGuest = {
        ...data,
        weddingId,
        email: data.email || null,
        phone: data.phone || null,
        plusOneName: data.plusOneName || null,
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<Guest> }) => {
      return apiRequest('PATCH', `/api/guests/${id}`, data);
    },
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
    mutationFn: async (guestId: number) => {
      return apiRequest('DELETE', `/api/guests/${guestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests', weddingId] });
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
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName || '',
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
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className={className}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('guestList.totalGuests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              {t('guestList.confirmed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              {t('guestList.declined')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              {t('guestList.pending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              {t('guestList.maybe')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.maybe}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('guestList.searchGuests')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={t('guestList.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('guestList.allStatuses')}</SelectItem>
            <SelectItem value="confirmed">{t('guestList.confirmed')}</SelectItem>
            <SelectItem value="declined">{t('guestList.declined')}</SelectItem>
            <SelectItem value="pending">{t('guestList.pending')}</SelectItem>
            <SelectItem value="maybe">{t('guestList.maybe')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={t('guestList.filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('guestList.allCategories')}</SelectItem>
            <SelectItem value="family">{t('guestList.family')}</SelectItem>
            <SelectItem value="friends">{t('guestList.friends')}</SelectItem>
            <SelectItem value="colleagues">{t('guestList.colleagues')}</SelectItem>
            <SelectItem value="other">{t('guestList.other')}</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="wedding-button">
              <Plus className="h-4 w-4 mr-2" />
              {t('guestList.addGuest')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGuest ? t('guestList.editGuest') : t('guestList.addNewGuest')}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('guestList.guestName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('guestList.enterGuestName')} {...field} />
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
                          <Input type="email" placeholder={t('guestList.enterEmail')} {...field} />
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
                          <Input placeholder={t('guestList.enterPhone')} {...field} />
                        </FormControl>
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
                            <SelectTrigger>
                              <SelectValue placeholder={t('guestList.selectCategory')} />
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
                  
                  <FormField
                    control={form.control}
                    name="side"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('guestList.side')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('guestList.selectSide')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bride">{t('guestList.bridesSide')}</SelectItem>
                            <SelectItem value="groom">{t('guestList.groomsSide')}</SelectItem>
                            <SelectItem value="both">{t('guestList.both')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                          <Input placeholder={t('guestList.enterPlusOneName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('guestList.dietaryRestrictions')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('guestList.enterDietaryRestrictions')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('guestList.address')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('guestList.enterAddress')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('guestList.notes')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('guestList.enterNotes')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingGuest(null);
                      form.reset();
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={addGuestMutation.isPending || updateGuestMutation.isPending}
                    className="wedding-button"
                  >
                    {editingGuest ? t('guestList.updateGuest') : t('guestList.addGuest')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Guest Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('guestList.guestList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <GuestListLoading />
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('guestList.noGuestsFound')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('guestList.name')}</TableHead>
                    <TableHead>{t('guestList.contact')}</TableHead>
                    <TableHead>{t('guestList.category')}</TableHead>
                    <TableHead>{t('guestList.side')}</TableHead>
                    <TableHead>{t('guestList.status')}</TableHead>
                    <TableHead>{t('guestList.plusOne')}</TableHead>
                    <TableHead>{t('guestList.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.map((guest: Guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{guest.name}</div>
                          {guest.plusOne && guest.plusOneName && (
                            <div className="text-sm text-muted-foreground">
                              +1: {guest.plusOneName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {guest.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              {guest.email}
                            </div>
                          )}
                          {guest.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {guest.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(`guestList.${guest.category}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {t(`guestList.${guest.side === 'bride' ? 'bridesSide' : guest.side === 'groom' ? 'groomsSide' : 'both'}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={guest.rsvpStatus}
                          onValueChange={(value) => handleStatusUpdate(guest.id, value as Guest['rsvpStatus'])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t('guestList.pending')}</SelectItem>
                            <SelectItem value="confirmed">{t('guestList.confirmed')}</SelectItem>
                            <SelectItem value="declined">{t('guestList.declined')}</SelectItem>
                            <SelectItem value="maybe">{t('guestList.maybe')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {guest.plusOne ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(guest)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGuestMutation.mutate(guest.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}