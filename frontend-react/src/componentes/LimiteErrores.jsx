/**
 * Componente de clase: captura errores de renderizado en cualquier
 * componente hijo y muestra un mensaje en lugar de una pantalla en blanco.
 * (Los límites de error solo pueden escribirse como clases en React.)
 */
import { Component } from 'react';

export default class LimiteErrores extends Component {
  constructor(props) {
    super(props);
    this.state = { hayError: false };
  }

  static getDerivedStateFromError() {
    return { hayError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error en la interfaz:', error, info.componentStack);
  }

  render() {
    if (this.state.hayError) {
      return (
        <div className="contenido">
          <div className="tarjeta">
            <h2>Algo salió mal</h2>
            <p>Recargue la página. Si el problema continúa, comuníquese con el administrador.</p>
            <button className="btn" onClick={() => window.location.reload()}>Recargar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
