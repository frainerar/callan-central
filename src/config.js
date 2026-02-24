// ── GRUPOS ────────────────────────────────────────────────────────────────────
// Para agregar grupos: añadí el nombre en GROUPS y un color en COLORS
export const GROUPS = ["Koalas", "Butterflies", "Hawks"];

export const COLORS = {
  Koalas:      { h: "#1F4E79", l: "#D6E4F0" },
  Butterflies: { h: "#7B3F00", l: "#FEF0D9" },
  Hawks:       { h: "#1B5E20", l: "#E8F5E9" },
  // Ejemplos para agregar más:
  // Lions:    { h: "#6A0572", l: "#F3E5F5" },
  // Eagles:   { h: "#B71C1C", l: "#FFEBEE" },
};

// ── PROFESORES ────────────────────────────────────────────────────────────────
// Agregá o quitá profesores acá. El PIN debe ser de 4 dígitos.
export const TEACHERS = [
  { id: "t1", name: "María",    pin: "1234" },
  { id: "t2", name: "Carlos",   pin: "2345" },
  { id: "t3", name: "Lucía",    pin: "3456" },
  // { id: "t4", name: "Juan",  pin: "4567" },
];

// ── ADMINISTRADOR ─────────────────────────────────────────────────────────────
// PIN del administrador para ver todos los registros
export const ADMIN = { id: "admin", name: "Admin", pin: "0000" };

export const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];
