import React from 'react';
import Header from './Header'; // Importar el componente Header

/**
 * Componente de layout básico.
 * Proporciona una estructura común para las páginas.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - El contenido a renderizar dentro del layout.
 * @returns {JSX.Element} El elemento JSX del layout.
 */
function Layout({ children }) {
  return (
    <div>
      <Header /> {/* Incluir el componente Header */}
      <div className="container mx-auto p-4">
        {children}
      </div>
      {/* Aquí se podría añadir un componente Footer si es necesario */}
    </div>
  );
}

export default Layout;
