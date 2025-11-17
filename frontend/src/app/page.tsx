import { redirect } from 'next/navigation';

// Este componente se ejecutará primero en la ruta '/'
export default function HomeRedirect() {
  // Redirigir al usuario a la página de login
  redirect('/login');
  // No se necesita más código aquí
}