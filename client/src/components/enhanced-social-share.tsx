import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Instagram, MessageCircle, ExternalLink } from 'lucide-react';
import { SiWhatsapp, SiTelegram, SiFacebook } from 'react-icons/si';

interface EnhancedSocialShareProps {
  weddingUrl: string;
  coupleName: string;
  className?: string;
}

export function EnhancedSocialShare({ weddingUrl, coupleName, className = '' }: EnhancedSocialShareProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showMore, setShowMore] = useState(false);

  const fullUrl = `${window.location.origin}/wedding/${weddingUrl}`;
  const shareText = `${coupleName} to'yiga taklif qilinasiz! / You're invited to ${coupleName}'s wedding!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: t('share.linkCopied'),
        description: t('share.linkCopiedDesc'),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t('share.copyError'),
        variant: "destructive",
      });
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${fullUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct link sharing, so we copy the link
    copyToClipboard();
    toast({
      title: "Instagram",
      description: "Link copied! Share it in your Instagram story or post.",
    });
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <Card className={`wedding-card ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-5 h-5 text-[#D4B08C]" />
          <h3 className="text-lg font-semibold text-[#2C3338]">{t('share.title')}</h3>
        </div>
        
        <p className="text-[#2C3338]/70 mb-6 text-sm">
          {t('share.subtitle')}
        </p>

        {/* Quick Share Options */}
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-[#2C3338] text-sm">{t('share.quickShare')}</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={shareToWhatsApp}
              className="flex items-center gap-2 h-12 border-[#D4B08C]/20 hover:bg-[#25D366]/5 hover:border-[#25D366] transition-colors"
            >
              <SiWhatsapp className="w-4 h-4 text-[#25D366]" />
              <span className="text-sm">{t('share.whatsapp')}</span>
            </Button>

            <Button
              variant="outline"
              onClick={shareToTelegram}
              className="flex items-center gap-2 h-12 border-[#D4B08C]/20 hover:bg-[#0088cc]/5 hover:border-[#0088cc] transition-colors"
            >
              <SiTelegram className="w-4 h-4 text-[#0088cc]" />
              <span className="text-sm">{t('share.telegram')}</span>
            </Button>

            <Button
              variant="outline"
              onClick={shareToInstagram}
              className="flex items-center gap-2 h-12 border-[#D4B08C]/20 hover:bg-[#E4405F]/5 hover:border-[#E4405F] transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#E4405F]" />
              <span className="text-sm">{t('share.instagram')}</span>
            </Button>

            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center gap-2 h-12 border-[#D4B08C]/20 hover:bg-[#D4B08C]/5 hover:border-[#D4B08C] transition-colors"
            >
              <Copy className="w-4 h-4 text-[#D4B08C]" />
              <span className="text-sm">{t('share.copyLink')}</span>
            </Button>
          </div>
        </div>

        {/* More Options Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowMore(!showMore)}
          className="w-full text-[#D4B08C] hover:bg-[#D4B08C]/5 text-sm"
        >
          {showMore ? t('share.showLess') : t('share.moreOptions')}
        </Button>

        {/* Additional Share Options */}
        {showMore && (
          <div className="mt-4 pt-4 border-t border-[#D4B08C]/20">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={shareToFacebook}
                className="flex items-center gap-2 h-12 border-[#D4B08C]/20 hover:bg-[#1877F2]/5 hover:border-[#1877F2] transition-colors"
              >
                <SiFacebook className="w-4 h-4 text-[#1877F2]" />
                <span className="text-sm">{t('share.facebook')}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const subject = encodeURIComponent(`${coupleName} Wedding Invitation`);
                  const body = encodeURIComponent(`${shareText}\n\n${fullUrl}`);
                  window.open(`mailto:?subject=${subject}&body=${body}`);
                }}
                className="flex items-center gap-2 h-12 border-[#D4B08C]/20 hover:bg-[#D4B08C]/5 hover:border-[#D4B08C] transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#D4B08C]" />
                <span className="text-sm">Email</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}