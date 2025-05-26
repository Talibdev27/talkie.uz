import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.features': 'Features',
      'nav.templates': 'Templates',
      'nav.pricing': 'Pricing',
      'nav.signIn': 'Sign In',
      'nav.getStarted': 'Get Started',

      // Hero Section
      'hero.title': 'Create Your Perfect',
      'hero.titleHighlight': 'Wedding Website',
      'hero.subtitle': 'Share your love story with a beautiful, personalized wedding website. Manage RSVPs, showcase photos, and create lasting memories with your guests.',
      'hero.startCreating': 'Start Creating',
      'hero.viewDemo': 'View Demo',
      'hero.freeTrial': 'Free 30-day trial',
      'hero.noCreditCard': 'No credit card required',

      // Wedding Site
      'wedding.ourStory': 'Our Love Story',
      'wedding.rsvp': 'RSVP',
      'wedding.photos': 'Our Memories',
      'wedding.guestBook': 'Guest Book',
      'wedding.weddingDetails': 'Wedding Details',
      'wedding.countdown': 'Countdown',

      // RSVP Form
      'rsvp.guestName': 'Guest Name',
      'rsvp.email': 'Email Address',
      'rsvp.willYouAttend': 'Will you attend?',
      'rsvp.yesAttending': 'Yes, I\'ll be there',
      'rsvp.notAttending': 'Sorry, can\'t make it',
      'rsvp.maybe': 'Maybe',
      'rsvp.plusOne': 'Will you bring a plus one?',
      'rsvp.message': 'Message for the couple',
      'rsvp.submit': 'Submit RSVP',
      'rsvp.thankYou': 'Thank you for your RSVP!',

      // Admin Dashboard
      'admin.dashboard': 'Dashboard',
      'admin.rsvpStatus': 'RSVP Status',
      'admin.confirmed': 'Confirmed',
      'admin.pending': 'Pending',
      'admin.declined': 'Declined',
      'admin.quickActions': 'Quick Actions',
      'admin.editWebsite': 'Edit Website',
      'admin.uploadPhotos': 'Upload Photos',
      'admin.manageGuests': 'Manage Guests',
      'admin.recentRSVPs': 'Recent RSVPs',

      // Features
      'features.title': 'Everything You Need for Your Perfect Day',
      'features.customization': 'Beautiful Customization',
      'features.rsvpManagement': 'RSVP Management',
      'features.photoGalleries': 'Photo Galleries',
      'features.multiLanguage': 'Multi-Language Support',
      'features.venueIntegration': 'Venue Integration',
      'features.backgroundMusic': 'Background Music',

      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',

      // Time units
      'time.days': 'Days',
      'time.hours': 'Hours',
      'time.minutes': 'Minutes',
      'time.seconds': 'Seconds',
    }
  },
  uz: {
    translation: {
      // Navigation
      'nav.features': 'Xususiyatlar',
      'nav.templates': 'Shablonlar',
      'nav.pricing': 'Narxlar',
      'nav.signIn': 'Kirish',
      'nav.getStarted': 'Boshlash',

      // Hero Section
      'hero.title': 'Mukammal yarating',
      'hero.titleHighlight': 'To\'y veb-sayti',
      'hero.subtitle': 'Chiroyli, shaxsiy to\'y veb-sayti bilan sevgi hikoyangizni baham ko\'ring. RSVP boshqaring, suratlarni ko\'rsating va mehmonlaringiz bilan unutilmas xotiralar yarating.',
      'hero.startCreating': 'Yaratishni boshlash',
      'hero.viewDemo': 'Demo ko\'rish',
      'hero.freeTrial': '30 kunlik bepul sinov',
      'hero.noCreditCard': 'Kredit karta talab qilinmaydi',

      // Wedding Site
      'wedding.ourStory': 'Bizning sevgi hikoyamiz',
      'wedding.rsvp': 'Tasdiq',
      'wedding.photos': 'Xotiralarimiz',
      'wedding.guestBook': 'Mehmonlar kitobi',
      'wedding.weddingDetails': 'To\'y tafsilotlari',
      'wedding.countdown': 'Hisoblash',

      // RSVP Form
      'rsvp.guestName': 'Mehmon ismi',
      'rsvp.email': 'Email manzili',
      'rsvp.willYouAttend': 'Qatnashasizmi?',
      'rsvp.yesAttending': 'Ha, men boraman',
      'rsvp.notAttending': 'Kechirasiz, kela olmayman',
      'rsvp.maybe': 'Balki',
      'rsvp.plusOne': 'Qo\'shimcha odamni olib kelasizmi?',
      'rsvp.message': 'Er-xotin uchun xabar',
      'rsvp.submit': 'Tasdiqlash yuborish',
      'rsvp.thankYou': 'Tasdiqlashingiz uchun rahmat!',

      // Admin Dashboard
      'admin.dashboard': 'Boshqaruv paneli',
      'admin.rsvpStatus': 'Tasdiq holati',
      'admin.confirmed': 'Tasdiqlangan',
      'admin.pending': 'Kutilmoqda',
      'admin.declined': 'Rad etilgan',
      'admin.quickActions': 'Tez harakatlar',
      'admin.editWebsite': 'Veb-saytni tahrirlash',
      'admin.uploadPhotos': 'Rasmlarni yuklash',
      'admin.manageGuests': 'Mehmonlarni boshqarish',
      'admin.recentRSVPs': 'So\'nggi tasdiqlar',

      // Time units
      'time.days': 'Kunlar',
      'time.hours': 'Soatlar',
      'time.minutes': 'Daqiqalar',
      'time.seconds': 'Soniyalar',
    }
  },
  ru: {
    translation: {
      // Navigation
      'nav.features': 'Возможности',
      'nav.templates': 'Шаблоны',
      'nav.pricing': 'Цены',
      'nav.signIn': 'Войти',
      'nav.getStarted': 'Начать',

      // Hero Section
      'hero.title': 'Создайте идеальный',
      'hero.titleHighlight': 'Свадебный сайт',
      'hero.subtitle': 'Поделитесь своей историей любви с красивым, персонализированным свадебным сайтом. Управляйте RSVP, демонстрируйте фотографии и создавайте незабываемые воспоминания с гостями.',
      'hero.startCreating': 'Начать создание',
      'hero.viewDemo': 'Посмотреть демо',
      'hero.freeTrial': '30-дневная бесплатная версия',
      'hero.noCreditCard': 'Кредитная карта не требуется',

      // Wedding Site
      'wedding.ourStory': 'Наша история любви',
      'wedding.rsvp': 'Подтверждение',
      'wedding.photos': 'Наши воспоминания',
      'wedding.guestBook': 'Книга гостей',
      'wedding.weddingDetails': 'Детали свадьбы',
      'wedding.countdown': 'Обратный отсчет',

      // RSVP Form
      'rsvp.guestName': 'Имя гостя',
      'rsvp.email': 'Email адрес',
      'rsvp.willYouAttend': 'Будете ли вы присутствовать?',
      'rsvp.yesAttending': 'Да, я буду там',
      'rsvp.notAttending': 'Извините, не смогу прийти',
      'rsvp.maybe': 'Возможно',
      'rsvp.plusOne': 'Приведете ли вы сопровождающего?',
      'rsvp.message': 'Сообщение для пары',
      'rsvp.submit': 'Отправить подтверждение',
      'rsvp.thankYou': 'Спасибо за ваше подтверждение!',

      // Admin Dashboard
      'admin.dashboard': 'Панель управления',
      'admin.rsvpStatus': 'Статус подтверждений',
      'admin.confirmed': 'Подтверждено',
      'admin.pending': 'Ожидает',
      'admin.declined': 'Отклонено',
      'admin.quickActions': 'Быстрые действия',
      'admin.editWebsite': 'Редактировать сайт',
      'admin.uploadPhotos': 'Загрузить фото',
      'admin.manageGuests': 'Управление гостями',
      'admin.recentRSVPs': 'Последние подтверждения',

      // Time units
      'time.days': 'Дни',
      'time.hours': 'Часы',
      'time.minutes': 'Минуты',
      'time.seconds': 'Секунды',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
