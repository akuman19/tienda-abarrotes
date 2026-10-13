/** Insignia con el estado del inventario de un producto (texto + color). */
export default function EstadoStock({ stock, minimo }) {
  if (stock <= minimo) return <span className="insignia bajo">Reponer</span>;
  if (stock <= minimo * 2) return <span className="insignia medio">Medio</span>;
  return <span className="insignia ok">Bien</span>;
}
