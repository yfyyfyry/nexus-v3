// Nexus App - Versión REAL con IndexedDB + WebSockets
let user = JSON.parse(localStorage.getItem('nexus_v9_user') || 'null');
let activeVidId = null;
let activeChatUserId = null;
let storyTimer = null;
let isMobile = false;

// Detectar dispositivo
function detectDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
    
    if (isMobile) {
        return 'mobile';
    } else if (isTablet) {
        return 'tablet';
    } else {
        return 'pc';
    }
}

// Mostrar selector de dispositivo al cargar
function showDeviceSelection() {
    const modal = document.createElement('div');
    modal.id = 'deviceModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 40px; text-align: center; max-width: 400px; width: 90%;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">¿Desde dónde ves Nexus?</h2>
            <p style="margin: 0 0 30px 0; color: #666; font-size: 16px;">Selecciona tu dispositivo para la mejor experiencia</p>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button onclick="selectDevice('mobile')" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; border: none; padding: 15px 25px; border-radius: 15px;
                    font-size: 16px; font-weight: 600; cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; align-items: center; gap: 10px;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-mobile-alt"></i>
                    Móvil
                </button>
                
                <button onclick="selectDevice('tablet')" style="
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white; border: none; padding: 15px 25px; border-radius: 15px;
                    font-size: 16px; font-weight: 600; cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; align-items: center; gap: 10px;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-tablet-alt"></i>
                    Tablet
                </button>
                
                <button onclick="selectDevice('pc')" style="
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white; border: none; padding: 15px 25px; border-radius: 15px;
                    font-size: 16px; font-weight: 600; cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex; align-items: center; gap: 10px;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-desktop"></i>
                    PC
                </button>
            </div>
            
            <p style="margin: 20px 0 0 0; color: #999; font-size: 12px;">
                Puedes cambiar esto después en Configuración
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Seleccionar dispositivo
function selectDevice(device) {
    localStorage.setItem('nexus_device', device);
    applyDeviceStyles(device);
    document.getElementById('deviceModal').remove();
    init();
}

// Aplicar estilos de dispositivo
function applyDeviceStyles(device) {
    const root = document.documentElement;
    
    if (device === 'pc') {
        // Estilos para PC - Interfaz completa
        root.style.setProperty('--app-width', '1400px');
        root.style.setProperty('--header-height', '80px');
        root.style.setProperty('--nav-height', '70px');
        root.style.setProperty('--card-width', '400px');
        root.style.setProperty('--card-height', '500px');
        root.style.setProperty('--font-size-base', '16px');
        root.style.setProperty('--spacing-large', '30px');
        root.style.setProperty('--border-radius', '12px');
        root.style.setProperty('--shadow', '0 8px 32px rgba(0,0,0,0.1)');
        
        // Layout para PC
        document.body.style.cssText += `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-size: 16px;
        `;
        
        // Header para PC
        const header = document.querySelector('.header');
        if (header) {
            header.style.cssText += `
                height: 80px;
                padding: 0 40px;
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0,0,0,0.1);
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            `;
        }
        
        // Navigation para PC
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.cssText += `
                height: 70px;
                padding: 0 40px;
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(20px);
                border-top: 1px solid rgba(0,0,0,0.1);
                box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
                justify-content: center;
                gap: 40px;
            `;
        }
        
        // Video cards para PC
        const style = document.createElement('style');
        style.textContent = `
            .video-card {
                width: 400px !important;
                height: 500px !important;
                border-radius: 12px !important;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
                transition: transform 0.3s, box-shadow 0.3s !important;
                margin: 15px !important;
            }
            
            .video-card:hover {
                transform: translateY(-8px) !important;
                box-shadow: 0 16px 48px rgba(0,0,0,0.15) !important;
            }
            
            .video-card video {
                height: 250px !important;
                border-radius: 12px 12px 0 0 !important;
            }
            
            .v-actions {
                padding: 20px !important;
                gap: 15px !important;
            }
            
            .act-btn {
                padding: 12px 20px !important;
                font-size: 14px !important;
                border-radius: 10px !important;
                transition: all 0.3s !important;
            }
            
            .act-btn:hover {
                transform: scale(1.1) !important;
                box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
            }
            
            .homePage {
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)) !important;
                gap: 30px !important;
                padding: 40px !important;
                max-width: 1400px !important;
                margin: 0 auto !important;
            }
            
            .header {
                max-width: 1400px !important;
                margin: 0 auto !important;
            }
            
            .nav {
                max-width: 1400px !important;
                margin: 0 auto !important;
            }
            
            .story-bar {
                padding: 20px 40px !important;
                gap: 20px !important;
            }
            
            .story-avatar {
                width: 70px !important;
                height: 70px !important;
                border-width: 3px !important;
            }
            
            .search-bar {
                max-width: 600px !important;
                margin: 0 auto !important;
                height: 50px !important;
                font-size: 16px !important;
                border-radius: 25px !important;
            }
            
            .modal {
                border-radius: 20px !important;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
            }
            
            .upload-modal {
                max-width: 600px !important;
                margin: 0 auto !important;
            }
            
            .comment-modal {
                max-width: 500px !important;
                margin: 0 auto !important;
            }
            
            /* Scrollbar personalizada para PC */
            ::-webkit-scrollbar {
                width: 12px !important;
            }
            
            ::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1) !important;
                border-radius: 6px !important;
            }
            
            ::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                border-radius: 6px !important;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
            }
        `;
        document.head.appendChild(style);
        
    } else if (device === 'tablet') {
        // Estilos para Tablet
        root.style.setProperty('--app-width', '1000px');
        root.style.setProperty('--header-height', '70px');
        root.style.setProperty('--nav-height', '60px');
        root.style.setProperty('--card-width', '300px');
        root.style.setProperty('--card-height', '400px');
        root.style.setProperty('--font-size-base', '14px');
        root.style.setProperty('--spacing-large', '20px');
        root.style.setProperty('--border-radius', '10px');
        root.style.setProperty('--shadow', '0 6px 24px rgba(0,0,0,0.08)');
        
    } else {
        // Estilos para Móvil (por defecto)
        root.style.setProperty('--app-width', '100%');
        root.style.setProperty('--header-height', '60px');
        root.style.setProperty('--nav-height', '60px');
        root.style.setProperty('--card-width', '100%');
        root.style.setProperty('--card-height', 'auto');
        root.style.setProperty('--font-size-base', '14px');
        root.style.setProperty('--spacing-large', '15px');
        root.style.setProperty('--border-radius', '8px');
        root.style.setProperty('--shadow', '0 4px 16px rgba(0,0,0,0.06)');
    }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', async () => {
    await nexusAPI.initDB();
    await nexusAPI.initWebSockets();
    
    const savedMode = localStorage.getItem('nexus_device_mode');
    if (savedMode) {
        isMobile = savedMode === 'mobile';
        if (isMobile) {
            document.body.classList.add('mobile-mode');
            document.body.classList.remove('desktop-mode');
        } else {
            document.body.classList.add('desktop-mode');
            document.body.classList.remove('mobile-mode');
        }
        
        if (!user) {
            startGuestMode();
        } else {
            document.getElementById('authOverlay').style.display = 'none';
            showWelcomeMessage();
            init();
        }
    } else {
        showDeviceSelection();
    }
    
    // Escuchar actualizaciones en tiempo real
    window.addEventListener('nexus:new_content', (event) => {
        const { type, data } = event.detail;
        console.log('Nuevo contenido:', type, data);
        
        // Actualizar UI según tipo
        if (type === 'video') renderHome();
        if (type === 'story') renderStories();
    });
});

// Modo invitado
function startGuestMode() {
    console.log('Iniciando modo invitado...');
    user = { 
        name: 'Invitado', 
        email: 'guest@nexus.local', 
        color: '#666',
        _id: 'guest_' + Date.now()
    };
    
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('guestLoginBtn').style.display = 'block';
    showWelcomeMessage();
    init();
}

function showLoginModal() {
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('authEmail').value = '';
    document.getElementById('authPass').value = '';
    document.getElementById('regName').value = '';
    document.getElementById('regOnly').style.display = 'none';
    document.getElementById('authT').innerText = "Tu mundo, tus reglas.";
    document.getElementById('authL').innerText = "¿Nuevo aquí? Crea una cuenta";
}

function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
        background: linear-gradient(45deg, #ff0050, #ff4500); color: white; 
        padding: 15px 25px; border-radius: 20px; z-index: 10000;
        font-weight: bold; animation: slideDown 0.5s ease;
    `;
    welcomeDiv.innerHTML = '¡Hola! Bienvenido a Nexus! Esta app está en fase beta';
    document.body.appendChild(welcomeDiv);
    
    setTimeout(() => welcomeDiv.remove(), 4000);
}

// ==================== AUTENTICACIÓN ====================
async function handleAuth() {
    const email = document.getElementById('authEmail').value.trim().toLowerCase();
    const password = document.getElementById('authPass').value;
    const isReg = document.getElementById('regOnly').style.display !== 'none';
    
    if (!email || !password) {
        alert("Completa todos los campos");
        return;
    }
    
    if (!validEmailFormat(email)) {
        alert("Introduce un correo válido");
        return;
    }
    
    try {
        if (isReg) {
            const name = document.getElementById('regName').value.trim();
            if (!name) {
                alert("El nombre es requerido");
                return;
            }
            if (password.length < 8) {
                alert("La contraseña debe tener al menos 8 caracteres");
                return;
            }
            
            // Crear usuario en IndexedDB
            const newUser = {
                name,
                email,
                color: '#' + Math.floor(Math.random()*16777215).toString(16),
                followers: 0,
                following: 0,
                createdAt: Date.now()
            };
            
            try {
                const id = await nexusAPI.db.users.add(newUser);
                console.log('Usuario creado con ID:', id);
                user = { ...newUser, id };
                await nexusAPI.setUser(user);
                alert('¡Cuenta creada exitosamente!');
            } catch (dbError) {
                console.error('Error creando usuario:', dbError);
                alert('Error creando cuenta: ' + dbError.message);
                return;
            }
            
        } else {
            // Buscar usuario en IndexedDB
            try {
                const existingUser = await nexusAPI.db.users.where('email').equals(email).first();
                if (!existingUser) {
                    alert("Usuario no encontrado. Regístrate primero.");
                    return;
                }
                
                user = existingUser;
                await nexusAPI.setUser(user);
                console.log('Usuario encontrado:', user);
                
            } catch (dbError) {
                console.error('Error buscando usuario:', dbError);
                alert('Error iniciando sesión: ' + dbError.message);
                return;
            }
        }
        
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('guestLoginBtn').style.display = 'none';
        init();
        
    } catch (error) {
        console.error('Error en autenticación:', error);
        alert("Error en la autenticación: " + error.message);
    }
}

function toggleA() {
    const regOnly = document.getElementById('regOnly');
    const authT = document.getElementById('authT');
    const authL = document.getElementById('authL');
    
    if (regOnly.style.display === 'none') {
        regOnly.style.display = 'block';
        authT.innerText = "Crea tu cuenta de Nexus";
        authL.innerText = "¿Ya tienes cuenta? Inicia sesión";
    } else {
        regOnly.style.display = 'none';
        authT.innerText = "Tu mundo, tus reglas.";
        authL.innerText = "¿Nuevo aquí? Crea una cuenta";
    }
}

async function logout() {
    try {
        await nexusAPI.logout();
        user = null;
        document.getElementById('guestLoginBtn').style.display = 'block';
        startGuestMode();
    } catch (error) {
        console.error('Error en logout:', error);
        location.reload();
    }
}

// ==================== INICIALIZACIÓN ====================
async function init() {
    if (!user) return;
    
    setAvatar(document.getElementById('myAvatar'), user);
    setAvatar(document.getElementById('pBigAvatar'), user);
    
    document.getElementById('pNameDisp').innerText = user.name || 'Usuario';
    document.getElementById('pEmailDisp').innerText = user.email || '';
    
    await updateProfileStats();
    await renderHome();
    await renderStories();
    await renderInbox();
}

async function updateProfileStats() {
    if (!user) return;
    
    try {
        const profile = await nexusAPI.getUserProfile(user.email);
        if (profile) {
            document.getElementById('statFollowers').innerText = profile.followersCount || 0;
            document.getElementById('statFollowing').innerText = profile.followingCount || 0;
            
            const videos = await nexusAPI.getVideos();
            const userVideos = videos.filter(v => v.author === user.email);
            const likes = userVideos.reduce((total, video) => total + (video.likes ? video.likes.length : 0), 0);
            
            document.getElementById('statLikes').innerText = likes;
        }
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

function setAvatar(el, u) {
    if (!el) return;
    if (!u) { 
        el.innerText = '?'; 
        el.style.background = '#333'; 
        return; 
    }
    if (u.pfp) {
        el.innerHTML = `<img src="${u.pfp}" style="width:100%;height:100%;object-fit:cover">`;
    } else { 
        el.innerText = u.name ? u.name[0].toUpperCase() : '?'; 
        el.style.background = u.color || '#333'; 
    }
}

// ==================== VIDEOS ====================
async function renderHome() {
    try {
        console.log('Renderizando videos...');
        const videos = await nexusAPI.getVideos();
        const container = document.getElementById('homePage');
        
        console.log('Videos obtenidos:', videos.length);
        
        if (videos.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">No hay videos aún. ¡Sé el primero en subir!</div>';
            return;
        }
        
        // Obtener lista de amigos (usuarios que sigues)
        const friends = await getFriendsList();
        console.log('Amigos encontrados:', friends);
        
        container.innerHTML = videos.map(video => {
            const isOwnVideo = video.author === (user ? user.email : null);
            const likesCount = video.likes ? video.likes.length : 0;
            const commentsCount = video.comments ? video.comments.length : 0;
            const isLiked = user && user.email !== 'guest@nexus.local' && video.likes && video.likes.includes(user.email);
            const isFromFriend = friends.includes(video.author);
            
            return `
                <div class="video-card ${isFromFriend ? 'friend-video' : ''}">
                    ${isFromFriend ? '<div class="friend-badge">👥 Amigo</div>' : ''}
                    <video src="${video.videoUrl}" controls preload="metadata"></video>
                    <div class="v-body">
                        <div class="avatar-v" style="background:${video.authorColor || '#333'}">
                            ${video.authorAvatar ? 
                                `<img src="${video.authorAvatar}" style="width:100%;height:100%;object-fit:cover">` : 
                                (video.authorName || 'U')[0]}
                        </div>
                        <div style="flex:1">
                            <b>${escapeHtml(video.title)}</b><br>
                            <small style="color:#666">${escapeHtml(video.authorName || 'Usuario')} • ${timeAgo(video.createdAt)}</small>
                        </div>
                        ${isOwnVideo ? 
                            `<button class="del-btn-mini" onclick="deleteVideo(${video.id})">Borrar</button>` : 
                            `<button onclick="followUser('${video.author}')" style="background:var(--blue); color:white; border:none; padding:6px 15px; border-radius:10px; font-weight:600; font-size:12px">
                                ${friends.includes(video.author) ? 'Siguiendo' : 'Seguir'}
                            </button>`
                        }
                    </div>
                    <div class="v-actions">
                        <div class="act-group">
                            <button class="act-btn ${isLiked ? 'active-l' : ''}" onclick="toggleLike(${video.id}, this)">
                                <i class="fas fa-heart"></i>
                                <span>${formatNumber(likesCount)}</span>
                            </button>
                            <button class="act-btn" onclick="openComments(${video.id})">
                                <i class="fas fa-comment"></i>
                                <span>${formatNumber(commentsCount)}</span>
                            </button>
                            <button class="act-btn" onclick="shareVideo(${video.id})">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                    <!-- Comentarios visibles -->
                    <div class="comments-section">
                        <div class="comments-header" onclick="toggleComments(${video.id})">
                            <i class="fas fa-comments"></i>
                            <span>Comentarios (${formatNumber(commentsCount)})</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="comments-list" id="comments-${video.id}" style="display: none;">
                            ${renderVideoComments(video.comments || [])}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Videos renderizados correctamente');
        
    } catch (error) {
        console.error('Error cargando videos:', error);
        const container = document.getElementById('homePage');
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #ff3b30;">Error cargando videos. Recarga la página.</div>';
    }
}

// Obtener lista de amigos (usuarios que sigues)
async function getFriendsList() {
    try {
        if (!user || user.email === 'guest@nexus.local') return [];
        
        const follows = await nexusAPI.db.follows.where('followerId').equals(user.email).toArray();
        return follows.map(follow => follow.followingId);
    } catch (error) {
        console.error('Error obteniendo amigos:', error);
        return [];
    }
}

// Renderizar comentarios de un video
function renderVideoComments(comments) {
    if (!comments || comments.length === 0) {
        return '<div class="no-comments">No hay comentarios aún. ¡Sé el primero!</div>';
    }
    
    return comments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar" style="background:${comment.color || '#333'}">
                ${comment.avatar ? 
                    `<img src="${comment.avatar}" style="width:100%;height:100%;object-fit:cover">` : 
                    (comment.name || 'U')[0]}
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <strong>${escapeHtml(comment.name || 'Usuario')}</strong>
                    <small>${timeAgo(comment.createdAt)}</small>
                </div>
                <div class="comment-text">${escapeHtml(comment.content)}</div>
            </div>
        </div>
    `).join('');
}

// Toggle comentarios visibles
function toggleComments(videoId) {
    const commentsDiv = document.getElementById(`comments-${videoId}`);
    const headerDiv = commentsDiv.previousElementSibling;
    const chevron = headerDiv.querySelector('.fa-chevron-down');
    
    if (commentsDiv.style.display === 'none') {
        commentsDiv.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
    } else {
        commentsDiv.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

async function upContent() {
    const file = document.getElementById('vFile').files[0];
    const title = document.getElementById('vTitle').value.trim();
    const type = document.getElementById('vT').value;
    
    if (!file || !title) {
        alert("Selecciona un archivo y escribe un título");
        return;
    }
    
    try {
        if (!user || user.email === 'guest@nexus.local') {
            alert('Inicia sesión para subir contenido');
            return;
        }
        
        console.log('Iniciando upload de video...');
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                console.log('Archivo leído, tamaño:', e.target.result.length);
                
                const videoData = {
                    title,
                    description: '',
                    videoUrl: e.target.result,
                    type,
                    author: user.email,
                    authorName: user.name,
                    authorAvatar: user.pfp,
                    authorColor: user.color,
                    likes: [],
                    comments: [],
                    views: 0,
                    createdAt: Date.now()
                };
                
                console.log('Guardando video en IndexedDB...', videoData);
                
                try {
                    const id = await nexusAPI.db.videos.add(videoData);
                    console.log('Video guardado con ID:', id);
                    
                    // Agregar el ID al videoData para sincronización
                    videoData.id = id;
                    
                    // Broadcast a otros usuarios
                    await nexusAPI.broadcast('client-new_video', { video: videoData });
                    
                    alert("✅ Video subido exitosamente");
                    closeModal('uploadModal');
                    
                    // Limpiar formulario
                    document.getElementById('vFile').value = '';
                    document.getElementById('vTitle').value = '';
                    
                    // Refrescar la vista
                    await renderHome();
                    
                } catch (dbError) {
                    console.error('Error guardando video en IndexedDB:', dbError);
                    alert("❌ Error guardando video: " + dbError.message);
                }
                
            } catch (processError) {
                console.error('Error procesando archivo:', processError);
                alert("❌ Error procesando archivo: " + processError.message);
            }
        };
        
        reader.onerror = (fileError) => {
            console.error('Error leyendo archivo:', fileError);
            alert("❌ Error leyendo el archivo: " + fileError.message);
        };
        
        // Iniciar lectura del archivo
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error general en upload:', error);
        alert("❌ Error subiendo video: " + error.message);
    }
}

async function deleteVideo(videoId) {
    if (!confirm("¿Estás seguro de que quieres borrar este video?")) return;
    
    try {
        await nexusAPI.deleteVideo(videoId);
        alert("Video eliminado");
        renderHome();
    } catch (error) {
        alert("Error eliminando video: " + error.message);
    }
}

// ==================== LIKES Y SEGUIMIENTOS ====================
async function toggleLike(videoId, button) {
    try {
        if (!user || user.email === 'guest@nexus.local') {
            alert('Inicia sesión para dar like');
            return;
        }
        
        console.log('Dando like al video:', videoId);
        
        // Obtener video actual
        const video = await nexusAPI.db.videos.where('id').equals(videoId).first();
        if (!video) {
            console.error('Video no encontrado:', videoId);
            return;
        }
        
        // Verificar si ya dio like
        const alreadyLiked = video.likes && video.likes.includes(user.email);
        
        if (alreadyLiked) {
            // Quitar like
            video.likes = video.likes.filter(email => email !== user.email);
            await nexusAPI.db.videos.update(videoId, { likes: video.likes });
            
            // Broadcast unlike
            await nexusAPI.broadcast('client-unlike_video', { 
                videoId, 
                userId: user.email 
            });
            
            button.classList.remove('active-l');
            const span = button.querySelector('span');
            const currentCount = parseInt(span.textContent) || 0;
            span.textContent = formatNumber(currentCount - 1);
            
        } else {
            // Agregar like
            video.likes = (video.likes || []).concat(user.email);
            await nexusAPI.db.videos.update(videoId, { likes: video.likes });
            
            // Broadcast like
            await nexusAPI.broadcast('client-like_video', { 
                videoId, 
                userId: user.email 
            });
            
            button.classList.add('active-l');
            const span = button.querySelector('span');
            const currentCount = parseInt(span.textContent) || 0;
            span.textContent = formatNumber(currentCount + 1);
        }
        
        console.log('Like actualizado:', video.likes);
        
    } catch (error) {
        console.error('Error dando like:', error);
        alert('Error dando like: ' + error.message);
    }
}

function isLikedByUser(video) {
    if (!user || user.email === 'guest@nexus.local') return false;
    return video.likes && video.likes.includes(user.email);
}

async function followUser(userEmail) {
    try {
        if (!user || user.email === 'guest@nexus.local') {
            alert('Inicia sesión para seguir usuarios');
            return;
        }
        
        if (userEmail === user.email) {
            alert('No puedes seguirte a ti mismo');
            return;
        }
        
        console.log('Siguiendo al usuario:', userEmail);
        
        // Verificar si ya sigue
        const alreadyFollowing = await nexusAPI.db.follows
            .where('followerId').equals(user.email)
            .and(follow => follow.followingId === userEmail)
            .first();
        
        if (alreadyFollowing) {
            // Dejar de seguir
            await nexusAPI.db.follows.delete(alreadyFollowing.id);
            
            // Broadcast unfollow
            await nexusAPI.broadcast('client-unfollow_user', { 
                followerId: user.email, 
                followingId: userEmail 
            });
            
            alert('Dejaste de seguir');
            
        } else {
            // Seguir
            await nexusAPI.db.follows.add({
                followerId: user.email,
                followingId: userEmail,
                createdAt: Date.now()
            });
            
            // Broadcast follow
            await nexusAPI.broadcast('client-follow_user', { 
                followerId: user.email, 
                followingId: userEmail 
            });
            
            alert('¡Siguiendo!');
        }
        
        // Refrescar la vista
        renderHome();
        
    } catch (error) {
        console.error('Error siguiendo usuario:', error);
        alert('Error siguiendo usuario: ' + error.message);
    }
}

// ==================== COMENTARIOS ====================
function openComments(videoId) {
    activeVidId = videoId;
    document.getElementById('commentModal').style.display = 'flex';
    renderComments();
}

async function renderComments() {
    try {
        const video = await nexusAPI.db.videos.where('id').equals(activeVidId).first();
        const container = document.getElementById('commList');
        
        if (video && video.comments) {
            container.innerHTML = video.comments.map(comment => `
                <div style="margin-bottom: 12px; padding: 10px; background: #1a1a1a; border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <div class="avatar-v" style="width: 25px; height: 25px; background: ${comment.color || '#333'}">
                            ${comment.avatar ? 
                                `<img src="${comment.avatar}" style="width:100%;height:100%;object-fit:cover">` : 
                                (comment.name || 'U')[0]}
                        </div>
                        <strong>${escapeHtml(comment.name || 'Usuario')}</strong>
                        <small style="color: #666;">${timeAgo(comment.createdAt)}</small>
                    </div>
                    <p style="margin: 0; color: #fff;">${escapeHtml(comment.content)}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="color: #666; text-align: center;">No hay comentarios aún</p>';
        }
    } catch (error) {
        console.error('Error cargando comentarios:', error);
    }
}

async function postComment() {
    const input = document.getElementById('commInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    try {
        if (!user || user.email === 'guest@nexus.local') {
            alert('Inicia sesión para comentar');
            return;
        }
        
        console.log('Agregando comentario al video:', activeVidId);
        
        const commentData = {
            name: user.name,
            email: user.email,
            avatar: user.pfp,
            color: user.color,
            content,
            createdAt: Date.now()
        };
        
        // Obtener video actual
        const video = await nexusAPI.db.videos.where('id').equals(activeVidId).first();
        if (!video) {
            console.error('Video no encontrado para comentar:', activeVidId);
            return;
        }
        
        // Agregar comentario al video
        video.comments = (video.comments || []).concat(commentData);
        await nexusAPI.db.videos.update(activeVidId, { comments: video.comments });
        
        // Broadcast del comentario
        await nexusAPI.broadcast('client-comment_video', { 
            comment: commentData, 
            videoId: activeVidId 
        });
        
        console.log('Comentario agregado:', commentData);
        
        input.value = '';
        renderComments();
        
    } catch (error) {
        console.error('Error comentando:', error);
        alert('Error comentando: ' + error.message);
    }
}

// ==================== ACTUALIZACIÓN EN TIEMPO REAL ====================
// Escuchar eventos de sincronización
window.addEventListener('nexus:new_content', async (event) => {
    const { type, data } = event.detail;
    console.log('📡 Evento recibido:', type, data);
    
    switch (type) {
        case 'like':
            await handleLikeSync(data);
            break;
        case 'unlike':
            await handleUnlikeSync(data);
            break;
        case 'comment':
            await handleCommentSync(data);
            break;
        case 'follow':
            await handleFollowSync(data);
            break;
        case 'unfollow':
            await handleUnfollowSync(data);
            break;
        case 'video':
            await handleVideoSync(data);
            break;
        case 'delete_video':
            await handleDeleteSync(data);
            break;
    }
    
    // Refrescar la vista principal
    await renderHome();
});

// Listener para refresco de videos
window.addEventListener('nexus:refresh_videos', async (event) => {
    console.log('🔄 Refrescando videos por evento');
    await renderHome();
    await renderShorts();
});

// Listener para refresco de likes
window.addEventListener('nexus:refresh_likes', async (event) => {
    const { videoId, likes } = event.detail;
    console.log('❤️ Refrescando likes del video:', videoId);
    
    // Actualizar botón de like en el DOM
    const likeButtons = document.querySelectorAll(`[onclick*="toggleLike(${videoId}"]`);
    likeButtons.forEach(button => {
        const span = button.querySelector('span');
        if (span) {
            span.textContent = formatNumber(likes.length);
        }
        
        // Actualizar estado activo
        const isLiked = user && likes.includes(user.email);
        if (isLiked) {
            button.classList.add('active-l');
        } else {
            button.classList.remove('active-l');
        }
    });
});

// Listener para refresco de comentarios
window.addEventListener('nexus:refresh_comments', async (event) => {
    const { videoId, comments } = event.detail;
    console.log('💬 Refrescando comentarios del video:', videoId);
    
    // Actualizar contador de comentarios
    const commentButtons = document.querySelectorAll(`[onclick*="openComments(${videoId}"]`);
    commentButtons.forEach(button => {
        const span = button.querySelector('span');
        if (span) {
            span.textContent = formatNumber(comments.length);
        }
    });
    
    // Actualizar sección de comentarios si está visible
    const commentsSection = document.getElementById(`comments-${videoId}`);
    if (commentsSection && commentsSection.style.display !== 'none') {
        commentsSection.innerHTML = renderVideoComments(comments);
    }
});

// Forzar sincronización periódica
setInterval(async () => {
    if (user && user.email !== 'guest@nexus.local') {
        console.log('🔄 Sincronización periódica...');
        await renderHome();
        await renderShorts();
    }
}, 10000); // Cada 10 segundos

// Manejar sincronización de likes
async function handleLikeSync(data) {
    if (!user || user.email === data.userId) return; // No actualizar si es el mismo usuario
    
    try {
        const video = await nexusAPI.db.videos.where('id').equals(data.videoId).first();
        if (video) {
            video.likes = (video.likes || []).concat(data.userId);
            await nexusAPI.db.videos.update(data.videoId, { likes: video.likes });
            console.log('❤️ Like sincronizado:', data);
        }
    } catch (error) {
        console.error('Error sincronizando like:', error);
    }
}

// Manejar sincronización de unlike
async function handleUnlikeSync(data) {
    if (!user || user.email === data.userId) return; // No actualizar si es el mismo usuario
    
    try {
        const video = await nexusAPI.db.videos.where('id').equals(data.videoId).first();
        if (video) {
            video.likes = (video.likes || []).filter(email => email !== data.userId);
            await nexusAPI.db.videos.update(data.videoId, { likes: video.likes });
            console.log('💔 Unlike sincronizado:', data);
        }
    } catch (error) {
        console.error('Error sincronizando unlike:', error);
    }
}

// Manejar sincronización de comentarios
async function handleCommentSync(data) {
    try {
        const video = await nexusAPI.db.videos.where('id').equals(data.videoId).first();
        if (video) {
            video.comments = (video.comments || []).concat(data.comment);
            await nexusAPI.db.videos.update(data.videoId, { comments: video.comments });
            console.log('💬 Comentario sincronizado:', data);
        }
    } catch (error) {
        console.error('Error sincronizando comentario:', error);
    }
}

// Manejar sincronización de videos
async function handleVideoSync(data) {
    try {
        const existing = await nexusAPI.db.videos.where('id').equals(data.id).first();
        if (!existing) {
            await nexusAPI.db.videos.add(data);
            console.log('📹 Video sincronizado:', data);
        }
    } catch (error) {
        console.error('Error sincronizando video:', error);
    }
}

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        })[s];
    });
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' h';
    return Math.floor(seconds / 86400) + ' días';
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function changePage(id, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(id).classList.add('active-page');
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    
    if (id === 'inboxPage') renderInbox();
    if (id === 'shortsPage') renderShorts();
    if (id === 'homePage') renderHome();
}

async function renderShorts() {
    try {
        const videos = await nexusAPI.getVideos();
        const shorts = videos.filter(v => v.type === 'short');
        const container = document.getElementById('shortsPage');
        
        if (shorts.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">No hay shorts aún. ¡Sé el primero en subir!</div>';
            return;
        }
        
        // Obtener lista de amigos
        const friends = await getFriendsList();
        
        container.innerHTML = shorts.map((short, index) => {
            const isOwnVideo = short.author === (user ? user.email : null);
            const likesCount = short.likes ? short.likes.length : 0;
            const commentsCount = short.comments ? short.comments.length : 0;
            const isLiked = user && user.email !== 'guest@nexus.local' && short.likes && short.likes.includes(user.email);
            const isFromFriend = friends.includes(short.author);
            
            return `
                <div class="short-frame" data-video-id="${short.id}">
                    <video src="${short.videoUrl}" loop playsinline onclick="this.paused?this.play():this.pause()"></video>
                    <div class="short-overlay">
                        <div class="short-info">
                            <div class="short-author">
                                <div class="avatar-v" style="background:${short.authorColor || '#333'}; width: 40px; height: 40px;">
                                    ${short.authorAvatar ? 
                                        `<img src="${short.authorAvatar}" style="width:100%;height:100%;object-fit:cover">` : 
                                        (short.authorName || 'U')[0]}
                                </div>
                                <div>
                                    <strong>${escapeHtml(short.authorName || 'Usuario')}</strong>
                                    <br>
                                    <small>${escapeHtml(short.title)}</small>
                                </div>
                            </div>
                            ${isFromFriend ? '<div class="friend-badge">👥 Amigo</div>' : ''}
                        </div>
                        
                        <div class="short-side">
                            <button class="side-btn ${isLiked ? 'active-l' : ''}" onclick="toggleLike(${short.id}, this)">
                                <i class="fas fa-heart"></i>
                                <span>${formatNumber(likesCount)}</span>
                            </button>
                            <button class="side-btn" onclick="openComments(${short.id})">
                                <i class="fas fa-comment"></i>
                                <span>${formatNumber(commentsCount)}</span>
                            </button>
                            <button class="side-btn" onclick="shareVideo(${short.id})">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                            ${isOwnVideo ? 
                                `<button class="side-btn" onclick="deleteVideo(${short.id})" style="color: #ff3b30;">
                                    <i class="fas fa-trash"></i>
                                </button>` : 
                                `<button class="side-btn" onclick="followUser('${short.author}')">
                                    <i class="fas fa-user-plus"></i>
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Auto-play primer short
        const firstVideo = container.querySelector('video');
        if (firstVideo) {
            firstVideo.play();
        }
        
        // Scroll snap behavior
        setupShortsScroll();
        
    } catch (error) {
        console.error('Error cargando shorts:', error);
    }
}

// Configurar scroll behavior para shorts
function setupShortsScroll() {
    const container = document.getElementById('shortsPage');
    let currentShortIndex = 0;
    const videos = container.querySelectorAll('video');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                const frame = video.closest('.short-frame');
                const index = Array.from(container.querySelectorAll('.short-frame')).indexOf(frame);
                
                if (index !== currentShortIndex) {
                    // Pausar video anterior
                    if (videos[currentShortIndex]) {
                        videos[currentShortIndex].pause();
                    }
                    
                    // Reproducir video actual
                    video.play();
                    currentShortIndex = index;
                }
            }
        });
    }, { threshold: 0.7 });
    
    // Observar todos los videos
    videos.forEach(video => observer.observe(video));
}

function shareVideo(videoId) {
    // Obtener datos del video
    nexusAPI.db.videos.where('id').equals(videoId).first().then(video => {
        if (video) {
            // Crear URL para compartir
            const shareUrl = `${window.location.origin}?video=${videoId}`;
            
            // Verificar si Web Share API está disponible
            if (navigator.share) {
                navigator.share({
                    title: video.title,
                    text: `Mira este video en Nexus: ${video.title}`,
                    url: shareUrl
                }).then(() => {
                    console.log('Video compartido exitosamente');
                }).catch((error) => {
                    console.log('Error compartiendo:', error);
                    // Fallback a copiar enlace
                    copyToClipboard(shareUrl);
                });
            } else {
                // Fallback para desktop
                copyToClipboard(shareUrl);
            }
        }
    });
}

// Función para copiar al portapapeles
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('🔗 Enlace copiado al portapapeles');
    } catch (err) {
        alert('❌ No se pudo copiar el enlace');
    }
    
    document.body.removeChild(textarea);
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function openCamera() {
    alert('Función de cámara próximamente');
}

// ==================== UTILIDADES ====================
function validEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==================== BÚSQUEDA DE USUARIOS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Configurar búsqueda de usuarios
    const searchInput = document.getElementById('globalSearch');
    const resultsBox = document.getElementById('searchResultsBox');
    
    if (searchInput && resultsBox) {
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim().toLowerCase();
            
            if (query.length < 2) {
                resultsBox.style.display = 'none';
                return;
            }
            
            try {
                // Buscar usuarios en IndexedDB
                const users = await nexusAPI.db.users
                    .where('email')
                    .startsWith(query)
                    .or('name')
                    .startsWith(query)
                    .toArray();
                
                // Buscar por email exacto
                const exactUser = await nexusAPI.db.users
                    .where('email')
                    .equals(query)
                    .first();
                
                if (exactUser && !users.find(u => u.email === exactUser.email)) {
                    users.push(exactUser);
                }
                
                renderSearchResults(users);
                
            } catch (error) {
                console.error('Error buscando usuarios:', error);
            }
        });
        
        // Cerrar resultados al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
                resultsBox.style.display = 'none';
            }
        });
    }
});

// Renderizar resultados de búsqueda
function renderSearchResults(users) {
    const resultsBox = document.getElementById('searchResultsBox');
    
    if (users.length === 0) {
        resultsBox.innerHTML = '<div style="padding: 15px; color: #888; text-align: center;">No se encontraron usuarios</div>';
        resultsBox.style.display = 'block';
        return;
    }
    
    resultsBox.innerHTML = users.map(u => `
        <div class="search-result-item" onclick="selectUserFromSearch('${u.email}')">
            <div class="search-avatar" style="background: ${u.color || '#333'}">
                ${u.pfp ? 
                    `<img src="${u.pfp}" style="width:100%;height:100%;object-fit:cover">` : 
                    (u.name || 'U')[0]}
            </div>
            <div class="search-info">
                <div class="search-name">${escapeHtml(u.name || 'Usuario')}</div>
                <div class="search-email">${escapeHtml(u.email)}</div>
            </div>
            <div class="search-action">
                <button class="search-follow-btn" onclick="event.stopPropagation(); followUserFromSearch('${u.email}')">
                    Seguir
                </button>
            </div>
        </div>
    `).join('');
    
    resultsBox.style.display = 'block';
}

// Seleccionar usuario de búsqueda
function selectUserFromSearch(email) {
    document.getElementById('globalSearch').value = email;
    document.getElementById('searchResultsBox').style.display = 'none';
}

// Seguir usuario desde búsqueda
async function followUserFromSearch(email) {
    await followUser(email);
    document.getElementById('searchResultsBox').style.display = 'none';
    document.getElementById('globalSearch').value = '';
}

// ==================== SEGUIMIENTO DE USUARIOS ====================
async function followUser(email) {
    if (!user || user.email === 'guest@nexus.local') {
        alert('Inicia sesión para seguir usuarios');
        return;
    }
    
    if (user.email === email) {
        alert('No puedes seguirte a ti mismo');
        return;
    }
    
    try {
        // Verificar si ya sigue al usuario
        const existingFollow = await nexusAPI.db.follows
            .where('followerId')
            .equals(user.email)
            .and(follow => follow.followingId === email)
            .first();
        
        if (existingFollow) {
            // Dejar de seguir
            await nexusAPI.db.follows.delete(existingFollow.id);
            await nexusAPI.broadcast('client-unfollow_user', {
                followerId: user.email,
                followingId: email
            });
            console.log('👋 Dejaste de seguir:', email);
        } else {
            // Seguir
            await nexusAPI.db.follows.add({
                followerId: user.email,
                followingId: email,
                createdAt: Date.now()
            });
            await nexusAPI.broadcast('client-follow_user', {
                followerId: user.email,
                followingId: email
            });
            console.log('👥 Siguiendo a:', email);
        }
        
        // Refrescar UI
        await renderHome();
        
    } catch (error) {
        console.error('Error siguiendo/dejando de seguir:', error);
        alert('Error: ' + error.message);
    }
}

// ==================== STORIES ====================
async function renderStories() {
    try {
        const stories = await nexusAPI.getStories();
        const container = document.getElementById('storyBar');
        
        let html = `
            <div class="story-item" onclick="openModal('storyUpModal')" style="text-align:center; font-size:11px">
                <div class="story-ring" style="background:#222">
                    <div class="story-pfp" style="color:var(--blue)">+</div>
                </div>
                <span style="color:#888">Tu historia</span>
            </div>
        `;
        
        const storiesByUser = {};
        stories.forEach(story => {
            if (!storiesByUser[story.author]) {
                storiesByUser[story.author] = {
                    author: story.authorName,
                    avatar: story.authorAvatar,
                    color: story.authorColor,
                    stories: []
                };
            }
            storiesByUser[story.author].stories.push(story);
        });
        
        Object.values(storiesByUser).forEach(userStories => {
            html += `
                <div class="story-item" onclick="viewStoryGroup('${userStories.author}')" style="text-align:center; font-size:11px; cursor:pointer">
                    <div class="story-ring">
                        <div class="story-pfp" style="background:${userStories.color || '#333'}">
                            ${userStories.avatar ? 
                                `<img src="${userStories.avatar}" style="width:100%;height:100%;object-fit:cover">` : 
                                (userStories.author || 'U')[0]}
                        </div>
                    </div>
                    <span style="color:#888">${escapeHtml(userStories.author || 'Usuario')}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error cargando stories:', error);
    }
}

async function viewStoryGroup(userName) {
    try {
        const stories = await nexusAPI.getStories();
        const userStories = stories.filter(s => s.authorName === userName);
        
        if (userStories.length === 0) {
            alert('No hay stories disponibles');
            return;
        }
        
        // Crear viewer de stories completo
        const viewerDiv = document.createElement('div');
        viewerDiv.id = 'storyViewer';
        viewerDiv.style.cssText = `
            position: fixed; inset: 0; background: #000; z-index: 10001; 
            display: flex; flex-direction: column;
        `;
        
        // Barra de progreso
        const progressHtml = userStories.map((_, index) => 
            `<div class="prog-bg"><div class="prog-fill" id="prog-${index}"></div></div>`
        ).join('');
        
        viewerDiv.innerHTML = `
            <div class="story-progress">${progressHtml}</div>
            <div class="story-content">
                <div class="story-ui">
                    <div class="avatar-v" style="width:35px; height:35px; background:${userStories[0].authorColor || '#333'}">
                        ${userStories[0].authorAvatar ? 
                            `<img src="${userStories[0].authorAvatar}" style="width:100%;height:100%;object-fit:cover">` : 
                            (userStories[0].authorName || 'U')[0]}
                    </div>
                    <div>
                        <b>${escapeHtml(userStories[0].authorName || 'Usuario')}</b><br>
                        <small style="color:#888">${timeAgo(userStories[0].createdAt)}</small>
                    </div>
                    <button onclick="closeStoryViewer()" style="background:none; border:none; color:white; font-size:24px; cursor:pointer; margin-left:auto">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${userStories[0].imageUrl && userStories[0].imageUrl.includes('video') ? 
                    `<video src="${userStories[0].imageUrl}" autoplay playsinline controls style="max-width:100%; max-height:100%; object-fit:contain"></video>` :
                    `<img src="${userStories[0].imageUrl || ''}" style="max-width:100%; max-height:100%; object-fit:contain">`
                }
            </div>
        `;
        
        document.body.appendChild(viewerDiv);
        
        // Auto-avanzar stories
        let currentStoryIndex = 0;
        const storyDuration = 5000; // 5 segundos por story
        
        function showNextStory() {
            currentStoryIndex++;
            if (currentStoryIndex >= userStories.length) {
                closeStoryViewer();
                return;
            }
            
            // Actualizar progreso
            document.getElementById(`prog-${currentStoryIndex - 1}`).style.width = '100%';
            
            // Actualizar contenido
            const storyContent = viewerDiv.querySelector('.story-content');
            storyContent.innerHTML = `
                <div class="story-ui">
                    <div class="avatar-v" style="width:35px; height:35px; background:${userStories[currentStoryIndex].authorColor || '#333'}">
                        ${userStories[currentStoryIndex].authorAvatar ? 
                            `<img src="${userStories[currentStoryIndex].authorAvatar}" style="width:100%;height:100%;object-fit:cover">` : 
                            (userStories[currentStoryIndex].authorName || 'U')[0]}
                    </div>
                    <div>
                        <b>${escapeHtml(userStories[currentStoryIndex].authorName || 'Usuario')}</b><br>
                        <small style="color:#888">${timeAgo(userStories[currentStoryIndex].createdAt)}</small>
                    </div>
                    <button onclick="closeStoryViewer()" style="background:none; border:none; color:white; font-size:24px; cursor:pointer; margin-left:auto">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${userStories[currentStoryIndex].imageUrl && userStories[currentStoryIndex].imageUrl.includes('video') ? 
                    `<video src="${userStories[currentStoryIndex].imageUrl}" autoplay playsinline controls style="max-width:100%; max-height:100%; object-fit:contain"></video>` :
                    `<img src="${userStories[currentStoryIndex].imageUrl || ''}" style="max-width:100%; max-height:100%; object-fit:contain">`
                }
            `;
            
            // Iniciar animación de progreso
            const currentProg = document.getElementById(`prog-${currentStoryIndex}`);
            if (currentProg) {
                currentProg.style.transition = `width ${storyDuration}ms linear`;
                currentProg.style.width = '100%';
            }
            
            setTimeout(showNextStory, storyDuration);
        }
        
        // Iniciar primer story
        setTimeout(() => {
            const firstProg = document.getElementById('prog-0');
            if (firstProg) {
                firstProg.style.transition = `width ${storyDuration}ms linear`;
                firstProg.style.width = '100%';
                setTimeout(showNextStory, storyDuration);
            }
        }, 100);
        
        // Navegación con teclado
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowRight') {
                clearTimeout(storyTimer);
                showNextStory();
            } else if (e.key === 'Escape') {
                closeStoryViewer();
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
        
        // Guardar referencia para limpiar después
        viewerDiv.handleKeyPress = handleKeyPress;
        
    } catch (error) {
        console.error('Error viendo stories:', error);
        alert('Error al cargar stories');
    }
}

function closeStoryViewer() {
    const viewer = document.getElementById('storyViewer');
    if (viewer) {
        // Limpiar event listeners
        if (viewer.handleKeyPress) {
            document.removeEventListener('keydown', viewer.handleKeyPress);
        }
        viewer.remove();
    }
}

async function upStory() {
    const file = document.getElementById('sFile').files[0];
    if (!file) {
        alert("Selecciona una imagen o video");
        return;
    }
    
    try {
        if (!user || user.email === 'guest@nexus.local') {
            alert('Inicia sesión para subir stories');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const storyData = {
                imageUrl: e.target.result,
                author: user.email,
                authorName: user.name,
                authorAvatar: user.pfp,
                authorColor: user.color,
                createdAt: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000)
            };
            
            await nexusAPI.db.stories.add(storyData);
            alert("Story subido exitosamente");
            closeModal('storyUpModal');
            renderStories();
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        alert("Error subiendo story: " + error.message);
    }
}

async function renderInbox() {
    try {
        const container = document.getElementById('chatList');
        container.innerHTML = '<p style="color:#666; text-align:center; padding:20px">No tienes conversaciones</p>';
    } catch (error) {
        console.error('Error cargando inbox:', error);
    }
}

function sendTextMsg() {
    alert('Función de chat próximamente');
}

function sendMediaMsg(type) {
    alert('Función de chat próximamente');
}

function closeChat() {
    document.getElementById('chatView').style.display = 'none';
}
