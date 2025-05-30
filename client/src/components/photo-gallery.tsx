import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PhotoLoading } from '@/components/ui/loading';
import type { Photo } from '@shared/schema';

interface PhotoGalleryProps {
  weddingId: number;
  className?: string;
}

export function PhotoGallery({ weddingId, className = '' }: PhotoGalleryProps) {
  const { t } = useTranslation();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ['/api/photos/wedding', weddingId],
    queryFn: () => fetch(`/api/photos/wedding/${weddingId}`).then(res => res.json()),
  });

  const openModal = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeModal = () => {
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1);
    } else {
      setSelectedPhotoIndex(selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <PhotoLoading count={8} />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">{t('photos.noPhotosYet')}</p>
          <p className="text-sm">{t('photos.photosWillAppear')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-xl shadow-md photo-hover"
              onClick={() => openModal(index)}
            >
              <img
                src={photo.url}
                alt={photo.caption || `Wedding photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo Modal */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black">
          {selectedPhotoIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20"
                onClick={closeModal}
              >
                <X className="h-6 w-6" />
              </Button>

              <img
                src={photos[selectedPhotoIndex].url}
                alt={photos[selectedPhotoIndex].caption || `Wedding photo ${selectedPhotoIndex + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain"
              />

              {photos[selectedPhotoIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                  <p className="text-center">{photos[selectedPhotoIndex].caption}</p>
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
                    onClick={() => navigatePhoto('prev')}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
                    onClick={() => navigatePhoto('next')}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
