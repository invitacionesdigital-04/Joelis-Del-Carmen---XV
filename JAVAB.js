// Variables globales
let isPlaying = false;
let player = null;
let playerReady = false;
let currentSlide = 0;
let totalSlides = 0;
let enableMusic = false;

// Funciones globales para los botones del modal
function enterWithMusicClick() {
    // console.log('Función enterWithMusicClick() ejecutada');
    enableMusic = true;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
    }

    // El player se precarga desde DOMContentLoaded (ver loadYouTubeAPI más abajo),
    // así que si ya está listo llamamos playVideo() de inmediato, dentro del mismo
    // tick del click. Eso es justo lo que iOS Safari exige para permitir el audio;
    // si el player se crea o se reproduce de forma asíncrona (fuera del gesto del
    // usuario), iOS lo bloquea en silencio y por eso antes no sonaba en iPhone.
    if (playerReady && player) {
        document.getElementById('musicPlayer').style.display = 'block';
        player.unMute();
        player.setVolume(100);
        player.playVideo();
        isPlaying = true;
        updateMusicIcon();
        // En iOS/Safari a veces el primer playVideo() no arranca el audio
        // aunque sí "conecta" el gesto; reintentamos una vez, todavía
        // dentro del mismo ciclo de interacción del usuario.
        setTimeout(() => {
            if (player && typeof player.getPlayerState === 'function' && player.getPlayerState() !== 1) {
                player.unMute();
                player.playVideo();
            }
        }, 300);
    }
    // Si el player todavía no está listo (conexión lenta), onPlayerReady se
    // encarga de reproducir apenas termine de inicializar.
}

function enterWithoutMusicClick() {
    // console.log('Función enterWithoutMusicClick() ejecutada');
    enableMusic = false;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para configurar los botones directamente
function setupModalButtons() {
    const enterWithMusic = document.getElementById('enterWithMusic');
    const enterWithoutMusic = document.getElementById('enterWithoutMusic');
    const modal = document.getElementById('welcomeModal');

    // console.log('Configurando botones del modal...', { enterWithMusic, enterWithoutMusic, modal });

    if (enterWithMusic) {
        enterWithMusic.onclick = function() {
            // console.log('Botón CON música clickeado');
            enableMusic = true;
            if (modal) {
                modal.style.display = 'none';
            }
            // Mismo arreglo que en enterWithMusicClick: reproducir de forma
            // síncrona dentro del click si el player ya está precargado.
            if (playerReady && player) {
                const musicPlayer = document.getElementById('musicPlayer');
                if (musicPlayer) musicPlayer.style.display = 'block';
                player.unMute();
                player.setVolume(100);
                player.playVideo();
                isPlaying = true;
                updateMusicIcon();
                setTimeout(() => {
                    if (player && typeof player.getPlayerState === 'function' && player.getPlayerState() !== 1) {
                        player.unMute();
                        player.playVideo();
                    }
                }, 300);
            }
        };
    }

    if (enterWithoutMusic) {
        enterWithoutMusic.onclick = function() {
            // console.log('Botón SIN música clickeado');
            enableMusic = false;
            if (modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOM cargado, inicializando...');
    initializeCountdown();
    initializeCarousel();
    setupModalButtons();

    // Mostrar el modal de bienvenida para elegir con/sin música
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    // Se precarga el player de YouTube desde el inicio (no en el click) para
    // que playVideo() pueda ejecutarse de forma síncrona dentro del gesto del
    // usuario en enterWithMusicClick(). Esto es lo que exige iOS Safari.
    loadYouTubeAPI();
});

// También configurar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    // console.log('Ventana completamente cargada');
    setupModalButtons();
});



// Cargar la API de YouTube
function loadYouTubeAPI() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
}

// Función llamada por la API de YouTube
function initializeYouTubePlayer() {
    if (player) return; // ya inicializado, evita crear el player dos veces

    player = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'vwp1yxtcD7I',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playlist: 'vwp1yxtcD7I'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    playerReady = true;
    const musicPlayer = document.getElementById('musicPlayer');
    const musicToggle = document.getElementById('musicToggle');

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    // Caso borde: el usuario ya hizo click en "con música" antes de que el
    // player terminara de inicializar (ej. conexión lenta). Lo reproducimos
    // apenas esté listo.
    if (enableMusic && !isPlaying) {
        if (musicPlayer) musicPlayer.style.display = 'block';
        event.target.unMute();
        event.target.setVolume(100);
        event.target.playVideo();
        isPlaying = true;
        updateMusicIcon();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
    }
    updateMusicIcon();
}

function onPlayerError(event) {
    console.log('Error al cargar el video de YouTube');
    const musicPlayer = document.getElementById('musicPlayer');
    musicPlayer.style.display = 'block';
    isPlaying = false;
    updateMusicIcon();
}

function toggleMusic() {
    if (player) {
        if (isPlaying) {
            player.pauseVideo();
            isPlaying = false;
        } else {
            player.playVideo();
            isPlaying = true;
        }
        updateMusicIcon();
    }
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (volumeIcon) {
        if (isPlaying) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08" stroke="#222" stroke-width="2"></path>
                <circle cx="6.5" cy="12" r="1" fill="#D98FA3"/>
            `;
        } else {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <line x1="19" y1="9" x2="17" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <line x1="17" y1="9" x2="19" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <circle cx="6.5" cy="12" r="1" fill="#ff6b6b"/>
            `;
        }
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2026-10-10T14:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel infinito: las fotos avanzan siempre en la misma dirección y,
// al llegar a la última, siguen con la primera (en círculo) sin devolverse.
// Para lograrlo se clonan las fotos antes y después de las originales y,
// cuando el carrusel entra en la zona de clones, salta sin animación a la
// foto equivalente del grupo original (el salto es invisible).
let carouselPos = 0;
let carouselTrack = null;

function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if (!track) return;
    carouselTrack = track;

    const originals = Array.from(track.querySelectorAll('.carousel-item'));
    totalSlides = originals.length;
    if (!totalSlides) return;
    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;

    // Clones: un juego completo después y otro antes de las fotos reales
    originals.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });
    originals.slice().reverse().forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        track.insertBefore(clone, track.firstChild);
    });

    carouselPos = totalSlides; // primera foto real

    if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
    if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));

    track.addEventListener('transitionend', (e) => {
        if (e.target === track) normalizeCarousel();
    });

    renderCarousel(false);
    requestAnimationFrame(() => renderCarousel(false));
    setTimeout(() => renderCarousel(false), 200);
    window.addEventListener('load', () => renderCarousel(false));
    window.addEventListener('resize', () => renderCarousel(false));

    // Auto-play del carrusel (siempre hacia adelante)
    setInterval(() => moveCarousel(1), 2500);
}

function carouselCenterOffset() {
    const items = carouselTrack.querySelectorAll('.carousel-item');
    const itemWidth = items[0].getBoundingClientRect().width || 1;
    const containerWidth = carouselTrack.parentElement.getBoundingClientRect().width;
    const visible = Math.max(1, Math.round(containerWidth / itemWidth));
    return Math.floor(visible / 2);
}

function renderCarousel(animate) {
    if (!carouselTrack) return;
    const items = carouselTrack.querySelectorAll('.carousel-item');
    const target = items[carouselPos];
    if (!target) return;
    const translateXpx = -Math.round(target.offsetLeft);

    if (animate) {
        carouselTrack.style.transform = `translateX(${translateXpx}px)`;
    } else {
        // Salto instantáneo: sin animar el track ni el zoom de la foto central
        carouselTrack.classList.add('no-anim');
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = `translateX(${translateXpx}px)`;
        markCenterCarouselItem();
        void carouselTrack.offsetWidth; // fuerza reflow
        carouselTrack.style.transition = '';
        carouselTrack.classList.remove('no-anim');
    }
    markCenterCarouselItem();
    updateSlideCounter();
}

// Si estamos en la zona de clones, saltar a la foto real equivalente
function normalizeCarousel() {
    if (carouselPos >= totalSlides * 2) {
        carouselPos -= totalSlides;
        renderCarousel(false);
    } else if (carouselPos < totalSlides) {
        carouselPos += totalSlides;
        renderCarousel(false);
    }
}

function moveCarousel(direction) {
    if (!carouselTrack) return;
    normalizeCarousel(); // por si el navegador no disparó transitionend (pestaña en segundo plano)
    carouselPos += direction;
    renderCarousel(true);
}

function nextSlide() { moveCarousel(1); }
function previousSlide() { moveCarousel(-1); }

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    if (!currentSlideElement || !carouselTrack || !totalSlides) return;
    const centerIndex = carouselPos + carouselCenterOffset();
    currentSlideElement.textContent = (centerIndex % totalSlides) + 1;
}

// Marca la foto del centro (se agranda en PC)
function markCenterCarouselItem() {
    if (!carouselTrack) return;
    const items = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    items.forEach(it => it.classList.remove('is-center'));
    const center = items[carouselPos + carouselCenterOffset()];
    if (center) center.classList.add('is-center');
}

// Funciones de los botones
function openLocation(location) {
    // Enlaces de ejemplo (dirección ficticia) - ceremonia y celebración
    const mapsUrls = {
        ceremony: "https://www.google.com/maps/search/?api=1&query=Villa+Seven+Guerra+Santo+Domingo",
        reception: "https://www.google.com/maps/search/?api=1&query=Villa+Seven+Guerra+Santo+Domingo"
    };
    const mapsUrl = mapsUrls[location] || mapsUrls.ceremony;
    window.open(mapsUrl, '_blank');
}

// NOTA: esta es una plantilla de ejemplo. Reemplaza el contenido de estas
// funciones con tu propio enlace (Google Drive, Google Form, lista de
// regalos, etc.) cuando personalices la invitación.

function sharePhotos() {
    // Ejemplo: aquí se debe colocar el enlace real a la carpeta de Google Drive.
    window.open('https://photos.app.goo.gl/hRzQC4HjiejjFSPs5', '_blank');
}

function showDressCode() {
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeDressCodeModal() {
    // El click dentro de la tarjeta del modal usa stopPropagation(), así que
    // esta función solo se dispara al hacer click en el fondo oscuro o en la X.
    const modal = document.getElementById('dresscodeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showGifts() {
    window.open('https://cuentapro11.github.io/numero-cuenta-ejemplo/', '_blank');
}

function confirmAttendance() {
    const telefono = '18296367285';
    const mensaje = 'Estimada familia:\n\n' +
        'Por medio del presente, confirmo con mucho gusto mi asistencia a la celebración de los XV años de Joelis Del Carmen, ' +
        'el sábado 10 de octubre de 2026, de 2:00 p.m. a 7:00 p.m.\n\n' +
        'Agradezco la amable invitación.\n\n' +
        'Atentamente,\n';
    window.open('https://wa.me/' + telefono + '?text=' + encodeURIComponent(mensaje), '_blank');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 700; color: #fff; margin-bottom: 0.35rem; letter-spacing: 0.2px;">${title}</h4>
        <p style="color: #ddd;">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Nota: el efecto de portada ahora se logra 100% con CSS (hero fijo detrás
// del contenido, ver .hero-section y .content en CCSB.css), igual que en
// boda100L. Ya no hace falta mover nada por JS en el scroll.


// Forzar limpieza de caches en clientes antiguos
(function() {
  function clearCaches() {
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      }).catch(() => {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearCaches);
  } else {
    clearCaches();
  }
})();
