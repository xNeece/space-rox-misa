/* =========================================================
   XATSPACE ROXY — V2
   ========================================================= */

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

// Cambiá estas URLs cuando quieras.
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/roxinzunza",
  tiktok: "https://www.tiktok.com/",
  facebook: "https://www.facebook.com/",
  youtube: "https://youtu.be/Tk9TM7-eTmw?si=NpcyesZNgQA3lw9Q",
  x: "https://x.com/"
};

const songs = [
  { title:"One of the Girls", artist:"The Weeknd, JENNIE & Lily Rose Depp", file:"assets/music/song01.mp3" },
  { title:"Love is a bitch", artist:"Two feet.", file:"assets/music/song02.mp3" },
  { title:"I feel like a drowning ", artist:"Two feet.", file:"assets/music/song03.mp3" },
  { title:"House of ballons", artist:"The Weeknd", file:"assets/music/song04.mp3" },
  { title:"Often ", artist:"The Weeknd", file:"assets/music/song05.mp3" },
  { title:"Take me to the church", artist:"Hozier.", file:"assets/music/song06.mp3" },
  { title:"Way down we go", artist:"Kaleo", file:"assets/music/song07.mp3" },
  { title:"Joseph ", artist:"Falling in reverse", file:"assets/music/song08.mp3" },
  { title:"So far so fake", artist:"Pierce the veil.", file:"assets/music/song09.mp3" },
  { title:"Killing You", artist:"Asking Alexandria.", file:"assets/music/song10.mp3" }
];

const photos = Array.from({length:37}, (_,i) => ({
  number:i+1,
  file:`assets/gallery/photo${String(i+1).padStart(2,"0")}.jpg`,
  locked:[3,6,9,12,15,16,19,21,22,25,27,30,33,35,37].includes(i+1)
}));

const videos = Array.from({length:15}, (_,i) => ({
  number:i+1,
  file:`assets/videos/video${String(i+1).padStart(2,"0")}.mp4`,
  locked:[3,6,9,10,11,13,15].includes(i+1)
}));

const gifts = Array.from({length:6}, (_,i) => ({
  number:i+1,
  file:`assets/gifts/gift${String(i+1).padStart(2,"0")}.png`
}));

let currentSong = 0;
let currentPhotoIndex = 0;
let currentVideoIndex = 0;
const unlockedPhotos = new Set();
const unlockedVideos = new Set();
const startScreen = document.getElementById("startScreen");
const mainScreen = document.getElementById("mainScreen");
const audio = document.getElementById("audioPlayer");
let hobbyNotificationTimer = null;

/* =========================================================
   PANTALLA INICIAL
   ========================================================= */

/* =========================================================
   PANTALLA INICIAL Y TRANSICIÓN DE 5 IMÁGENES
   ========================================================= */

function enterSpace(){
  const overlay = document.getElementById("transitionOverlay");
  const transitionImages = overlay.querySelectorAll(".transition-gallery img");
  
  startScreen.classList.add("hidden");
  overlay.classList.remove("hidden");

  // Secuencia de animación para las 5 imágenes de transición
  let currentTransIndex = 0;
  if(transitionImages.length > 0) {
    transitionImages[0].classList.add("active");
  }

  // Cambia de imagen cada 800ms (ajustable según el tiempo total)
  const transInterval = setInterval(() => {
    if(transitionImages[currentTransIndex]) {
      transitionImages[currentTransIndex].classList.remove("active");
    }
    currentTransIndex++;
    if(currentTransIndex < transitionImages.length) {
      transitionImages[currentTransIndex].classList.add("active");
    } else {
      clearInterval(transInterval);
    }
  }, 600);

  // Tiempo total que dura la transición antes de mostrar el Xatspace principal (6 segundos)
  window.setTimeout(() => {
    mainScreen.classList.remove("hidden");
    renderPhotos();
    loadSong(currentSong);

    if(!window.__mainAtmosphereStarted){
      window.__mainAtmosphereStarted = true;
      requestAnimationFrame(() => startAtmosphere("mainFx","main"));
    }

    window.setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.setAttribute("aria-hidden","true");
      audio.play().catch(() => {});
    }, 100);
  }, 3800);
}

function deny(){
  window.location.href = "https://xat.com/";
}

document.getElementById("acceptBtn").addEventListener("click", enterSpace);
document.getElementById("denyBtn").addEventListener("click", deny);

function deny(){
  window.location.href = "https://xat.com/";
}

document.getElementById("acceptBtn").addEventListener("click", enterSpace);
document.getElementById("denyBtn").addEventListener("click", deny);

/* =========================================================
   GALERÍA
   ========================================================= */

function renderPhotos(){
  const content = document.getElementById("tabContent");

  content.innerHTML = `
    <div class="gallery">
      ${photos.map(p => {
        const isLocked = p.locked && !unlockedPhotos.has(p.number);
        return `
        <article class="photo-card ${isLocked ? "locked" : ""}"
                 data-file="${p.file}" data-number="${p.number}" data-locked="${isLocked}">
          <img src="${p.file}" alt="Foto ${p.number}" onerror="this.style.opacity='.05'">

          ${isLocked ? `
            <div class="lock-overlay">
              <div class="lock-icon">🔒</div>
              <div class="lock-text">
                Contenido + 18<br>
                Comprar por 1500 xats
              </div>
              <button class="unlock" type="button">
                🔓 Desbloquear
              </button>
            </div>
          ` : ""}
        </article>
      `}).join("")}
    </div>
  `;

  document.getElementById("photoCount").textContent = photos.length;

  content.querySelectorAll(".photo-card").forEach(card => {
    card.addEventListener("click", event => {
      const file = card.dataset.file;
      const number = Number(card.dataset.number);

      if(event.target.closest(".unlock")){
        event.stopPropagation();
        openUnlockModal(number, file);
        return;
      }

      // Las fotos bloqueadas no se abren hasta confirmar el desbloqueo.
      if(card.dataset.locked === "true") return;
      openLightbox(number);
    });
  });
}

function openUnlockModal(number, file, type="photo"){
  const modal = document.getElementById("unlockModal");
  if(!modal) return;
  modal.dataset.contentNumber = String(number);
  modal.dataset.file = file;
  modal.dataset.type = type;
  const title=document.getElementById("unlockTitle");
  const message=document.getElementById("unlockMessage");
  if(title) title.textContent=type==="video" ? "Desbloquear video" : "Desbloquear imagen";
  if(message) message.innerHTML=`¿Estás seguro de gastar <strong>${type==="video"?"3000":"1500"} xats</strong> para ver ${type==="video"?"este video":"esta imagen"}?`;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeUnlockModal(){
  const modal = document.getElementById("unlockModal");
  if(!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

document.getElementById("unlockCancel")?.addEventListener("click", closeUnlockModal);
document.getElementById("unlockModalClose")?.addEventListener("click", closeUnlockModal);
document.getElementById("unlockModal")?.addEventListener("click", event => {
  if(event.target.id === "unlockModal") closeUnlockModal();
});
document.getElementById("unlockAccept")?.addEventListener("click", () => {
  const modal = document.getElementById("unlockModal");
  const number = Number(modal?.dataset.contentNumber);
  const file = modal?.dataset.file;
  const type = modal?.dataset.type || "photo";
  if(!number || !file) return;

  if(type === "video") {
    unlockedVideos.add(number);
    closeUnlockModal();
    renderVideos();
    window.setTimeout(() => openVideoLightbox(number), 30);
  } else {
    unlockedPhotos.add(number);
    closeUnlockModal();
    renderPhotos();
    window.setTimeout(() => openLightbox(number), 30);
  }
});

/* =========================================================
   PESTAÑAS SUPERIORES
   ========================================================= */

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const name = tab.dataset.tab;

    if(name === "photos"){
      renderPhotos();
      return;
    }
    if(name === "videos"){
      renderVideos();
      return;
    }
    if(name === "music"){
      renderMusicPage();
      return;
    }
    if(name === "gift"){
      renderGifts();
      return;
    }
    if(name === "hobbies"){
      renderHobbies();
      return;
    }
    if(name === "friends"){
      renderFriends();
      return;
    }
  });
});

function showPanel(title,text){
  document.getElementById("tabContent").innerHTML = `
    <div class="info-panel">
      <h2>${title}</h2>
      <p>${text}</p>
    </div>
  `;
}

/* =========================================================
   VIDEOS — 10 elementos verticales, 2 visibles + 1 bloqueado
   ========================================================= */
function renderVideos(){
  const content=document.getElementById("tabContent");
  content.innerHTML=`
    <div class="video-gallery">
      ${videos.map(v=>{
        const locked=v.locked && !unlockedVideos.has(v.number);
        // Si no está bloqueado, añadimos #t=0.5 para que el navegador cargue una miniatura del video
        const videoSource = locked ? "" : `${v.file}#t=0.5`;
        return `
          <article class="video-card ${locked?"locked":""}" data-number="${v.number}" data-file="${v.file}" data-locked="${locked}">
            <div class="video-frame">
              <video ${locked?"":'preload="metadata"'} playsinline muted>
                ${locked?"":`<source src="${videoSource}" type="video/mp4">`}
              </video>
              ${locked?`
                <div class="video-lock-overlay">
                  <div class="lock-icon">🔒</div>
                  <div class="lock-text"><br>Video +18</br> Comprar por 3000 xats </div>
                  <button class="unlock-video" type="button">🔓 Desbloquear</button>
                </div>`:""}
            </div>
            <div class="video-caption"><span>VIDEO ${String(v.number).padStart(2,"0")}</span><small>${locked?"Bloqueado":"Disponible"}</small></div>
          </article>`;
      }).join("")}
    </div>
  `;

  const count=document.getElementById("videoCount");
  if(count) count.textContent=videos.length;

  content.querySelectorAll(".video-card").forEach(card=>{
    card.addEventListener("click",event=>{
      const number=Number(card.dataset.number);
      if(event.target.closest(".unlock-video")){
        event.stopPropagation();
        openUnlockModal(number,card.dataset.file,"video");
        return;
      }
      if(card.dataset.locked === "true") return;
      openVideoLightbox(number);
    });
    const frame = card.querySelector(".video-frame");
    frame?.addEventListener("click", event => {
      if(event.target.closest(".unlock-video")) return;
      if(card.dataset.locked === "true") return;
      openVideoLightbox(Number(card.dataset.number));
    });
  });
}

/* =========================================================
   REGALADOS — 6 imágenes con ampliación animada
   ========================================================= */
function renderGifts(){
  const content=document.getElementById("tabContent");
  content.innerHTML=`
    <div class="gift-page">
      <div class="gift-grid">
        ${gifts.map(g=>`
          <article class="gift-card" data-number="${g.number}" data-file="${g.file}">
            <img src="${g.file}" alt="Regalo ${g.number}" onerror="this.onerror=null;this.src='assets/gallery/photo${String(g.number).padStart(2,"0")}.jpg'">
            <span>REGALO ${String(g.number).padStart(2,"0")}</span>
          </article>`).join("")}
      </div>
    </div>
  `;
  content.querySelectorAll(".gift-card").forEach(card=>{
    card.addEventListener("click",()=>openGiftLightbox(Number(card.dataset.number)));
  });
}

let currentGiftIndex=0;
function openGiftLightbox(number){
  const box=document.getElementById("giftLightbox");
  const img=document.getElementById("giftLightboxImage");
  if(!box||!img) return;
  const index=gifts.findIndex(g=>g.number===number);
  if(index<0) return;
  currentGiftIndex=index;
  img.src=gifts[index].file;
  img.classList.remove("gift-orbit-in");
  void img.offsetWidth;
  img.classList.add("gift-orbit-in");
  box.classList.remove("hidden");
}
function navigateGift(direction){
  currentGiftIndex=(currentGiftIndex+direction+gifts.length)%gifts.length;
  const img=document.getElementById("giftLightboxImage");
  if(!img) return;
  img.classList.remove("gift-orbit-in");
  void img.offsetWidth;
  img.src=gifts[currentGiftIndex].file;
  img.classList.add("gift-orbit-in");
}
function closeGiftLightbox(){
  const box=document.getElementById("giftLightbox");
  const img=document.getElementById("giftLightboxImage");
  if(box) box.classList.add("hidden");
  if(img) img.src="";
}
document.getElementById("giftLightboxClose")?.addEventListener("click",closeGiftLightbox);
document.getElementById("giftLightboxPrev")?.addEventListener("click",e=>{e.stopPropagation();navigateGift(-1);});
document.getElementById("giftLightboxNext")?.addEventListener("click",e=>{e.stopPropagation();navigateGift(1);});
document.getElementById("giftLightbox")?.addEventListener("click",e=>{if(e.target.id==="giftLightbox") closeGiftLightbox();});

/* =========================================================
   HOBBIES — Citas rotativas con autor y desplazamiento dinámico
   ========================================================= */

// Cada elemento ahora separa el texto principal de su autor
const hobbyQuotes = [
  { 
    texto: "Tenía una voluntad inquebrantable y un deseo inestable, y la combinación de ambos la convertía en algo peligroso.", 
    autor: "Trono de Cristal" 
  },
  { 
    texto: "No le debe lealtad a nadie salvo a sí misma, y no vacilará en atravesarte el corazón con un cuchillo.", 
    autor: "Trono de Cristal" 
  },
  { 
    texto: "Porque hay personas que necesitan que las salves tanto como tú precisas ser salvada.", 
    autor: "Trono de Cristal" 
  },
  { 
    texto: "Jacob era como mi propio sol particular, un sol que combatía las nubes de mi vida. Alrededor de Edward, todo mi mundo orbitaba; él era mi eje central.", 
    autor: "Luna Nueva" 
  },
  { 
    texto: "De las nubes me puedo encargar, pero no puedo luchar contra un eclipse.", 
    autor: "Luna Nueva" 
  },
  { 
    texto: "No sé qué composición tendrán nuestras almas, pero sea de lo que sea, la suya es igual a la mía.", 
    autor: "Cumbres Borrascosas" 
  },
  { 
    texto: "En cualquier caso, todos estamos condenados, obligados a vivir fuera de las puertas del cielo. Y creo que a mí me gusta más vivir en la oscuridad, junto a mi sombra.", 
    autor: "Haunting Adeline" 
  },
  { 
    texto: "Algunas personas llegan para salvarte. Otras, para enseñarte a arder.", 
    autor: "RoxInz " 
  }
];

let hobbyIndex = 0;

async function typeBalloon(balloon,text){
  const span=balloon.querySelector("span");
  if(!span) return;
  balloon.classList.add("show");
  span.textContent="";
  const speed=18;
  for(let i=0;i<text.length;i++){
    span.textContent += text[i];
    await new Promise(resolve=>setTimeout(resolve,speed));
  }
}

async function startHobbyNotifications() {
  if (hobbyNotificationTimer) clearTimeout(hobbyNotificationTimer);
  const container = document.getElementById("hobbyQuotes");
  if (!container) return;
  
  // Limpiamos el contenedor al iniciar el ciclo
  container.innerHTML = "";
  hobbyIndex = 0;

  // Función interna para agregar un nuevo mensaje con límite máximo de 3 en pantalla
  const agregarSiguienteMensaje = async () => {
    // Si ya llegamos al final del array, podemos reiniciar el ciclo o detenernos
    if (hobbyIndex >= hobbyQuotes.length) {
      hobbyIndex = 0; // Bucle infinito de frases
    }

    const data = hobbyQuotes[hobbyIndex];
    hobbyIndex++;

    // 1. Crear el elemento del globo de texto
    const balloon = document.createElement("div");
    balloon.classList.add("quote-balloon");

    // 2. Párrafo para la frase principal
    const spanText = document.createElement("span");
    spanText.style.display = "block";
    balloon.appendChild(spanText);

    // 3. Párrafo independiente para el autor abajo
    const spanAuthor = document.createElement("span");
    spanAuthor.style.display = "block";
    spanAuthor.style.marginTop = "6px";
    spanAuthor.style.fontStyle = "italic";
    spanAuthor.style.color = "#888"; // Tono sutil para el autor
    spanAuthor.style.textAlign = "right";
    balloon.appendChild(spanAuthor);

    // Agregar el globo al contenedor de la interfaz
    container.appendChild(balloon);

    // Límite de 3 mensajes visibles: si hay más de 3, borramos el primero (el más viejo)
    const balloons = container.querySelectorAll(".quote-balloon");
    if (balloons.length > 6) {
      container.removeChild(balloons[0]);
    }

    // Efecto de escritura automatizada (Typewriter) para el texto y luego el autor
    balloon.classList.add("show");
    
    // Escribir la frase
    const frase = `"${data.texto}"`;
    for (let i = 0; i < frase.length; i++) {
      spanText.textContent += frase[i];
      await new Promise(resolve => setTimeout(resolve, 14));
    }

    // Escribir el autor en su propio párrafo abajo
    const autorTexto = `- ${data.autor}`;
    for (let i = 0; i < autorTexto.length; i++) {
      spanAuthor.textContent += autorTexto[i];
      await new Promise(resolve => setTimeout(resolve, 18));
    }

    // Programar la aparición del siguiente mensaje después de una pausa
    hobbyNotificationTimer = setTimeout(agregarSiguienteMensaje, 3500);
  };

  // Iniciar la secuencia con el primer mensaje
  agregarSiguienteMensaje();
}

function renderHobbies(){
  const content = document.getElementById("tabContent");
  content.innerHTML = `
    <div class="hobbies-page">
      <div class="hobby-quotes" id="hobbyQuotes">
        <!-- Los globos se cargarán dinámicamente aquí -->
      </div>
      <div class="hobby-render">
        <div class="hobby-center-mark" aria-hidden="true"></div>
        <div class="hobby-petal-layer" aria-hidden="true"><span>❀</span><span>✿</span><span>❀</span><span>✿</span><span>❀</span><span>✿</span></div>
        <img src="assets/hobbies/hobby-render.png" alt="Render de hobbies" onerror="this.onerror=null;this.src='assets/gallery/photo01.jpg'">
      </div>
    </div>
  `;
  startHobbyNotifications();
}


/* =========================================================
   REDES SOCIALES
   ========================================================= */

document.querySelector('.socials a[title="Instagram"]').href = SOCIAL_LINKS.instagram;
document.querySelector('.socials a[title="TikTok"]').href = SOCIAL_LINKS.tiktok;
document.querySelector('.socials a[title="Facebook"]').href = SOCIAL_LINKS.facebook;
document.querySelector('.socials a[title="YouTube"]').href = SOCIAL_LINKS.youtube;
document.querySelector('.socials a[title="X"]').href = SOCIAL_LINKS.x;

/* =========================================================
   REPRODUCTOR / ONDA / MÚSICA
   ========================================================= */

function coverFor(index){
  return `assets/music/cover${String((index % 20)+1).padStart(2,"0")}.jpg`;
}

function coverFallback(img,index){
  img.onerror=()=>{
    img.onerror=null;
    img.src=`assets/gallery/photo${String((index % 20)+1).padStart(2,"0")}.jpg`;
  };
}

function formatTime(seconds){
  if(!Number.isFinite(seconds)) return "00:00";
  const m=Math.floor(seconds/60).toString().padStart(2,"0");
  const s=Math.floor(seconds%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function buildMiniWave(){
  const el=document.getElementById("miniWave");
  if(!el || el.children.length) return;
  for(let i=0;i<28;i++){
    const bar=document.createElement("i");
    bar.style.height=`${3 + ((i*7)%10)}px`;
    el.appendChild(bar);
  }
}

function loadSong(index){
  if(!songs.length) return;
  currentSong=(index+songs.length)%songs.length;
  const song=songs[currentSong];
  audio.src=song.file;
  document.getElementById("nowTitle").textContent=song.title;
  document.getElementById("nowArtist").textContent=song.artist;
  document.getElementById("musicCount").textContent=songs.length;
  syncMusicPage();
}

function nextSong(playNow=true){
  loadSong(currentSong+1);
  if(playNow) audio.play().catch(()=>{});
}
function prevSong(){
  loadSong(currentSong-1);
  audio.play().catch(()=>{});
}

document.getElementById("nextBtn").addEventListener("click",()=>nextSong(true));
document.getElementById("prevBtn").addEventListener("click",prevSong);
document.getElementById("playBtn").addEventListener("click",()=>{
  if(audio.paused) audio.play().catch(()=>{}); else audio.pause();
});

audio.addEventListener("play",()=>{
  document.getElementById("playBtn").textContent="Ⅱ";
  document.querySelector(".sound-wave")?.classList.remove("paused");
});
audio.addEventListener("pause",()=>{
  document.getElementById("playBtn").textContent="▶";
  document.querySelector(".sound-wave")?.classList.add("paused");
});
audio.addEventListener("ended",()=>nextSong(true));

audio.addEventListener("timeupdate",()=>{
  const bar=document.getElementById("progressBar");
  if(audio.duration) bar.style.width=`${(audio.currentTime/audio.duration)*100}%`;
  syncMusicPage();
});

audio.addEventListener("loadedmetadata",syncMusicPage);

function buildWaveform(){
  const wave=document.getElementById("musicWave");
  if(!wave || wave.children.length) return;
  for(let i=0;i<68;i++){
    const bar=document.createElement("i");
    bar.style.setProperty("--h",`${7 + ((i*13)%43)}px`);
        bar.style.animationDelay=`-${(i%9)*0.09}s`;
    wave.appendChild(bar);
  }
}

function renderMusicPage(){
  const content=document.getElementById("tabContent");
  content.innerHTML=`
    <div class="music-page music-page-compact">
      <div class="music-carousel" id="musicCarousel" aria-label="Portadas de canciones">
        <button class="carousel-arrow carousel-prev" id="coverPrev" title="Canción anterior">‹</button>
        <div class="music-stage">
          ${songs.map((s,i)=>`
            <article class="music-cover-card ${i===currentSong?"active":""}" data-index="${i}">
              <img src="${coverFor(i)}" alt="Portada ${i+1}" onerror="this.onerror=null;this.src='assets/gallery/photo${String((i % 20)+1).padStart(2,"0")}.jpg';this.style.opacity='.86'">
              <span class="cover-number">${String(i+1).padStart(2,"0")}/${String(songs.length).padStart(2,"0")}</span>
              <div class="cover-label">${s.title}<br><span>${s.artist}</span></div>
            </article>
          `).join("")}
        </div>
        <button class="carousel-arrow carousel-next" id="coverNext" title="Canción siguiente">›</button>
      </div>

      <div class="music-main music-main-compact">
        <div class="music-player-side">
          <div id="musicWave" class="sound-wave compact-wave" aria-label="Onda de sonido"></div>
          <div class="music-controls">
            <button id="musicPrev" title="Anterior">|◀</button>
            <button id="musicPlay" class="music-play" title="Pausa / reproducir">▶</button>
            <button id="musicNext" title="Siguiente">▶|</button>
          </div>
          <div class="music-time"><span id="musicCurrent">00:00</span><span id="musicDuration">00:00</span></div>
          <div id="musicProgress" class="music-progress" title="Progreso"><i></i></div>
          <div class="music-now-mini"><strong id="musicNowTitle">${songs[currentSong]?.title||"Sin música"}</strong><span id="musicNowArtist">${songs[currentSong]?.artist||"Agregá tus MP3"}</span></div>
        </div>

        <div class="playlist-box">
          ${songs.map((s,i)=>`
            <div class="playlist-row ${i===currentSong?"active":""}" data-index="${i}">
              <span class="playlist-num">${String(i+1).padStart(2,"0")}</span>
              <img src="${coverFor(i)}" alt="" onerror="this.onerror=null;this.src='assets/gallery/photo${String((i % 20)+1).padStart(2,"0")}.jpg';this.style.opacity='.86'">
              <div class="playlist-info"><strong>${s.title}</strong><span>${s.artist}</span></div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  buildWaveform();
  applyMusicCarousel();

  content.querySelectorAll(".music-cover-card,.playlist-row").forEach(el=>el.addEventListener("click",()=>selectMusic(Number(el.dataset.index),true)));
  document.getElementById("coverPrev").addEventListener("click",()=>prevSong());
  document.getElementById("coverNext").addEventListener("click",()=>nextSong(true));
  document.getElementById("musicPrev").addEventListener("click",prevSong);
  document.getElementById("musicNext").addEventListener("click",()=>nextSong(true));
  document.getElementById("musicPlay").addEventListener("click",()=>{
    if(audio.paused) audio.play().catch(()=>{}); else audio.pause();
  });
  document.getElementById("musicProgress").addEventListener("click",e=>{
    if(!audio.duration) return;
    const r=e.currentTarget.getBoundingClientRect();
    audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration;
  });
}

function applyMusicCarousel(){
  const cards=document.querySelectorAll(".music-cover-card");
  if(!cards.length) return;
  cards.forEach(card=>{
    const i=Number(card.dataset.index);
    let diff=i-currentSong;
    const n=songs.length;
    if(diff>n/2) diff-=n;
    if(diff<-n/2) diff+=n;
    card.classList.toggle("active",diff===0);
    card.dataset.position=String(Math.max(-2,Math.min(2,diff)));
    card.setAttribute("aria-hidden", Math.abs(diff)>2 ? "true" : "false");
  });
}

function selectMusic(index,playNow=false){
  loadSong(index);
  if(playNow) audio.play().catch(()=>{});
  if(document.querySelector(".music-page")) syncMusicPage();
}

function syncMusicPage(){
  const page=document.querySelector(".music-page");
  if(!page) return;
  const song=songs[currentSong];
  const title=document.getElementById("musicNowTitle");
  const artist=document.getElementById("musicNowArtist");
  const current=document.getElementById("musicCurrent");
  const duration=document.getElementById("musicDuration");
  const progress=document.querySelector("#musicProgress i");
  if(title) title.textContent=song?.title||"Sin música";
  if(artist) artist.textContent=song?.artist||"Agregá tus MP3";
  if(current) current.textContent=formatTime(audio.currentTime);
  if(duration) duration.textContent=formatTime(audio.duration);
  if(progress) progress.style.width=audio.duration?`${(audio.currentTime/audio.duration)*100}%`:"0%";
  page.querySelectorAll("[data-index]").forEach(el=>el.classList.toggle("active",Number(el.dataset.index)===currentSong));
  applyMusicCarousel();
  const wave=document.getElementById("musicWave");
  if(wave) wave.classList.toggle("paused",audio.paused);
}

buildMiniWave();

/* =========================================================
   FECHA Y HORA EN LA BARRA LATERAL
   ========================================================= */
const monthNames=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
const dayNames=["SUN","MON","TUE","WED","THU","FRI","SAT"];
function updateClock(){
  const now=new Date();
  document.getElementById("dayName").textContent=dayNames[now.getDay()];
  document.getElementById("dayNumber").textContent=String(now.getDate()).padStart(2,"0");
  document.getElementById("monthLine").textContent=monthNames[now.getMonth()];
  document.getElementById("clockLine").textContent=[now.getHours(),now.getMinutes(),now.getSeconds()].map(n=>String(n).padStart(2,"0")).join(":");
}
updateClock();
setInterval(updateClock,1000);

/* =========================================================
   LIGHTBOX
   ========================================================= */

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");

function nextUnlockedPhoto(from,direction){
  let index=from;
  for(let step=0;step<photos.length;step++){
    index=(index+direction+photos.length)%photos.length;
    const photo=photos[index];
    if(!photo.locked || unlockedPhotos.has(photo.number)) return index;
  }
  return from;
}

function openLightbox(number){
  const index=typeof number === "number" ? photos.findIndex(p=>p.number===number) : photos.findIndex(p=>p.file===number);
  if(index<0) return;
  const photo=photos[index];
  if(photo.locked && !unlockedPhotos.has(photo.number)) return;
  currentPhotoIndex=index;
  lightboxImage.src=photo.file;
  lightbox.classList.remove("hidden");
}

function navigatePhoto(direction){
  const next=nextUnlockedPhoto(currentPhotoIndex,direction);
  if(next===currentPhotoIndex) return;
  currentPhotoIndex=next;
  lightboxImage.classList.remove("photo-nav-in");
  void lightboxImage.offsetWidth;
  lightboxImage.classList.add("photo-nav-in");
  lightboxImage.src=photos[currentPhotoIndex].file;
}

function closeLightbox(){
  lightbox.classList.add("hidden");
  lightboxImage.src="";
}

document.getElementById("lightboxClose").addEventListener("click",closeLightbox);
document.getElementById("lightboxPrev").addEventListener("click",e=>{e.stopPropagation();navigatePhoto(-1);});
document.getElementById("lightboxNext").addEventListener("click",e=>{e.stopPropagation();navigatePhoto(1);});
lightbox.addEventListener("click",event=>{if(event.target===lightbox) closeLightbox();});

const videoLightbox=document.getElementById("videoLightbox");
const videoLightboxPlayer=document.getElementById("videoLightboxPlayer");

function nextUnlockedVideo(from,direction){
  let index=from;
  for(let step=0;step<videos.length;step++){
    index=(index+direction+videos.length)%videos.length;
    const video=videos[index];
    if(!video.locked || unlockedVideos.has(video.number)) return index;
  }
  return from;
}

function openVideoLightbox(number){
  const index=videos.findIndex(v=>v.number===number);
  if(index<0) return;
  const video=videos[index];
  if(video.locked && !unlockedVideos.has(video.number)) return;
  currentVideoIndex=index;
  videoLightboxPlayer.pause();
  videoLightboxPlayer.src=video.file;
  
  // Mantiene el video silenciado para permitir la reproducción automática sin restricciones del navegador
  videoLightboxPlayer.muted=true;
  videoLightboxPlayer.loop = true; 

  videoLightboxPlayer.setAttribute("aria-label", `Video ${video.number}`);
  videoLightbox.classList.remove("hidden");
  videoLightbox.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");

  // Inicia la reproducción automática de inmediato
  videoLightboxPlayer.play().catch(error => {
    console.log("El navegador restringió la reproducción automática:", error);
  });
}

function navigateVideo(direction){
  const next=nextUnlockedVideo(currentVideoIndex,direction);
  if(next===currentVideoIndex) return;
  currentVideoIndex=next;
  videoLightboxPlayer.pause();
  videoLightboxPlayer.src=videos[currentVideoIndex].file;
  videoLightboxPlayer.muted=true; // Mantiene el video silenciado para permitir el autoplay sin bloqueos del navegador
  
  // 1. Forzar la carga y reproducción automática inmediata
  videoLightboxPlayer.play().catch(error => {
    console.log("El navegador restringió la reproducción automática al navegar:", error);
  });
}

function closeVideoLightbox(){
  videoLightboxPlayer.pause();
  videoLightboxPlayer.removeAttribute("src");
  videoLightboxPlayer.load();
  videoLightbox.classList.add("hidden");
  videoLightbox.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}

document.getElementById("videoLightboxClose").addEventListener("click",closeVideoLightbox);
document.getElementById("videoLightboxPrev").addEventListener("click",e=>{e.stopPropagation();navigateVideo(-1);});
document.getElementById("videoLightboxNext").addEventListener("click",e=>{e.stopPropagation();navigateVideo(1);});
videoLightbox.addEventListener("click",event=>{if(event.target===videoLightbox) closeVideoLightbox();});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){closeLightbox();closeVideoLightbox();}
  if(!lightbox.classList.contains("hidden")){
    if(event.key==="ArrowLeft") navigatePhoto(-1);
    if(event.key==="ArrowRight") navigatePhoto(1);
  }
  if(!videoLightbox.classList.contains("hidden")){
    if(event.key==="ArrowLeft") navigateVideo(-1);
    if(event.key==="ArrowRight") navigateVideo(1);
  }
});


/* =========================================================
   EFECTOS VISUALES — V4
   Nieve / partículas / pétalos / líneas / órbitas.
   IMPORTANTE: no se usan pulsos rápidos ni cambios bruscos
   de brillo. El movimiento es lento y continuo para evitar
   parpadeos molestos.
   ========================================================= */

function startAtmosphere(canvasId, mode = "main"){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;

  const ctx = canvas.getContext("2d", { alpha:true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 1, height = 1, dpr = 1;
  let snow = [], petals = [], orbits = [], streaks = [];
  let raf = 0;
  let started = false;

  const rand = (a,b) => a + Math.random() * (b-a);

  function resize(){
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // Escala una sola vez por resize. No se cambia durante la animación.
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const area = width * height;

    // Bastantes copos, pero pequeños y muy suaves.
    const snowCount = reduceMotion
      ? Math.min(28, Math.max(16, Math.round(area / 55000)))
      : Math.min(105, Math.max(55, Math.round(area / 17000)));

    snow = Array.from({length:snowCount}, () => ({
      x:rand(0,width),
      y:rand(-height,height),
      r:rand(.65,2.0),
      speed:rand(.16,.55),
      drift:rand(-.08,.08),
      sway:rand(.08,.22),
      phase:rand(0,Math.PI*2),
      alpha:rand(.16,.42)
    }));

    const petalCount = reduceMotion ? 3 : (mode === "start" ? 9 : 14);
    petals = Array.from({length:petalCount}, () => ({
      x:rand(-30,width+30),
      y:rand(-height,height),
      size:rand(5,10),
      speed:rand(.16,.38),
      drift:rand(-.13,.13),
      rot:rand(0,Math.PI*2),
      spin:rand(-.006,.006),
      phase:rand(0,Math.PI*2),
      alpha:rand(.12,.25),
      red:Math.random() < .18
    }));

    const orbitCount = mode === "start" ? 4 : 6;
    orbits = Array.from({length:orbitCount},(_,i) => ({
      x:rand(width*.08,width*.92),
      y:rand(height*.12,height*.9),
      rx:rand(45,150),
      ry:rand(18,68),
      rot:rand(-.8,.8),
      speed:rand(-.00065,.00065),
      angle:rand(0,Math.PI*2),
      alpha:rand(.035,.075),
      red:i === orbitCount-1 && mode !== "start"
    }));

    streaks = Array.from({length:reduceMotion ? 2 : 5}, () => ({
      x:rand(0,width),
      y:rand(0,height),
      len:rand(35,105),
      speed:rand(.15,.38),
      alpha:rand(.025,.07),
      angle:rand(-.12,.12)
    }));
  }

  function drawSnowflake(s){
    // Movimiento lento, continuo y sin cambios de luminosidad.
    s.y += s.speed;
    s.x += s.drift + Math.sin(s.y * .008 + s.phase) * s.sway * .08;

    if(s.y > height + 6){
      s.y = -6;
      s.x = rand(0,width);
    }
    if(s.x < -6) s.x = width + 6;
    if(s.x > width + 6) s.x = -6;

    ctx.beginPath();
    ctx.fillStyle = `rgba(225,225,225,${s.alpha})`;
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fill();
  }

  function drawPetal(p,t){
    p.y += p.speed;
    p.x += p.drift + Math.sin(t * .00045 + p.phase) * .06;
    p.rot += p.spin;

    if(p.y > height + 25){
      p.y = -25;
      p.x = rand(-20,width+20);
    }
    if(p.x > width+30) p.x = -30;
    if(p.x < -30) p.x = width+30;

    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rot);
    ctx.scale(1,.62);

    ctx.beginPath();
    ctx.moveTo(0,-p.size);
    ctx.bezierCurveTo(p.size*.9,-p.size*.35,p.size*.85,p.size*.65,0,p.size);
    ctx.bezierCurveTo(-p.size*.85,p.size*.65,-p.size*.9,-p.size*.35,0,-p.size);

    ctx.fillStyle = p.red
      ? `rgba(150,30,38,${p.alpha})`
      : `rgba(205,205,205,${p.alpha})`;
    ctx.fill();

    ctx.restore();
  }

  function drawOrbit(o){
    o.angle += o.speed;

    ctx.save();
    ctx.translate(o.x,o.y);
    ctx.rotate(o.rot + Math.sin(o.angle) * .035);

    ctx.beginPath();
    ctx.ellipse(0,0,o.rx,o.ry,0,0,Math.PI*2);

    ctx.strokeStyle = o.red
      ? `rgba(155,35,42,${o.alpha})`
      : `rgba(190,190,190,${o.alpha})`;
    ctx.lineWidth = .7;
    ctx.stroke();
    ctx.restore();
  }

  function drawStreak(s){
    s.y += s.speed;

    if(s.y > height + 30){
      s.y = -30;
      s.x = rand(0,width);
    }

    ctx.save();
    ctx.translate(s.x,s.y);
    ctx.rotate(s.angle);

    const grad = ctx.createLinearGradient(0,0,s.len,0);
    grad.addColorStop(0,"rgba(200,200,200,0)");
    grad.addColorStop(.5,`rgba(200,200,200,${s.alpha})`);
    grad.addColorStop(1,"rgba(200,200,200,0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = .55;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(s.len,0);
    ctx.stroke();

    ctx.restore();
  }

  function frame(t){
    // Una sola limpieza por cuadro; sin flashes ni cambios globales de opacity.
    ctx.clearRect(0,0,width,height);

    orbits.forEach(drawOrbit);
    streaks.forEach(drawStreak);
    snow.forEach(drawSnowflake);
    petals.forEach(p => drawPetal(p,t));

    if(!reduceMotion){
      raf = requestAnimationFrame(frame);
    }
  }

  resize();
  window.addEventListener("resize",resize,{passive:true});

  // Evita iniciar múltiples loops si enterSpace se ejecuta otra vez.
  if(started) return;
  started = true;

  if(reduceMotion){
    frame(0);
  }else{
    raf = requestAnimationFrame(frame);
  }
}

/*
 * La atmósfera principal se inicia solamente cuando la pantalla
 * principal está visible. Así no hay un canvas animándose debajo
 * de una pantalla oculta durante el inicio.
 */
startAtmosphere("startFx","start");

/* =========================================================
   AMIGOS — 6 imágenes con escala de grises, zoom y brillo
   ========================================================= */
const friends = Array.from({length:6}, (_,i) => ({
  number: i + 1,
  file: `assets/friends/friend${String(i+1).padStart(2,"0")}.jpg`,
  name: `Character ${i+1}`
}));

function renderFriends(){
  const content = document.getElementById("tabContent");
  content.innerHTML = `
    <div class="friends-page">
      <div class="friends-grid">
        ${friends.map(f => `
          <div class="friend-wrapper">
            <span class="friend-num">0${f.number}</span>
            <article class="friend-card" data-number="${f.number}">
              <img src="${f.file}" alt="${f.name}" onerror="this.onerror=null;this.src='assets/gallery/photo${String(f.number).padStart(2,"0")}.jpg'">
              <span class="friend-name">${f.name}</span>
            </article>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/* =========================================================
   AMIGOS — DATOS ACTUALIZADOS CON AVATAR, REGISTRO Y UID
   ========================================================= */
const friendsData = [
  {
    number: 1,
    name: "Mario",
    register: "Reg: APRESDECES",
    uid: "UID: 1517392869",
    file: "assets/friends/friend01.jpg",
    render: "assets/friends/render01.png",
    avatar: "assets/friends/avatar01.png", // Imagen circular del amigo
    video: "assets/friends/video01.mp4",
    link: "https://xat.me/1517392869",
    quote: "「 Te conocí apenas este año y, para ser sincero, eres de las pocas personas que realmente llegaron a agradarme. No suelo considerar fácilmente a alguien como un amigo, así que supongo que eso dice bastante. Espero que esta amistad continúe durante mucho tiempo. Te estimo y, aunque no suelo decirlo, te deseo lo mejor en lo que venga。 」"
  },
  {
    number: 2,
    name: "Lance",
    register: "Reg: MOSTLYSELFISH",
    uid: "UID: 1555016996",
    file: "assets/friends/friend02.jpg",
    render: "assets/friends/render02.png",
    avatar: "assets/friends/avatar02.png",
    video: "assets/friends/video02.mp4",
    link: "https://xat.me/1555016996",
    quote: "「 PARA THEIN SARDO MIKEY. A veces las palabras no son lo mío pero, a una de las leyendas más longevas del sat puntocon (?, y una de las personas más agradables de tratar por aquí. Apareciendo aquí aprovecho para agradecer y destacarte por el buen trato, las risas, el estar pendiente de una forma u otra así no tengamos tanto tiempo y hasta por ser buena amiga de mis amigos. Por ello y más cosas, me alegra decirte que cuentas con un humilde servidor para tonterías o para cuando quieras hablar con alguien. Y recuerda, los haters solo se tragan como al alcohol (?. Grande Thein。 」"
  },
  {
    number: 3,
    name: "Urbina",
    register: "Reg: VIRTUEVIAN",
    uid: "UID: 201414748",
    file: "assets/friends/friend03.jpg",
    render: "assets/friends/render03.png",
    avatar: "assets/friends/avatar03.png",
    video: "assets/friends/video03.mp4",
    link: "https://xat.me/201414748",
    quote: "「 Te adoro amiga de mi corazón, cuenta conmigo para las que salgan. 15 años de amistad y contando. Reales hasta la muerte oiste bb。 」"
  },
  {
    number: 4,
    name: "Lugo",
    register: "REG: ILUGUINHOO",
    uid: "UID: 266694246",
    file: "assets/friends/friend04.jpg",
    render: "assets/friends/render04.png",
    avatar: "assets/friends/avatar04.png",
    video: "assets/friends/video04.mp4",
    link: "https://xat.me/266694246",
    quote: "「 ”Hola mi potra, espero que algún dia compartamos peso muerto juntos y una sentadilla también, con cariño, Luguito”。 」"
  },
  {
    number: 5,
    name: "Nece",
    register: "REG: NECE",
    uid: "UID: 2200022",
    file: "assets/friends/friend05.jpg",
    render: "assets/friends/render05.png",
    avatar: "assets/friends/avatar05.png",
    video: "assets/friends/video05.mp4",
    link: "https://xat.me/Nece",
    quote: "「 Hace no mucho nos conocemos, pero gracias por hablarme y preocuparte de vez en cuando si ando sad o no. Quiero que sepas que las circunstancias a veces no estan a nuestro favor, pero hay que seguir adelante, entonces si caes levante, y si necesitas ayuda sabes que podes contar conmigo amiga Rox, gracias por estar。 」"
  },
  {
    number: 6,
    name: "Nai",
    register: "REG: YUFFIE",
    uid: "UID: 292726185",
    file: "assets/friends/friend06.jpg",
    render: "assets/friends/render06.png",
    avatar: "assets/friends/avatar06.png",
    video: "assets/friends/video06.mp4",
    link: "https://xat.me/292726185",
    quote: "「 ここに好きな言葉を入れてください。 」"
  },
  {
    number: 7,
    name: "Dami",
    register: "REG: KEIOU",
    uid: "UID: 108534737",
    file: "assets/friends/friend07.jpg",
    render: "assets/friends/render07.png",
    avatar: "assets/friends/avatar07.png",
    video: "assets/friends/video07.mp4",
    link: "https://xat.me/108534737",
    quote: "「 Que onda roxy, espero que tu hermanita te haya dado permiso para este space, si no le voy a tener que contar, saludos。 」"
  }
];

function renderFriends(){
  const content = document.getElementById("tabContent");
  content.innerHTML = `
    <div class="friends-page">
      <div class="friends-grid">
        ${friendsData.map(f => `
          <div class="friend-wrapper" onclick="openFriendDetail(${f.number})">
            <span class="friend-num">0${f.number}</span>
            <article class="friend-card" data-number="${f.number}">
              <img src="${f.file}" alt="${f.name}" onerror="this.onerror=null;this.src='assets/gallery/photo${String(f.number).padStart(2,"0")}.jpg'">
              <span class="friend-name">${f.name}</span>
            </article>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function openFriendDetail(num){
  const f = friendsData.find(item => item.number === num);
  const content = document.getElementById("tabContent");
  
  content.innerHTML = `
    <div class="friend-detail-container">
      <button class="back-to-friends-btn" onclick="renderFriends()">‹ VOLVER</button>

      <div class="friend-detail-grid">
        <!-- Izquierda: Render y Partículas -->
        <div class="friend-render-side">
          <div class="particles-container">
            <span class="particle"></span>
            <span class="particle"></span>
            <span class="particle"></span>
            <span class="particle"></span>
            <span class="particle"></span>
          </div>
          <img src="${f.render}" class="floating-render" alt="Render" onerror="this.style.display='none'">
        </div>

        <!-- Derecha: Textos, Avatar y Video -->
        <div class="friend-info-side">
          <div class="friend-top-row">
            <div class="quote-box">
              <p>${f.quote}</p>
            </div>

            <div class="friend-profile-group">
              <span class="friend-title-name">${f.name}</span>
              <div class="friend-avatar-circle">
                <img src="${f.avatar}" alt="${f.name}" onerror="this.onerror=null;this.src='assets/gallery/photo01.jpg'">
              </div>
              <span class="friend-reg">${f.register}</span>
              <span class="friend-uid">${f.uid}</span>
            </div>
          </div>

          <div class="friend-video-box">
            <video src="${f.video}" autoplay muted loop playsinfile></video>
          </div>
        </div>
      </div>

      <!-- Botón inferior derecho con la cadena y el texto "Space" -->
      <a href="${f.link}" target="_blank" class="back-to-friends-btn friend-link-btn">🔗 Space</a>
    </div>
  `;
}
