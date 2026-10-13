/** Íconos SVG del menú (trazo de 2 px). */
const trazos = {
  panel: <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" />,
  ventas: <><path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M6 6L5 3H2" /></>,
  inventario: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  compras: <><path d="M3 7h13v10H3z" /><path d="M16 10h4l2 3v4h-6" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  clientes: <><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s7 2 7 6" /><path d="M17 11a3 3 0 1 0 0-6M22 21c0-3-2-5-5-5.5" /></>,
  reportes: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
};

export default function Icono({ nombre }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {trazos[nombre]}
    </svg>
  );
}
