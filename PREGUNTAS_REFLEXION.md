# Preguntas de reflexión

_Escribe tus respuestas debajo de cada pregunta._

**Alumno:** Constanza Venegas

---

## Paso 1 · Explorando la API

| Pregunta | Mi respuesta |
|---|---|
| ¿Cuántos personajes trae cada página? | 20 personajes por página. |
| ¿Qué campo me dice si existe una página siguiente? | `info.next`, que trae la URL de la página que sigue. |
| ¿Qué valor tiene ese campo en la última página? | `null`. |
| ¿Qué código HTTP devuelve una búsqueda sin resultados? | 404 (con el mensaje "There is nothing here"). |
| ¿Qué campos del personaje usa `CharacterCard`? | `name`, `status`, `species` e `image`. |

## Paso 2 · Petición HTTP

**¿Qué diferencia hay entre que `fetch` "falle" y que el servidor responda con un error? ¿Qué debo revisar en la respuesta?**

> `fetch` solo falla de verdad (rechaza la promesa) cuando no se puede comunicar con el servidor, por ejemplo si no hay internet. En cambio, si el servidor sí responde pero con un error, como un 404 o un 500, `fetch` lo toma como una respuesta normal y no lanza ningún error. Por eso hay que revisar `response.ok` o `response.status` antes de usar los datos.

## Paso 3 · Estado

**¿Por qué guardo los personajes en estado y no en una variable normal?**

> Porque cuando cambia un estado React vuelve a dibujar la pantalla y así se ven los datos nuevos. Si uso una variable normal y la cambio, React no se entera, no actualiza la pantalla y además el valor se pierde cada vez que el componente se vuelve a renderizar.

## Paso 4 · useEffect

1. **¿Qué pasa si omito por completo el arreglo de dependencias?**

> El efecto se ejecuta después de cada render. Como dentro del efecto cambio estados, eso provoca otro render y se vuelve a ejecutar, y se arma un bucle infinito de peticiones.

2. **¿Qué significa dejar el arreglo vacío?**

> Que el efecto no depende de nada, así que se ejecuta una sola vez, cuando la pantalla aparece por primera vez.

3. **¿Por qué la función que recibe `useEffect` no debe ser `async` directamente?**

> Porque una función `async` siempre devuelve una promesa, y React espera que la función del efecto no devuelva nada o devuelva una función de limpieza. Por eso dentro del efecto creo una función `async` aparte y la llamo.

## Paso 5 · FlatList

1. **¿Para qué sirve la prop que extrae la llave de cada elemento?**

> Sirve para que cada elemento de la lista tenga una llave única (usé el `id` convertido a texto). Así React sabe cuál elemento es cuál, puede actualizar solo los que cambian y no aparecen las advertencias de keys.

2. **¿Por qué usar `FlatList` en lugar de un `ScrollView` con `.map()`?**

> Porque `FlatList` solo dibuja los elementos que se ven en pantalla (y algunos cercanos), mientras que `ScrollView` con `.map()` dibuja todos de una vez. Con una lista larga eso gasta más memoria y se pone lento. Además `FlatList` ya trae cosas listas para usar, como la paginación, el pull to refresh, el separador y la lista vacía.

## Paso 6 · Carga y error

**¿Por qué es mejor mostrar un mensaje con un botón "Reintentar" que dejar la pantalla vacía?**

> Porque así el usuario entiende que algo falló y puede volver a intentarlo sin cerrar la app. Si la pantalla queda vacía parece que la app está rota y no hay nada que se pueda hacer.

## Paso 8 · Paginación

**¿Qué problema aparece si la función de "cargar más" se dispara varias veces seguidas? ¿Cómo lo evité?**

> Se pide la misma página varias veces, entonces aparecen personajes repetidos, salen advertencias de keys duplicadas y se hacen peticiones de más. Lo evité con un "candado" hecho con `useRef`, que se actualiza al instante, y con condiciones al inicio de la función para que no cargue si ya está cargando, si está en la carga inicial o actualizando, si hubo un error o si ya no hay más páginas.

## Paso 9 · Pull to refresh

**¿Por qué usé un estado distinto (`refreshing`) y no el mismo de la carga inicial?**

> Porque no es lo mismo para el usuario. En la carga inicial la lista se reemplaza por un spinner grande, pero al actualizar la lista tiene que seguir visible y solo se muestra el indicador de arriba. Si usara el mismo estado `loading`, la lista desaparecería mientras el usuario jala hacia abajo.

## Paso 10 · Búsqueda

1. **¿Qué es el debounce y qué problema resuelve?**

> Es esperar a que el usuario deje de escribir un momento (aquí 500 ms) antes de hacer la búsqueda. Resuelve que se haga una petición por cada letra que se escribe, lo que gasta internet, puede saturar la API y muestra resultados intermedios que no sirven.

2. **¿Para qué sirve la función de limpieza (cleanup) que se devuelve en un `useEffect`? Da un ejemplo de esta práctica.**

> Es una función que React ejecuta antes de volver a correr el efecto y cuando la pantalla se cierra. Sirve para cancelar lo que el efecto dejó pendiente. En esta práctica la usé en el debounce con `clearTimeout`, para que el temporizador anterior no llegue a ejecutarse si el usuario sigue escribiendo. También la usé en la carga para marcar `ignore = true` y descartar una respuesta vieja.

3. **Si el usuario escribe rápido y las respuestas llegan en desorden, ¿qué podría salir mal?**

> Que una respuesta vieja llegue después de una más nueva y la reemplace. Por ejemplo, si busco "ri" y luego "rick", y la respuesta de "ri" llega al final, la lista mostraría resultados que no corresponden a lo que está escrito en el campo. Lo evité con la variable `ignore` dentro del efecto y con un identificador de petición para "cargar más" y "actualizar".

## Cierre

**Menciona dos mejoras que le harías a la app si tuvieras una hora más:**

> 1. Agregar una pantalla de detalle: al tocar una tarjeta, que se vea más información del personaje, como su origen y los episodios donde sale.
>
> 2. Agregar un botón "Reintentar" al final de la lista para cuando falle la carga de una página (como pasó con el error 429), y filtros por estado y especie.