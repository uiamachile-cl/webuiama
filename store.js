/**
 * UIAMA CHILE - CENTRAL DATA STORE & FIREBASE CLOUD REALTIME ENGINE
 * Hybrid LocalStorage + Firebase Firestore Realtime Sinks
 */

const STORAGE_KEY = 'uiama_chile_db_v7';
const SYNC_CHANNEL = 'uiama_sync_broadcast';

// Initial default data grounded in https://uiamachile.weebly.com & User Specifications
const DEFAULT_DATABASE = {
  associationInfo: {
    name: "ONG Y CORPORACIÓN UIAMA CHILE",
    pjNumber: "254.537",
    registry: "Ministerio de Justicia de Chile",
    nature: "Corporación de Derecho Privado y ONG",
    location: "Región Metropolitana, Chile y el Mundo",
    foundedYear: 2008,
    president: "Fernando Guerrero Tala",
    globalAcademies: "+12 Academias",
    globalMasters: "+18 Maestros y Profesores",
    countries: "+65 Países",
    email: "uiamachile@gmail.com",
    affiliations: "CONINTMASTERS, CONFBEC, FECAP, ACKAM, CBLAM, UIA.ORG, IUOTH.COM, AFSO LATAM, TECHSOUP, GOODSTACK, MEMBER OF GOOGLE NONPROFITS ORGANIZATION"
  },
  
  areas: [
    {
      id: "deportiva",
      title: "1) DEPORTIVA",
      icon: "fa-trophy",
      description: "Nuestro gran objetivo es unir, convocar y fortalecer a profesores, estilos y sistemas independientes o en proceso de crecimiento. UIAMA CHILE ya convoca a más de 18 Academias, 22 Maestros en más de 5 países."
    },
    {
      id: "cultural",
      title: "2) CULTURAL",
      icon: "fa-book-open",
      description: "Generamos instancias para llegar a la comunidad y organizaciones en el área de la cultura por medio de la educación, talleres, charlas, libros y revistas especializadas."
    },
    {
      id: "social",
      title: "3) SOCIAL",
      icon: "fa-users-line",
      description: "Promovemos e implementamos actividades, talleres y cursos para empoderar a la mayor cantidad de personas posible en nuestra comunidad."
    },
    {
      id: "formativa",
      title: "4) FORMATIVA",
      icon: "fa-graduation-cap",
      description: "Entregamos herramientas necesarias en diferentes áreas a personas o agrupaciones que requieran aprender, estudiar y tomar instructorados de artes marciales."
    }
  ],

  boardMembers: [
    {
      id: "dir-1",
      name: "Fernando Guerrero Tala",
      position: "Presidente UIAMA CHILE",
      rank: "Gran Maestro / 8º Dan",
      discipline: "Kempo & Artes Marciales Mixtas",
      image: "assets/logo_official.png",
      email: "uiamachile@gmail.com"
    },
    {
      id: "dir-2",
      name: "Carlos Retamales",
      position: "Vicepresidente",
      rank: "Maestro 6º Dan",
      discipline: "Taekwondo & Kickboxing",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      email: "uiamachile@gmail.com"
    },
    {
      id: "dir-3",
      name: "Patricia Fuentes",
      position: "Secretaria General",
      rank: "Profesora 4º Dan",
      discipline: "Karate Do Tradicional",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      email: "uiamachile@gmail.com"
    },
    {
      id: "dir-4",
      name: "Rodrigo Morales",
      position: "Director de Arbitraje",
      rank: "Maestro 5º Dan",
      discipline: "Ju-Jitsu & Sambo",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      email: "uiamachile@gmail.com"
    }
  ],

  members: [
    {
      id: "mem-1",
      academyName: "Academia Kempo Bushido Santiago",
      instructor: "Prof. Fernando Guerrero",
      style: "Kempo Contact",
      region: "Región Metropolitana",
      city: "Santiago Central",
      address: "Av. Libertador Bernardo O'Higgins #1420",
      status: "Afiliado Oficial",
      phone: "+56 9 8765 4321"
    },
    {
      id: "mem-2",
      academyName: "Escuela Dragón Blanco Valparaíso",
      instructor: "Prof. Mario Silva",
      style: "Kung Fu Wushu",
      region: "Valparaíso",
      city: "Viña del Mar",
      address: "Calle Valparaíso #540",
      status: "Afiliado Oficial",
      phone: "+56 9 7654 3210"
    },
    {
      id: "mem-3",
      academyName: "Club Taekwondo Halcones del Sur",
      instructor: "Dra. Elena Alarcón",
      style: "Taekwondo WT",
      region: "Biobío",
      city: "Concepción",
      address: "Barros Arana #890",
      status: "Afiliado Oficial",
      phone: "+56 9 6543 2109"
    },
    {
      id: "mem-4",
      academyName: "Dojo Bushido Antofagasta",
      instructor: "Maestro Pedro Castillo",
      style: "Karate Shotokan",
      region: "Antofagasta",
      city: "Antofagasta",
      address: "Av. Brasil #1230",
      status: "Afiliado Oficial",
      phone: "+56 9 5432 1098"
    }
  ],

  albums: [
    {
      id: "alb-1",
      title: "Campeonato Mundial UIAMA 2026",
      description: "Delegación chilena e internacional en el mundial de artes marciales",
      cover: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&auto=format&fit=crop&q=80",
      date: "2026-05"
    },
    {
      id: "alb-2",
      title: "Seminarios & Capacitaciones de Arbitraje",
      description: "Cursos de formación de jueces y árbitros certificados",
      cover: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
      date: "2026-04"
    },
    {
      id: "alb-3",
      title: "Exámenes de Grado & Cinturones Negros",
      description: "Graduaciones oficiales homologadas por UIAMA Chile",
      cover: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
      date: "2026-03"
    }
  ],

  galleryPhotos: [
    {
      id: "pho-1",
      albumId: "alb-1",
      title: "Desfile de Delegación UIAMA Chile",
      url: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "pho-2",
      albumId: "alb-1",
      title: "Competencia de Formas y Katas",
      url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "pho-3",
      albumId: "alb-2",
      title: "Clase Magistral de Reglamentación",
      url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "pho-4",
      albumId: "alb-3",
      title: "Entrega de Diplomas y Rangos Dan",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
    }
  ],

  news: [
    {
      id: "news-1",
      title: "MUNDIAL POR EQUIPOS \"CONINTMASTERS\"",
      date: "2026-08-22",
      category: "CAMPEONATO",
      summary: "22,23 DE AGOSTO 2026 SAO PAULO, BRASIL"
    },
    {
      id: "news-2",
      title: "Seminario Internacional de Arbitraje y Reglamentación",
      date: "2026-11-08",
      category: "FORMATIVO",
      summary: "Curso de capacitación y homologación de jueces para Formas, Point Fighting y Light Contact (\"MODO ONLINE\") \"INSCRIPCIONES ABIERTAS\""
    }
  ],

  resources: [
    {
      id: "res-1",
      title: "Estatutos Corporación UIAMA Chile (PJ 254.537)",
      format: "PDF",
      size: "2.4 MB",
      url: "#",
      category: "Documentos Oficiales"
    },
    {
      id: "res-2",
      title: "Reglamento Oficial de Competición y Arbitraje 2026",
      format: "PDF",
      size: "4.1 MB",
      url: "#",
      category: "Arbitraje"
    },
    {
      id: "res-3",
      title: "Formulario Oficial de Afiliación de Academias",
      format: "DOCX",
      size: "520 KB",
      url: "#",
      category: "Formularios"
    }
  ],

  messages: []
};

class UIAMAStore {
  constructor() {
    this.broadcast = new BroadcastChannel(SYNC_CHANNEL);
    this.dbCloud = null;
    this.initFirebase();
    this.initLocalStorage();
    
    this.broadcast.onmessage = (event) => {
      if (event.data && event.data.type === 'DATA_UPDATED') {
        window.dispatchEvent(new CustomEvent('uiama_data_changed', { detail: event.data.table }));
      }
    };
  }

  initFirebase() {
    try {
      if (window.firebase && window.firebaseConfig && window.firebaseConfig.apiKey && !window.firebaseConfig.apiKey.includes('PlaceYourKeyHere')) {
        if (!firebase.apps.length) {
          firebase.initializeApp(window.firebaseConfig);
        }
        this.dbCloud = firebase.firestore();
        console.log("Firebase Cloud Firestore initialized successfully");
        this.setupFirestoreRealtimeListeners();
      }
    } catch (e) {
      console.log("Firebase Cloud in offline/hybrid fallback mode:", e);
    }
  }

  setupFirestoreRealtimeListeners() {
    if (!this.dbCloud) return;

    const collections = ['members', 'boardMembers', 'news', 'resources', 'albums', 'galleryPhotos', 'messages'];
    collections.forEach(colName => {
      this.dbCloud.collection(colName).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          
          const localDb = this.getFullDatabase();
          localDb[colName] = items;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localDb));
          
          this.notifyChange(colName);
        }
      }, err => console.log(`Firestore listener error on ${colName}:`, err));
    });
  }

  initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.saveFullDatabase(DEFAULT_DATABASE);
    }
  }

  getFullDatabase() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : DEFAULT_DATABASE;
    } catch (e) {
      console.error("Error reading localStorage, using defaults", e);
      return DEFAULT_DATABASE;
    }
  }

  saveFullDatabase(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    this.notifyChange('all');
  }

  get(table) {
    const db = this.getFullDatabase();
    return db[table] || [];
  }

  add(table, item) {
    const db = this.getFullDatabase();
    if (!db[table]) db[table] = [];
    item.id = item.id || `${table.slice(0, 3)}-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    db[table].unshift(item);
    this.saveFullDatabase(db);

    // Push to Cloud Firestore if connected
    if (this.dbCloud && table !== 'associationInfo' && table !== 'areas') {
      const itemData = { ...item };
      delete itemData.id;
      this.dbCloud.collection(table).doc(item.id).set(itemData)
        .catch(err => console.log(`Cloud sync add error on ${table}:`, err));
    }

    return item;
  }

  update(table, id, updatedData) {
    const db = this.getFullDatabase();
    if (!db[table]) return null;
    const index = db[table].findIndex(i => i.id === id);
    if (index !== -1) {
      db[table][index] = { ...db[table][index], ...updatedData };
      this.saveFullDatabase(db);

      // Update in Cloud Firestore if connected
      if (this.dbCloud && table !== 'associationInfo' && table !== 'areas') {
        this.dbCloud.collection(table).doc(id).update(updatedData)
          .catch(err => console.log(`Cloud sync update error on ${table}:`, err));
      }

      return db[table][index];
    }
    return null;
  }

  delete(table, id) {
    const db = this.getFullDatabase();
    if (!db[table]) return false;
    db[table] = db[table].filter(i => i.id !== id);
    
    if (table === 'albums') {
      db['galleryPhotos'] = (db['galleryPhotos'] || []).filter(p => p.albumId !== id);
    }

    this.saveFullDatabase(db);

    // Delete from Cloud Firestore if connected
    if (this.dbCloud && table !== 'associationInfo' && table !== 'areas') {
      this.dbCloud.collection(table).doc(id).delete()
        .catch(err => console.log(`Cloud sync delete error on ${table}:`, err));
    }

    return true;
  }

  resetToDefaults() {
    this.saveFullDatabase(DEFAULT_DATABASE);
  }

  exportJSON() {
    return JSON.stringify(this.getFullDatabase(), null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.associationInfo && parsed.members) {
        this.saveFullDatabase(parsed);
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON import", e);
    }
    return false;
  }

  notifyChange(table) {
    window.dispatchEvent(new CustomEvent('uiama_data_changed', { detail: table }));
    this.broadcast.postMessage({ type: 'DATA_UPDATED', table: table });
  }
}

window.uiamaStore = new UIAMAStore();
