import React, { useState } from 'react'; // Importar useState
import Header from './Header.jsx'; // Importar el componente Header
import AuthPage from '../Auth/AuthPage.jsx'; // Importar AuthPage

/**
 * Componente de layout básico.
 * Proporciona una estructura común para las páginas y maneja el modal de autenticación.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - El contenido a renderizar dentro del layout.
 * @returns {JSX.Element} El elemento JSX del layout.
 */
function Layout({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false); // Estado para controlar la visibilidad del modal

  // Función para abrir el modal de autenticación
  const openAuthModal = () => {
    //console.log('Abriendo modal de autenticación');
    setShowAuthModal(true);
  };

  // Función para cerrar el modal de autenticación
  const closeAuthModal = () => {
    console.log('Cerrando modal de autenticación');
    setShowAuthModal(false);
  };

  return (
    <div>
      {/* Pasar la función openAuthModal al Header */}
      <Header openAuthModal={openAuthModal} />
      <div className="container mx-auto p-4">
        {children}
      </div>
      {/* Aquí se podría añadir un componente Footer si es necesario */}

      {/* Modal de Autenticación */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={closeAuthModal}> {/* Overlay del modal */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()} > {/* Contenido del modal */}
            <AuthPage /> {/* Contenido de la página de autenticación */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
