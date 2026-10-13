import { Navigate, Route, Routes } from 'react-router-dom';
import Diseno from './componentes/Diseno';
import RutaProtegida from './componentes/RutaProtegida';
import Login from './paginas/Login';
import Panel from './paginas/Panel';
import PuntoVenta from './paginas/PuntoVenta';
import Inventario from './paginas/Inventario';
import Clientes from './paginas/Clientes';
import Compras from './paginas/Compras';
import Reportes from './paginas/Reportes';
import NoEncontrada from './paginas/NoEncontrada';

/** Rutas de la aplicación. Inventario, compras y reportes son solo para el Administrador. */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida><Diseno /></RutaProtegida>}>
        <Route path="/" element={<Navigate to="/panel" replace />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/ventas" element={<PuntoVenta />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/inventario" element={<RutaProtegida soloAdmin><Inventario /></RutaProtegida>} />
        <Route path="/compras" element={<RutaProtegida soloAdmin><Compras /></RutaProtegida>} />
        <Route path="/reportes" element={<RutaProtegida soloAdmin><Reportes /></RutaProtegida>} />
      </Route>
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  );
}
