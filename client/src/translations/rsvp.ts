// RSVP translations for different languages
export const rsvpTranslations = {
  en: {
    title: "Please confirm your attendance",
    confirmationTitle: "Confirmation",
    guestName: "Guest Name",
    attendanceQuestion: "Will you be attending?",
    options: {
      yes: "Yes, I will attend",
      withPartner: "I will attend with my spouse/partner",
      no: "Unfortunately, I cannot attend",
      maybe: "Not sure yet"
    }
  },
  uz: {
    title: "Iltimos, qatnashishingizni bildiring",
    confirmationTitle: "Tasdiqlash",
    guestName: "Mehmonning ismi",
    attendanceQuestion: "Qatnashasizmi?",
    options: {
      yes: "Ha, men boraman",
      withPartner: "Turmush o'rtog'im bilan boraman",
      no: "Afsuski, kela olmayman",
      maybe: "Hali bilmayman"
    }
  },
  ru: {
    title: "Пожалуйста, подтвердите своё участие",
    confirmationTitle: "Подтверждение",
    guestName: "Имя гостя",
    attendanceQuestion: "Вы будете участвовать?",
    options: {
      yes: "Да, я приду",
      withPartner: "Я приду с супругом/супругой",
      no: "К сожалению, не смогу прийти",
      maybe: "Пока не уверен(а)"
    }
  },
  kk: {
    title: "Қатысатыныңызды растауыңызды сұраймыз",
    confirmationTitle: "Растау",
    guestName: "Қонақтың аты-жөні",
    attendanceQuestion: "Сіз қатысасыз ба?",
    options: {
      yes: "Иә, мен барамын",
      withPartner: "Жұбайыммен бірге барамын",
      no: "Өкінішке орай, бара алмаймын",
      maybe: "Әлі нақты емес"
    }
  },
  kaa: {
    title: "Iltipar, qatnasıwıńızdı rastlań",
    confirmationTitle: "Rastlaw",
    guestName: "Mehmán atı-jóni",
    attendanceQuestion: "Qatnasasız ba?",
    options: {
      yes: "Hám, men baraman",
      withPartner: "Qurbyım menen baraman",
      no: "Áfsúski, bara almaýman",
      maybe: "Áli anıq emes"
    }
  }
};

export function getRsvpTranslation(language: string) {
  return rsvpTranslations[language as keyof typeof rsvpTranslations] || rsvpTranslations.en;
}