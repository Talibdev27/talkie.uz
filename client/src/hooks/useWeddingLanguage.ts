import { useState, useEffect } from 'react';
import type { Wedding } from '@shared/schema';

type TranslationKeys = {
  welcome_guests: string;
  wedding_details: string;
  couple_names: string;
  wedding_time: string;
  wedding_venue: string;
  open_map: string;
  photo_gallery: string;
  confirmation: string;
  guest_book: string;
  your_name: string;
  your_message: string;
  submit: string;
  submitting: string;
  loading: string;
  error: string;
  // Welcome message translations
  welcome_message_line1: string;
  welcome_message_line2: string;
  // RSVP form translations
  please_confirm_attendance: string;
  guest_name: string;
  will_you_attend: string;
  yes_will_attend: string;
  attend_with_spouse: string;
  cannot_attend: string;
  not_sure_yet: string;
  message_optional: string;
  confirmation_button: string;
  // Time connectors
  time_at: string;
  and_connector: string;
};

interface LanguageTranslations {
  [key: string]: TranslationKeys;
}

const translations: LanguageTranslations = {
  uz: {
    welcome_guests: "Aziz mehmonlar!",
    wedding_details: "To'y haqida",
    couple_names: "To'y egalari:",
    wedding_time: "Bayramni boshlash vaqti:",
    wedding_venue: "To'y manzili:",
    open_map: "Karta orqali ochish",
    photo_gallery: "Fotoalbom",
    confirmation: "Tasdiqlash",
    guest_book: "Mehmonlar kitobi",
    your_name: "Ismingiz",
    your_message: "Xabaringiz",
    submit: "Yuborish",
    submitting: "Yuborilmoqda...",
    loading: "Yuklanmoqda...",
    error: "Xatolik",
    welcome_message_line1: "Sizni nikoh to'yiga taklif qilamiz...",
    welcome_message_line2: "Qalblar ezguliklarga to'la bo'lgan ushbu qutlug' kunda do'stlar yonida bo'ling!",
    please_confirm_attendance: "Iltimos, kelishingizni tasdiqlang",
    guest_name: "Mehmon ismi",
    will_you_attend: "Kelasizmi?",
    yes_will_attend: "Ha, kelaman",
    attend_with_spouse: "Turmush o'rtog'im bilan kelaman",
    cannot_attend: "Afsuski, kela olmayman",
    not_sure_yet: "Hali aniq emas",
    message_optional: "Xabar (ixtiyoriy)",
    confirmation_button: "Tasdiqlash",
    time_at: "soat",
    and_connector: "va"
  },
  ru: {
    welcome_guests: "Дорогие гости!",
    wedding_details: "О свадьбе",
    couple_names: "Молодожены:",
    wedding_time: "Время начала торжества:",
    wedding_venue: "Место проведения:",
    open_map: "Открыть карту",
    photo_gallery: "Фотогалерея",
    confirmation: "Подтверждение",
    guest_book: "Книга гостей",
    your_name: "Ваше имя",
    your_message: "Ваше сообщение",
    submit: "Отправить",
    submitting: "Отправляется...",
    loading: "Загрузка...",
    error: "Ошибка",
    welcome_message_line1: "Приглашаем вас на нашу свадьбу...",
    welcome_message_line2: "Будьте с нами в этот радостный день, наполненный любовью и счастьем!",
    please_confirm_attendance: "Пожалуйста, подтвердите своё участие",
    guest_name: "Имя гостя",
    will_you_attend: "Будете ли вы присутствовать?",
    yes_will_attend: "Да, буду присутствовать",
    attend_with_spouse: "Буду присутствовать с супругом/партнером",
    cannot_attend: "К сожалению, не смогу присутствовать",
    not_sure_yet: "Пока не уверен",
    message_optional: "Сообщение (необязательно)",
    confirmation_button: "Подтверждение",
    time_at: "время",
    and_connector: "и"
  },
  kz: {
    welcome_guests: "Құрметті қонақтар!",
    wedding_details: "Той туралы",
    couple_names: "Той иелері:",
    wedding_time: "Мереке басталу уақыты:",
    wedding_venue: "Той мекенжайы:",
    open_map: "Картадан көру",
    photo_gallery: "Фотогалерея",
    confirmation: "Растау",
    guest_book: "Қонақтар кітабы",
    your_name: "Сіздің атыңыз",
    your_message: "Сіздің хабарыңыз",
    submit: "Жіберу",
    submitting: "Жіберілуде...",
    loading: "Жүктелуде...",
    error: "Қате",
    welcome_message_line1: "Сізді біздің үйлену тойымызға шақырамыз...",
    welcome_message_line2: "Жүректер махаббат пен бақытқа толы осы қуанышты күнде бізбен бірге болыңыз!",
    please_confirm_attendance: "Өтінеміз, қатысуыңызды растаңыз",
    guest_name: "Қонақ аты",
    will_you_attend: "Қатысасыз ба?",
    yes_will_attend: "Иә, қатысамын",
    attend_with_spouse: "Жұбайыммен/серіктесіммен қатысамын",
    cannot_attend: "Өкінішке орай, қатыса алмаймын",
    not_sure_yet: "Әзірше белгісіз",
    message_optional: "Хабарлама (міндетті емес)",
    confirmation_button: "Растау",
    time_at: "уақыт",
    and_connector: "және"
  },
  kaa: {
    welcome_guests: "Aziz qonaqlar!",
    wedding_details: "Toy haqında",
    couple_names: "Toy iyeleri:",
    wedding_time: "Bayram baslaw waqtı:",
    wedding_venue: "Toy mekeni:",
    open_map: "Kartadan kóriw",
    photo_gallery: "Fotoalbom",
    confirmation: "Tastıyıqlaw",
    guest_book: "Qonaqlar kitabı",
    your_name: "Sіzdіñ atıñız",
    your_message: "Sіzdіñ habarıñız",
    submit: "Jiberіw",
    submitting: "Jiberіlіp jatır...",
    loading: "Júktelіp jatır...",
    error: "Qáte",
    welcome_message_line1: "Sizdi nikah toyıña shaqıramız...",
    welcome_message_line2: "Júrekler súyіspenshіlіk hám baqıtqa tolı ushbul quwanıshtı kúnde bizben bіrge bolıñ!",
    please_confirm_attendance: "Ótinemiz, qatısıwıñızdı tastıyıqlañ",
    guest_name: "Qonaq atı",
    will_you_attend: "Qatısasız ba?",
    yes_will_attend: "Awa, qatısaman",
    attend_with_spouse: "Júbayım/sherіktesіm menen qatısaman",
    cannot_attend: "Ókіnіshke oray, qatısa almayman",
    not_sure_yet: "Házirshе belgіsіz",
    message_optional: "Habar (míndetti emes)",
    confirmation_button: "Tastıyıqlaw",
    time_at: "waqıt",
    and_connector: "hám"
  }
};

export function useWeddingLanguage(wedding?: Wedding) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('uz');

  useEffect(() => {
    if (wedding?.defaultLanguage) {
      setCurrentLanguage(wedding.defaultLanguage);
    }
  }, [wedding?.defaultLanguage]);

  const t = (key: keyof TranslationKeys): string => {
    return translations[currentLanguage]?.[key] || translations['uz'][key] || key;
  };

  const availableLanguages = wedding?.availableLanguages || ['uz'];

  const changeLanguage = async (newLanguage: string) => {
    if (availableLanguages.includes(newLanguage)) {
      setCurrentLanguage(newLanguage);
      
      // Update wedding language settings if we have wedding ID
      if (wedding?.id) {
        try {
          await fetch(`/api/weddings/${wedding.id}/languages`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              defaultLanguage: newLanguage,
              availableLanguages: availableLanguages
            }),
          });
        } catch (error) {
          console.error('Failed to update language settings:', error);
        }
      }
    }
  };

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    t
  };
}