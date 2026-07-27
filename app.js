/**
 * UIAMA CHILE - MAIN APPLICATION CONTROLLER
 * Reactive view rendering, live search, dynamic gallery, theme toggling, toast notification system
 */

class UIAMAApp {
  constructor() {
    this.currentTheme = localStorage.getItem('uiama_theme') || 'dark';
    this.selectedAlbumFilter = 'all';
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
    this.renderAllViews();
    if (window.admin) window.admin.init();

    // Subscribe to live data changes across tabs
    window.addEventListener('uiama_data_changed', (e) => {
      console.log('Real-time sync update triggered for:', e.detail);
      this.renderAllViews();
      this.showToast('Vista actualizada automáticamente con los últimos cambios', 'success');
    });
  }

  bindEvents() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('uiama_theme', this.currentTheme);
        this.applyTheme(this.currentTheme);
      });
    }

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-active');
      });
    }

    // Navigation Smooth Scroll
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
          if (navLinks) navLinks.classList.remove('mobile-active');
        }
      });
    });

    // Directory Search & Filter Listeners
    const searchInput = document.getElementById('member-search');
    const regionSelect = document.getElementById('member-region-filter');
    if (searchInput) searchInput.addEventListener('input', () => this.renderMembersDirectory());
    if (regionSelect) regionSelect.addEventListener('change', () => this.renderMembersDirectory());

    // Public Contact Form
    const contactForm = document.getElementById('public-contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newMessage = {
          name: document.getElementById('cnt-name').value,
          email: document.getElementById('cnt-email').value,
          phone: document.getElementById('cnt-phone').value,
          country: document.getElementById('cnt-country').value,
          academy: document.getElementById('cnt-academy').value,
          message: document.getElementById('cnt-message').value,
          date: new Date().toLocaleString(),
          status: "Pendiente"
        };
        window.uiamaStore.add('messages', newMessage);
        contactForm.reset();
        this.showToast('Mensaje enviado con éxito a uiamachile@gmail.com. Responderemos a la brevedad.', 'success');
      });
    }

    // Lightbox Modal Close Listener
    const lightboxModal = document.getElementById('lightbox-modal');
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.classList.contains('modal-close')) {
          lightboxModal.classList.remove('active');
        }
      });
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  renderAllViews() {
    this.renderTicker();
    this.renderAreas();
    this.renderPresidentInfo();
    this.renderBoard();
    this.renderMembersDirectory();
    this.renderGallery();
    this.renderResources();
  }

  renderTicker() {
    const news = window.uiamaStore.get('news');
    const tickerEl = document.getElementById('ticker-wrapper');
    if (!tickerEl) return;

    if (news.length === 0) {
      tickerEl.innerHTML = `<span class="ticker-badge">UIAMA CHILE</span> ONG Y CORPORACIÓN UNIÓN INTERNACIONAL DE ARTISTAS MARCIALES Y DE ARTES INTERNAS &bull; Correo: uiamachile@gmail.com`;
      return;
    }

    tickerEl.innerHTML = news.map(n => `
      <span><strong class="ticker-badge">${n.category}</strong> <strong>${n.title}</strong> (${n.date}): ${n.summary}</span>
    `).join(' &nbsp;&bull;&nbsp; ');
  }

  renderAreas() {
    const areas = window.uiamaStore.get('areas');
    const gridEl = document.getElementById('areas-grid');
    if (!gridEl) return;

    gridEl.innerHTML = areas.map(a => `
      <div class="area-card">
        <div class="area-icon"><i class="fa-solid ${a.icon}"></i></div>
        <h3 class="area-title font-heading">${a.title}</h3>
        <p class="area-text">${a.description}</p>
      </div>
    `).join('');
  }

  renderPresidentInfo() {
    const info = window.uiamaStore.get('associationInfo');
    const presContainer = document.getElementById('president-container');
    if (!presContainer) return;

    presContainer.innerHTML = `
      <div class="president-card glass-panel">
        <div class="president-img-wrap">
          <img src="assets/logo_official.png" alt="Emblema UIAMA Chile" style="object-fit: contain; padding: 20px; background: rgba(0,0,0,0.3);">
        </div>
        <div>
          <span class="badge-pj"><i class="fa-solid fa-certificate"></i> PERSONERÍA JURÍDICA Nº ${info.pjNumber}</span>
          <h2 class="president-title font-heading">${info.president}</h2>
          <div class="president-role">Presidente UIAMA CHILE & Fundador</div>
          <p style="margin-bottom: 16px; color: var(--text-muted); line-height: 1.7;">
            "Nuestra organización tiene una visión abierta y pluralista de cada estilo y sistema de arte marcial. 
            Nos preocupamos de darle respaldo institucional y reconocimiento a todos los instructores que realizan sus clases por vocación, transformando vidas en cada sede y comuna del país y del mundo."
          </p>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div><strong style="color: var(--accent-gold); font-size: 1.2rem;">${info.globalAcademies}</strong><br><small style="color: var(--text-muted);">Mundiales</small></div>
            <div><strong style="color: var(--accent-gold); font-size: 1.2rem;">${info.globalMasters}</strong><br><small style="color: var(--text-muted);">Maestros</small></div>
            <div><strong style="color: var(--accent-gold); font-size: 1.2rem;">${info.countries}</strong><br><small style="color: var(--text-muted);">Países Integrados</small></div>
            <div><strong style="color: var(--primary); font-size: 1.1rem;"><i class="fa-solid fa-envelope"></i> uiamachile@gmail.com</strong><br><small style="color: var(--text-muted);">Correo Oficial</small></div>
          </div>
        </div>
      </div>
    `;
  }

  renderBoard() {
    const board = window.uiamaStore.get('boardMembers');
    const boardGrid = document.getElementById('board-grid');
    if (!boardGrid) return;

    boardGrid.innerHTML = board.map(b => `
      <div class="member-card">
        <img src="${b.image || 'assets/logo_official.png'}" alt="${b.name}" class="member-avatar">
        <div class="member-info">
          <h3 class="member-name font-heading">${b.name}</h3>
          <div class="member-position">${b.position}</div>
          <span class="member-rank">${b.rank || 'Maestro Marcial'}</span>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">${b.discipline}</div>
          <div style="font-size: 0.8rem; color: var(--primary); margin-top: 4px;"><i class="fa-solid fa-envelope"></i> ${b.email || 'uiamachile@gmail.com'}</div>
        </div>
      </div>
    `).join('');
  }

  renderMembersDirectory() {
    const members = window.uiamaStore.get('members');
    const gridEl = document.getElementById('directory-grid');
    if (!gridEl) return;

    const searchTerm = (document.getElementById('member-search')?.value || '').toLowerCase();
    const regionTerm = document.getElementById('member-region-filter')?.value || '';

    const regionSelect = document.getElementById('member-region-filter');
    if (regionSelect && regionSelect.options.length <= 1) {
      const regions = [...new Set(members.map(m => m.region))];
      regions.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        regionSelect.appendChild(opt);
      });
    }

    const filtered = members.filter(m => {
      const matchesSearch = m.academyName.toLowerCase().includes(searchTerm) ||
                            m.instructor.toLowerCase().includes(searchTerm) ||
                            m.style.toLowerCase().includes(searchTerm) ||
                            m.city.toLowerCase().includes(searchTerm);
      const matchesRegion = regionTerm === '' || m.region === regionTerm;
      return matchesSearch && matchesRegion;
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);" class="glass-panel">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--primary);"></i>
          <h3>No se encontraron academias afiliadas</h3>
          <p>Prueba buscando con otro término de filtro o ciudad.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(m => `
      <div class="academy-card">
        <div>
          <div class="academy-header">
            <h3 class="academy-name font-heading">${m.academyName}</h3>
            <span class="academy-badge">${m.style}</span>
          </div>
          <div class="academy-details">
            <div><i class="fa-solid fa-user-ninja" style="color: var(--primary);"></i> <strong>Instructor:</strong> ${m.instructor}</div>
            <div><i class="fa-solid fa-location-dot" style="color: var(--accent-gold);"></i> <strong>Ubicación:</strong> ${m.city}, ${m.region}</div>
            ${m.address ? `<div><i class="fa-solid fa-map" style="color: var(--accent-blue);"></i> ${m.address}</div>` : ''}
            ${m.phone ? `<div><i class="fa-solid fa-phone" style="color: var(--accent-green);"></i> ${m.phone}</div>` : ''}
          </div>
        </div>
        <div style="border-top: 1px solid var(--dark-border); padding-top: 12px; font-size: 0.8rem; color: var(--accent-green); display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-circle-check"></i> ${m.status || 'Afiliado Oficial UIAMA'}
        </div>
      </div>
    `).join('');
  }

  renderGallery() {
    const albums = window.uiamaStore.get('albums');
    const photos = window.uiamaStore.get('galleryPhotos');

    const albumsNavContainer = document.getElementById('gallery-albums-nav');
    const photosGrid = document.getElementById('gallery-photos-grid');

    if (!albumsNavContainer || !photosGrid) return;

    albumsNavContainer.innerHTML = `
      <button class="btn btn-sm ${this.selectedAlbumFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.filterGallery('all')">
        <i class="fa-solid fa-border-all"></i> Todas las Fotos (${photos.length})
      </button>
      ${albums.map(a => {
        const count = photos.filter(p => p.albumId === a.id).length;
        const activeClass = this.selectedAlbumFilter === a.id ? 'btn-primary' : 'btn-secondary';
        return `
          <button class="btn btn-sm ${activeClass}" onclick="window.app.filterGallery('${a.id}')">
            <i class="fa-solid fa-images"></i> ${a.title} (${count})
          </button>
        `;
      }).join('')}
    `;

    const filteredPhotos = this.selectedAlbumFilter === 'all' 
      ? photos 
      : photos.filter(p => p.albumId === this.selectedAlbumFilter);

    if (filteredPhotos.length === 0) {
      photosGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;" class="glass-panel">
          <i class="fa-solid fa-camera-retro" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 10px;"></i>
          <p style="color: var(--text-muted);">No hay fotografías cargadas en este álbum.</p>
        </div>
      `;
      return;
    }

    photosGrid.innerHTML = filteredPhotos.map(p => {
      const albumObj = albums.find(a => a.id === p.albumId);
      return `
        <div class="gallery-photo-card glass-panel" onclick="window.app.openLightbox('${p.url}', '${p.title || 'Fotografía UIAMA Chile'}', '${albumObj ? albumObj.title : 'Galería'}')">
          <img src="${p.url}" alt="${p.title || 'Foto UIAMA'}" class="gallery-img">
          <div class="gallery-caption">
            <div style="font-weight:700; font-size:0.9rem;">${p.title || 'Fotografía UIAMA'}</div>
            <div style="font-size:0.75rem; color:var(--accent-gold);">${albumObj ? albumObj.title : 'Galería'}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  filterGallery(albumId) {
    this.selectedAlbumFilter = albumId;
    this.renderGallery();
  }

  openLightbox(url, title, albumName) {
    const modal = document.getElementById('lightbox-modal');
    const imgEl = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');

    if (modal && imgEl) {
      imgEl.src = url;
      if (titleEl) titleEl.textContent = `${title} (${albumName})`;
      modal.classList.add('active');
    }
  }

  renderResources() {
    const resources = window.uiamaStore.get('resources');
    const gridEl = document.getElementById('resources-grid');
    if (!gridEl) return;

    gridEl.innerHTML = resources.map(r => `
      <div class="resource-card">
        <div class="resource-icon"><i class="fa-solid fa-file-pdf"></i></div>
        <div class="resource-info">
          <h4 class="font-heading">${r.title}</h4>
          <p>${r.category} &bull; ${r.format || 'PDF'} (${r.size || 'Descargable'})</p>
          <a href="#" onclick="alert('Descargando recurso oficial: ${r.title}'); return false;" style="color: var(--primary); font-size: 0.85rem; font-weight: 700; text-decoration: none; margin-top: 6px; display: inline-block;">
            <i class="fa-solid fa-download"></i> Descargar Documento
          </a>
        </div>
      </div>
    `).join('');
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new UIAMAApp();
  window.app.init();
});
