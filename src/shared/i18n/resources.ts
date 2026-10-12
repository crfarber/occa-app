/**
 * All user-facing text. Dutch is the source; English must have exactly the same keys and the
 * same {{placeholders}} (checked by `i18n.test.ts`). Keys are typed: `t('unknown.key')` does not
 * compile.
 */
export const nl = {
  common: {
    yes: 'Ja',
    no: 'Nee',
    loading: 'Laden…',
    retry: 'Opnieuw proberen',
    cancel: 'Annuleren',
    back: 'Terug',
    ok: 'OK',
    signOut: 'Uitloggen',
    close: 'Sluiten',
    somethingWrong: 'Er is iets misgegaan.',
    offline: 'Geen verbinding. Probeer het later opnieuw.',
  },
  feedback: {
    takingLonger: 'Dit duurt langer dan verwacht…',
    processing: {
      signOut: 'Uitloggen…',
    },
  },
  login: {
    subtitle: 'Log in om verder te gaan.',
    signIn: 'Inloggen',
    demoHint: 'Demo-modus: je logt in zonder account. Kies een echte login vóór een release.',
    version: 'Versie {{version}}',
    sessionExpired: 'Je sessie is verlopen. Log opnieuw in.',
    method: {
      demo: 'demo',
      'azure-ad': 'Azure AD',
    },
    errors: {
      unavailable: 'Inloggen is niet beschikbaar in deze versie van de app.',
      failed: 'Het lukte niet. Probeer het opnieuw.',
    },
  },
  home: {
    title: 'Home',
    start: {
      title: 'Kleding scannen',
      body: 'Maak een foto van een item. De herkenning gebeurt op je telefoon, zonder server.',
      action: 'Start met scannen',
    },
    tabs: {
      scanned: 'Gescand',
    },
    empty: 'Nog niets gescand. Start met een foto.',
    complete: 'Tik om de productgegevens aan te vullen.',
  },
  listing: {
    title: 'Productgegevens',
    hint: 'Dit vul je zelf in. De foto levert het niet.',
    recognition: 'Herkenning: {{category}} ({{score}}%)',
    recognitionUnknown: 'Herkenning: onzeker',
    section: 'Voor de website',
    missing: 'Dit item is er niet meer.',
    brand: 'Merk',
    price: 'Prijs',
    description: 'Omschrijving',
    category: 'Categorie',
    subcategory: 'Subcategorie',
    color: 'Kleur',
    audience: 'Voor wie',
    size: 'Maat',
    shopSpot: 'Plek in de winkel',
    number: 'Nummer',
  },
  capture: {
    title: 'Kleding herkennen',
    hint: 'Plaats het kledingstuk in het kader. Dat vlak bepaalt de herkenning en de dominante kleur.',
    frameLabel: 'Dominante kleur',
    alignHint: 'Knijp om te zoomen en sleep tot het kledingstuk in het kader past.',
    alignConfirm: 'Gebruik dit kader',
    takePhoto: 'Foto maken',
    pickPhoto: 'Kies foto',
    addPhoto: 'Foto toevoegen',
    cancelAdd: 'Terug naar concept',
    photos: 'Foto’s (max. {{max}})',
    photoRole: {
      title: 'Soort foto',
      overview: 'Overzicht kledingstuk',
      label: 'Label / detail',
    },
    again: 'Opnieuw',
    save: 'Opslaan',
    choose: 'Kies…',
    clearChoice: 'Geen keuze',
    classifying: 'Bezig met herkennen…',
    draft: {
      title: 'Controleren en opslaan',
      colors: 'Kleur',
      colorsEmpty: 'Geen kleur gevonden',
      pattern: 'Patroon',
      subtype: 'Subtype',
      category: 'Categorie',
    },
    pattern: {
      gestreept: 'Gestreept',
      geruit: 'Geruit',
      bloemen: 'Bloemen',
      print: 'Print',
      dessin: 'Dessin',
      effen: 'Effen',
      anders: 'Anders',
    },
    rawLabels: 'Ruwe labels van ML Kit',
    noLabels: 'Geen labels gevonden.',
    labelRow: '{{text}} ({{score}}%)',
    score: 'Zekerheid {{score}}%',
    goHome: 'Naar home',
    permission: {
      allow: 'Camera toestaan',
      denied:
        'Zonder camera kun je geen foto maken. Kies een foto uit je bibliotheek, of geef toestemming.',
    },
    category: {
      top: 'Shirt',
      broek: 'Broek',
      schoenen: 'Schoenen',
      tas: 'Tas',
      jas: 'Jas',
      rok: 'Rok',
      jurk: 'Jurk',
      trui_vest: 'Trui / vest',
      unknown: 'Onzeker',
    },
    errors: {
      capture: 'Het lukte niet om een foto te maken.',
      classify: 'Het lukte niet om de foto te herkennen.',
      crop: 'Het lukte niet om de foto bij te snijden.',
    },
  },
  settings: {
    open: 'Instellingen',
    title: 'Instellingen',
    section: {
      general: 'Algemeen',
    },
    language: {
      title: 'Taal',
      hint: 'Kies de taal van de app. De keuze blijft bewaard.',
      nl: 'Nederlands',
      en: 'Engels',
    },
  },
} as const;

type Widen<T> = T extends string ? string : { [Key in keyof T]: Widen<T[Key]> };

/** The shape of a language file: same keys as Dutch, any text. */
export type Translations = Widen<typeof nl>;

export const en: Translations = {
  common: {
    yes: 'Yes',
    no: 'No',
    loading: 'Loading…',
    retry: 'Try again',
    cancel: 'Cancel',
    back: 'Back',
    ok: 'OK',
    signOut: 'Sign out',
    close: 'Close',
    somethingWrong: 'Something went wrong.',
    offline: 'No connection. Please try again later.',
  },
  feedback: {
    takingLonger: 'This is taking longer than expected…',
    processing: {
      signOut: 'Signing out…',
    },
  },
  login: {
    subtitle: 'Sign in to continue.',
    signIn: 'Sign in',
    demoHint: 'Demo mode: you sign in without an account. Choose a real sign-in before a release.',
    version: 'Version {{version}}',
    sessionExpired: 'Your session has expired. Please sign in again.',
    method: {
      demo: 'demo',
      'azure-ad': 'Azure AD',
    },
    errors: {
      unavailable: 'Signing in is not available in this version of the app.',
      failed: 'That did not work. Please try again.',
    },
  },
  home: {
    title: 'Home',
    start: {
      title: 'Scan clothing',
      body: 'Take a photo of an item. Recognition runs on your phone, with no server.',
      action: 'Start scanning',
    },
    tabs: {
      scanned: 'Scanned',
    },
    empty: 'Nothing scanned yet. Start with a photo.',
    complete: 'Tap to fill in the product details.',
  },
  listing: {
    title: 'Product details',
    hint: 'You fill this in yourself. The photo does not provide it.',
    recognition: 'Recognition: {{category}} ({{score}}%)',
    recognitionUnknown: 'Recognition: uncertain',
    section: 'For the website',
    missing: 'This item is no longer here.',
    brand: 'Brand',
    price: 'Price',
    description: 'Description',
    category: 'Category',
    subcategory: 'Subcategory',
    color: 'Colour',
    audience: 'Who it is for',
    size: 'Size',
    shopSpot: 'Place in the shop',
    number: 'Number',
  },
  capture: {
    title: 'Recognise clothing',
    hint: 'Place the garment in the frame. That area drives recognition and the dominant colour.',
    frameLabel: 'Dominant colour',
    alignHint: 'Pinch to zoom and drag until the garment fits the frame.',
    alignConfirm: 'Use this frame',
    takePhoto: 'Take photo',
    pickPhoto: 'Choose photo',
    addPhoto: 'Add photo',
    cancelAdd: 'Back to draft',
    photos: 'Photos (max. {{max}})',
    photoRole: {
      title: 'Photo type',
      overview: 'Garment overview',
      label: 'Label / detail',
    },
    again: 'Again',
    save: 'Save',
    choose: 'Choose…',
    clearChoice: 'No selection',
    classifying: 'Recognising…',
    draft: {
      title: 'Review and save',
      colors: 'Colour',
      colorsEmpty: 'No colour found',
      pattern: 'Pattern',
      subtype: 'Subtype',
      category: 'Category',
    },
    pattern: {
      gestreept: 'Striped',
      geruit: 'Checked',
      bloemen: 'Floral',
      print: 'Print',
      dessin: 'Patterned',
      effen: 'Solid',
      anders: 'Other',
    },
    rawLabels: 'Raw ML Kit labels',
    noLabels: 'No labels found.',
    labelRow: '{{text}} ({{score}}%)',
    score: 'Confidence {{score}}%',
    goHome: 'Go to home',
    permission: {
      allow: 'Allow camera',
      denied:
        'Without the camera you cannot take a photo. Pick one from your library, or grant permission.',
    },
    category: {
      top: 'Shirt',
      broek: 'Trousers',
      schoenen: 'Shoes',
      tas: 'Bag',
      jas: 'Jacket',
      rok: 'Skirt',
      jurk: 'Dress',
      trui_vest: 'Sweater / cardigan',
      unknown: 'Uncertain',
    },
    errors: {
      capture: 'Taking a photo failed.',
      classify: 'Recognising the photo failed.',
      crop: 'Cropping the photo failed.',
    },
  },
  settings: {
    open: 'Settings',
    title: 'Settings',
    section: {
      general: 'General',
    },
    language: {
      title: 'Language',
      hint: 'Choose the app language. The choice is kept.',
      nl: 'Dutch',
      en: 'English',
    },
  },
};

export const LANGUAGES = ['nl', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const resources = {
  nl: { translation: nl },
  en: { translation: en },
} as const;
