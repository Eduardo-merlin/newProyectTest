export function validationSeccion1(registration) {
  const firstName = registration.firstName.trim();
  const lastName = registration.lastName.trim();
  const email = registration.email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone = registration.phone.trim();
  const phonePattern = /^\+?[0-9 ]+$/;
  const digitCount = phone.replace(/\D/g, '').length;
  const errors = {};

  if (firstName.length < 2 || firstName.length > 80) {
    errors.firstName = 'Debe de tener entre 2 y 80 caractares';
  }
  if (lastName.length < 2 || lastName.length > 80) {
    errors.lastName = 'Debe tener entre 2 y 80 caracteres';
  }
  if (!email || email.length > 254 || !emailPattern.test(email)) {
    errors.email =
      'El correo es obligatorio y debe tener un maximo de 254 caracteres y debe contener el formato email@email';
  }
  if (phone && (!phonePattern.test(phone) || digitCount < 10 || digitCount > 15)) {
    errors.phone = 'El telefono debe tener entre 10 a 15 digitos y ter un formato correcto';
  }
  return errors
}
