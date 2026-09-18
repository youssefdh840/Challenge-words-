import { CountryInfo } from '../types';

export const COUNTRIES: Record<string, CountryInfo> = {
  TN: {
    code: 'TN',
    name: 'Tunisia',
    flag: '🇹🇳',
    capital: 'Tunis',
    continent: 'Africa',
    primaryLanguage: 'Arabic (Tunisian Derja)',
    nativeGreeting: 'عسلامة (Aslema)',
    greetingPhonetic: 'Ah-sleh-mah',
    speechLang: 'ar-TN',
    culturalHighlight: 'Ancient Carthage ruins, Medina of Tunis & desert starscapes of Matmata',
    cuisine: 'Couscous au mérou & Spicy Harissa',
    famousLandmark: 'Amphitheatre of El Jem',
    soundMelody: [
      { freq: 293.66, duration: 250 }, // D4
      { freq: 311.13, duration: 250 }, // Eb4 (Maqam Hijaz flavor)
      { freq: 369.99, duration: 350 }, // F#4
      { freq: 392.0, duration: 400 },  // G4
      { freq: 369.99, duration: 250 }, // F#4
      { freq: 311.13, duration: 300 }, // Eb4
      { freq: 293.66, duration: 600 }, // D4
    ],
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    capital: 'Paris',
    continent: 'Europe',
    primaryLanguage: 'French',
    nativeGreeting: 'Bonjour !',
    greetingPhonetic: 'Bon-zhoor',
    speechLang: 'fr-FR',
    culturalHighlight: 'The Enlightenment, haute couture, Impressionist art and the Louvre',
    cuisine: 'Bouillabaisse & Croissant au beurre',
    famousLandmark: 'Eiffel Tower & Mont Saint-Michel',
    soundMelody: [
      { freq: 392.0, duration: 200 }, // G4 Musette accordion waltz
      { freq: 440.0, duration: 200 }, // A4
      { freq: 493.88, duration: 350 }, // B4
      { freq: 523.25, duration: 250 }, // C5
      { freq: 493.88, duration: 250 }, // B4
      { freq: 440.0, duration: 200 },  // A4
      { freq: 392.0, duration: 500 },  // G4
    ],
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    capital: 'Tokyo',
    continent: 'Asia',
    primaryLanguage: 'Japanese',
    nativeGreeting: 'こんにちは (Konnichiwa)',
    greetingPhonetic: 'Kohn-nee-chee-wah',
    speechLang: 'ja-JP',
    culturalHighlight: 'Shinto shrines, traditional tea ceremony, cherry blossoms & high technology',
    cuisine: 'Traditional Ramen & Kaiseki',
    famousLandmark: 'Mount Fuji & Fushimi Inari Shrine',
    soundMelody: [
      { freq: 440.0, duration: 300 }, // A4 (Sakura in-sen scale)
      { freq: 466.16, duration: 300 }, // Bb4
      { freq: 587.33, duration: 400 }, // D5
      { freq: 523.25, duration: 300 }, // C5
      { freq: 466.16, duration: 300 }, // Bb4
      { freq: 440.0, duration: 600 },  // A4
    ],
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    capital: 'Brasília',
    continent: 'Americas',
    primaryLanguage: 'Portuguese',
    nativeGreeting: 'Olá! Tudo bem?',
    greetingPhonetic: 'Oh-lah, too-doo baym?',
    speechLang: 'pt-BR',
    culturalHighlight: 'Carnaval in Rio, Amazon rainforest biodiversity, Capoeira & Bossa Nova',
    cuisine: 'Feijoada Completa & Pão de Queijo',
    famousLandmark: 'Christ the Redeemer & Iguazu Falls',
    soundMelody: [
      { freq: 329.63, duration: 200 }, // E4 (Samba syncopation)
      { freq: 392.0, duration: 250 },  // G4
      { freq: 440.0, duration: 200 },  // A4
      { freq: 493.88, duration: 350 }, // B4
      { freq: 440.0, duration: 200 },  // A4
      { freq: 392.0, duration: 250 },  // G4
      { freq: 329.63, duration: 500 }, // E4
    ],
  },
  SN: {
    code: 'SN',
    name: 'Senegal',
    flag: '🇸🇳',
    capital: 'Dakar',
    continent: 'Africa',
    primaryLanguage: 'Wolof & French',
    nativeGreeting: 'Nanga def? (Naan-gah def)',
    greetingPhonetic: 'Naan-gah def',
    speechLang: 'fr-SN',
    culturalHighlight: 'The spirit of Teranga (hospitality), Sabar polyrhythms, and Gorée Island history',
    cuisine: 'Thiéboudienne (National Fish & Rice dish)',
    famousLandmark: 'African Renaissance Monument',
    soundMelody: [
      { freq: 349.23, duration: 200 }, // F4 (Kora style)
      { freq: 392.0, duration: 200 },  // G4
      { freq: 440.0, duration: 300 },  // A4
      { freq: 523.25, duration: 300 }, // C5
      { freq: 440.0, duration: 200 },  // A4
      { freq: 349.23, duration: 500 }, // F4
    ],
  },
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    capital: 'New Delhi',
    continent: 'Asia',
    primaryLanguage: 'Hindi & English',
    nativeGreeting: 'नमस्ते (Namaste)',
    greetingPhonetic: 'Nah-mas-tay',
    speechLang: 'hi-IN',
    culturalHighlight: 'Ancient Vedic traditions, vibrant Holi & Diwali festivals, and Classical Ragas',
    cuisine: 'Fragrant Dum Biryani & Butter Chicken',
    famousLandmark: 'Taj Mahal in Agra',
    soundMelody: [
      { freq: 261.63, duration: 300 }, // C4 (Raga Yaman)
      { freq: 293.66, duration: 300 }, // D4
      { freq: 329.63, duration: 350 }, // E4
      { freq: 369.99, duration: 350 }, // F#4
      { freq: 392.0, duration: 400 },  // G4
      { freq: 440.0, duration: 350 },  // A4
      { freq: 493.88, duration: 300 }, // B4
      { freq: 523.25, duration: 600 }, // C5
    ],
  },
  MX: {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    capital: 'Mexico City',
    continent: 'Americas',
    primaryLanguage: 'Spanish',
    nativeGreeting: '¡Hola! ¿Qué onda?',
    greetingPhonetic: 'Oh-lah, kay ohn-dah',
    speechLang: 'es-MX',
    culturalHighlight: 'Mesoamerican Maya & Aztec pyramids, Día de los Muertos, Mariachi music',
    cuisine: 'Tacos al Pastor & Mole Poblano',
    famousLandmark: 'Chichen Itza & Teotihuacan',
    soundMelody: [
      { freq: 392.0, duration: 200 }, // G4 Mariachi trumpet flourish
      { freq: 523.25, duration: 250 }, // C5
      { freq: 659.25, duration: 350 }, // E5
      { freq: 587.33, duration: 250 }, // D5
      { freq: 523.25, duration: 500 }, // C5
    ],
  },
  EG: {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    capital: 'Cairo',
    continent: 'Africa',
    primaryLanguage: 'Arabic',
    nativeGreeting: 'أهلاً وسهلاً (Ahlan wa Sahlan)',
    greetingPhonetic: 'Ah-lan wah sah-lan',
    speechLang: 'ar-EG',
    culturalHighlight: '5,000 years of Pharaonic civilization along the Nile river valley',
    cuisine: 'Koshary & Ful Medames',
    famousLandmark: 'Great Pyramids of Giza & Sphinx',
    soundMelody: [
      { freq: 293.66, duration: 300 }, // D4
      { freq: 311.13, duration: 300 }, // Eb4
      { freq: 369.99, duration: 400 }, // F#4 (Oud Phrygian Dominant)
      { freq: 392.0, duration: 350 },  // G4
      { freq: 440.0, duration: 300 },  // A4
      { freq: 369.99, duration: 300 }, // F#4
      { freq: 293.66, duration: 600 }, // D4
    ],
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    capital: 'Rome',
    continent: 'Europe',
    primaryLanguage: 'Italian',
    nativeGreeting: 'Ciao! Benvenuto!',
    greetingPhonetic: 'Chao, ben-veh-noo-to',
    speechLang: 'it-IT',
    culturalHighlight: 'Roman Empire monuments, Renaissance masterpieces, opera and fashion',
    cuisine: 'Neapolitan Pizza & Fresh Tagliatelle al Ragù',
    famousLandmark: 'Colosseum & Leaning Tower of Pisa',
    soundMelody: [
      { freq: 329.63, duration: 250 }, // E4 Mandolin Tarantella
      { freq: 392.0, duration: 250 },  // G4
      { freq: 523.25, duration: 300 }, // C5
      { freq: 493.88, duration: 250 }, // B4
      { freq: 440.0, duration: 250 },  // A4
      { freq: 392.0, duration: 500 },  // G4
    ],
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    capital: 'Ottawa',
    continent: 'Americas',
    primaryLanguage: 'English & French',
    nativeGreeting: 'Hello / Bonjour!',
    greetingPhonetic: 'Heh-loh, bon-zhoor',
    speechLang: 'en-CA',
    culturalHighlight: 'Rocky Mountain landscapes, maple syrup heritage, and Indigenous First Nations art',
    cuisine: 'Poutine with Quebec cheese curds & Tourtière',
    famousLandmark: 'Niagara Falls & Banff National Park',
    soundMelody: [
      { freq: 261.63, duration: 300 }, // C4
      { freq: 329.63, duration: 300 }, // E4
      { freq: 392.0, duration: 400 },  // G4
      { freq: 523.25, duration: 500 }, // C5
    ],
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    capital: 'Canberra',
    continent: 'Oceania',
    primaryLanguage: 'English',
    nativeGreeting: "G'day mate!",
    greetingPhonetic: 'Geh-day mayt',
    speechLang: 'en-AU',
    culturalHighlight: 'Indigenous Dreamtime storytelling, Great Barrier Reef marine wonders & Outback',
    cuisine: 'Meat Pie & Pavlova with kiwi fruit',
    famousLandmark: 'Sydney Opera House & Uluru',
    soundMelody: [
      { freq: 196.0, duration: 400 },  // G3 Didgeridoo drone resonance
      { freq: 220.0, duration: 300 },  // A3
      { freq: 261.63, duration: 350 }, // C4
      { freq: 196.0, duration: 600 },  // G3
    ],
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    capital: 'Seoul',
    continent: 'Asia',
    primaryLanguage: 'Korean',
    nativeGreeting: '안녕하세요 (Annyeonghaseyo)',
    greetingPhonetic: 'Ahn-nyung-hah-say-yoh',
    speechLang: 'ko-KR',
    culturalHighlight: 'Joseon palaces, K-Wave pop culture, Hanbok dress and cutting-edge robotics',
    cuisine: 'Kimchi Jjigae, Bibimbap & Korean BBQ',
    famousLandmark: 'Gyeongbokgung Palace & N Seoul Tower',
    soundMelody: [
      { freq: 329.63, duration: 300 }, // E4 (Arirang pentatonic)
      { freq: 392.0, duration: 300 },  // G4
      { freq: 440.0, duration: 400 },  // A4
      { freq: 523.25, duration: 400 }, // C5
      { freq: 440.0, duration: 300 },  // A4
      { freq: 392.0, duration: 500 },  // G4
    ],
  },
  MA: {
    code: 'MA',
    name: 'Morocco',
    flag: '🇲🇦',
    capital: 'Rabat',
    continent: 'Africa',
    primaryLanguage: 'Arabic & Amazigh',
    nativeGreeting: 'سلام عليكم (Salam Alaykum)',
    greetingPhonetic: 'Sah-laam ah-lay-koom',
    speechLang: 'ar-MA',
    culturalHighlight: 'Blue city of Chefchaouen, bustling souks of Marrakech & Gnawa music',
    cuisine: 'Slow-cooked Lamb Tagine with prunes & Pastilla',
    famousLandmark: 'Hassan II Mosque in Casablanca',
    soundMelody: [
      { freq: 293.66, duration: 250 },
      { freq: 329.63, duration: 250 },
      { freq: 369.99, duration: 300 },
      { freq: 392.0, duration: 350 },
      { freq: 369.99, duration: 250 },
      { freq: 293.66, duration: 550 },
    ],
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    capital: 'Berlin',
    continent: 'Europe',
    primaryLanguage: 'German',
    nativeGreeting: 'Guten Tag!',
    greetingPhonetic: 'Goo-ten Tahk',
    speechLang: 'de-DE',
    culturalHighlight: 'Classical symphonies of Bach & Beethoven, Bauhaus design, Black Forest folklore',
    cuisine: 'Sauerbraten, Bratwurst & Warm Pretzels',
    famousLandmark: 'Brandenburg Gate & Neuschwanstein Castle',
    soundMelody: [
      { freq: 261.63, duration: 300 }, // Ode to Joy
      { freq: 261.63, duration: 300 },
      { freq: 293.66, duration: 300 },
      { freq: 329.63, duration: 300 },
      { freq: 329.63, duration: 300 },
      { freq: 293.66, duration: 300 },
      { freq: 261.63, duration: 500 },
    ],
  },
  AR: {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    capital: 'Buenos Aires',
    continent: 'Americas',
    primaryLanguage: 'Spanish',
    nativeGreeting: '¡Hola, che! ¿Cómo andás?',
    greetingPhonetic: 'Oh-lah chay, koh-moh ahn-dahs',
    speechLang: 'es-AR',
    culturalHighlight: 'Passionate Argentine Tango, Gaucho cowboy lore across the Pampas, and football heritage',
    cuisine: 'Asado Criollo barbecue & Dulce de Leche Empanadas',
    famousLandmark: 'Perito Moreno Glacier & Plaza de Mayo',
    soundMelody: [
      { freq: 220.0, duration: 250 }, // Tango bandoneon motif
      { freq: 246.94, duration: 250 },
      { freq: 261.63, duration: 350 },
      { freq: 329.63, duration: 400 },
      { freq: 311.13, duration: 250 },
      { freq: 293.66, duration: 600 },
    ],
  },
  GR: {
    code: 'GR',
    name: 'Greece',
    flag: '🇬🇷',
    capital: 'Athens',
    continent: 'Europe',
    primaryLanguage: 'Greek',
    nativeGreeting: 'Γεια σας! (Yia sas!)',
    greetingPhonetic: 'Yah sahs',
    speechLang: 'el-GR',
    culturalHighlight: 'Cradle of Western democracy, classical philosophy, Olympic games and Aegean islands',
    cuisine: 'Moussaka with eggplant & Fresh Greek Salad with Feta',
    famousLandmark: 'Acropolis of Athens & Parthenon',
    soundMelody: [
      { freq: 293.66, duration: 200 }, // Zorba / Bouzouki rhythm
      { freq: 329.63, duration: 200 },
      { freq: 369.99, duration: 250 },
      { freq: 392.0, duration: 300 },
      { freq: 440.0, duration: 300 },
      { freq: 392.0, duration: 200 },
      { freq: 293.66, duration: 500 },
    ],
  }
};

export const COUNTRIES_LIST = Object.values(COUNTRIES);
