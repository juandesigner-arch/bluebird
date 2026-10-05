export const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const categories = [
  {
    id: "housing", name: "Vivienda", icon: "🏠", color: "#2563eb",
    items: [{ key: "rent", name: "Arriendo", icon: "🏡", type: "fixed", value: 0 }]
  },
  {
    id: "services", name: "Servicios", icon: "💡", color: "#0891b2",
    items: [
      { key: "water", name: "Agua", icon: "💧", type: "fixed", value: 0, factor: 0.5, note: "Se suma 50%" },
      { key: "power", name: "Luz", icon: "⚡", type: "fixed", value: 0 },
      { key: "gas", name: "Gas", icon: "🔥", type: "fixed", value: 0 },
      { key: "internet", name: "Internet", icon: "🌐", type: "fixed", value: 0 },
      { key: "phone", name: "Celular", icon: "📱", type: "fixed", value: 0 }
    ]
  },
  {
    id: "transport", name: "Transporte", icon: "🏍️", color: "#ea580c",
    items: [
      { key: "parking", name: "Parqueadero", icon: "🅿️", type: "fixed", value: 0 },
      { key: "soat", name: "SOAT", icon: "🛡️", type: "fixed", value: 0, factor: 1 / 12, note: "Valor anual / 12" },
      { key: "tech", name: "Tecnomecánica", icon: "📄", type: "fixed", value: 0, factor: 1 / 12, note: "Valor anual / 12" },
      { key: "gasoline", name: "Gasolina", icon: "⛽", type: "variable", slots: 5 },
      { key: "maintenance", name: "Mantenimiento", icon: "🔧", type: "variable", slots: 2 }
    ]
  },
  {
    id: "food", name: "Alimentación", icon: "🛒", color: "#dc2626",
    items: [
      { key: "restaurants", name: "Bares, restaurantes y salidas", icon: "🍽️", type: "variable", slots: 5 },
      { key: "market", name: "Mercado, aseo y hogar", icon: "🛒", type: "variable", slots: 5 },
      { key: "pet", name: "Mascota", icon: "🐱", type: "variable", slots: 3 }
    ]
  },
  {
    id: "health", name: "Salud", icon: "❤️", color: "#16a34a",
    items: [
      { key: "gym", name: "Gym", icon: "💪", type: "fixed", value: 0 },
      { key: "medicine", name: "Medicinas / suplementos", icon: "💊", type: "variable", slots: 3 },
      { key: "wellbeing", name: "Bienestar", icon: "🧠", type: "variable", slots: 3 }
    ]
  },
  {
    id: "subscriptions", name: "Suscripciones", icon: "📦", color: "#7c3aed",
    automatic: true,
    items: [
      { key: "spotify", name: "Spotify", icon: "🎵", type: "fixed", value: 0, automatic: true },
      { key: "icloud", name: "iCloud", icon: "☁️", type: "fixed", value: 0, automatic: true },
      { key: "chatgpt", name: "ChatGPT", icon: "🤖", type: "fixed", value: 0, automatic: true },
      { key: "adobe", name: "Adobe", icon: "🎨", type: "fixed", value: 0, automatic: true }
    ]
  },
  {
    id: "business", name: "Negocio", icon: "🚀", color: "#ca8a04",
    items: [
      { key: "officeOne", name: "Oficina 1", icon: "🏢", type: "fixed", value: 0 },
      { key: "officeTwo", name: "Oficina 2", icon: "🏢", type: "fixed", value: 0 }
    ]
  },
  {
    id: "debt", name: "Deudas", icon: "💳", color: "#334155",
    items: [
      { key: "mastercard", name: "MasterCard", icon: "💳", type: "debt", minimum: 0, debt: 0 },
      { key: "visa", name: "Visa", icon: "💳", type: "debt", minimum: 0, debt: 0 },
      { key: "credit", name: "Crédito", icon: "🏦", type: "debt", minimum: 0, debt: 0 }
    ]
  }
];

