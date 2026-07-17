// HomePage - Landing page
const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const HomePage = () => {
  const page = document.createElement("div");
  page.className = "flex flex-col";

  page.innerHTML = `
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full bg-background border-b border-border text-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
        <a href="/" class="flex items-center gap-2 shrink-0" id="logo-link">
          <span class="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-background font-display font-bold">M</span>
          <span class="font-display text-xl font-bold text-text">MUISKA</span>
        </a>

        <input type="checkbox" id="menu-toggle" class="peer hidden" />
        <label for="menu-toggle" class="lg:hidden text-text text-2xl cursor-pointer">&#9776;</label>

        <nav class="hidden peer-checked:flex lg:flex flex-col lg:flex-row absolute lg:static top-full left-0 w-full lg:w-auto bg-background lg:bg-transparent border-b lg:border-0 border-border px-6 lg:px-0 py-4 lg:py-0 gap-4 lg:gap-6 items-center lg:flex-1 lg:justify-center">
          <ul class="flex flex-col lg:flex-row items-center gap-1 w-full lg:w-auto">
            <li class="w-full lg:w-auto"><a href="#inicio" class="block text-center lg:inline px-4 py-2 rounded-full bg-muted text-primary font-medium">Inicio</a></li>
            <li class="w-full lg:w-auto"><a href="#categorias" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">Categorías</a></li>
            <li class="w-full lg:w-auto"><a href="#publicaciones" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">Publicaciones</a></li>
            <li class="w-full lg:w-auto"><a href="#como-funciona" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">Cómo funciona</a></li>
            <li class="w-full lg:w-auto"><a href="#nosotros" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">Nosotros</a></li>
          </ul>
          <div class="flex items-center gap-2 w-full lg:w-auto">
            <input type="text" placeholder="Buscar..." class="bg-muted text-text placeholder-text/50 rounded-full px-4 py-2 border border-border flex-1 lg:flex-none" />
            <button class="bg-accent hover:opacity-90 text-background font-medium px-4 py-2 rounded-full shrink-0">Buscar</button>
          </div>
          <div class="flex items-center gap-4 lg:hidden w-full justify-center pt-2">
            <button class="text-text/70 hover:text-text font-medium" data-path="/login">Iniciar sesión</button>
            <button class="bg-primary hover:bg-primary-hover text-background font-medium px-5 py-2.5 rounded-full" data-path="/registro">Registrarse</button>
          </div>
        </nav>

        <div class="hidden lg:flex items-center gap-4 shrink-0">
          <button class="text-text/70 hover:text-text font-medium" data-path="/login">Iniciar sesión</button>
          <button class="bg-primary hover:bg-primary-hover text-background font-medium px-5 py-2.5 rounded-full" data-path="/registro">Registrarse</button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section id="inicio" class="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 xl:py-40 overflow-hidden">
      <img src="/Woman.jpg" alt="Emprendedora colombiana trabajando en su taller" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-background/85"></div>
      <div class="relative max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col items-center text-center">
        <a class="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm text-text/70 mb-8 sm:mb-10 hover:border-primary transition">Plataforma de intercambio comunitario</a>
        <h1 class="font-display font-bold leading-none mb-8 sm:mb-10">
          <span class="block text-text text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">Conecta.</span>
          <span class="block text-primary text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">Comparte.</span>
          <span class="block text-text text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">Crece.</span>
        </h1>
        <p class="text-base sm:text-lg lg:text-xl text-text/70 max-w-md sm:max-w-2xl mb-8 sm:mb-10">El mercado comunitario donde emprendedores y personas del día a día intercambian bienes, servicios y donaciones con facilidad.</p>
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a href="/explorar" class="w-full sm:w-auto text-center bg-primary hover:bg-primary-hover text-background font-medium px-6 py-3 lg:px-8 lg:py-4 lg:text-lg rounded-full" id="hero-explorar">Explorar ahora →</a>
          <a href="/registro" class="w-full sm:w-auto text-center bg-background hover:bg-muted border border-border text-text font-medium px-6 py-3 lg:px-8 lg:py-4 lg:text-lg rounded-full transition" id="hero-registro">Crear cuenta gratis</a>
        </div>
      </div>
    </section>

    <!-- Categorías -->
    <section id="categorias" class="bg-background px-6 py-20">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="font-display text-4xl font-bold text-text mb-2">Categorías</h2>
            <p class="text-text/60">Explora nuestras categorías principales.</p>
          </div>
          <a href="/explorar" class="text-primary font-medium flex items-center gap-1 hover:text-primary-hover transition" id="cat-ver-todo">Ver todo →</a>
        </div>
        <div class="categories grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">👗</span>
            <h3 class="font-medium text-text">Ropa & Moda</h3>
          </a>
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">🍽️</span>
            <h3 class="font-medium text-text">Comida</h3>
          </a>
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">💻</span>
            <h3 class="font-medium text-text">Tecnología</h3>
          </a>
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">🏠</span>
            <h3 class="font-medium text-text">Hogar</h3>
          </a>
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">🎨</span>
            <h3 class="font-medium text-text">Arte</h3>
          </a>
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">🧑‍⚕️</span>
            <h3 class="font-medium text-text">Salud</h3>
          </a>
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">📚</span>
            <h3 class="font-medium text-text">Educación</h3>
          </a>
          <a href="/explorar" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
            <span class="text-3xl">🔧</span>
            <h3 class="font-medium text-text">Servicios</h3>
          </a>
        </div>
      </div>
    </section>

    <!-- Publicaciones destacadas -->
    <section id="publicaciones" class="bg-muted px-6 py-20">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="font-display text-4xl font-bold text-text mb-2">Publicaciones destacadas</h2>
            <p class="text-text/60">Nuestra selección de publicaciones más populares.</p>
          </div>
          <a href="/explorar" class="text-primary font-medium flex items-center gap-1 hover:text-primary-hover transition" id="pub-ver-mas">Ver más →</a>
        </div>
        <div class="Publicaciones grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Publicación 1 -->
          <div class="Publicacion flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden">
            <div class="relative">
              <img src="/vestidor.jpg" alt="Vestido de noche elegante" class="w-full h-56 object-cover" />
              <span class="absolute top-3 left-3 bg-primary text-background text-xs font-medium px-3 py-1 rounded-full">Venta</span>
              <input type="checkbox" id="like-1" class="peer hidden" />
              <label for="like-1" class="like-btn absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer text-text/40 peer-checked:text-primary transition-transform duration-200 active:scale-75">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 transition-transform duration-200 peer-checked:scale-125" fill="currentColor">
                  <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.1-1 4.4-.3 5.7 1.4l1.7 2.1 1.7-2.1c1.3-1.7 3.6-2.4 5.7-1.4 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
                </svg>
              </label>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-medium text-text text-lg mb-1">Vestido de noche elegante</h3>
              <p class="text-text/60 text-sm mb-4">El vestido de noche elegante es perfecto para ocasiones especiales.</p>
              <div class="flex items-center justify-between text-sm text-text/60 border-b border-border pb-3 mb-3">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.6.2.2.5.2.7 0C12.3 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                  </svg>
                  Bogotá
                </span>
                <span>Hace 2 días</span>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span class="text-background text-xs font-bold">MG</span>
                  </div>
                  <span class="text-sm text-text">María González</span>
                </div>
                <span class="font-bold text-primary">$85.000</span>
              </div>
              <button class="w-full mt-auto bg-primary hover:bg-primary-hover text-background font-medium py-2 rounded-full">Contactar</button>
            </div>
          </div>

          <!-- Publicación 2 -->
          <div class="Publicacion flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden">
            <div class="relative">
              <img src="/guitarra.jpg" alt="Clases de guitarra online" class="w-full h-56 object-cover" />
              <span class="absolute top-3 left-3 bg-accent text-background text-xs font-medium px-3 py-1 rounded-full">Servicio</span>
              <input type="checkbox" id="like-2" class="peer hidden" />
              <label for="like-2" class="like-btn absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer text-text/40 peer-checked:text-primary transition-transform duration-200 active:scale-75">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 transition-transform duration-200 peer-checked:scale-125" fill="currentColor">
                  <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.1-1 4.4-.3 5.7 1.4l1.7 2.1 1.7-2.1c1.3-1.7 3.6-2.4 5.7-1.4 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
                </svg>
              </label>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-medium text-text text-lg mb-1">Clases de guitarra online</h3>
              <p class="text-text/60 text-sm mb-4">Aprende a tocar la guitarra con nuestros instructores expertos.</p>
              <div class="flex items-center justify-between text-sm text-text/60 border-b border-border pb-3 mb-3">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.6.2.2.5.2.7 0C12.3 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                  </svg>
                  Medellín
                </span>
                <span>Hace 5 días</span>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <span class="text-background text-xs font-bold">CM</span>
                  </div>
                  <span class="text-sm text-text">Carlos Mendez</span>
                </div>
                <span class="font-bold text-primary">$40.000</span>
              </div>
              <button class="w-full mt-auto bg-primary hover:bg-primary-hover text-background font-medium py-2 rounded-full">Contactar</button>
            </div>
          </div>

          <!-- Publicación 3 -->
          <div class="Publicacion flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden">
            <div class="relative">
              <img src="/Lenovo.jpg" alt="Laptop Lenovo ThinkPad T14" class="w-full h-56 object-cover" />
              <span class="absolute top-3 left-3 bg-primary text-background text-xs font-medium px-3 py-1 rounded-full">Venta</span>
              <input type="checkbox" id="like-3" class="peer hidden" />
              <label for="like-3" class="like-btn absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer text-text/40 peer-checked:text-primary transition-transform duration-200 active:scale-75">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 transition-transform duration-200 peer-checked:scale-125" fill="currentColor">
                  <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.1-1 4.4-.3 5.7 1.4l1.7 2.1 1.7-2.1c1.3-1.7 3.6-2.4 5.7-1.4 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
                </svg>
              </label>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-medium text-text text-lg mb-1">Laptop Lenovo ThinkPad T14</h3>
              <p class="text-text/60 text-sm mb-4">Potente laptop para trabajo y entretenimiento.</p>
              <div class="flex items-center justify-between text-sm text-text/60 border-b border-border pb-3 mb-3">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.6.2.2.5.2.7 0C12.3 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                  </svg>
                  Cali
                </span>
                <span>Hace 1 día</span>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span class="text-background text-xs font-bold">FO</span>
                  </div>
                  <span class="text-sm text-text">Fabián Ortiz</span>
                </div>
                <span class="font-bold text-primary">$2.800.000</span>
              </div>
              <button class="w-full mt-auto bg-primary hover:bg-primary-hover text-background font-medium py-2 rounded-full">Contactar</button>
            </div>
          </div>

          <!-- Publicación 4 -->
          <div class="Publicacion flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden">
            <div class="relative">
              <img src="/libro_de_receta.jpg" alt="Libro de recetas" class="w-full h-56 object-cover" />
              <span class="absolute top-3 left-3 bg-text text-background text-xs font-medium px-3 py-1 rounded-full">Donación</span>
              <input type="checkbox" id="like-4" class="peer hidden" />
              <label for="like-4" class="like-btn absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer text-text/40 peer-checked:text-primary transition-transform duration-200 active:scale-75">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 transition-transform duration-200 peer-checked:scale-125" fill="currentColor">
                  <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.1-1 4.4-.3 5.7 1.4l1.7 2.1 1.7-2.1c1.3-1.7 3.6-2.4 5.7-1.4 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
                </svg>
              </label>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-medium text-text text-lg mb-1">Libro de recetas</h3>
              <p class="text-text/60 text-sm mb-4">Descubre deliciosas recetas para preparar en casa.</p>
              <div class="flex items-center justify-between text-sm text-text/60 border-b border-border pb-3 mb-3">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.6.2.2.5.2.7 0C12.3 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                  </svg>
                  Bucaramanga
                </span>
                <span>Hace 3 días</span>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-text flex items-center justify-center shrink-0">
                    <span class="text-background text-xs font-bold">ER</span>
                  </div>
                  <span class="text-sm text-text">Elena Rodríguez</span>
                </div>
                <span class="font-bold text-primary">$57.000</span>
              </div>
              <button class="w-full mt-auto bg-primary hover:bg-primary-hover text-background font-medium py-2 rounded-full">Contactar</button>
            </div>
          </div>

          <!-- Publicación 5 -->
          <div class="Publicacion flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden">
            <div class="relative">
              <img src="/Reparacion.jpg" alt="Servicio de reparación" class="w-full h-56 object-cover" />
              <span class="absolute top-3 left-3 bg-accent text-background text-xs font-medium px-3 py-1 rounded-full">Servicio</span>
              <input type="checkbox" id="like-5" class="peer hidden" />
              <label for="like-5" class="like-btn absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer text-text/40 peer-checked:text-primary transition-transform duration-200 active:scale-75">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 transition-transform duration-200 peer-checked:scale-125" fill="currentColor">
                  <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.1-1 4.4-.3 5.7 1.4l1.7 2.1 1.7-2.1c1.3-1.7 3.6-2.4 5.7-1.4 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
                </svg>
              </label>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-medium text-text text-lg mb-1">Servicio de reparación de bicicletas</h3>
              <p class="text-text/60 text-sm mb-4">Servicio de reparación de bicicletas.</p>
              <div class="flex items-center justify-between text-sm text-text/60 border-b border-border pb-3 mb-3">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.6.2.2.5.2.7 0C12.3 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                  </svg>
                  Barranquilla
                </span>
                <span>Hace 2 días</span>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <span class="text-background text-xs font-bold">JM</span>
                  </div>
                  <span class="text-sm text-text">Jorge Martínez</span>
                </div>
                <span class="font-bold text-primary">$55.000</span>
              </div>
              <button class="w-full mt-auto bg-primary hover:bg-primary-hover text-background font-medium py-2 rounded-full">Contactar</button>
            </div>
          </div>

          <!-- Publicación 6 -->
          <div class="Publicacion flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden">
            <div class="relative">
              <img src="/Olla.jpg" alt="Olla de cerámica" class="w-full h-56 object-cover" />
              <span class="absolute top-3 left-3 bg-primary text-background text-xs font-medium px-3 py-1 rounded-full">Venta</span>
              <input type="checkbox" id="like-6" class="peer hidden" />
              <label for="like-6" class="like-btn absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer text-text/40 peer-checked:text-primary transition-transform duration-200 active:scale-75">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 transition-transform duration-200 peer-checked:scale-125" fill="currentColor">
                  <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.1-1 4.4-.3 5.7 1.4l1.7 2.1 1.7-2.1c1.3-1.7 3.6-2.4 5.7-1.4 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
                </svg>
              </label>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-medium text-text text-lg mb-1">Olla de cerámica</h3>
              <p class="text-text/60 text-sm mb-4">La olla de cerámica es un accesorio ideal para cocinar y servir platos deliciosos.</p>
              <div class="flex items-center justify-between text-sm text-text/60 border-b border-border pb-3 mb-3">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.6.2.2.5.2.7 0C12.3 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                  </svg>
                  Cúcuta
                </span>
                <span>Hace 5 días</span>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span class="text-background text-xs font-bold">DR</span>
                  </div>
                  <span class="text-sm text-text">Diego Rodríguez</span>
                </div>
                <span class="font-bold text-primary">$86.200</span>
              </div>
              <button class="w-full mt-auto bg-primary hover:bg-primary-hover text-background font-medium py-2 rounded-full">Contactar</button>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Cómo funciona -->
    <section id="como-funciona" class="bg-background px-6 py-24">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="font-display text-4xl font-bold text-text mb-3">¿Cómo funciona?</h2>
        <p class="text-text/60 mb-14">Simple y sin complicaciones.</p>
        <div class="steps grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="step bg-background border border-border rounded-2xl px-8 py-10">
            <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted rounded-2xl text-3xl">👤</div>
            <span class="text-primary font-bold text-sm">01</span>
            <h3 class="font-bold text-text text-xl mt-2 mb-3">Regístrate gratis</h3>
            <p class="text-text/60">Crea tu cuenta en segundos y configura tu perfil de vendedor o comprador.</p>
          </div>
          <div class="step bg-background border border-border rounded-2xl px-8 py-10">
            <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted rounded-2xl text-3xl">🔍</div>
            <span class="text-primary font-bold text-sm">02</span>
            <h3 class="font-bold text-text text-xl mt-2 mb-3">Publica o explora</h3>
            <p class="text-text/60">Sube tus productos, servicios o donaciones, o encuentra lo que necesitas.</p>
          </div>
          <div class="step bg-background border border-border rounded-2xl px-8 py-10">
            <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted rounded-2xl text-3xl">🤝</div>
            <span class="text-primary font-bold text-sm">03</span>
            <h3 class="font-bold text-text text-xl mt-2 mb-3">Conecta y cierra</h3>
            <p class="text-text/60">Habla directamente con el vendedor, acuerden los detalles y listo.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section id="cta" class="bg-primary px-10 py-24">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="font-display text-4xl font-bold text-background mb-4">¡Únete a la comunidad!</h2>
        <p class="text-background/80 mb-10">Miles de emprendedores ya intercambian en MUISKA.</p>
        <a href="/registro" class="inline-block bg-background hover:bg-muted text-primary font-bold px-8 py-4 rounded-full transition" id="cta-registro">Crear cuenta gratis →</a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-text px-6 py-8">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <a href="/" class="flex items-center gap-3 shrink-0">
          <span class="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-background font-display font-bold">M</span>
          <span class="font-display text-xl font-bold text-background">MUISKA</span>
        </a>
        <p class="text-background/60 text-sm text-center">&copy; 2024 MUISKA Community Commerce. Todos los derechos reservados.</p>
        <nav class="flex items-center gap-6">
          <a href="#" class="text-background/70 hover:text-background text-sm transition">Términos</a>
          <a href="#" class="text-background/70 hover:text-background text-sm transition">Privacidad</a>
          <a href="#" class="text-background/70 hover:text-background text-sm transition">Ayuda</a>
        </nav>
      </div>
    </footer>
  `;

  // Navegación SPA en botones y enlaces
  page.querySelectorAll("[data-path]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.path);
    });
  });

  page.querySelectorAll("a[href^='/']").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.getAttribute("href"));
    });
  });

  return page;
};

export default HomePage;