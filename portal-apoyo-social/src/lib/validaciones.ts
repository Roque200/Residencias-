export function validarNombre(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Ingresa el nombre completo.";
  if (!/^[A-Za-zÁÉÍÓÚÑÜáéíóúñü ]{5,100}$/.test(v)) {
    return "Usa solo letras y espacios (mínimo 5 caracteres).";
  }
  return null;
}

export function validarCurp(valor: string): string | null {
  const v = valor.trim().toUpperCase();
  const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
  if (!regex.test(v)) {
    return "La CURP debe tener 18 caracteres en el formato oficial (ej. TOIM800512MGTRRR05).";
  }
  return null;
}

export function validarDomicilio(valor: string): string | null {
  if (valor.trim().length < 6) return "Ingresa un domicilio válido y completo.";
  return null;
}

export function validarComunidad(valor: string): string | null {
  const v = valor.trim();
  if (!/^[A-Za-zÁÉÍÓÚÑÜáéíóúñü0-9 ]{2,60}$/.test(v)) {
    return "Ingresa el nombre de la comunidad o localidad.";
  }
  return null;
}

export function validarTelefono(valor: string): string | null {
  if (!/^\d{10}$/.test(valor.trim())) {
    return "El teléfono debe tener exactamente 10 dígitos.";
  }
  return null;
}
