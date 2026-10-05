export const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

export const sections = [
  {
    id: "housing",
    title: "Vivienda",
    subtitle: "Arriendo",
    asset: { src: "assets/icons/casita.png", alt: "Vivienda" },
    color: "#0057d9",
    metaphor: "casita de pájaros",
    completeCopy: "El refugio quedo tranquilo.",
    items: [
      { key: "rent", label: "Arriendo", icon: "🏡", value: 0 }
    ]
  },
  {
    id: "services",
    title: "Servicios",
    subtitle: "Servicios y hogar",
    asset: "🪹",
    color: "#00a6ff",
    metaphor: "ramitas",
    completeCopy: "Las ramitas ya sostienen el mes.",
    items: [
      { key: "water", label: "Agua", icon: "💧", value: 0, monthlyFactor: 0.5, hint: "Bimestral se suma 50%" },
      { key: "power", label: "Luz", icon: "⚡", value: 0 },
      { key: "gas", label: "Gas", icon: "🔥", value: 0 },
      { key: "internet", label: "Internet", icon: "🌐", value: 0 },
      { key: "phone", label: "Celular", icon: "📱", value: 0 }
    ]
  },
  {
    id: "transport",
    title: "Transporte",
    subtitle: "Movilidad",
    asset: "🪶",
    color: "#ff8a00",
    metaphor: "plumas",
    completeCopy: "Las plumas estan listas para moverse.",
    items: [
      { key: "parking", label: "Parqueadero", icon: "🅿️", value: 0 },
      { key: "soat", label: "SOAT", icon: "🛡️", value: 0, annual: true, paidMonth: 3, autoChecked: true, hint: "Pagado en abril" },
      { key: "techInspection", label: "Tecnomecánica", icon: "📄", value: 0, annual: true, paidMonth: 3, autoChecked: true, hint: "Pagado en abril" },
      { key: "gasoline", label: "Gasolina", icon: "⛽", value: 0, entries: 5, entryMode: "sum", noCheck: true, hint: "5 registros" },
      { key: "maintenance", label: "Mantenimiento", icon: "🔧", value: 0, entries: 2, entryMode: "sum", noCheck: true, hint: "2 slots · puede ser cero" }
    ]
  },
  {
    id: "homeLife",
    title: "Alimentación",
    subtitle: "Mercado",
    asset: "🐛",
    color: "#ff3b30",
    metaphor: "gusanos",
    autoSectionChecked: true,
    completeCopy: "Los gusanos del mes estan en su lugar.",
    items: [
      { key: "goingOut", label: "Bares, restaurantes y salidas", icon: "🍽️", value: 0, entries: 5, entryMode: "sum", noCheck: true, hint: "5 registros" },
      { key: "marketHome", label: "Mercado, aseo y hogar", icon: "🛒", value: 0, entries: 5, entryMode: "sum", noCheck: true, hint: "5 registros" },
      { key: "pet", label: "Mascota", icon: "🐱", value: 0, entries: 3, entryMode: "sum", noCheck: true, hint: "3 registros" }
    ]
  },
  {
    id: "health",
    title: "Salud",
    subtitle: "Bienestar",
    asset: "🍃",
    color: "#34c759",
    metaphor: "hojas",
    completeCopy: "Las hojas ya respiran suave.",
    items: [
      { key: "gym", label: "Gym", icon: "💪", value: 0 },
      { key: "medicine", label: "Medicinas / suplementos", icon: "💊", value: 0, entries: 3, entryMode: "sum", noCheck: true, hint: "3 registros variables" },
      { key: "wellbeing", label: "Bienestar", icon: "🧠", value: 0, entries: 3, entryMode: "sum", noCheck: true, hint: "3 registros variables" }
    ]
  },
  {
    id: "subscriptions",
    title: "Ocio",
    subtitle: "Tiempo para ti",
    asset: "🌰",
    color: "#af52de",
    metaphor: "bellotas",
    autoSectionChecked: true,
    completeCopy: "Cobros automaticos, sin ruido.",
    items: [
      { key: "spotify", label: "Spotify", icon: "🎵", value: 0, noCheck: true, hint: "Cobro automático" },
      { key: "icloud", label: "iCloud", icon: "☁️", value: 0, noCheck: true, hint: "Cobro automático" },
      { key: "chatgpt", label: "ChatGPT", icon: "🤖", value: 0, noCheck: true, hint: "Cobro automático" },
      { key: "adobe", label: "Adobe", icon: "🎨", value: 0, noCheck: true, hint: "Cobro automático" }
    ]
  },
  {
    id: "entrepreneurship",
    title: "Negocio",
    subtitle: "Mi emprendimiento",
    asset: "🚀",
    color: "#ffcc00",
    metaphor: "libro pequeño",
    completeCopy: "El taller sigue caminando.",
    items: [
      { key: "officeOne", label: "Oficina 1", icon: "🏢", value: 0 },
      { key: "officeTwo", label: "Oficina 2", icon: "🏢", value: 0 }
    ]
  },
  {
    id: "debt",
    title: "Deudas",
    subtitle: "Nubes por despejar",
    asset: "☁️",
    color: "#0a2540",
    metaphor: "nubes",
    completeCopy: "Las nubes estan bajo vigilancia.",
    items: [
      { key: "mastercardBancolombiaMin", debtTotalKey: "mastercardBancolombiaDebt", label: "MasterCard Bancolombia", icon: "💳", value: 0, debtTotal: 0, group: "Tarjetas", debt: true },
      { key: "visaDaviviendaMin", debtTotalKey: "visaDaviviendaDebt", label: "Visa Davivienda", icon: "💳", value: 0, debtTotal: 0, group: "Tarjetas", debt: true },
      { key: "visaRappiMin", debtTotalKey: "visaRappiDebt", label: "Visa Rappi", icon: "💳", value: 0, debtTotal: 0, group: "Tarjetas", debt: true },
      { key: "freeInvestmentMin", debtTotalKey: "freeInvestmentDebt", label: "Libre inversión", icon: "🏦", value: 0, debtTotal: 0, group: "Créditos", debt: true },
      { key: "crediagilMin", debtTotalKey: "crediagilDebt", label: "Crediágil", icon: "🏦", value: 0, debtTotal: 0, group: "Créditos", debt: true }
    ]
  }
];

const allItems = sections.flatMap((section) => section.items);
const defaultValues = Object.fromEntries(
  allItems.flatMap((item) => [
    [item.key, item.value],
    ...(item.debtTotalKey ? [[item.debtTotalKey, item.debtTotal || 0]] : [])
  ])
);
const defaultEntries = Object.fromEntries(
  allItems
    .filter((item) => item.entries)
    .map((item) => [item.key, Array.from({ length: item.entries }, () => 0)])
);
export const defaultState = {
  view: "home",
  selectedSectionId: "homeLife",
  selectedLogKey: "",
  values: defaultValues,
  entries: defaultEntries,
  customItems: {},
  itemLabels: {},
  removedItems: { crediagilMin: true },
  yearLogs: {},
  checked: {},
  migrations: {},
  currencyRates: {}
};

