/**
 * UIAMA CHILE - ADMIN PANEL (SYSTEM CRUD CONTROLLER)
 * Fixed Album & Gallery Photos association, multi-photo file upload, JSON Export/Import, and high-security auto-logout
 */

class UIAMAAdmin {
  constructor() {
    this.isAuthenticated = false;
    this.currentTab = 'members';
    this.editingId = null;
    this.selectedGalleryAlbumId = '';
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const openBtn = document.getElementById('open-admin-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openAdminModal());
    }

    const closeBtn = document.getElementById('close-admin-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeAdminModal());
    }

    // Close modal & auto-logout on backdrop click
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeAdminModal();
        }
      });
    }

    // Close modal & auto-logout on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        this.closeAdminModal();
      }
    });

    // Login Form Submit
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-pass-input').value.trim();
        if (pass === 'ado20012001') {
          this.loginSuccess();
        } else {
          window.app.showToast('Contraseña incorrecta', 'error');
        }
      });
    }

    // Admin Logout Button
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
        window.app.showToast('Sesión administrativa cerrada', 'success');
      });
    }

    // Tab Navigation
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.admin-tab');
        if (!targetBtn) return;
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        targetBtn.classList.add('active');
        this.currentTab = targetBtn.getAttribute('data-tab');
        this.renderTabContent();
      });
    });

    // EVENT DELEGATION for CRUD form submit
    document.addEventListener('submit', (e) => {
      if (e.target && (e.target.id === 'admin-crud-form' || e.target.id === 'create-album-form')) {
        this.handleFormSubmit(e);
      }
    });

    // EVENT DELEGATION for JSON Export & Import across entire Admin Panel
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'export-db-btn' || e.target.id === 'quick-export-json-btn' || e.target.closest('#export-db-btn') || e.target.closest('#quick-export-json-btn'))) {
        this.exportBackup();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target && (e.target.id === 'import-db-input' || e.target.id === 'quick-import-json-input')) {
        this.importBackup(e);
      }
    });
  }

  openAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      this.logout();
      modal.classList.add('active');
    }
  }

  closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.logout();
  }

  logout() {
    this.isAuthenticated = false;
    const authSection = document.getElementById('admin-auth-section');
    const dashSection = document.getElementById('admin-dashboard-section');
    const passInput = document.getElementById('admin-pass-input');

    if (authSection) authSection.style.display = 'block';
    if (dashSection) dashSection.style.display = 'none';
    if (passInput) passInput.value = '';
  }

  loginSuccess() {
    this.isAuthenticated = true;
    document.getElementById('admin-auth-section').style.display = 'none';
    document.getElementById('admin-dashboard-section').style.display = 'block';
    this.renderTabContent();
    window.app.showToast('Acceso concedido al Panel de Control UIAMA Chile', 'success');
  }

  renderTabContent() {
    this.editingId = null;
    const formContainer = document.getElementById('admin-form-container');
    const tableContainer = document.getElementById('admin-table-container');

    if (!formContainer || !tableContainer) return;

    formContainer.innerHTML = '';
    tableContainer.innerHTML = '';

    const jsonHeaderBar = `
      <div class="glass-panel" style="padding: 14px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3);">
        <span style="font-size: 0.95rem; font-weight: 800; color: var(--accent-gold); display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-file-code"></i> Gestión de Base de Datos JSON:
        </span>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button type="button" id="quick-export-json-btn" class="btn btn-gold btn-sm">
            <i class="fa-solid fa-download"></i> Exportar Archivo JSON
          </button>
          <label class="btn btn-secondary btn-sm" style="cursor: pointer; margin: 0;">
            <i class="fa-solid fa-upload"></i> Importar Archivo JSON
            <input type="file" id="quick-import-json-input" accept=".json" style="display: none;">
          </label>
        </div>
      </div>
    `;

    switch (this.currentTab) {
      case 'members':
        formContainer.innerHTML = jsonHeaderBar;
        this.renderMembersCRUD(formContainer, tableContainer);
        break;
      case 'board':
        formContainer.innerHTML = jsonHeaderBar;
        this.renderBoardCRUD(formContainer, tableContainer);
        break;
      case 'gallery':
        formContainer.innerHTML = jsonHeaderBar;
        this.renderGalleryCRUD(formContainer, tableContainer);
        break;
      case 'news':
        formContainer.innerHTML = jsonHeaderBar;
        this.renderNewsCRUD(formContainer, tableContainer);
        break;
      case 'resources':
        formContainer.innerHTML = jsonHeaderBar;
        this.renderResourcesCRUD(formContainer, tableContainer);
        break;
      case 'messages':
        formContainer.innerHTML = jsonHeaderBar;
        this.renderMessagesView(formContainer, tableContainer);
        break;
      case 'backup':
        this.renderBackupControls(formContainer, tableContainer);
        break;
    }
  }

  /* --- 1. MEMBERS CRUD --- */
  renderMembersCRUD(formEl, tableEl) {
    const members = window.uiamaStore.get('members');
    
    const formHtml = `
      <h3 class="font-heading" style="margin-bottom: 15px;"><i class="fa-solid fa-school"></i> Registrar / Editar Academia Miembro</h3>
      <form id="admin-crud-form" class="glass-panel" style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
        <input type="hidden" id="crud-id" value="">
        <div class="form-group">
          <label>Nombre de la Academia *</label>
          <input type="text" id="mem-name" class="form-control" required placeholder="Ej: Dojo Kempo Bushido Santiago">
        </div>
        <div class="form-group">
          <label>Instructor / Maestro *</label>
          <input type="text" id="mem-instructor" class="form-control" required placeholder="Ej: Prof. Fernando Guerrero">
        </div>
        <div class="form-group">
          <label>Estilo Marcial *</label>
          <input type="text" id="mem-style" class="form-control" required placeholder="Ej: Kempo, Karate, Taekwondo">
        </div>
        <div class="form-group">
          <label>Región / Estado *</label>
          <input type="text" id="mem-region" class="form-control" required placeholder="Ej: Región Metropolitana">
        </div>
        <div class="form-group">
          <label>Ciudad / Comuna *</label>
          <input type="text" id="mem-city" class="form-control" required placeholder="Ej: Santiago Central">
        </div>
        <div class="form-group">
          <label>Dirección / Sede</label>
          <input type="text" id="mem-address" class="form-control" placeholder="Ej: Av. Bernardo O'Higgins #1420">
        </div>
        <div class="form-group">
          <label>Teléfono de Contacto</label>
          <input type="text" id="mem-phone" class="form-control" placeholder="+56 9 8765 4321">
        </div>
        <div class="form-group">
          <label>Estado de Afiliación</label>
          <select id="mem-status" class="form-control">
            <option value="Afiliado Oficial">Afiliado Oficial</option>
            <option value="En Proceso de Afiliación">En Proceso de Afiliación</option>
            <option value="Honorario">Honorario</option>
          </select>
        </div>
        <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.admin.resetForm()">Limpiar / Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Guardar Academia</button>
        </div>
      </form>
    `;
    formEl.insertAdjacentHTML('beforeend', formHtml);

    let rowsHtml = members.map(m => `
      <tr>
        <td><strong>${m.academyName}</strong></td>
        <td>${m.instructor}</td>
        <td><span class="academy-badge">${m.style}</span></td>
        <td>${m.city}, ${m.region}</td>
        <td>${m.phone || 'N/A'}</td>
        <td><span style="color: var(--accent-green); font-size: 0.8rem; font-weight: 700;">${m.status || 'Afiliado Oficial'}</span></td>
        <td class="actions-cell">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.admin.editMember('${m.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn btn-primary btn-sm" onclick="window.admin.deleteItem('members', '${m.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <div class="table-responsive glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Academia</th>
              <th>Instructor</th>
              <th>Estilo</th>
              <th>Ubicación</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7" style="text-align:center; padding: 20px;">No hay academias registradas</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  editMember(id) {
    const m = window.uiamaStore.get('members').find(i => i.id === id);
    if (!m) return;
    this.editingId = id;
    if (document.getElementById('crud-id')) document.getElementById('crud-id').value = m.id;
    if (document.getElementById('mem-name')) document.getElementById('mem-name').value = m.academyName || '';
    if (document.getElementById('mem-instructor')) document.getElementById('mem-instructor').value = m.instructor || '';
    if (document.getElementById('mem-style')) document.getElementById('mem-style').value = m.style || '';
    if (document.getElementById('mem-region')) document.getElementById('mem-region').value = m.region || '';
    if (document.getElementById('mem-city')) document.getElementById('mem-city').value = m.city || '';
    if (document.getElementById('mem-address')) document.getElementById('mem-address').value = m.address || '';
    if (document.getElementById('mem-phone')) document.getElementById('mem-phone').value = m.phone || '';
    if (document.getElementById('mem-status')) document.getElementById('mem-status').value = m.status || 'Afiliado Oficial';

    const formEl = document.getElementById('admin-crud-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    window.app.showToast('Modo edición activado para: ' + m.academyName, 'success');
  }

  /* --- 2. BOARD CRUD --- */
  renderBoardCRUD(formEl, tableEl) {
    const board = window.uiamaStore.get('boardMembers');

    const formHtml = `
      <h3 class="font-heading" style="margin-bottom: 15px;"><i class="fa-solid fa-user-tie"></i> Integrante de la Directiva</h3>
      <form id="admin-crud-form" class="glass-panel" style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
        <input type="hidden" id="crud-id" value="">
        <div class="form-group">
          <label>Nombre Completo *</label>
          <input type="text" id="board-name" class="form-control" required placeholder="Ej: Fernando Guerrero Tala">
        </div>
        <div class="form-group">
          <label>Cargo en la Directiva *</label>
          <input type="text" id="board-position" class="form-control" required placeholder="Ej: Presidente UIAMA CHILE">
        </div>
        <div class="form-group">
          <label>Grado / Rango *</label>
          <input type="text" id="board-rank" class="form-control" required placeholder="Ej: Gran Maestro / 8º Dan">
        </div>
        <div class="form-group">
          <label>Disciplina / Sistema</label>
          <input type="text" id="board-discipline" class="form-control" placeholder="Ej: Kempo & Artes Marciales Mixtas">
        </div>
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input type="email" id="board-email" class="form-control" placeholder="uiamachile@gmail.com">
        </div>
        
        <div class="form-group">
          <label>Subir Foto del Integrante (Archivo Imagen)</label>
          <input type="file" id="board-photo-file" accept="image/*" class="form-control">
        </div>
        <div class="form-group">
          <label>O Enlace URL de la Foto</label>
          <input type="text" id="board-image-url" class="form-control" placeholder="https://... o assets/logo_official.png">
        </div>

        <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.admin.resetForm()">Limpiar / Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Guardar Directivo</button>
        </div>
      </form>
    `;
    formEl.insertAdjacentHTML('beforeend', formHtml);

    let rowsHtml = board.map(b => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${b.image || 'assets/logo_official.png'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-gold);">
            <strong>${b.name}</strong>
          </div>
        </td>
        <td><span style="color: var(--primary); font-weight:700;">${b.position}</span></td>
        <td>${b.rank}</td>
        <td>${b.discipline}</td>
        <td>${b.email || 'uiamachile@gmail.com'}</td>
        <td class="actions-cell">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.admin.editBoard('${b.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn btn-primary btn-sm" onclick="window.admin.deleteItem('boardMembers', '${b.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <div class="table-responsive glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Foto & Nombre</th>
              <th>Cargo</th>
              <th>Grado</th>
              <th>Disciplina</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center; padding: 20px;">No hay directivos registrados</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  editBoard(id) {
    const b = window.uiamaStore.get('boardMembers').find(i => i.id === id);
    if (!b) return;
    this.editingId = id;
    if (document.getElementById('crud-id')) document.getElementById('crud-id').value = b.id;
    if (document.getElementById('board-name')) document.getElementById('board-name').value = b.name || '';
    if (document.getElementById('board-position')) document.getElementById('board-position').value = b.position || '';
    if (document.getElementById('board-rank')) document.getElementById('board-rank').value = b.rank || '';
    if (document.getElementById('board-discipline')) document.getElementById('board-discipline').value = b.discipline || '';
    if (document.getElementById('board-email')) document.getElementById('board-email').value = b.email || '';
    if (document.getElementById('board-image-url')) document.getElementById('board-image-url').value = b.image || '';

    const formEl = document.getElementById('admin-crud-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    window.app.showToast('Editando integrante: ' + b.name, 'success');
  }

  /* --- 3. GALLERY & ALBUMS CRUD (Fixed Album & Photo Association) --- */
  renderGalleryCRUD(formEl, tableEl) {
    const albums = window.uiamaStore.get('albums');
    const photos = window.uiamaStore.get('galleryPhotos');

    const formHtml = `
      <div class="glass-panel" style="padding: 22px; margin-bottom: 25px; border-left: 4px solid var(--accent-gold);">
        <h3 class="font-heading" style="margin-bottom: 15px; color: var(--accent-gold);"><i class="fa-solid fa-folder-plus"></i> 1. Crear Nuevo Álbum de Fotos</h3>
        <form id="create-album-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <input type="hidden" id="crud-type" value="create-album">
          <div class="form-group">
            <label>Nombre / Título del Álbum *</label>
            <input type="text" id="alb-title" class="form-control" required placeholder="Ej: Álbum Campeonato Mundial 2026">
          </div>
          <div class="form-group">
            <label>Descripción / Evento</label>
            <input type="text" id="alb-desc" class="form-control" placeholder="Ej: Fotos de la delegación en Brasil">
          </div>
          <div class="form-group">
            <label>Imagen Portada del Álbum (Archivo o URL)</label>
            <input type="file" id="alb-cover-file" accept="image/*" class="form-control">
          </div>
          <div class="form-group" style="display: flex; align-items: flex-end;">
            <button type="submit" class="btn btn-gold btn-sm" style="width:100%;"><i class="fa-solid fa-folder-plus"></i> Crear Álbum</button>
          </div>
        </form>
      </div>

      <div class="glass-panel" style="padding: 22px; border-left: 4px solid var(--primary);">
        <h3 class="font-heading" style="margin-bottom: 15px; color: var(--primary);"><i class="fa-solid fa-camera"></i> 2. Subir Fotografías a un Álbum Determinado</h3>
        <form id="upload-photos-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
          <div class="form-group" style="grid-column: 1 / -1;">
            <label style="font-weight:700; color:var(--accent-gold); font-size:1.05rem;">Seleccionar Álbum de Destino *</label>
            <select id="gallery-album-select" class="form-control" required style="border: 2px solid var(--accent-gold); background: var(--dark-card);" onchange="window.admin.onAlbumSelectChange(this.value)">
              <option value="">-- Selecciona el Álbum al que pertenecen las fotos --</option>
              ${albums.map(a => `<option value="${a.id}" ${this.selectedGalleryAlbumId === a.id ? 'selected' : ''}>📁 ${a.title}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Subir una o varias Fotos (Archivos)</label>
            <input type="file" id="gallery-multi-files" multiple accept="image/*" class="form-control">
          </div>

          <div class="form-group">
            <label>O Enlace URL de Imagen</label>
            <input type="text" id="gallery-single-url" class="form-control" placeholder="https://...">
          </div>

          <div class="form-group" style="display: flex; align-items: flex-end;">
            <button type="button" class="btn btn-primary btn-sm" onclick="window.admin.handlePhotoUpload()" style="width:100%;">
              <i class="fa-solid fa-upload"></i> Cargar Fotos al Álbum
            </button>
          </div>
        </form>
      </div>
    `;
    formEl.insertAdjacentHTML('beforeend', formHtml);

    let albumsHtml = albums.map(a => {
      const albumPhotos = photos.filter(p => p.albumId === a.id);
      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${a.cover || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=100'}" style="width:55px; height:45px; border-radius:6px; object-fit:cover; border:1px solid var(--glass-border);">
              <div>
                <strong style="font-size:1rem; color:var(--text-main);">${a.title}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">${a.description || 'Sin descripción'}</div>
              </div>
            </div>
          </td>
          <td><span class="ticker-badge" style="font-size:0.85rem; padding:4px 10px;">${albumPhotos.length} foto(s) asociadas</span></td>
          <td class="actions-cell">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.admin.viewAlbumPhotos('${a.id}')"><i class="fa-solid fa-eye"></i> Ver Galería de Fotos</button>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.admin.deleteItem('albums', '${a.id}')" title="Eliminar Álbum y Fotos"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    tableEl.innerHTML = `
      <div style="margin-top:25px;">
        <h4 class="font-heading" style="margin-bottom:12px; font-size:1.2rem; color:var(--accent-gold);">
          <i class="fa-solid fa-folder-open"></i> Álbumes Creados en la Galería
        </h4>
        <div class="table-responsive glass-panel">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Álbum</th>
                <th>Fotografías Asociadas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>${albumsHtml || '<tr><td colspan="3" style="text-align:center; padding:20px;">No hay álbumes creados aún. ¡Crea tu primer álbum arriba!</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div id="album-photos-preview-container" style="margin-top:30px;"></div>
    `;

    if (this.selectedGalleryAlbumId) {
      this.viewAlbumPhotos(this.selectedGalleryAlbumId);
    }
  }

  onAlbumSelectChange(albumId) {
    this.selectedGalleryAlbumId = albumId;
    if (albumId) {
      this.viewAlbumPhotos(albumId);
    }
  }

  viewAlbumPhotos(albumId) {
    this.selectedGalleryAlbumId = albumId;
    const album = window.uiamaStore.get('albums').find(a => a.id === albumId);
    const photos = window.uiamaStore.get('galleryPhotos').filter(p => p.albumId === albumId);
    const container = document.getElementById('album-photos-preview-container');
    if (!container || !album) return;

    let photosHtml = photos.map(p => `
      <div class="glass-panel" style="position:relative; overflow:hidden; border-radius:8px; border:1px solid var(--dark-border);">
        <img src="${p.url}" style="width:100%; height:140px; object-fit:cover; display:block;">
        <div style="padding:10px; font-size:0.82rem; display:flex; justify-content:space-between; align-items:center; background:var(--dark-card);">
          <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px; font-weight:600;">${p.title || 'Foto'}</span>
          <button type="button" class="btn btn-primary btn-sm" style="padding:3px 8px;" onclick="window.admin.deleteItem('galleryPhotos', '${p.id}'); window.admin.viewAlbumPhotos('${albumId}');" title="Eliminar Foto de este Álbum">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="glass-panel" style="padding:22px; border-left:4px solid var(--accent-gold);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
          <h4 class="font-heading" style="color:var(--accent-gold); font-size:1.2rem;">
            <i class="fa-solid fa-images"></i> Fotografías Relacionadas al Álbum: "${album.title}" (${photos.length})
          </h4>
          <span class="ticker-badge">Álbum ID: ${album.id}</span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap:15px;">
          ${photosHtml || '<p style="grid-column:1/-1; color:var(--text-muted); padding:20px 0; text-align:center;">Este álbum aún no tiene fotos asociadas. Selecciona archivos arriba y presiona "Cargar Fotos al Álbum".</p>'}
        </div>
      </div>
    `;
    container.scrollIntoView({ behavior: 'smooth' });
  }

  async handlePhotoUpload() {
    const albumSelect = document.getElementById('gallery-album-select');
    const albumId = albumSelect ? albumSelect.value : this.selectedGalleryAlbumId;
    
    if (!albumId) {
      window.app.showToast('Por favor selecciona un álbum de destino primero', 'error');
      return;
    }

    const fileInput = document.getElementById('gallery-multi-files');
    const urlInput = document.getElementById('gallery-single-url');

    let count = 0;
    let firstPhotoUrl = '';

    if (fileInput && fileInput.files.length > 0) {
      for (let file of fileInput.files) {
        const dataUrl = await this.readFileAsDataURL(file);
        if (!firstPhotoUrl) firstPhotoUrl = dataUrl;
        
        window.uiamaStore.add('galleryPhotos', {
          albumId: albumId,
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: dataUrl
        });
        count++;
      }
      fileInput.value = '';
    }

    if (urlInput && urlInput.value.trim()) {
      const singleUrl = urlInput.value.trim();
      if (!firstPhotoUrl) firstPhotoUrl = singleUrl;

      window.uiamaStore.add('galleryPhotos', {
        albumId: albumId,
        title: "Fotografía " + (count + 1),
        url: singleUrl
      });
      count++;
      urlInput.value = '';
    }

    if (count > 0) {
      // Auto-update album cover if album has no cover image or default placeholder
      const album = window.uiamaStore.get('albums').find(a => a.id === albumId);
      if (album && firstPhotoUrl && (!album.cover || album.cover.includes('unsplash'))) {
        window.uiamaStore.update('albums', albumId, { cover: firstPhotoUrl });
      }

      window.app.showToast(`¡Se subieron ${count} foto(s) correctamente al álbum "${album ? album.title : 'seleccionado'}"!`, 'success');
      this.selectedGalleryAlbumId = albumId;
      this.renderTabContent();
      this.viewAlbumPhotos(albumId);
      if (window.app) window.app.renderAllViews();
    } else {
      window.app.showToast('Selecciona archivos de imagen o ingresa una URL de foto', 'error');
    }
  }

  readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  /* --- 4. NEWS CRUD --- */
  renderNewsCRUD(formEl, tableEl) {
    const news = window.uiamaStore.get('news');

    const formHtml = `
      <h3 class="font-heading" style="margin-bottom: 15px;"><i class="fa-solid fa-newspaper"></i> Noticias y Eventos</h3>
      <form id="admin-crud-form" class="glass-panel" style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
        <input type="hidden" id="crud-id" value="">
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Título del Evento / Noticia *</label>
          <input type="text" id="news-title" class="form-control" required placeholder="Ej: Torneo Abierto UIAMA Chile 2026">
        </div>
        <div class="form-group">
          <label>Fecha *</label>
          <input type="date" id="news-date" class="form-control" required value="${new Date().toISOString().slice(0,10)}">
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <input type="text" id="news-category" class="form-control" placeholder="Campeonato / Seminario / Noticia">
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Resumen / Contenido *</label>
          <textarea id="news-summary" class="form-control" required placeholder="Detalles de la convocatoria..."></textarea>
        </div>
        <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.admin.resetForm()">Limpiar / Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-floppy-disk"></i> Guardar Publicación</button>
        </div>
      </form>
    `;
    formEl.insertAdjacentHTML('beforeend', formHtml);

    let rowsHtml = news.map(n => `
      <tr>
        <td><strong>${n.title}</strong></td>
        <td>${n.date}</td>
        <td><span class="ticker-badge">${n.category}</span></td>
        <td>${n.summary}</td>
        <td class="actions-cell">
          <button type="button" class="btn btn-primary btn-sm" onclick="window.admin.deleteItem('news', '${n.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <div class="table-responsive glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Resumen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding: 20px;">No hay noticias publicadas</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  /* --- 5. RESOURCES CRUD --- */
  renderResourcesCRUD(formEl, tableEl) {
    const resources = window.uiamaStore.get('resources');

    const formHtml = `
      <h3 class="font-heading" style="margin-bottom: 15px;"><i class="fa-solid fa-folder-open"></i> Agregar Recurso / Documentación</h3>
      <form id="admin-crud-form" class="glass-panel" style="padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
        <input type="hidden" id="crud-id" value="">
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Título del Documento *</label>
          <input type="text" id="res-title" class="form-control" required placeholder="Ej: Reglamento Oficial de Arbitraje 2026">
        </div>
        <div class="form-group">
          <label>Formato *</label>
          <input type="text" id="res-format" class="form-control" required placeholder="PDF / DOCX / ZIP">
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <input type="text" id="res-category" class="form-control" placeholder="Arbitraje / Estatutos / Formulario">
        </div>
        <div class="form-group" style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-plus"></i> Publicar Documento</button>
        </div>
      </form>
    `;
    formEl.insertAdjacentHTML('beforeend', formHtml);

    let rowsHtml = resources.map(r => `
      <tr>
        <td><strong>${r.title}</strong></td>
        <td><span class="academy-badge">${r.format || 'PDF'}</span></td>
        <td>${r.category}</td>
        <td class="actions-cell">
          <button type="button" class="btn btn-primary btn-sm" onclick="window.admin.deleteItem('resources', '${r.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <div class="table-responsive glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Formato</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || '<tr><td colspan="4" style="text-align:center; padding: 20px;">No hay recursos agregados</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  /* --- 6. MESSAGES VIEW --- */
  renderMessagesView(formEl, tableEl) {
    const messages = window.uiamaStore.get('messages');
    formEl.insertAdjacentHTML('beforeend', `<h3><i class="fa-solid fa-envelope"></i> Solicitudes y Mensajes Recibidos</h3>`);

    let rowsHtml = messages.map(m => `
      <tr>
        <td><strong>${m.name}</strong><br><small style="color:var(--text-muted)">${m.date}</small></td>
        <td>${m.email}<br><small>${m.phone || ''}</small></td>
        <td><span class="academy-badge" style="background:rgba(245, 158, 11, 0.2); color:var(--accent-gold);">${m.country || 'Chile'}</span></td>
        <td>${m.academy || 'N/A'}</td>
        <td style="max-width: 300px;">${m.message}</td>
        <td class="actions-cell">
          <button type="button" class="btn btn-primary btn-sm" onclick="window.admin.deleteItem('messages', '${m.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tableEl.innerHTML = `
      <div class="table-responsive glass-panel">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Remitente</th>
              <th>Contacto</th>
              <th>País</th>
              <th>Academia</th>
              <th>Mensaje</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center; padding: 20px;">No hay mensajes registrados</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  /* --- 7. BACKUP & CONTROL --- */
  renderBackupControls(formEl, tableEl) {
    formEl.innerHTML = `
      <div class="glass-panel" style="padding: 30px;">
        <h3 class="font-heading" style="margin-bottom: 15px;"><i class="fa-solid fa-database"></i> Mantenimiento y Respaldo JSON</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">
          Puedes exportar toda la base de datos (Miembros, Directiva, Galería de Fotos, Documentos) a un archivo `.json` para guardarlo en tu equipo, o importar una copia previamente respaldada.
        </p>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <button type="button" id="export-db-btn" class="btn btn-gold"><i class="fa-solid fa-download"></i> Exportar Archivo JSON</button>
          <label class="btn btn-secondary" style="cursor: pointer;">
            <i class="fa-solid fa-upload"></i> Importar Archivo JSON
            <input type="file" id="import-db-input" accept=".json" style="display: none;">
          </label>
          <button type="button" id="reset-db-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-left"></i> Restablecer Valores Oficiales</button>
        </div>
      </div>
    `;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('crud-id')?.value;
    const type = document.getElementById('crud-type')?.value;

    if (type === 'create-album' || e.target.id === 'create-album-form') {
      const fileInput = document.getElementById('alb-cover-file');
      let coverUrl = "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&auto=format&fit=crop&q=80";

      if (fileInput && fileInput.files.length > 0) {
        coverUrl = await this.readFileAsDataURL(fileInput.files[0]);
      }

      const albumData = {
        title: document.getElementById('alb-title').value.trim(),
        description: document.getElementById('alb-desc')?.value.trim() || '',
        cover: coverUrl,
        date: new Date().toISOString().slice(0,7)
      };

      const newAlbum = window.uiamaStore.add('albums', albumData);
      this.selectedGalleryAlbumId = newAlbum.id;
      window.app.showToast(`Álbum "${albumData.title}" creado exitosamente`, 'success');
      this.renderTabContent();
      if (window.app) window.app.renderAllViews();
      return;
    }

    if (this.currentTab === 'members') {
      const data = {
        academyName: document.getElementById('mem-name').value.trim(),
        instructor: document.getElementById('mem-instructor').value.trim(),
        style: document.getElementById('mem-style').value.trim(),
        region: document.getElementById('mem-region').value.trim(),
        city: document.getElementById('mem-city').value.trim(),
        address: document.getElementById('mem-address')?.value.trim() || '',
        phone: document.getElementById('mem-phone')?.value.trim() || '',
        status: document.getElementById('mem-status')?.value || 'Afiliado Oficial'
      };

      if (id) {
        window.uiamaStore.update('members', id, data);
        window.app.showToast('Academia "' + data.academyName + '" actualizada con éxito', 'success');
      } else {
        window.uiamaStore.add('members', data);
        window.app.showToast('Nueva academia "' + data.academyName + '" guardada con éxito', 'success');
      }
    } else if (this.currentTab === 'board') {
      const photoFileInput = document.getElementById('board-photo-file');
      let imageVal = document.getElementById('board-image-url')?.value.trim() || 'assets/logo_official.png';

      if (photoFileInput && photoFileInput.files.length > 0) {
        imageVal = await this.readFileAsDataURL(photoFileInput.files[0]);
      }

      const data = {
        name: document.getElementById('board-name').value.trim(),
        position: document.getElementById('board-position').value.trim(),
        rank: document.getElementById('board-rank').value.trim(),
        discipline: document.getElementById('board-discipline')?.value.trim() || '',
        email: document.getElementById('board-email')?.value.trim() || 'uiamachile@gmail.com',
        image: imageVal
      };

      if (id) {
        window.uiamaStore.update('boardMembers', id, data);
        window.app.showToast('Integrante "' + data.name + '" actualizado con su foto', 'success');
      } else {
        window.uiamaStore.add('boardMembers', data);
        window.app.showToast('Nuevo directivo "' + data.name + '" guardado con éxito', 'success');
      }
    } else if (this.currentTab === 'news') {
      const data = {
        title: document.getElementById('news-title').value.trim(),
        date: document.getElementById('news-date').value,
        category: document.getElementById('news-category').value.trim() || 'Noticia',
        summary: document.getElementById('news-summary').value.trim()
      };
      window.uiamaStore.add('news', data);
      window.app.showToast('Publicación guardada exitosamente', 'success');
    } else if (this.currentTab === 'resources') {
      const data = {
        title: document.getElementById('res-title').value.trim(),
        format: document.getElementById('res-format').value.trim() || 'PDF',
        category: document.getElementById('res-category').value.trim() || 'General',
        url: "#"
      };
      window.uiamaStore.add('resources', data);
      window.app.showToast('Documento guardado con éxito', 'success');
    }

    if (window.app) {
      window.app.renderAllViews();
    }
    this.renderTabContent();
  }

  deleteItem(table, id) {
    if (confirm('¿Eliminar este registro permanentemente?')) {
      window.uiamaStore.delete(table, id);
      this.renderTabContent();
      if (window.app) window.app.renderAllViews();
      window.app.showToast('Registro eliminado con éxito', 'success');
    }
  }

  resetForm() {
    this.editingId = null;
    const form = document.getElementById('admin-crud-form');
    if (form) form.reset();
    if (document.getElementById('crud-id')) document.getElementById('crud-id').value = '';
  }

  exportBackup() {
    const jsonStr = window.uiamaStore.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UIAMA_Chile_BD_Respaldo_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.app.showToast('¡Archivo JSON exportado y descargado exitosamente!', 'success');
  }

  importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const success = window.uiamaStore.importJSON(evt.target.result);
      if (success) {
        this.renderTabContent();
        if (window.app) window.app.renderAllViews();
        window.app.showToast('¡Base de datos cargada e importada con éxito desde el archivo JSON!', 'success');
      } else {
        window.app.showToast('Error al importar el archivo JSON', 'error');
      }
    };
    reader.readAsText(file);
  }
}

window.admin = new UIAMAAdmin();
