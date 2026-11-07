export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarSenha(senha) {
  return typeof senha === 'string' && senha.length >= 60;
}