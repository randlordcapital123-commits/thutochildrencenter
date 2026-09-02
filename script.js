// ===== DATA LAYER (localStorage) =====
const DB = {
    get(key, fallback) {
        try {
            const data = localStorage.getItem(`thato_${key}`);
            return data ? JSON.parse(data) : fallback;
        } catch { return fallback; }
    },
    set(key, value) {
        localStorage.setItem(`thato_${key}`, JSON.stringify(value));
    }
};

// Default data
const DEFAULT_SERVICES = [
    { id: 1, title: 'Early Learning Program', description: 'Structured play-based learning for ages 2-4, focusing on language, numbers, and social skills.', price: 'R1800/month', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&crop=center' },
    { id: 2, title: 'Toddler Care', description: 'Safe and loving care for little ones aged 1-2, with sensory play, music, and motor skill development.', price: 'R2200/month', image: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=400&h=300&fit=crop&crop=center' },
    { id: 3, title: 'After-School Club', description: 'Homework help, creative activities, and sports for school-going children up to age 6.', price: 'R1200/month', image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&h=300&fit=crop&crop=center' }
];
const DEFAULT_GALLERY = [
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=400&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&h=300&fit=crop&crop=center'
];

let services = DB.get('services', DEFAULT_SERVICES);
let gallery = DB.get('gallery', DEFAULT_GALLERY);
let logo = DB.get('logo', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=80&h=80&fit=crop&crop=center');
let heroBg = DB.get('heroBg', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1600&h=900&fit=crop&crop=center');
let bizInfo = DB.get('bizInfo', {
    name: 'Thato Children Center',
    location: 'Siyabuswa, Mpumalanga, South Africa',
    phone: '0799134734',
    whatsapp: '+2779134734',
    email: 'info@thatochildrencenter.co.za'
});

function saveAll() {
    DB.set('services', services);
    DB.set('gallery', gallery);
    DB.set('logo', logo);
    DB.set('heroBg', heroBg);
    DB.set('bizInfo', bizInfo);
}

// ===== RENDER FUNCTIONS =====
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = services.map(s => `
        <div class="service-card">
            <img src="${s.image}" alt="${s.title}" loading="lazy" />
            <div class="body">
                <h3>${s.title}</h3>
                <p>${s.description}</p>
                <div class="price">${s.price}</div>
                <a href="https://wa.me/${bizInfo.whatsapp.replace('+', '')}?text=Hello%20Thato%20Children%20Center!%20I'm%20interested%20in%20the%20${encodeURIComponent(s.title)}%20service." target="_blank" class="whatsapp-enquiry">
                    <i class="fab fa-whatsapp"></i> Enquire on WhatsApp
                </a>
            </div>
        </div>
    `).join('');
}

function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = gallery.map(url => `<img src="${url}" alt="Gallery image" loading="lazy" />`).join('');
}

function renderAdminServices() {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;
    tbody.innerHTML = services.map(s => `
        <tr>
            <td><img src="${s.image}" alt="${s.title}" /></td>
            <td><strong>${s.title}</strong></td>
            <td>${s.description}</td>
            <td>${s.price}</td>
            <td class="actions">
                <button class="edit-btn" data-id="${s.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${s.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
    // Attach events
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditService(Number(btn.dataset.id)));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteService(Number(btn.dataset.id)));
    });
}

function renderAdminGallery() {
    const grid = document.getElementById('galleryAdminGrid');
    if (!grid) return;
    grid.innerHTML = gallery.map((url, idx) => `
        <div class="gallery-admin-item">
            <img src="${url}" alt="Gallery" />
            <button class="remove-gallery" data-index="${idx}"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
    document.querySelectorAll('.remove-gallery').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.index);
            gallery.splice(idx, 1);
            saveAll();
            renderAdminGallery();
            renderGallery();
        });
    });
}

function updateBranding() {
    const logoImg = document.getElementById('navLogo');
    const footerLogo = document.getElementById('footerLogo');
    const logoPreview = document.getElementById('logoPreview');
    if (logoImg) logoImg.src = logo;
    if (footerLogo) footerLogo.src = logo;
    if (logoPreview) logoPreview.src = logo;

    const heroBgEl = document.getElementById('heroBg');
    const heroPreview = document.getElementById('heroPreview');
    if (heroBgEl) heroBgEl.style.backgroundImage = `url(${heroBg})`;
    if (heroPreview) heroPreview.src = heroBg;
}

function updateBizInfo() {
    const fields = ['bizName', 'bizLocation', 'bizPhone', 'bizWhatsapp', 'bizEmail'];
    const ids = ['name', 'location', 'phone', 'whatsapp', 'email'];
    fields.forEach((f, i) => {
        const el = document.getElementById(f);
        if (el) el.value = bizInfo[ids[i]] || '';
    });
}

// ===== ADMIN LOGIC =====
const ADMIN_PASSWORD = 'admin123';
let isAdmin = false;

function showAdminDashboard(show) {
    document.getElementById('adminLogin').style.display = show ? 'none' : 'block';
    document.getElementById('adminDashboard').style.display = show ? 'block' : 'none';
    if (show) {
        renderAdminServices();
        renderAdminGallery();
        updateBizInfo();
        updateBranding();
    }
}

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('adminPassword').value;
    if (pass === ADMIN_PASSWORD) {
        isAdmin = true;
        showAdminDashboard(true);
    } else {
        alert('Incorrect password. Try admin123');
    }
});

document.getElementById('adminLogout')?.addEventListener('click', () => {
    isAdmin = false;
    showAdminDashboard(false);
    document.getElementById('adminPassword').value = '';
});

// ===== SERVICE CRUD =====
let editingServiceId = null;

function openAddService() {
    editingServiceId = null;
    document.getElementById('modalTitle').textContent = 'Add Service';
    document.getElementById('serviceId').value = '';
    document.getElementById('sTitle').value = '';
    document.getElementById('sDesc').value = '';
    document.getElementById('sPrice').value = '';
    document.getElementById('sImage').value = '';
    document.getElementById('serviceModal').classList.add('active');
}

function openEditService(id) {
    const s = services.find(x => x.id === id);
    if (!s) return;
    editingServiceId = id;
    document.getElementById('modalTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value = id;
    document.getElementById('sTitle').value = s.title;
    document.getElementById('sDesc').value = s.description;
    document.getElementById('sPrice').value = s.price;
    document.getElementById('sImage').value = s.image;
    document.getElementById('serviceModal').classList.add('active');
}

function deleteService(id) {
    if (!confirm('Delete this service?')) return;
    services = services.filter(s => s.id !== id);
    saveAll();
    renderAdminServices();
    renderServices();
}

document.getElementById('addServiceBtn')?.addEventListener('click', openAddService);
document.getElementById('modalClose')?.addEventListener('click', () => {
    document.getElementById('serviceModal').classList.remove('active');
});
document.getElementById('serviceModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('serviceModal').classList.remove('active');
});

document.getElementById('serviceForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = Number(document.getElementById('serviceId').value) || Date.now();
    const title = document.getElementById('sTitle').value.trim();
    const description = document.getElementById('sDesc').value.trim();
    const price = document.getElementById('sPrice').value.trim();
    const image = document.getElementById('sImage').value.trim();
    if (!title || !description || !price || !image) return alert('All fields required');

    if (editingServiceId) {
        const idx = services.findIndex(s => s.id === editingServiceId);
        if (idx !== -1) services[idx] = { id: editingServiceId, title, description, price, image };
    } else {
        services.push({ id, title, description, price, image });
    }
    saveAll();
    renderAdminServices();
    renderServices();
    document.getElementById('serviceModal').classList.remove('active');
});

// ===== BUSINESS INFO SAVE =====
document.getElementById('businessForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    bizInfo.name = document.getElementById('bizName').value.trim();
    bizInfo.location = document.getElementById('bizLocation').value.trim();
    bizInfo.phone = document.getElementById('bizPhone').value.trim();
    bizInfo.whatsapp = document.getElementById('bizWhatsapp').value.trim();
    bizInfo.email = document.getElementById('bizEmail').value.trim();
    saveAll();
    updateBizInfo();
    // Update contact section and WhatsApp links
    renderServices(); // refresh WhatsApp links
    alert('Business info saved!');
});

// ===== LOGO & HERO UPLOAD (drag & drop) =====
function setupDropZone(zoneId, inputId, previewId, storageKey) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!zone || !input || !preview) return;

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return alert('Please select an image.');
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            preview.src = data;
            if (storageKey === 'logo') {
                logo = data;
                updateBranding();
            } else if (storageKey === 'heroBg') {
                heroBg = data;
                updateBranding();
            }
            saveAll();
        };
        reader.readAsDataURL(file);
    };

    input.addEventListener('change', () => {
        if (input.files.length) handleFile(input.files[0]);
    });

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = '#f59e0b'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = '#cbd5e1'; });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.style.borderColor = '#cbd5e1';
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
}
setupDropZone('logoDrop', 'logoInput', 'logoPreview', 'logo');
setupDropZone('heroDrop', 'heroInput', 'heroPreview', 'heroBg');

// ===== GALLERY UPLOAD (multiple) =====
const galleryDrop = document.getElementById('galleryDrop');
const galleryInput = document.getElementById('galleryInput');
if (galleryDrop && galleryInput) {
    const handleGalleryFiles = (files) => {
        for (let file of files) {
            if (!file.type.startsWith('image/')) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                gallery.push(e.target.result);
                saveAll();
                renderAdminGallery();
                renderGallery();
            };
            reader.readAsDataURL(file);
        }
    };
    galleryInput.addEventListener('change', () => {
        if (galleryInput.files.length) handleGalleryFiles(galleryInput.files);
    });
    galleryDrop.addEventListener('dragover', (e) => { e.preventDefault(); galleryDrop.style.borderColor = '#f59e0b'; });
    galleryDrop.addEventListener('dragleave', () => { galleryDrop.style.borderColor = '#cbd5e1'; });
    galleryDrop.addEventListener('drop', (e) => {
        e.preventDefault();
        galleryDrop.style.borderColor = '#cbd5e1';
        if (e.dataTransfer.files.length) handleGalleryFiles(e.dataTransfer.files);
    });
}

// ===== CONTACT FORM =====
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you! Your message has been sent. We\'ll get back to you soon.');
    e.target.reset();
});

// ===== MOBILE NAV TOGGLE =====
document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
});
// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('show');
    });
});

// ===== INIT =====
renderServices();
renderGallery();
updateBranding();
updateBizInfo();

// If admin is already logged in (from session?), but we'll default to logged out
showAdminDashboard(false);

// ===== YEARS COUNT ANIMATION (optional) =====
// Just a static value, we keep "5+" as is.