import {
  Baby,
  Building2,
  Church,
  Compass,
  Croissant,
  Heart,
  Landmark,
  Leaf,
  type LucideIcon,
  Mountain,
  Palmtree,
  Snowflake,
  Sparkles,
  Sun,
  ShoppingBag,
  User,
  Users,
  Waves,
} from "lucide-react";
import type { IdealPara, Region, Ritmo, TipoViaje } from "@/lib/schema";

/* Las 8 preguntas del cuestionario, con sus opciones y sus íconos. */

export type Opcion<T> = {
  valor: T;
  etiqueta: string;
  detalle?: string;
  icono: LucideIcon;
};

export const OPCIONES_TIPO: Opcion<TipoViaje>[] = [
  { valor: "playa", etiqueta: "Playa", detalle: "Mar, arena y no hacer nada", icono: Waves },
  { valor: "cultura", etiqueta: "Cultura e historia", detalle: "Museos, ruinas, ciudades con historia", icono: Landmark },
  { valor: "naturaleza", etiqueta: "Naturaleza", detalle: "Paisajes, bosques, cataratas", icono: Leaf },
  { valor: "aventura", etiqueta: "Aventura", detalle: "Caminatas, actividades al aire libre", icono: Compass },
  { valor: "relax", etiqueta: "Relax", detalle: "Descansar de verdad", icono: Sun },
  { valor: "gastronomia", etiqueta: "Gastronomía", detalle: "Comer bien en todos lados", icono: Croissant },
  { valor: "ciudad", etiqueta: "Ciudad", detalle: "Caminar, ver vidrieras, salir de noche", icono: Building2 },
  { valor: "nieve", etiqueta: "Nieve", detalle: "Esquiar o conocer la nieve", icono: Snowflake },
  { valor: "religioso", etiqueta: "Religioso", detalle: "Peregrinación y santuarios", icono: Church },
  { valor: "compras", etiqueta: "Compras", detalle: "Outlets y shoppings", icono: ShoppingBag },
];

export const OPCIONES_COMPANIA: Opcion<IdealPara>[] = [
  { valor: "pareja", etiqueta: "En pareja", icono: Heart },
  { valor: "familia", etiqueta: "En familia con niños", icono: Baby },
  { valor: "amigos", etiqueta: "Con amigos", icono: Users },
  { valor: "solo", etiqueta: "Solo o sola", icono: User },
  { valor: "grupo", etiqueta: "En grupo grande", icono: Users },
  { valor: "adultos-mayores", etiqueta: "Adultos mayores", icono: Users },
];

export const OPCIONES_PRESUPUESTO = [
  { valor: "hasta-500", etiqueta: "Hasta USD 500", min: 0, max: 500 },
  { valor: "500-1200", etiqueta: "Entre USD 500 y 1.200", min: 500, max: 1200 },
  { valor: "1200-2500", etiqueta: "Entre USD 1.200 y 2.500", min: 1200, max: 2500 },
  { valor: "2500-5000", etiqueta: "Entre USD 2.500 y 5.000", min: 2500, max: 5000 },
  { valor: "mas-5000", etiqueta: "Más de USD 5.000", min: 5000, max: 100000 },
] as const;

export const OPCIONES_DIAS = [
  { valor: "1-4", etiqueta: "Un fin de semana largo", detalle: "Hasta 4 días", min: 1, max: 4 },
  { valor: "5-8", etiqueta: "Una semana", detalle: "5 a 8 días", min: 5, max: 8 },
  { valor: "9-14", etiqueta: "Dos semanas", detalle: "9 a 14 días", min: 9, max: 14 },
  { valor: "15-40", etiqueta: "Más de dos semanas", detalle: "Tengo tiempo", min: 15, max: 40 },
] as const;

export const OPCIONES_RITMO: Opcion<Ritmo>[] = [
  { valor: "tranquilo", etiqueta: "Tranquilo", detalle: "Pocas actividades, mucho descanso", icono: Sun },
  { valor: "moderado", etiqueta: "Moderado", detalle: "Algo para hacer, pero sin correr", icono: Compass },
  { valor: "intenso", etiqueta: "Intenso", detalle: "Quiero ver todo lo que se pueda", icono: Mountain },
];

export const OPCIONES_REGION: Opcion<Region | "sorprendeme">[] = [
  { valor: "paraguay", etiqueta: "Paraguay", detalle: "Sin salir del país", icono: Leaf },
  { valor: "sudamerica", etiqueta: "Sudamérica", detalle: "Brasil, Argentina, Chile, Perú…", icono: Mountain },
  { valor: "caribe", etiqueta: "Caribe", detalle: "Punta Cana, Cancún, Aruba…", icono: Palmtree },
  { valor: "norteamerica", etiqueta: "Norteamérica", detalle: "Estados Unidos, Canadá, México", icono: Building2 },
  { valor: "europa", etiqueta: "Europa", icono: Landmark },
  { valor: "otros", etiqueta: "Otros destinos", detalle: "Tierra Santa, Egipto, Asia…", icono: Compass },
  { valor: "sorprendeme", etiqueta: "Sorprendeme", detalle: "Me da igual, mostrame lo mejor", icono: Sparkles },
];
