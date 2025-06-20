import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle } from '@/components/language-toggle';
import { 
  Heart, Palette, Calendar, Camera, Globe, MapPin, Music, 
  Check, Menu, X, Star, Users, MessageSquare 
} from 'lucide-react';
import { PricingSection } from '@/components/pricing-section';

export default function Landing() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Palette,
      titleKey: 'features.customization',
      descriptionKey: 'features.customizationDesc',
    },
    {
      icon: Calendar,
      titleKey: 'features.rsvpManagement',
      descriptionKey: 'features.rsvpManagementDesc',
    },
    {
      icon: Camera,
      titleKey: 'features.photoGalleries',
      descriptionKey: 'features.photoGalleriesDesc',
    },
    {
      icon: Globe,
      titleKey: 'features.multiLanguage',
      descriptionKey: 'features.multiLanguageDesc',
    },
    {
      icon: MapPin,
      titleKey: 'features.venueIntegration',
      descriptionKey: 'features.venueIntegrationDesc',
    },
    {
      icon: Music,
      titleKey: 'features.backgroundMusic',
      descriptionKey: 'features.backgroundMusicDesc',
    },
  ];

  const templates = [
    {
      nameKey: 'templates.gardenRomance',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250',
      descriptionKey: 'templates.gardenRomanceDesc',
    },
    {
      nameKey: 'templates.modernElegance',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250',
      descriptionKey: 'templates.modernEleganceDesc',
    },
    {
      nameKey: 'templates.rusticCharm',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250',
      descriptionKey: 'templates.rusticCharmDesc',
    },
    {
      nameKey: 'templates.beachBliss',
      image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250',
      descriptionKey: 'templates.beachBlissDesc',
    },
    {
      nameKey: 'templates.classicTradition',
      image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250',
      descriptionKey: 'templates.classicTraditionDesc',
    },
    {
      nameKey: 'templates.bohoChic',
      image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250',
      descriptionKey: 'templates.bohoChicDesc',
    },
  ];

  const pricingPlans = [
    {
      nameKey: 'pricing.basic',
      priceKey: 'pricing.free',
      featuresKey: 'pricing.basicFeatures',
      buttonKey: 'pricing.chooseBasic',
      popular: false,
    },
    {
      nameKey: 'pricing.premium',
      price: '100,000',
      currency: 'som',
      periodKey: 'pricing.perYear',
      featuresKey: 'pricing.premiumFeatures',
      buttonKey: 'pricing.choosePremium',
      popular: true,
    },
    {
      nameKey: 'pricing.deluxe',
      price: '300,000',
      currency: 'som',
      periodKey: 'pricing.perYear',
      featuresKey: 'pricing.deluxeFeatures',
      buttonKey: 'pricing.chooseDeluxe',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-soft-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Heart className="h-8 w-8 text-romantic-gold mr-2" />
                <h1 className="text-2xl font-playfair font-semibold text-romantic-gold">
                  LoveStory
                </h1>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="text-charcoal hover:text-romantic-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('nav.features')}
              </a>
              <a href="#templates" className="text-charcoal hover:text-romantic-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('nav.templates')}
              </a>
              <a href="#pricing" className="text-charcoal hover:text-romantic-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('nav.pricing')}
              </a>
              <LanguageToggle />
              <Link href="/login">
                <Button variant="ghost" className="text-charcoal hover:text-romantic-gold">
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link href="/create-wedding">
                <Button className="wedding-button">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-soft-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-charcoal hover:text-romantic-gold">
                  {t('nav.features')}
                </a>
                <a href="#templates" className="block px-3 py-2 text-charcoal hover:text-romantic-gold">
                  {t('nav.templates')}
                </a>
                <a href="#pricing" className="block px-3 py-2 text-charcoal hover:text-romantic-gold">
                  {t('nav.pricing')}
                </a>
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full justify-start text-charcoal hover:text-romantic-gold">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link href="/get-started" className="block">
                  <Button className="w-full wedding-button">
                    {t('nav.getStarted')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-charcoal leading-tight">
                {t('hero.title')}
                <span className="text-romantic-gold block">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="mt-6 text-lg text-charcoal opacity-80 font-lato leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/get-started">
                  <Button className="wedding-button text-lg px-8 py-4">
                    {t('hero.startCreating')}
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" className="wedding-button-outline text-lg px-8 py-4">
                    {t('hero.viewDemo')}
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-charcoal opacity-70">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-sage-green mr-2" />
                  <span>{t('hero.freeTrial')}</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-sage-green mr-2" />
                  <span>{t('hero.noCreditCard')}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Beautiful couple in elegant wedding attire" 
                className="rounded-2xl shadow-2xl w-full h-auto" 
              />
              <Card className="absolute -bottom-6 -left-6 wedding-card">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-charcoal opacity-70 font-lato">{t('hero.joinOver')}</p>
                  <p className="text-2xl font-playfair font-bold text-romantic-gold">50,000+</p>
                  <p className="text-sm text-charcoal opacity-70 font-lato">{t('hero.happyCouples')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Wedding Website Section */}
      <section className="py-20 bg-soft-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('demo.title')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70 max-w-2xl mx-auto">
              {t('demo.subtitle')}
            </p>
          </div>

          <Card className="wedding-card elegant-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-romantic-gold to-sage-green p-1">
              <div className="bg-white rounded-xl">
                {/* Demo Hero Section */}
                <div className="relative h-96 overflow-hidden rounded-t-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600" 
                    alt="Elegant wedding venue with beautiful floral arrangements" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                    <div>
                      <h3 className="text-3xl lg:text-4xl font-playfair font-bold mb-2 text-shadow">
                        Sarah & Michael
                      </h3>
                      <p className="text-lg font-cormorant mb-4 text-shadow">
                        September 15, 2024
                      </p>
                      {/* Countdown Timer */}
                      <div className="flex justify-center space-x-4 text-sm">
                        <div className="bg-white bg-opacity-20 rounded-xl px-3 py-2">
                          <div className="font-bold text-lg">45</div>
                          <div>Days</div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-xl px-3 py-2">
                          <div className="font-bold text-lg">12</div>
                          <div>Hours</div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-xl px-3 py-2">
                          <div className="font-bold text-lg">30</div>
                          <div>Min</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-8 space-y-12">
                  {/* Our Story Section */}
                  <div className="text-center">
                    <h4 className="text-2xl font-playfair font-bold text-charcoal mb-6">{t('demo.ourStory')}</h4>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <p className="text-charcoal opacity-80 leading-relaxed">
                          {t('demo.storyText')}
                        </p>
                      </div>
                      <div>
                        <img 
                          src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" 
                          alt="Couple's romantic engagement photo in natural setting" 
                          className="rounded-xl shadow-lg w-full h-auto" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Demo Photo Gallery */}
                  <div>
                    <h4 className="text-2xl font-playfair font-bold text-charcoal text-center mb-6">{t('demo.ourMemories')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
                        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
                        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
                        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300'
                      ].map((src, index) => (
                        <img 
                          key={index}
                          src={src} 
                          alt={`Wedding photo ${index + 1}`}
                          className="rounded-xl shadow-md w-full h-32 object-cover photo-hover" 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="wedding-card text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-romantic-gold rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-playfair font-semibold text-charcoal mb-4">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-charcoal opacity-70 leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Template Gallery */}
      <section id="templates" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-charcoal">
              {t('templates.title')}
            </h2>
            <p className="mt-4 text-lg text-charcoal opacity-70 max-w-2xl mx-auto">
              {t('templates.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <Card key={index} className="wedding-card overflow-hidden">
                <img 
                  src={template.image} 
                  alt={t(template.nameKey)}
                  className="w-full h-48 object-cover" 
                />
                <CardContent className="p-6">
                  <h3 className="text-lg font-playfair font-semibold text-charcoal mb-2">
                    {t(template.nameKey)}
                  </h3>
                  <p className="text-sm text-charcoal opacity-70 mb-4">
                    {t(template.descriptionKey)}
                  </p>
                  <Link href={`/demo?template=${template.nameKey.split('.')[1]}`}>
                    <Button className="w-full wedding-button">
                      {t('templates.previewTemplate')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-romantic-gold">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-white opacity-90 mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started">
              <Button className="bg-white text-romantic-gold px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 transition-all shadow-lg">
                {t('cta.startFreeTrial')}
              </Button>
            </Link>
            <Link href="/demo">
              <Button className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-white hover:text-romantic-gold transition-all shadow-lg font-semibold">
                {t('hero.viewDemo')}
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white opacity-70">
            {t('cta.noCreditCard')} • {t('cta.freeTrial')} • {t('cta.cancelAnytime')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 text-romantic-gold mr-2" />
                <h3 className="text-2xl font-playfair font-semibold text-romantic-gold">
                  LoveStory
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                {t('footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.features')}</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.weddingWebsites')}</a></li>
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.rsvpManagement')}</a></li>
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.photoGalleries')}</a></li>
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.guestBook')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.contactUs')}</a></li>
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-romantic-gold transition-colors">{t('footer.termsOfService')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 LoveStory. All rights reserved. Made with <Heart className="inline h-4 w-4 text-romantic-gold mx-1" /> for couples everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}