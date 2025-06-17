import { useState, useEffect } from 'react';
import type { Wedding } from '@shared/schema';

interface LanguageTranslations {
  [key: string]: {
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
  };
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
    error: "Xatolik"
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
    error: "Ошибка"
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
    error: "Қате"
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
    error: "Qáte"
  }
};

export function useWeddingLanguage(wedding?: Wedding) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('uz');

  useEffect(() => {
    if (wedding?.defaultLanguage) {
      setCurrentLanguage(wedding.defaultLanguage);
    }
  }, [wedding?.defaultLanguage]);

  const t = (key: string): string => {
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