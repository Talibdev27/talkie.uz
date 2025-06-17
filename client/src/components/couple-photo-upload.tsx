import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CouplePhotoUploadProps {
  weddingId: number;
  currentPhotoUrl?: string;
  onPhotoUploaded?: (url: string) => void;
}

export function CouplePhotoUpload({ weddingId, currentPhotoUrl, onPhotoUploaded }: CouplePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('photoType', 'couple');
      formData.append('weddingId', weddingId.toString());
      
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Photo Uploaded",
        description: "Couple photo has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', weddingId] });
      if (onPhotoUploaded) {
        onPhotoUploaded(data.url);
      }
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const deletePhoto = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/photos/wedding/${weddingId}/couple`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo Deleted",
        description: "Couple photo has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/photos/wedding', weddingId] });
    },
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Couple Photo</h3>
          </div>
          
          {currentPhotoUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={currentPhotoUrl}
                  alt="Couple photo"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => deletePhoto.mutate()}
                  disabled={deletePhoto.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="replace-couple-photo"
                  disabled={uploading || uploadMutation.isPending}
                />
                <label
                  htmlFor="replace-couple-photo"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Replace Photo
                </label>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="font-medium text-gray-700 mb-2">Upload Couple Photo</h4>
              <p className="text-sm text-gray-500 mb-4">
                This photo will appear at the top of your wedding site
              </p>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="couple-photo-upload"
                disabled={uploading || uploadMutation.isPending}
              />
              <label
                htmlFor="couple-photo-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading || uploadMutation.isPending ? 'Uploading...' : 'Choose Photo'}
              </label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}