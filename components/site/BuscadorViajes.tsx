import { CalendarDays, Compass, MapPin, Search } from "lucide-react";
import { ETIQUETA_REGION, ETIQUETA_TIPO_VIAJE, REGIONES, TIPOS_VIAJE } from "@/lib/schema";
import { MESES_OPCIONES } from "@/lib/format";

/** Usa los mismos parámetros que el catálogo, también sin JavaScript. */
export function BuscadorViajes() {
  return (
    <form action="/paquetes" method="get" className="buscador-viajes" role="search" aria-label="Buscar paquetes de viaje">
      <label className="buscador-campo">
        <MapPin aria-hidden="true" />
        <span><span className="buscador-etiqueta">¿A dónde vamos?</span>
          <select name="region" defaultValue="" aria-label="Región de destino">
            <option value="">Todos los destinos</option>
            {REGIONES.map((region) => <option key={region} value={region}>{ETIQUETA_REGION[region]}</option>)}
          </select>
        </span>
      </label>
      <label className="buscador-campo">
        <CalendarDays aria-hidden="true" />
        <span><span className="buscador-etiqueta">¿Cuándo viajás?</span>
          <select name="mes" defaultValue="" aria-label="Mes de salida">
            <option value="">Soy flexible</option>
            {MESES_OPCIONES.map((mes) => <option key={mes.valor} value={mes.valor}>{mes.etiqueta}</option>)}
          </select>
        </span>
      </label>
      <label className="buscador-campo">
        <Compass aria-hidden="true" />
        <span><span className="buscador-etiqueta">Tu forma de viajar</span>
          <select name="tipo" defaultValue="" aria-label="Tipo de viaje">
            <option value="">Quiero explorar</option>
            {TIPOS_VIAJE.map((tipo) => <option key={tipo} value={tipo}>{ETIQUETA_TIPO_VIAJE[tipo]}</option>)}
          </select>
        </span>
      </label>
      <button type="submit" className="buscador-boton"><Search className="size-5" aria-hidden="true" /><span>Buscar viajes</span></button>
    </form>
  );
}
