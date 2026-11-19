import { API_BASE_URL } from '../config/constants';

export async function getCharacters({ page = 1, name = '' } = {}) {
  // Se arma la URL: base + ruta + página.
  let url = `${API_BASE_URL}/character?page=${page}`;

  // El filtro va solo si hay texto (sin espacios sobrantes) y codificado.
  const search = name.trim();
  if (search) {
    url += `&name=${encodeURIComponent(search)}`;
  }

  // Si falla la red, fetch rechaza y el error sigue de largo.
  const response = await fetch(url);

  // 404 = búsqueda sin coincidencias: no es un error, es "sin resultados".
  if (response.status === 404) {
    return { results: [], hasNextPage: false };
  }

  // Cualquier otra respuesta no exitosa sí es un error.
  if (!response.ok) {
    throw new Error(`El servidor respondió con un error (código ${response.status}).`);
  }

  const data = await response.json();

  // info.next es la URL de la página siguiente, o null en la última.
  return {
    results: data.results,
    hasNextPage: data.info.next !== null,
  };
}