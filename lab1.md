# Lab 1 — Registro para una conferencia

Construirás una experiencia de registro completa en Vanilla JavaScript: tres secciones progresivas, campos que aparecen según las elecciones, validación, revisión de datos y confirmación local. El reto central es pasar de una página estática a una interfaz cuyo contenido y distribución responden al paso actual y a lo que el usuario elige. El diseño visual, la adaptación a pantallas pequeñas y las transiciones son parte del ejercicio. No hay servidor ni envío real de datos.

**Punto de partida:** sabes maquetar, dar estilo, manejar eventos del DOM y escribir pruebas básicas. Este laboratorio te lleva a organizar esas habilidades en una aplicación mantenible.

## Objetivos

- Diseñar una interfaz adaptable y accesible a partir de una referencia visual.
- Construir un layout dinámico: mostrar una sección a la vez y ajustar los campos visibles según las elecciones, manteniendo usable la interfaz en distintos tamaños de pantalla.
- Distinguir los datos del registro del estado temporal de la interfaz y mantener los primeros en un único objeto JavaScript como fuente de verdad.
- Separar reglas de validación, manipulación del DOM y coordinación de eventos.
- Probar reglas e interacciones con Vitest; en las pruebas de interfaz, trabajar con el HTML real del proyecto.
- Dar retroalimentación útil cuando un dato es incorrecto o una decisión cambia los campos visibles.

## Preparación

1. Copia `template/` a una carpeta de trabajo independiente, por ejemplo `mi-lab-01/`.
2. Copia este archivo y `instructions-lab-01.md` a esa carpeta. Si tu asistente necesita instrucciones en un archivo especial, copia allí el contenido de `instructions-lab-01.md`.
3. Desde la carpeta de trabajo ejecuta `npm install`, `npm run check` y `npm run dev`.
4. Verifica que la UI de ejemplo responde y que la prueba inicial pasa. A continuación, reemplaza la UI y la prueba de ejemplo por las del registro. Conserva la configuración y los scripts.
5. Añade la referencia visual a `assets/` cuando esté disponible y úsala durante el diseño. Hasta entonces, sigue los requisitos visuales de esta guía.

## Producto esperado

Una persona completa tres secciones con botones **Atrás** y **Continuar**. Continuar valida solo la sección actual; si hay errores, permanece allí, muestra mensajes junto a los campos y un resumen con enlaces a ellos, y lleva el foco al primer error. Atrás conserva los datos introducidos. Después de la tercera sección aparece una **pantalla de revisión**: muestra todos los datos relevantes, permite volver a editar y ofrece **Confirmar registro**. La confirmación muestra una **pantalla de éxito**. Revisión y éxito son pantallas del flujo, no secciones adicionales del formulario.

## Arquitectura Modelo-Vista-Controlador (MVC)
El siguiente diagrama representa la arquitectura siguiendo el patrón MVC. Identifica las responsabilidades y la capa correspondiente para entender cómo organizar el código y cómo interactuán entre sí cada capa

![Arquitectura MVC](./assets/Arquitectura%20MVC.png)

## Dos tipos de estado

No toda variable que cambia pertenece al mismo lugar. Antes de crear módulos, clasifica cada valor según lo que representa:

| Valor | ¿Qué representa? | Responsabilidad sugerida |
| --- | --- | --- |
| Nombre, correo, tipo de entrada, workshops y términos aceptados | Datos introducidos para el registro; se validan y, cuando aplican, aparecen en la revisión. | **Modelo de datos**: un único objeto `registration` con los campos de las tres secciones. No hace falta crear una clase. |
| Sección actual y errores que se muestran ahora | Estado temporal de la interacción. | **Estado de UI** coordinado por el controlador, por ejemplo `currentStep` y `errors`. |
| Campos visibles, progreso y botones habilitados | Normalmente son consecuencias de otros valores: `ticketType`, `currentStep` o los errores. | **Valores derivados** al actualizar la vista; evita guardar copias que puedan contradecir el estado original. |

Usa `registration` como **fuente de verdad de los datos del formulario**. Cuando alguien edite un campo, actualiza su valor en ese objeto; cuando vuelvas a una sección, haz que los controles reflejen el objeto. La vista representa el estado y comunica cambios, pero los valores del DOM no deberían ser la única copia de la información. Puedes normalizar una copia para validarla y decidir cuándo incorporar el valor normalizado al objeto sin cambiar inesperadamente lo que la persona está escribiendo.

El controlador puede mantener el estado temporal de UI, pero eso no significa que toda variable deba persistirse: si se puede calcular de manera fiable a partir de `registration` y `currentStep`, calcúlala cuando corresponda. **Preguntas guía:** ¿se enviaría o revisaría este valor como parte del registro? ¿Sigue importando al cambiar de sección? ¿Es un dato elegido por el usuario o una consecuencia visual de otro dato? ¿Qué ocurriría si guardas por separado `ticketType` y un booleano `showInstitution` que dejan de coincidir?

### Sección 1 — Contacto

| Campo (nombre sugerido) | Control | Validación / opciones |
| --- | --- | --- |
| Nombre (`firstName`) | `input type="text"` | Obligatorio; entre 2 y 80 caracteres después de quitar espacios en los extremos. |
| Apellidos (`lastName`) | `input type="text"` | Obligatorio; entre 2 y 80 caracteres después de quitar espacios en los extremos. |
| Correo electrónico (`email`) | `input type="email"` | Obligatorio; quitar espacios en los extremos; comprobar formato de correo y máximo 254 caracteres. No hace falta validar que exista. |
| Teléfono (`phone`) | `input type="tel"` | Opcional; si se informa, aceptar dígitos y espacios, con un `+` opcional **solo al inicio**; deben quedar entre 10 y 15 dígitos. |

El correo se muestra en la revisión, pero no hay verificación remota ni promesa de envío.

### Sección 2 — Participación

| Campo (nombre sugerido) | Control | Validación / opciones |
| --- | --- | --- |
| Ocupación (`occupation`) | `select` | Obligatoria; opción inicial vacía «Selecciona una opción»; opciones: «Estudiante» (`student`), «Empleado/a» (`employee`), «Independiente» (`self-employed`), «Otra» (`other`). |
| Tipo de entrada (`ticketType`) | `select` o grupo de `input type="radio"` | Obligatorio; «General» (`general`), «Estudiante» (`student`), «Profesional» (`professional`). Si usas `select`, incluye una opción inicial vacía. |
| Institución educativa (`institution`) | `input type="text"` | Solo para entrada `student`: visible y obligatoria; entre 2 y 100 caracteres tras quitar espacios extremos. |
| Empresa (`company`) | `input type="text"` | Solo para entrada `professional`: visible y obligatoria; entre 2 y 100 caracteres tras quitar espacios extremos. |
| Cargo (`jobTitle`) | `input type="text"` | Solo para entrada `professional`: visible y obligatorio; entre 2 y 80 caracteres tras quitar espacios extremos. |

La ocupación y el tipo de entrada son elecciones independientes: elegir «Estudiante» como ocupación no activa el campo de institución; lo activa la entrada `student`. Si se cambia de entrada, **conserva temporalmente** los valores ocultos para que puedan reaparecer si se vuelve a esa opción, pero no los valides, incluyas en la revisión ni confirmes cuando no correspondan. Desactiva los controles ocultos si usas un único formulario para evitar que se envíen accidentalmente.

### Sección 3 — Experiencia en el evento

| Campo (nombre sugerido) | Control | Validación / opciones |
| --- | --- | --- |
| Workshops (`workshops`) | Grupo de `input type="checkbox"` | Seleccionar al menos uno; opciones: «Diseño de interfaces» (`ui-design`), «Accesibilidad web» (`web-accessibility`), «Pruebas de frontend» (`frontend-testing`). Se permite seleccionar varios. |
| Preferencia alimentaria (`dietaryPreference`) | `select` | Opcional; «Sin preferencia» (`none`, valor inicial), «Vegetariana» (`vegetarian`), «Vegana» (`vegan`), «Sin gluten» (`gluten-free`). |
| Necesidades de accesibilidad (`accessibilityNeeds`) | `textarea` | Opcional; máximo 300 caracteres. Conserva el texto escrito, pero considera vacío un valor compuesto solo por espacios. |
| Aceptación de términos (`acceptTerms`) | `input type="checkbox"` | Debe estar marcada para pasar a la revisión; no se marca por defecto. |

Incluye el texto de términos como contenido de ejemplo claramente identificado; este laboratorio no constituye un proceso legal o de pago. No solicites información sensible innecesaria.

## Requisitos de interfaz

- Usa HTML semántico: `form`, `label`, `button`, `fieldset` y `legend` para grupos de controles; encabezados en orden lógico. Usa botones reales para navegar entre secciones.
- En móvil, presenta una sola columna, controles cómodos y botones fáciles de pulsar. En pantallas amplias, usa un ancho de lectura controlado y, si ayuda, una segunda columna para contexto o progreso. Asegura que el flujo funcione con teclado y al ampliar el contenido al 200 % sin perder controles.
- Diseña estados de foco, selección, error, inhabilitación y éxito. El error debe ser legible en texto y no depender únicamente del color. Los mensajes por campo deben quedar asociados al control mediante `aria-describedby`, y los inválidos deben comunicar `aria-invalid`.
- Muestra qué sección está activa y cuánto falta, sin usar el estilo visual como única fuente del estado.
- Usa transiciones breves para cambios de sección, campos condicionales y retroalimentación. Respeta `prefers-reduced-motion: reduce` y no muevas el foco inesperadamente durante una animación.
- Al mostrar una sección, sitúa el foco en un lugar predecible; al fallar una validación, lleva el foco al primer campo inválido. El resumen de errores debe ayudar a saltar a cada problema.
- La pantalla de revisión debe representar claramente qué datos fueron proporcionados y omitir los condicionales que no correspondan. Escapa o inserta como texto cualquier valor que provenga del usuario; no interpretes sus notas como HTML.

La referencia visual orientará jerarquía, espaciado, tipografía y colores. Trabaja sus versiones móvil y escritorio y sus estados interactivos. No se exige reproducir píxeles exactos ni se presupone que la referencia ya esté incorporada al repositorio.

## Etapas de trabajo

Sigue los pasos en orden. En cada etapa: **identifica el comportamiento → implementa una parte pequeña → compruébala manualmente → añade pruebas → ejecuta `npm run check`**. Los nombres de módulos y funciones quedan a tu criterio; usa inglés para ellos. Las preguntas son decisiones que debes poder justificar, no respuestas que tengas que copiar.

### Paso 0 — Conoce el punto de partida

1. Ejecuta la UI y la prueba iniciales. Identifica qué archivo contiene el HTML, dónde se cargan CSS y JavaScript y cómo se inicia Vitest.
2. Esboza en papel las cinco pantallas/estados: secciones 1, 2 y 3, revisión y éxito. Señala qué información sobrevive al volver atrás.
3. Reemplaza la prueba del ejemplo al reemplazar la UI; una prueba que sigue esperando el contenido anterior deja de ser útil.

**Comprueba:** `npm run check` funciona antes de comenzar y sabes explicar la ruta de los archivos que modificarás.

### Paso 1 — Construye la navegación con una pista deslizante

En esta fase tendrás tres paneles vacíos que se desplazan horizontalmente. Es un ejemplo guiado para aprender una interacción nueva: incorpora cada fragmento, comprueba su efecto y explica qué responsabilidad cumple antes de seguir. Más adelante añadirás campos y validación; aquí no se entrega la solución del registro completo.

Usa la [siguiente](./assets/Fase%201%20%20-%20Navigation.png) imagen como referencia sobre el layout y comportamiento esperado para esta primer fase. Puedes consultar el diseño de cada ventana en la carpeta `assets/Fase 1`

![Navigation Layout](./assets/Fase%201%20%20-%20Navigation.png)

#### 1.1 Identifica las piezas antes de escribir código

Dibuja el layout móvil y el de escritorio. El navegador del formulario tiene tres niveles: un contenedor general, una ventana que deja ver un panel y una pista interior que contiene todos los paneles. Los botones se sitúan fuera de esa ventana para permanecer visibles al desplazarla. ¿Qué parte necesita Flexbox para disponer paneles en fila? ¿Dónde podrías usar Grid para distribuir los campos de cada panel?

En la versión anterior se ocultaba cada sección con `hidden`. Para esta estrategia, **no uses `hidden` en los paneles de la pista**: necesitan conservar su espacio para que el desplazamiento corresponda al índice actual. `hidden` seguirá siendo útil para los grupos condicionales y para alternar el formulario completo con revisión y éxito.

#### 1.2 Crea la estructura HTML

Coloca este contenido en el `main` de `public/index.html`. El ejemplo utiliza tus tres contenedores y botones de navegación, con encabezados y textos visibles en español. Conserva el `<script type="module">` que inicia la aplicación; lo conectarás en el paso 1.6.

```html
<h1 id="registration-title">Registro para la conferencia</h1>

<form id="navigator" aria-labelledby="registration-title">
  <p id="step-progress" aria-live="polite">Sección 1 de 3</p>

  <div class="groups">
    <div class="groups-track">
      <section class="navigable-group" id="section-one"
        aria-labelledby="section-one-title">
        <h2 id="section-one-title" tabindex="-1">Contacto</h2>
      </section>
      <section class="navigable-group" id="section-two"
        aria-labelledby="section-two-title" inert>
        <h2 id="section-two-title" tabindex="-1">Participación</h2>
      </section>
      <section class="navigable-group" id="section-three"
        aria-labelledby="section-three-title" inert>
        <h2 id="section-three-title" tabindex="-1">Experiencia</h2>
      </section>
    </div>
  </div>

  <div class="controls">
    <button type="button" id="navLeft" disabled>Atrás</button>
    <button type="button" id="navRight">Continuar</button>
  </div>
</form>
```

El `form` agrupa los futuros campos. `type="button"` evita que los botones intenten enviarlo. `tabindex="-1"` permite enfocar los encabezados desde JavaScript sin introducirlos como paradas adicionales de Tab. El atributo `inert` evita la interacción y el foco dentro de los paneles inactivos; **no los oculta ni elimina su espacio**. Recortar una región con CSS por sí solo no impide llegar a sus futuros inputs con el teclado.

**Comprueba:** existen tres secciones, dos botones y un indicador de progreso. Todavía es normal ver las secciones una debajo de otra: falta el layout.

#### 1.3 Define la ventana y la pista con CSS

Añade estas reglas en `public/assets/css/styles.css`, ajustando el nombre del archivo si tu template usa otro. Usa un borde provisional para distinguir cada panel; después lo adaptarás al diseño de Figma.

```css
#navigator {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: min(100%, 36rem);
  margin: 2rem auto;
}

.groups {
  width: 100%;
  overflow: hidden;
}

.groups-track {
  display: flex;
  align-items: flex-start;
  width: 100%;
  transition: transform 300ms ease;
}

.navigable-group {
  box-sizing: border-box;
  flex: 0 0 100%;
  min-width: 0;
  min-height: 10rem;
  padding: 1rem;
  border: 1px solid currentColor;
}

.controls {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.navigable-group h2:focus {
  outline: 2px solid currentColor;
  outline-offset: 0.25rem;
}

@media (prefers-reduced-motion: reduce) {
  .groups-track {
    transition: none;
  }
}
```

`flex: 0 0 100%` reserva para cada panel exactamente el ancho de la pista y evita que se encoja. `box-sizing: border-box` incluye bordes y padding en ese ancho. La pista mantiene un ancho del 100 % de la ventana aunque sus hijos sobresalgan: así, trasladarla un `-100%` desplaza exactamente un panel. No le asignes `width: 300%` ni añadas un `gap` entre paneles sin recalcular el desplazamiento.

Usa `min-height`, no una altura fija que recorte los futuros mensajes de error. La pista puede ocupar la altura del panel más alto, incluso si está fuera de pantalla; ajustar su altura al panel activo queda como extensión opcional. Para contenido muy largo, permite que la página se desplace verticalmente.

**Comprueba:** solo ves el primer panel. Desde las herramientas del navegador, prueba temporalmente `transform: translateX(-100%)` y luego `-200%` en la pista. ¿Por qué mover un panel concreto rompería la idea de una fila que se desplaza como una unidad? Retira el cambio manual antes de continuar.

#### 1.4 Representa el paso actual en JavaScript

Crea `public/assets/js/navigation.js` con este primer fragmento. Todavía no contiene eventos: su objetivo es iniciar el estado y representar una posición.

```js
export function initializeNavigation(root = document) {
  let currentStep = 0;

  const navigator = root.querySelector('#navigator');
  const groupsTrack = navigator.querySelector('.groups-track');
  const groups = navigator.querySelectorAll('.navigable-group');
  const navLeftBtn = navigator.querySelector('#navLeft');
  const navRightBtn = navigator.querySelector('#navRight');
  const progress = navigator.querySelector('#step-progress');

  function updateSectionPosition() {
    groupsTrack.style.transform = `translateX(-${currentStep * 100}%)`;
  }

  updateSectionPosition();
}
```

Los índices son 0, 1 y 2; el texto visible usará 1, 2 y 3. `currentStep` es **estado de UI**: no pertenece al objeto `registration`. El desplazamiento se calcula a partir de ese índice; no necesitas otro estado como `trackOffset`. Las referencias a elementos HTML tampoco son datos del registro.

`initializeNavigation` guarda el estado dentro de la función y prepara los elementos con los que trabajará. Recibir `root` permite iniciar la navegación sobre el documento real o el documento de una prueba. No hace falta una clase ni un framework. Antes de inicializar, el HTML debe estar presente.

#### 1.5 Sincroniza posición, botones y paneles activos

Dentro de la misma función, **sustituye** `updateSectionPosition` por esta versión; conserva la llamada final. No añadas una segunda función con el mismo nombre.

```js
function updateSectionPosition(moveFocus = false) {
  groupsTrack.style.transform = `translateX(-${currentStep * 100}%)`;

  groups.forEach((group, index) => {
    group.toggleAttribute('inert', index !== currentStep);
  });

  navLeftBtn.disabled = currentStep === 0;
  navRightBtn.disabled = currentStep === groups.length - 1;
  progress.textContent = `Sección ${currentStep + 1} de ${groups.length}`;

  if (moveFocus) {
    groups[currentStep].querySelector('h2').focus({ preventScroll: true });
  }
}
```

Ahora una sola actualización mantiene coordinadas las representaciones del paso. Los estados `disabled` se **derivan** del índice; no se guardan en variables independientes. `moveFocus` distingue la carga inicial de una navegación que debe situar al usuario en el nuevo panel. No dependas de un tiempo de espera igual a los 300 ms de la animación para decidir el paso.

`inert` no sustituye la validación ni decide qué campos son relevantes para confirmar: conserva los paneles en el layout y evita interactuar con los inactivos. Cuando añadas campos, valida los datos correspondientes al paso; los valores seguirán viviendo en `registration`.

#### 1.6 Conecta los eventos e inicia la aplicación

Añade estas funciones y sus listeners **dentro de `initializeNavigation`, antes de la llamada final** a `updateSectionPosition()`. Así comparten el mismo `currentStep`; no declares otro contador fuera de la función.

```js
function goToPreviousStep() {
  if (currentStep > 0) {
    currentStep -= 1;
    updateSectionPosition(true);
  }
}

function goToNextStep() {
  if (currentStep < groups.length - 1) {
    currentStep += 1;
    updateSectionPosition(true);
  }
}

navLeftBtn.addEventListener('click', goToPreviousStep);
navRightBtn.addEventListener('click', goToNextStep);
```

Los límites evitan índices fuera del rango. Calcular el último índice desde `groups.length` evita repetir el número 2 por el código. Las funciones de evento coordinan un cambio de estado y su representación; más adelante `goToNextStep` consultará la validación antes de cambiar el índice.

En `public/assets/js/main.js`, inicia la navegación una sola vez:

```js
import { initializeNavigation } from './navigation.js';

initializeNavigation();
```

En `public/index.html`, conserva o añade una única carga de ese archivo, al final del `body`:

```html
<script type="module" src="./assets/js/main.js"></script>
```

**Comprueba:** Atrás está deshabilitado en la primera sección; Continuar lo está en la tercera. El indicador, la posición y el foco cambian juntos. Esta es la navegación provisional de **tres paneles**: el acceso a revisión y éxito se conectará en los pasos 4 y 5, cuando la última sección sea válida. Entonces Continuar dejará de estar deshabilitado en el último panel y ejecutará esa nueva acción, sin trasladar la pista a un cuarto panel inexistente.

#### 1.7 Escribe una primera prueba con el HTML real

Crea `__tests__/navigation.test.js`. Importa el módulo que prepara la navegación, en vez de importar `main.js`, para controlar el momento en que se ejecuta.

```js
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { beforeEach, expect, it } from 'vitest';
import { initializeNavigation } from '../public/assets/js/navigation.js';

const html = readFileSync(
  new URL('../public/index.html', import.meta.url),
  'utf8',
);

beforeEach(() => {
  const page = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = page.body.innerHTML;
  initializeNavigation();
});

it('avanza al segundo panel y actualiza su representación', () => {
  document.querySelector('#navRight').click();

  expect(document.querySelector('.groups-track').style.transform)
    .toBe('translateX(-100%)');
  expect(document.querySelector('#step-progress').textContent)
    .toBe('Sección 2 de 3');
  expect(document.querySelector('#section-one').hasAttribute('inert'))
    .toBe(true);
  expect(document.querySelector('#section-two').hasAttribute('inert'))
    .toBe(false);
  expect(document.querySelector('#navLeft').disabled).toBe(false);
  expect(document.activeElement.id).toBe('section-two-title');
});
```

Cada prueba empieza con una copia nueva del HTML real y una sola inicialización. El script incluido en ese HTML no arranca automáticamente al copiar su contenido en el test; la llamada explícita prepara la interacción. Este es un test de integración del módulo con el DOM. Comprueba el estado representado, pero `jsdom` no dibuja paneles ni reproduce una animación: revisa desplazamiento, teclado e interacción real de `inert` también en el navegador.

**Pruebas que debes añadir:** estado inicial; volver de la segunda sección a la primera; recorrer hasta la tercera; impedir sobrepasar ambos extremos; actualizar correctamente los botones y el progreso; mantener solo un panel sin `inert`. No hace falta esperar 300 ms para verificar el cambio de estado. Más adelante sustituye la prueba del botón deshabilitado en la última sección por el comportamiento de acceso a revisión.

**Comprueba antes de avanzar:** las pruebas pasan con `npm run check`; la navegación funciona en móvil y escritorio; Tab no entra en paneles fuera de pantalla; al reducir movimiento, el cambio funciona sin transición. Puedes explicar qué es estado de UI, qué se deriva de él y por qué los datos del registro se añadirán por separado.

> **Pista opcional — siguiente separación de responsabilidades:** este módulo pequeño mezcla deliberadamente eventos y representación para que puedas seguir el flujo completo. Una vez comprendido, identifica qué partes trasladarías a una vista (selectores, transform, foco y botones) y cuáles conservarías en el controlador (paso actual y decisión de avanzar). Refactoriza conservando las pruebas, sin añadir abstracciones que todavía no necesitas.

Para ampliar: [atributo `inert` en MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert) y [limitaciones visuales de jsdom](https://github.com/jsdom/jsdom#pretending-to-be-a-visual-browser).


### Paso 2 — Completa Contacto como primera sección vertical

1. Sustituye el texto provisional de la primera sección por los cuatro campos de su tabla. Decide `label`, `name`, `id`, ayuda y ubicación del mensaje de error. ¿Qué puede comprobar HTML y qué regla deberá comprobar tu JavaScript?
2. Crea **un único objeto `registration`** para los datos de las tres secciones, aunque al principio solo uses los campos de Contacto. Usa valores iniciales adecuados para los campos aún vacíos; no guardes nodos del DOM en él. Decide cómo actualizarlo al escribir en un `input` y al cambiar un `select` o checkbox. ¿Por qué tres objetos independientes, uno por sección, dificultarían la revisión final?
3. Haz que los controles de Contacto reflejen `registration` al volver atrás. ¿Qué sucedería si cambias el objeto pero dejas un valor anterior en el input? Piensa cuándo normalizar texto sin borrar espacios mientras todavía se escribe.
4. Escribe validaciones que reciban datos del objeto y no nodos HTML. Prueba nombre corto, apellidos vacíos, email incorrecto y teléfono vacío/válido/inválido.
5. Conecta la validación al botón Continuar: ante errores conserva los datos en `registration`, permanece en la sección, muestra mensajes, actualiza el resumen y enfoca el primer campo inválido. Cuando todo es válido, avanza. Los errores pertenecen al estado temporal de UI; no los guardes como si fueran datos del registro. Si hay validación nativa del navegador, evita que sustituya o contradiga estos mensajes.
6. Escribe pruebas de la interacción con `public/index.html`: el error bloquea el avance; corregirlo permite continuar; Atrás restaura los valores desde el objeto. Mantén también las pruebas puras de validación.

> **Pista opcional — reparto de responsabilidades:** una regla recibe valores simples y devuelve problemas; la vista lee controles y muestra estado; el controlador coordina «leer → validar → guardar → mostrar». Puedes usar `data-testid` para algún elemento cuyo propósito sea difícil de localizar de forma estable, como una pantalla de resultado; para controles con etiqueta, prueba primero búsquedas por etiqueta, rol o texto. No añadas `data-testid` a todo ni acoples las pruebas a clases CSS.

**Comprueba:** solo se avanza con Contacto válido, el foco y los mensajes indican qué corregir, los valores del objeto y de los controles coinciden tras volver atrás, y `npm run check` pasa. Pregunta al tutor si alguna regla está mezclada con cambios del DOM o si hay dos copias independientes de los datos.

Usa la siguiente imagen como guía para el diseño y layout esperados para la primer sección del formulario

![Section 1 Fields](./assets/Fase%202/Section%201.png)

Usa la siguiente imagen como guía para el diseño y layout esperados para la primer sección del formulario cuando existen errores durante la validación

![Section 1 Errors](./assets/Fase%202/Section%201%20-%20errors.png)

### Paso 3 — Completa Participación y sus campos condicionales

1. Añade ocupación, tipo de entrada y sus campos dependientes. ¿Por qué la ocupación no debe activar por sí sola institución o empresa? Reutiliza la idea de regiones ocultas con `hidden` para el grupo de campos que deja de aplicar; comprueba que el layout se reajusta sin dejar huecos ni romperse en móvil. Decide qué controles se desactivan.
2. Cuando cambia `ticketType` en `registration`, actualiza los campos visibles a partir de ese valor. Conserva temporalmente en el mismo objeto los valores ocultos, pero ignóralos al validar y al construir la revisión. ¿Qué pasará si eliges estudiante, escribes una institución, cambias a profesional y luego vuelves? ¿Necesitas además una variable `isStudentFieldsVisible`, o puedes calcularlo desde `ticketType`?
3. Escribe validaciones puras para las opciones permitidas y las longitudes condicionales. Integra la validación de esta sección en Continuar sin volver a bloquear por errores antiguos de Contacto, salvo si se regresa allí y se modifica.
4. Prueba las tres entradas, la ausencia de los campos exigidos y el cambio entre tipos. Comprueba que un valor oculto no impide avanzar y que vuelve a aparecer si regresas a su opción.

> **Pista opcional — campos condicionales:** el tipo de entrada puede decidir qué grupo es aplicable; la misma decisión debe guiar visibilidad, validación y revisión. Si cada parte tiene una condición distinta, surgirán incoherencias. `hidden` retira el grupo de la presentación y del foco, pero no elimina automáticamente sus valores ni sustituye la lógica que debe ignorarlos al validar o confirmar. Si existe un envío HTML, desactiva los controles ocultos para que no participen en él.

**Comprueba:** cada tipo muestra y exige solo sus campos, la navegación conserva lo escrito y `npm run check` pasa. Pide al tutor que revise casos de cambio de selección y responsabilidades.

Usa la siguiente imagen como referencia del diseño de esta sección del formulario:

![Section 2 - campos](./assets/Fase%203/Section%202%20-%20a.png)

Referencia para el Menu de selección "Ocupación" 

![Section 2 - menu displayed](./assets/Fase%203/Section%202%20-%20b.png)

Usa las siguientes imágenes como referencia del diseño de los campos dinámicos que se mostrarán según la sección de "Tipo de Entrada"

![Section 2 - campos](./assets/Fase%203/Section%202%20-%20c.png)

![Section 2 - campos](./assets/Fase%203/Section%202%20-%20d.png)

Usa la siguiente imagen como referencia del diseño de esta sección del formulario cuando los campos presentan errores

![Section 2 - campos](./assets/Fase%203/Section%202%20-%20d%20-%20errors.png)

Usa las siguientes imágenes como referencia del diseño de esta sección según la elección del usuario

### Paso 4 — Completa Experiencia y el paso a revisión

1. Añade el grupo de workshops, preferencia alimentaria, texto de accesibilidad y aceptación de términos al mismo objeto `registration`. Para los workshops representa la selección como una colección de valores; para términos, como un booleano. ¿Cuál es la diferencia entre validar un checkbox aislado y validar «al menos uno» dentro de un grupo?
2. Valida opciones permitidas, workshops, longitud de texto y términos. Muestra el error del grupo cerca de su `legend`; asócialo a los controles sin llenar la pantalla de mensajes repetidos.
3. Integra estas reglas en Continuar. Después de una sección 3 válida, muestra revisión en vez de éxito. Prueba ausencia de workshops, términos sin marcar y texto mayor de 300 caracteres.
4. Construye la revisión desde `registration`, no leyendo de nuevo controles que pueden estar ocultos. Omite los campos que no correspondan al tipo de entrada. Los valores escritos por la persona se insertan como texto, no como HTML. Añade «Editar» hacia la sección adecuada y vuelve a representar los controles desde el objeto.

**Comprueba:** nadie llega a revisión con esta sección incompleta; editar no pierde datos; la revisión refleja la selección actual; `npm run check` pasa.

Usa la siguiente imagen como referencia del diseño de los campos esperados para esta sección del formulario

![Section 3 Fields](./assets/Fase%204/Stage%203%20-%20Fields.png)

![Section 3 Fields Menu open](./assets/Fase%204/Stage%203%20-%20Fields%20-%20Select%20Expanded.png)

Usa la siguiente imagen como referencia del diseño de los campos cuando el formulario tiene errores

![Section 3 Fields errors](./assets/Fase%204/Stage%203%20-%20Fields%20-%20Errors.png)

### Paso 5 — Confirma, revisa diseño y prueba el recorrido completo

1. Al confirmar, valida de nuevo `registration` para las tres secciones, teniendo en cuenta el tipo de entrada actual. Si algo falla, lleva a la sección afectada y permite corregirlo. Si todo es válido, muestra éxito local sin afirmar que el registro fue enviado a un servidor. ¿Podrías completar la confirmación usando solo el objeto de datos, sin consultar el formulario oculto?
2. Prueba al menos un recorrido completo por cada tipo de entrada y un recorrido de corrección de errores. Usa el HTML real y comprueba resultados observables. Evita duplicar pruebas que solo confirman el mismo detalle interno.
3. Revisa diseño móvil/escritorio, zoom al 200 %, teclado, foco al cambiar de pantalla, contraste y `prefers-reduced-motion`. ¿Una transición explica un cambio de estado o solo retrasa el uso? ¿La vista de errores funciona sin depender del color?
4. Ejecuta `npm run check`. Explica con tus palabras dónde están los datos, las reglas, el acceso al DOM y la coordinación. Si una función acumula varias de estas tareas, considera dividirla antes de terminar.

**Comprueba:** tres secciones, revisión editable y éxito funcionan de principio a fin; las pruebas y herramientas de calidad pasan. Pide al tutor una revisión final con máximo tres hallazgos prioritarios.

Usa la siguiente imagen como referencia de la Interfaz mostrada para resumir la información proporcionada por el usuario

![Confirmation Form](./assets/Fase%205/Confirmation.png)

Usa la siguiente imagen como refernecia de la pantalla de éxito al procesar los datos del formulario

![Success](./assets/Fase%201/Success%20state.png)

### Diseño responsivo

Usa las siguientes imagenes como referencia de las Intefaz en su vista móvil, nota que el layout se conserva en su mayoría pero los tamaños se ajustan a las dimensiones de la pantalla

![Section 1](./assets/Mobile%20Layout/Section%201%20-%20Mobile.png)
![Section 2](./assets/Mobile%20Layout/Section%202%20-%20Mobile.png)
![Section 3](./assets/Mobile%20Layout/Stage%203%20-%20Fields%20-%20Mobile.png)
![Section 3](./assets/Mobile%20Layout/Confirmation%20-%20Mobile.png)
![Section 3](./assets/Mobile%20Layout/Success%20state%20-%20Mobile.png)

## Criterios de terminado

- Las tres secciones, la revisión y el éxito forman un flujo completo y coherente.
- Todas las reglas descritas se validan; se puede corregir un error y volver a avanzar sin perder datos.
- Las opciones condicionales aparecen, se validan y se resumen de acuerdo con la selección actual.
- Todos los datos del registro viven en un único objeto JavaScript; el paso actual y los errores se manejan como estado de UI y la visibilidad se deriva de los datos o del paso.
- La UI resulta usable en móvil, escritorio, teclado y movimiento reducido.
- Las pruebas cubren validación y los recorridos principales; `npm run check` termina correctamente.
- Puedes explicar qué módulo conserva los datos, cuál decide si son válidos, cuál actualiza el DOM y cuál coordina los eventos.

## Para reflexionar

¿Qué comprobaciones conviene hacer también con HTML y cuáles requieren reglas JavaScript? ¿Qué se pierde si el DOM es la única fuente de datos? ¿Qué valores pertenecen a `registration`, cuáles son estado de UI y cuáles pueden calcularse? ¿Qué comportamiento escogiste para los datos de campos que dejan de aplicar? ¿Qué prueba te protegería frente a un cambio accidental de un selector o un ID?

**Extensiones opcionales:** guardar un borrador en `localStorage`, validación al salir de un campo o progreso más detallado. Resuelve primero el flujo principal.

Al elegir nombres de variables y funciones, usa inglés claro y consistente. El texto visible en la interfaz y la documentación permanecen en español.
