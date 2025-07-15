// Mock data for the SPSS consulting platform

export const mockServices = [
  {
    id: 1,
    title: "Analiza Statistikore në SPSS",
    description: "Analizë e plotë e të dhënave tuaja me mjete të avancuara statistikore në SPSS.",
    icon: "BarChart3",
    price: "€50-200",
    duration: "2-5 ditë",
    features: [
      "Analiza deskriptive",
      "Teste hipotezash",
      "Analiza regresioni",
      "Analiza ANOVA",
      "Raport i detajuar me interpretim"
    ]
  },
  {
    id: 2,
    title: "Konsulencë 1-në-1",
    description: "Seancë konsultimi personale me ekspertë statistikorë për projektin tuaj.",
    icon: "Users",
    price: "€30/orë",
    duration: "1-2 orë",
    features: [
      "Konsultim i personalizuar",
      "Zgjidhja e problemeve specifike",
      "Udhëzime hap pas hapi",
      "Mbështetje e vazhdueshme",
      "Materiale të përshtatura"
    ]
  },
  {
    id: 3,
    title: "Interpretim Rezultatesh",
    description: "Interpretim profesional i rezultateve statistikore për publikim akademik.",
    icon: "FileText",
    price: "€40-120",
    duration: "1-3 ditë",
    features: [
      "Interpretim i detajuar",
      "Përgatitje për publikim",
      "Grafika dhe tabela",
      "Rekomandime për përmirësim",
      "Verifikim cilësie"
    ]
  },
  {
    id: 4,
    title: "Projektim Studimi",
    description: "Projektim dhe planifikim i studimeve kërkimore me metodologji të qëndrueshme.",
    icon: "PenTool",
    price: "€80-300",
    duration: "3-7 ditë",
    features: [
      "Projektim metodologjik",
      "Përllogaritje madhësie kampioni",
      "Përzgjedhje metodash statistikore",
      "Plan analitik",
      "Protokoll studimi"
    ]
  }
];

export const mockTrainingPrograms = [
  {
    id: 1,
    title: "SPSS për Fillestarë",
    description: "Kurs i plotë për të mësuar bazat e SPSS-së nga zero.",
    image: "/api/placeholder/400/250",
    level: "Fillestar",
    duration: "4 javë",
    price: "€120",
    rating: 4.8,
    students: 234,
    modules: [
      "Hyrje në SPSS",
      "Importimi i të dhënave",
      "Analizat deskriptive",
      "Grafika dhe tabela",
      "Teste bazë statistikore"
    ]
  },
  {
    id: 2,
    title: "Analiza të Avancuara në SPSS",
    description: "Kurs i avancuar për analiza komplekse statistikore.",
    image: "/api/placeholder/400/250",
    level: "I avancuar",
    duration: "6 javë",
    price: "€200",
    rating: 4.9,
    students: 156,
    modules: [
      "Regresioni shumëfishor",
      "Analiza faktoriale",
      "Analiza cluster",
      "Analiza diskriminuese",
      "Modelimi strukturor"
    ]
  },
  {
    id: 3,
    title: "SPSS për Kërkime Mjekësore",
    description: "Aplikim i SPSS-së në studimet mjekësore dhe epidemiologjike.",
    image: "/api/placeholder/400/250",
    level: "Specializim",
    duration: "5 javë",
    price: "€180",
    rating: 4.7,
    students: 89,
    modules: [
      "Analizat epidemiologjike",
      "Survival analysis",
      "Analiza kohore",
      "Meta-analiza",
      "Evidenca bazuar në prova"
    ]
  }
];

export const mockBlogPosts = [
  {
    id: 1,
    title: "Si të Zgjidhni Testin e Duhur Statistikor",
    excerpt: "Udhëzues i plotë për zgjedhjen e testeve statistikore të përshtatshme për të dhënat tuaja.",
    image: "/api/placeholder/400/250",
    author: "Dr. Alba Hasani",
    date: "2024-01-15",
    category: "Tutorial",
    readTime: "8 min"
  },
  {
    id: 2,
    title: "Gabimet më të Shpeshta në Analizën Statistikore",
    excerpt: "Identifikimi dhe shmangja e gabimeve të zakonshme në analizën e të dhënave.",
    image: "/api/placeholder/400/250",
    author: "Prof. Marin Kodra",
    date: "2024-01-12",
    category: "Best Practices",
    readTime: "6 min"
  },
  {
    id: 3,
    title: "Interpretimi i Rezultateve të Regresionit",
    excerpt: "Mënyra e duhur për të interpretuar dhe raportuar rezultatet e analizës regresive.",
    image: "/api/placeholder/400/250",
    author: "Dr. Ines Brahimi",
    date: "2024-01-10",
    category: "Tutorial",
    readTime: "10 min"
  }
];

export const mockProjects = [
  {
    id: 1,
    title: "Analiza të Dhënave Kërkimore",
    client: "Universiteti i Tiranës",
    status: "Në progres",
    progress: 75,
    deadline: "2024-02-15",
    type: "Analiza Statistikore"
  },
  {
    id: 2,
    title: "Studim Epidemiologjik",
    client: "Instituti i Shëndetit Publik",
    status: "Përfunduar",
    progress: 100,
    deadline: "2024-01-30",
    type: "Kërkime Mjekësore"
  },
  {
    id: 3,
    title: "Analiza Tregut",
    client: "ABC Marketing",
    status: "Filluar",
    progress: 25,
    deadline: "2024-02-28",
    type: "Analiza Biznesi"
  }
];

export const mockConsultants = [
  {
    id: 1,
    name: "Dr. Alba Hasani",
    title: "Ekspert Statistikor",
    specialization: "Statistika mjekësore",
    experience: "12 vite",
    rating: 4.9,
    image: "/api/placeholder/150/150",
    bio: "Ekspert me përvoje të gjatë në analizën statistikore për kërkime mjekësore dhe epidemiologjike."
  },
  {
    id: 2,
    name: "Prof. Marin Kodra",
    title: "Konsulent i Lartë",
    specialization: "Metodologji kërkimi",
    experience: "15 vite",
    rating: 4.8,
    image: "/api/placeholder/150/150",
    bio: "Profesor univerzitar me specializim në metodologjinë e kërkimit dhe analizën e të dhënave."
  },
  {
    id: 3,
    name: "Dr. Ines Brahimi",
    title: "Analist i Të Dhënave",
    specialization: "Statistika biznesore",
    experience: "8 vite",
    rating: 4.7,
    image: "/api/placeholder/150/150",
    bio: "Specialiste në analizën e të dhënave për bizneset dhe studimet e tregut."
  }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Dr. Fatmir Leshi",
    title: "Drejtor i Kërkimit, QSUT",
    text: "Shërbimi i shkëlqyer! Më ndihmuan të interpretoj rezultatet e studimit tim në mënyrë profesionale.",
    rating: 5,
    image: "/api/placeholder/60/60"
  },
  {
    id: 2,
    name: "Marina Tirana",
    title: "Studente Doktorature",
    text: "Kursi i SPSS-së më dha bazën e fortë që më duhej për të analizuar të dhënat e disertacionit.",
    rating: 5,
    image: "/api/placeholder/60/60"
  },
  {
    id: 3,
    name: "Ardit Hoxha",
    title: "Menaxher i Kërkimeve",
    text: "Konsulenca profesionale dhe e detajuar. Rekomandoj për çdo projekt kërkimor.",
    rating: 5,
    image: "/api/placeholder/60/60"
  }
];

export const mockStats = {
  projectsCompleted: 350,
  satisfiedClients: 280,
  yearsExperience: 15,
  trainedStudents: 1200
};