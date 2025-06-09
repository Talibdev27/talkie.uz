import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Trash2, Settings } from "lucide-react";
import type { Wedding, User } from "@shared/schema";

interface GuestManagerAssignProps {
  wedding: Wedding;
  className?: string;
}

interface GuestManagerAccess {
  id: number;
  userId: number;
  weddingId: number;
  accessLevel: string;
  userEmail: string;
  userName: string;
  createdAt: string;
}

export function GuestManagerAssign({ wedding, className = '' }: GuestManagerAssignProps) {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'guest_manager' | 'viewer'>('guest_manager');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing access permissions
  const { data: accessList = [], isLoading } = useQuery<GuestManagerAccess[]>({
    queryKey: ['/api/admin/wedding-access', wedding.id],
  });

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async (data: { email: string; accessLevel: string }) => {
      return apiRequest(`/api/admin/wedding-access`, {
        method: 'POST',
        body: JSON.stringify({
          weddingId: wedding.id,
          email: data.email,
          accessLevel: data.accessLevel,
          permissions: {
            canEditDetails: false,
            canManageGuests: data.accessLevel === 'guest_manager',
            canViewAnalytics: data.accessLevel === 'guest_manager',
            canManagePhotos: false,
            canEditGuestBook: false
          }
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Access Granted",
        description: `Successfully granted ${accessLevel} access to ${email}`,
      });
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wedding-access'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grant access",
        variant: "destructive",
      });
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async (accessId: number) => {
      return apiRequest(`/api/admin/wedding-access/${accessId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Access Revoked",
        description: "Successfully revoked access",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wedding-access'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke access",
        variant: "destructive",
      });
    },
  });

  const handleGrantAccess = () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    grantAccessMutation.mutate({ email: email.trim(), accessLevel });
  };

  const handleRevokeAccess = (accessId: number, userEmail: string) => {
    if (confirm(`Are you sure you want to revoke access for ${userEmail}?`)) {
      revokeAccessMutation.mutate(accessId);
    }
  };

  return (
    <Card className={`wedding-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2C3338]">
          <Users className="h-5 w-5 text-[#D4B08C]" />
          Guest Manager Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grant New Access */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-[#2C3338]">Grant Access to New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-level">Access Level</Label>
              <Select value={accessLevel} onValueChange={(value: 'guest_manager' | 'viewer') => setAccessLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest_manager">Guest Manager</SelectItem>
                  <SelectItem value="viewer">Viewer Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGrantAccess}
                disabled={grantAccessMutation.isPending}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Grant Access
              </Button>
            </div>
          </div>
        </div>

        {/* Current Access List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[#2C3338]">Current Access Permissions</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : accessList.length === 0 ? (
            <div className="text-center py-8 text-[#2C3338]/70">
              No guest managers assigned yet. Grant access to users above.
            </div>
          ) : (
            <div className="space-y-2">
              {accessList.map((access) => (
                <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#D4B08C] rounded-full flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2C3338]">{access.userName}</p>
                      <p className="text-sm text-[#2C3338]/70">{access.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={access.accessLevel === 'guest_manager' ? 'default' : 'secondary'}>
                      {access.accessLevel === 'guest_manager' ? 'Guest Manager' : 'Viewer'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeAccess(access.id, access.userEmail)}
                      disabled={revokeAccessMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Access Level Descriptions */}
        <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
          <h4 className="font-semibold text-[#2C3338]">Access Level Permissions</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Guest Manager:</strong> Can manage guest list, RSVP tracking, and view analytics. Cannot edit wedding details.
            </div>
            <div>
              <strong>Viewer:</strong> Read-only access to guest information and basic analytics.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}