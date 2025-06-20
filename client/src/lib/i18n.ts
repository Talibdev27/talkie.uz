import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      // Navigation
      'nav.features': 'Xususiyatlar',
      'nav.templates': 'Shablonlar',
      'nav.pricing': 'Narxlar',
      'nav.signIn': 'Kirish',
      'nav.getStarted': 'Boshlash',

      // Hero Section
      'hero.title': 'Mukammal',
      'hero.titleHighlight': 'To\'y Veb-Saytini Yarating',
      'hero.subtitle': 'Sevgi hikoyangizni chiroyli, shaxsiy to\'y veb-sayti orqali ulashing. RSVP\'larni boshqaring, rasmlarni namoyish eting va mehmonlaringiz bilan esda qoladigan xotiralar yarating.',
      'hero.startCreating': 'Yaratishni Boshlash',
      'hero.viewDemo': 'Demo Ko\'rish',
      'hero.freeTrial': '30 kunlik bepul sinov',
      'hero.noCreditCard': 'Kredit karta talab qilinmaydi',
      'hero.joinOver': 'Qo\'shiling',
      'hero.happyCouples': 'baxtli juftliklar',

      // Demo Section
      'demo.title': 'To\'y Veb-Saytingiz Hayotga Kelishini Ko\'ring',
      'demo.subtitle': 'Shaxsiy to\'y veb-saytingiz qanday ko\'rinishini interaktiv demo orqali ko\'ring',
      'demo.ourStory': 'Bizning Sevgi Hikoyamiz',
      'demo.ourMemories': 'Bizning Xotiralarimiz',
      'demo.storyText': 'Biz yomg\'irli seshanba kuni sevimli qahvaxonamizda uchrashdik. Tasodifiy uchrashuv sifatida boshlangan narsa biz tasavvur qila olgan eng go\'zal sevgi hikoyasiga aylandi...',
      'demo.howWeMet': 'Qanday Tanishdik',
      'demo.howWeMetText': 'Har bir sevgi hikoyasi o\'ziga xos va bizniki eng kutilmagan tarzda boshlandi...',

      // Wedding Site
      'wedding.dearGuests': 'Aziz Mehmonlar',
      'wedding.ourStory': 'Bizning Sevgi Hikoyamiz',
      'wedding.rsvp': 'Iltimos, qatnashishingizni bildiring',
      'wedding.photos': 'Bizning Xotiralarimiz',
      'wedding.guestBook': 'Mehmonlar Kitobi',
      'wedding.weddingDetails': 'To\'y Tafsilotlari',
      'wedding.countdown': 'Hisoblash',
      'wedding.when': 'Qachon',
      'wedding.where': 'Qayerda',
      'wedding.venue': 'To\'y Maskani',
      'wedding.ceremonyTime': 'Marosim soat 16:00 da boshlanadi',
      'wedding.clickToViewLocation': 'Manzilni ko\'rish uchun bosing',
      'wedding.viewOnMap': 'Xaritada Ko\'rish',
      'wedding.guestBookSubtitle': 'Bizning kunimizni yanada o\'ziga xos qilish uchun xabar qoldiring',
      'wedding.messagesFromLovedOnes': 'Yaqinlarimizdan xabarlar',
      'wedding.thankYouGuests': 'O\'ziga xos kunimizda ishtirok etganingiz uchun rahmat',
      'wedding.createdWith': 'Yaratilgan',
      
      // Navigation
      'nav.home': 'Bosh sahifa',
      'nav.rsvp': 'RSVP',
      'nav.details': 'Tafsilotlar',
      'nav.guestbook': 'Mehmonlar Kitobi',
      
      // Sections
      'sections.dearGuests': 'Aziz Mehmonlar',
      'sections.weddingDetails': 'To\'y Tafsilotlari',
      'sections.guestBook': 'Mehmonlar Kitobi',
      
      // Countdown
      'countdown.days': 'KUN',
      'countdown.hours': 'SOAT',
      'countdown.minutes': 'DAQIQA',
      
      // Details
      'details.when': 'Qachon',
      'details.where': 'Qayerda',
      'details.showOnMap': 'Xaritada Ko\'rish',
      'details.ceremonyBegins': 'To\'y marosimi boshlanadi',
      'details.dateTBD': 'Sana belgilanmagan',
      
      // RSVP
      'rsvp.title': 'Iltimos, qatnashishingizni tasdiqlang',
      'rsvp.subtitle': 'Siz bilan nishonlashni intiqorlik bilan kutamiz!',
      
      // Guest Book
      'guestBook.subtitle': 'Bizning kunimizni yanada o\'ziga xos qilish uchun xabar qoldiring',
      'guestBook.leaveMessage': 'Xabar Qoldirish',
      'guestBook.messages': 'Yaqinlardan Xabarlar',
      'guestBook.noMessages': 'Hali xabarlar yo\'q. Birinchi bo\'ling!',
      'wedding.using': 'LoveStory yordamida',
      'wedding.capturingJourney': 'Birgalikdagi sayohatimizni saqlab qolish',
      'wedding.cantWaitToCelebrate': 'Siz bilan nishonlashni intiqorlik bilan kutamiz!',
      'wedding.weddingDayIsHere': 'To\'y Kuni Keldi!',
      'wedding.beautifulMemories': 'Go\'zal xotiralar kutmoqda',
      'wedding.countdown.days': 'KUN',
      'wedding.countdown.hours': 'SOAT',
      'wedding.countdown.minutes': 'DAQIQA',
      'wedding.countdown.seconds': 'SONIYA',
      'wedding.withLove': 'Sevgi bilan,',

      // RSVP Form
      'rsvp.guestName': 'Mehmon Ismi',
      'rsvp.email': 'Email Manzil',
      'rsvp.willYouAttend': 'Qatnashasizmi?',
      'rsvp.yesAttending': 'Ha, men boraman',
      'rsvp.noAttending': 'Yo\'q, qatnasha olmayman',
      'rsvp.submitRSVP': 'RSVP Yuborish',
      'rsvp.thankYou': 'Rahmat!',
      'rsvp.confirmationSent': 'Tasdiqnoma yuborildi',
      'rsvp.pleaseEnterName': 'Iltimos, ismingizni kiriting',
      'rsvp.pleaseEnterEmail': 'Iltimos, email manzilingizni kiriting',
      'rsvp.pleaseSelectAttendance': 'Iltimos, qatnashishni tanlang',
      'rsvp.submitting': 'Yuborilmoqda...',

      // Management
      'manage.weddingDetails': 'To\'y Tafsilotlari',
      'manage.guestManagement': 'Mehmonlarni Boshqarish',
      'manage.guestDashboard': 'Mehmonlar Paneli',
      'manage.guestBook': 'Mehmonlar Kitobi',
      'manage.photoManagement': 'Rasmlarni Boshqarish',

      // Admin
      'admin.dashboard': 'Boshqaruv Paneli',
      'admin.users': 'Foydalanuvchilar',
      'admin.weddings': 'To\'ylar',
      'admin.photos': 'Rasmlar',
      'admin.settings': 'Sozlamalar',

      // Forms
      'form.name': 'Ism',
      'form.email': 'Email',
      'form.message': 'Xabar',
      'form.submit': 'Yuborish',
      'form.cancel': 'Bekor qilish',
      'form.save': 'Saqlash',
      'form.edit': 'Tahrirlash',
      'form.delete': 'O\'chirish',

      // Messages
      'message.success': 'Muvaffaqiyatli!',
      'message.error': 'Xatolik yuz berdi',
      'message.loading': 'Yuklanmoqda...',
      'message.saving': 'Saqlanmoqda...',
      'message.deleting': 'O\'chirilmoqda...',

      // Photo editing
      'imageEdit.title': 'Rasmni Tahrirlash',
      'imageEdit.crop': 'Kesish',
      'imageEdit.resize': 'O\'lchamni O\'zgartirish',
      'imageEdit.filter': 'Filtr',
      'imageEdit.brightness': 'Yorqinlik',
      'imageEdit.contrast': 'Kontrast',
      'imageEdit.saturation': 'To\'yinganlik',
      'imageEdit.reset': 'Qayta Tiklash',
      'imageEdit.apply': 'Qo\'llash',
      'imageEdit.upload': 'Yuklash',
      'imageEdit.backToEdit': 'Tahrirga Qaytish',
      'imageEdit.uploading': 'Yuklanmoqda...',
      'imageEdit.uploadPhoto': 'Rasm Yuklash'
    }
  },
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
      'hero.joinOver': 'Join over',
      'hero.happyCouples': 'happy couples',

      // Demo Section
      'demo.title': 'See Your Wedding Website Come to Life',
      'demo.subtitle': 'Preview how your personalized wedding website will look with our interactive demo',
      'demo.ourStory': 'Our Love Story',
      'demo.ourMemories': 'Our Memories',
      'demo.storyText': 'We met on a rainy Tuesday at our favorite coffee shop. What started as a chance encounter became the most beautiful love story we could have imagined...',
      'demo.howWeMet': 'How We Met',
      'demo.howWeMetText': 'Every love story is special, and ours began in the most unexpected way...',

      // Wedding Site
      'wedding.dearGuests': 'Dear Guests',
      'wedding.ourStory': 'Our Love Story',
      'wedding.rsvp': 'Please let us know if you\'ll be attending',
      'wedding.photos': 'Our Memories',
      'wedding.guestBook': 'Guest Book',
      'wedding.weddingDetails': 'Wedding Details',
      'wedding.countdown': 'Countdown',
      'wedding.when': 'When',
      'wedding.where': 'Where',
      'wedding.venue': 'Wedding Venue',
      'wedding.ceremonyTime': 'Ceremony begins at 4:00 PM',
      'wedding.clickToViewLocation': 'Click below to view location',
      'wedding.viewOnMap': 'View on Map',
      'wedding.guestBookSubtitle': 'Leave us a message to make our day even more special',
      'wedding.messagesFromLovedOnes': 'Messages from our loved ones',
      'wedding.thankYouGuests': 'Thank you for being part of our special day',
      'wedding.createdWith': 'Created with',
      
      // Navigation
      'nav.home': 'Home',
      'nav.rsvp': 'RSVP',
      'nav.details': 'Details',
      'nav.guestbook': 'Guest Book',
      
      // Sections
      'sections.dearGuests': 'Dear Guests',
      'sections.weddingDetails': 'Wedding Details',
      'sections.guestBook': 'Guest Book',
      
      // Countdown
      'countdown.days': 'DAYS',
      'countdown.hours': 'HOURS',
      'countdown.minutes': 'MINUTES',
      
      // Details
      'details.when': 'When',
      'details.where': 'Where',
      'details.showOnMap': 'Show on Map',
      'details.ceremonyBegins': 'Wedding ceremony begins',
      'details.dateTBD': 'Date TBD',
      
      // RSVP
      'rsvp.title': 'Please confirm your attendance',
      'rsvp.subtitle': 'We can\'t wait to celebrate with you!',
      
      // Guest Book
      'guestBook.subtitle': 'Leave us a message to make our day even more special',
      'guestBook.leaveMessage': 'Leave a Message',
      'guestBook.messages': 'Messages from Loved Ones',
      'guestBook.noMessages': 'No messages yet. Be the first!',
      'wedding.using': 'using LoveStory',
      'wedding.capturingJourney': 'Capturing our journey together',
      'wedding.cantWaitToCelebrate': 'We can\'t wait to celebrate with you!',
      'wedding.weddingDayIsHere': 'The Wedding Day is Here!',
      'wedding.beautifulMemories': 'Beautiful memories await',
      'wedding.countdown.days': 'DAYS',
      'wedding.countdown.hours': 'HOURS',
      'wedding.countdown.minutes': 'MINUTES',
      'wedding.countdown.seconds': 'SECONDS',
      'wedding.withLove': 'With love,',

      // RSVP Form
      'rsvp.guestName': 'Guest Name',
      'rsvp.email': 'Email Address',
      'rsvp.willYouAttend': 'Will you attend?',
      'rsvp.yesAttending': 'Yes, I\'ll be there',
      'rsvp.noAttending': 'No, I can\'t attend',
      'rsvp.submitRSVP': 'Submit RSVP',
      'rsvp.thankYou': 'Thank You!',
      'rsvp.confirmationSent': 'Confirmation sent',
      'rsvp.pleaseEnterName': 'Please enter your name',
      'rsvp.pleaseEnterEmail': 'Please enter your email',
      'rsvp.pleaseSelectAttendance': 'Please select attendance',
      'rsvp.submitting': 'Submitting...',

      // Management
      'manage.weddingDetails': 'Wedding Details',
      'manage.guestManagement': 'Guest Management',
      'manage.guestDashboard': 'Guest Dashboard',
      'manage.guestBook': 'Guest Book',
      'manage.photoManagement': 'Photo Management',

      // Admin
      'admin.dashboard': 'Dashboard',
      'admin.users': 'Users',
      'admin.weddings': 'Weddings',
      'admin.photos': 'Photos',
      'admin.settings': 'Settings',

      // Forms
      'form.name': 'Name',
      'form.email': 'Email',
      'form.message': 'Message',
      'form.submit': 'Submit',
      'form.cancel': 'Cancel',
      'form.save': 'Save',
      'form.edit': 'Edit',
      'form.delete': 'Delete',

      // Messages
      'message.success': 'Success!',
      'message.error': 'An error occurred',
      'message.loading': 'Loading...',
      'message.saving': 'Saving...',
      'message.deleting': 'Deleting...',

      // Photo editing
      'imageEdit.title': 'Edit Image',
      'imageEdit.crop': 'Crop',
      'imageEdit.resize': 'Resize',
      'imageEdit.filter': 'Filter',
      'imageEdit.brightness': 'Brightness',
      'imageEdit.contrast': 'Contrast',
      'imageEdit.saturation': 'Saturation',
      'imageEdit.reset': 'Reset',
      'imageEdit.apply': 'Apply',
      'imageEdit.upload': 'Upload',
      'imageEdit.backToEdit': 'Back to Edit',
      'imageEdit.uploading': 'Uploading...',
      'imageEdit.uploadPhoto': 'Upload Photo'
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
      'hero.subtitle': 'Поделитесь своей историей любви с красивым персонализированным свадебным сайтом. Управляйте RSVP, демонстрируйте фотографии и создавайте незабываемые воспоминания с вашими гостями.',
      'hero.startCreating': 'Начать создание',
      'hero.viewDemo': 'Посмотреть демо',
      'hero.freeTrial': '30-дневная бесплатная пробная версия',
      'hero.noCreditCard': 'Кредитная карта не требуется',
      'hero.joinOver': 'Присоединяйтесь к',
      'hero.happyCouples': 'счастливым парам',

      // Demo Section
      'demo.title': 'Увидьте, как ваш свадебный сайт оживает',
      'demo.subtitle': 'Посмотрите, как будет выглядеть ваш персонализированный свадебный сайт с помощью нашего интерактивного демо',
      'demo.ourStory': 'Наша история любви',
      'demo.ourMemories': 'Наши воспоминания',
      'demo.storyText': 'Мы встретились в дождливый вторник в нашем любимом кафе. То, что начиналось как случайная встреча, стало самой красивой историей любви, которую мы могли себе представить...',
      'demo.howWeMet': 'Как мы познакомились',
      'demo.howWeMetText': 'Каждая история любви особенная, и наша началась самым неожиданным образом...',

      // Wedding Site
      'wedding.dearGuests': 'Дорогие гости',
      'wedding.ourStory': 'Наша история любви',
      'wedding.rsvp': 'Пожалуйста, дайте нам знать, если вы будете присутствовать',
      'wedding.photos': 'Наши воспоминания',
      'wedding.guestBook': 'Гостевая книга',
      'wedding.weddingDetails': 'Детали свадьбы',
      'wedding.countdown': 'Обратный отсчет',
      'wedding.when': 'Когда',
      'wedding.where': 'Где',
      'wedding.venue': 'Место проведения свадьбы',
      'wedding.ceremonyTime': 'Церемония начинается в 16:00',
      'wedding.clickToViewLocation': 'Нажмите ниже, чтобы просмотреть местоположение',
      'wedding.viewOnMap': 'Посмотреть на карте',
      'wedding.guestBookSubtitle': 'Оставьте нам сообщение, чтобы сделать наш день еще более особенным',
      'wedding.messagesFromLovedOnes': 'Сообщения от наших близких',
      'wedding.thankYouGuests': 'Спасибо, что стали частью нашего особенного дня',
      'wedding.createdWith': 'Создано с помощью',
      
      // Navigation
      'nav.home': 'Главная',
      'nav.rsvp': 'RSVP',
      'nav.details': 'Детали',
      'nav.guestbook': 'Гостевая книга',
      
      // Sections
      'sections.dearGuests': 'Дорогие гости',
      'sections.weddingDetails': 'Детали свадьбы',
      'sections.guestBook': 'Гостевая книга',
      
      // Countdown
      'countdown.days': 'ДНИ',
      'countdown.hours': 'ЧАСЫ',
      'countdown.minutes': 'МИНУТЫ',
      
      // Details
      'details.when': 'Когда',
      'details.where': 'Где',
      'details.showOnMap': 'Показать на карте',
      'details.ceremonyBegins': 'Свадебная церемония начинается',
      'details.dateTBD': 'Дата уточняется',
      
      // RSVP
      'rsvp.title': 'Пожалуйста, подтвердите ваше присутствие',
      'rsvp.subtitle': 'Мы не можем дождаться, чтобы отпраздновать с вами!',
      
      // Guest Book
      'guestBook.subtitle': 'Оставьте нам сообщение, чтобы сделать наш день еще более особенным',
      'guestBook.leaveMessage': 'Оставить сообщение',
      'guestBook.messages': 'Сообщения от близких',
      'guestBook.noMessages': 'Пока нет сообщений. Будьте первыми!',
      'wedding.using': 'используя LoveStory',
      'wedding.capturingJourney': 'Запечатлевая наше путешествие вместе',
      'wedding.cantWaitToCelebrate': 'Мы не можем дождаться, чтобы отпраздновать с вами!',
      'wedding.weddingDayIsHere': 'День свадьбы настал!',
      'wedding.beautifulMemories': 'Прекрасные воспоминания ждут',
      'wedding.countdown.days': 'ДНИ',
      'wedding.countdown.hours': 'ЧАСЫ',
      'wedding.countdown.minutes': 'МИНУТЫ',
      'wedding.countdown.seconds': 'СЕКУНДЫ',
      'wedding.withLove': 'С любовью,',

      // RSVP Form
      'rsvp.guestName': 'Имя гостя',
      'rsvp.email': 'Адрес электронной почты',
      'rsvp.willYouAttend': 'Вы будете присутствовать?',
      'rsvp.yesAttending': 'Да, я буду',
      'rsvp.noAttending': 'Нет, я не смогу присутствовать',
      'rsvp.submitRSVP': 'Отправить RSVP',
      'rsvp.thankYou': 'Спасибо!',
      'rsvp.confirmationSent': 'Подтверждение отправлено',
      'rsvp.pleaseEnterName': 'Пожалуйста, введите ваше имя',
      'rsvp.pleaseEnterEmail': 'Пожалуйста, введите ваш email',
      'rsvp.pleaseSelectAttendance': 'Пожалуйста, выберите присутствие',
      'rsvp.submitting': 'Отправка...',

      // Management
      'manage.weddingDetails': 'Детали свадьбы',
      'manage.guestManagement': 'Управление гостями',
      'manage.guestDashboard': 'Панель гостей',
      'manage.guestBook': 'Гостевая книга',
      'manage.photoManagement': 'Управление фотографиями',

      // Admin
      'admin.dashboard': 'Панель управления',
      'admin.users': 'Пользователи',
      'admin.weddings': 'Свадьбы',
      'admin.photos': 'Фотографии',
      'admin.settings': 'Настройки',

      // Forms
      'form.name': 'Имя',
      'form.email': 'Email',
      'form.message': 'Сообщение',
      'form.submit': 'Отправить',
      'form.cancel': 'Отмена',
      'form.save': 'Сохранить',
      'form.edit': 'Редактировать',
      'form.delete': 'Удалить',

      // Messages
      'message.success': 'Успешно!',
      'message.error': 'Произошла ошибка',
      'message.loading': 'Загрузка...',
      'message.saving': 'Сохранение...',
      'message.deleting': 'Удаление...',

      // Photo editing
      'imageEdit.title': 'Редактировать изображение',
      'imageEdit.crop': 'Обрезать',
      'imageEdit.resize': 'Изменить размер',
      'imageEdit.filter': 'Фильтр',
      'imageEdit.brightness': 'Яркость',
      'imageEdit.contrast': 'Контраст',
      'imageEdit.saturation': 'Насыщенность',
      'imageEdit.reset': 'Сброс',
      'imageEdit.apply': 'Применить',
      'imageEdit.upload': 'Загрузить',
      'imageEdit.backToEdit': 'Вернуться к редактированию',
      'imageEdit.uploading': 'Загрузка...',
      'imageEdit.uploadPhoto': 'Загрузить фото'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'uz',
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Save language to localStorage when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;