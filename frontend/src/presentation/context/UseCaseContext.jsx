import React, { createContext, useContext } from 'react';
import { useRepositories } from './RepositoryContext';
import { GetBookingsUseCase } from '../../application/use-cases/get-bookings';
import { GetUserListUseCase } from '../../application/use-cases/get-user-list';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user';
import { GetCourtByIdUseCase } from '../../application/use-cases/get-court-by-id';
import { CheckAvailabilityUseCase } from '../../application/use-cases/check-availability';
import { GetWeeklyAvailabilityUseCase } from '../../application/use-cases/get-weekly-availability';
import { CreateBookingUseCase } from '../../application/use-cases/create-booking';
// Importar otros casos de uso aquí si es necesario

// Crear el contexto para los casos de uso
const UseCaseContext = createContext(null);

/**
 * Proveedor de casos de uso para la aplicación.
 * Envuelve la aplicación y proporciona instancias de casos de uso a los componentes hijos.
 * @param {object} { children } - Los componentes hijos que tendrán acceso a los casos de uso.
 */
export const UseCaseProvider = ({ children }) => {
  const { bookingRepository, userRepository, courtRepository } = useRepositories();

  // Instanciar los casos de uso aquí, inyectando las dependencias de los repositorios
  const getBookingsUseCase = new GetBookingsUseCase(bookingRepository);
  const getUserListUseCase = new GetUserListUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  const getCourtByIdUseCase = new GetCourtByIdUseCase(courtRepository);
  const checkAvailabilityUseCase = new CheckAvailabilityUseCase(courtRepository);
  const getWeeklyAvailabilityUseCase = new GetWeeklyAvailabilityUseCase(courtRepository);
  const createBookingUseCase = new CreateBookingUseCase(bookingRepository);
  // Añadir otros casos de uso aquí

  const useCases = {
    getBookingsUseCase,
    getUserListUseCase,
    deleteUserUseCase,
    getCourtByIdUseCase,
    checkAvailabilityUseCase,
    getWeeklyAvailabilityUseCase,
    createBookingUseCase,
    // Añadir otros casos de uso aquí
  };

  return (
    <UseCaseContext.Provider value={useCases}>
      {children}
    </UseCaseContext.Provider>
  );
};

/**
 * Hook personalizado para acceder a los casos de uso.
 * @returns {object} Un objeto que contiene las instancias de los casos de uso.
 */
export const useUseCases = () => {
  const context = useContext(UseCaseContext);
  if (!context) {
    throw new Error('useUseCases debe ser usado dentro de un UseCaseProvider');
  }
  return context;
};
