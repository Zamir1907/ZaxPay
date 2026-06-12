/* ========================================
   PAYMENT CENTER - UI CONTROLLER
   Modal Management | Event Handlers | State Management
   ======================================== */

(function() {
    'use strict';
    
    // ----------------------------------------
    // STATE MANAGEMENT
    // ----------------------------------------
    
    const state = {
        // Data metode pembayaran
        methods: {
            qris: {
                imagePath: 'assets/images/qris-placeholder.png', // Ganti dengan QRIS asli Anda
                nominal: 'Rp 0 - Rp 10.000.000',
                instruction: 'Scan QRIS menggunakan aplikasi bank atau e-wallet'
            },
            dana: {
                number: '+62 852 3873 2641', // Ganti dengan nomor DANA asli Anda
                name: 'Zacky Mirzadinata'
            },
            seabank: {
                number: '9015 1315 0038', // Ganti dengan nomor SeaBank asli Anda
                name: 'Zacky Mirzadinata' // Ganti dengan nama penerima SeaBank asli Anda
            }
        },
        
        // Modal state
        currentModal: null,
        isModalOpen: false,
        
        // Scrollbar width (untuk prevent body scroll)
        scrollbarWidth: 0
    };
    
    // ----------------------------------------
    // DOM ELEMENTS
    // ----------------------------------------
    
    const dom = {
        modalRoot: null,
        toastRoot: null,
        methodCards: null,
        otherMethodCard: null,
        otherPanel: null,
        panelCloseBtn: null,
        body: null
    };
    
    // ----------------------------------------
    // HELPER FUNCTIONS
    // ----------------------------------------
    
    /**
     * Hitung scrollbar width untuk mencegah layout shift
     */
    function getScrollbarWidth() {
        const div = document.createElement('div');
        div.style.overflow = 'scroll';
        div.style.position = 'absolute';
        div.style.top = '-9999px';
        div.style.width = '100px';
        div.style.height = '100px';
        document.body.appendChild(div);
        const width = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return width;
    }
    
    /**
     * Prevent body scroll saat modal terbuka
     */
    function preventBodyScroll(shouldPrevent) {
        if (shouldPrevent) {
            state.scrollbarWidth = getScrollbarWidth();
            dom.body.style.overflow = 'hidden';
            dom.body.style.paddingRight = `${state.scrollbarWidth}px`;
            dom.body.classList.add('modal-open');
        } else {
            dom.body.style.overflow = '';
            dom.body.style.paddingRight = '';
            dom.body.classList.remove('modal-open');
        }
    }
    
    /**
     * Render modal ke DOM
     */
    function renderModal(modalHTML) {
        if (!dom.modalRoot) return;
        dom.modalRoot.innerHTML = modalHTML;
        dom.modalRoot.classList.add('active');
        state.isModalOpen = true;
        preventBodyScroll(true);
        
        // Attach event listeners setelah modal di-render
        attachModalEventListeners();
    }
    
    /**
     * Close modal
     */
    function closeModal() {
        if (!dom.modalRoot || !state.isModalOpen) return;
        
        dom.modalRoot.classList.add('closing');
        
        setTimeout(() => {
            dom.modalRoot.innerHTML = '';
            dom.modalRoot.classList.remove('active', 'closing');
            state.isModalOpen = false;
            state.currentModal = null;
            preventBodyScroll(false);
        }, 200);
    }
    
    /**
     * Handle escape key
     */
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && state.isModalOpen) {
            closeModal();
        }
    }
    
    /**
     * Handle click outside modal
     */
    function handleOutsideClick(e) {
        if (!state.isModalOpen) return;
        const modalContainer = dom.modalRoot?.querySelector('.modal-container');
        if (modalContainer && !modalContainer.contains(e.target)) {
            closeModal();
        }
    }
    
    /**
     * Attach event listeners untuk modal yang aktif
     */
    function attachModalEventListeners() {
        const closeBtn = dom.modalRoot?.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Copy buttons untuk DANA & SeaBank
        const copyButtons = dom.modalRoot?.querySelectorAll('.copy-button');
        copyButtons?.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const number = btn.getAttribute('data-number');
                if (number && window.copyToClipboard) {
                    const success = await window.copyToClipboard(number, btn);
                    if (success) {
                        // Tambahkan class success untuk feedback visual
                        btn.classList.add('success');
                        setTimeout(() => {
                            btn.classList.remove('success');
                        }, 2000);
                    }
                }
            });
        });
        
        // Backdrop click
        const backdrop = dom.modalRoot?.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', closeModal);
        }
    }
    
    // ----------------------------------------
    // MODAL GENERATORS
    // ----------------------------------------
    
    /**
     * Generate QRIS Modal HTML
     */
    function generateQRISModal() {
        const qris = state.methods.qris;
        
        return `
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">
                            <i class="fas fa-qrcode"></i>
                            <span>QRIS Payment</span>
                        </div>
                        <button class="modal-close" aria-label="Tutup modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="qris-container">
                            <div class="qris-image-wrapper">
                                <img 
                                    src="${qris.imagePath}" 
                                    alt="QRIS Code" 
                                    class="qris-image"
                                    onerror="this.src='https://placehold.co/400x400/12121A/00E5FF?text=QRIS+Placeholder'"
                                >
                                <div class="qris-loading" style="display: none;">
                                    <i class="fas fa-spinner animate-spin"></i>
                                </div>
                            </div>
                            
                            <div class="qris-instruction">
                                <div class="instruction-step">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>Buka Aplikasi Bank/E-Wallet</span>
                                </div>
                                <i class="fas fa-arrow-right"></i>
                                <div class="instruction-step">
                                    <i class="fas fa-camera"></i>
                                    <span>Scan QRIS</span>
                                </div>
                                <i class="fas fa-arrow-right"></i>
                                <div class="instruction-step">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Konfirmasi Pembayaran</span>
                                </div>
                            </div>
                            
                            ${qris.nominal ? `
                            <div class="qris-nominal">
                                <i class="fas fa-tag"></i>
                                <span>Nominal: ${qris.nominal}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <i class="fas fa-shield-alt"></i>
                        <span>Transaksi aman & terenkripsi</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
 * Enhanced QRIS Modal dengan loading handler
 */
function generateQRISModalEnhanced() {
    const qris = state.methods.qris;
    
    return `
        <div class="modal-backdrop"></div>
        <div class="modal-container">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">
                        <i class="fas fa-qrcode"></i>
                        <span>QRIS Payment</span>
                    </div>
                    <button class="modal-close" aria-label="Tutup modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="qris-container">
                        <div class="qris-image-wrapper" id="qrisImageWrapper">
                            <img 
                                src="${qris.imagePath}" 
                                alt="QRIS Code" 
                                class="qris-image"
                                id="qrisImage"
                                onerror="this.onerror=null; this.src='https://placehold.co/400x400/12121A/00E5FF?text=QRIS+Not+Found'; document.getElementById('qrisLoading')?.style.setProperty('display', 'none', 'important');"
                                onload="document.getElementById('qrisLoading')?.style.setProperty('display', 'none', 'important');"
                                style="display: block;"
                            >
                            <div class="qris-loading" id="qrisLoading" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                                <i class="fas fa-spinner animate-spin"></i>
                                <span>Memuat QRIS...</span>
                            </div>
                        </div>
                        
                        <div class="qris-instruction">
                            <div class="instruction-step">
                                <i class="fas fa-mobile-alt"></i>
                                <span>Buka Aplikasi Bank/E-Wallet</span>
                            </div>
                            <i class="fas fa-arrow-right"></i>
                            <div class="instruction-step">
                                <i class="fas fa-camera"></i>
                                <span>Scan QRIS</span>
                            </div>
                            <i class="fas fa-arrow-right"></i>
                            <div class="instruction-step">
                                <i class="fas fa-check-circle"></i>
                                <span>Konfirmasi Pembayaran</span>
                            </div>
                        </div>
                        
                        ${qris.nominal ? `
                        <div class="qris-nominal">
                            <i class="fas fa-tag"></i>
                            <span>Nominal: ${qris.nominal}</span>
                        </div>
                        ` : ''}
                        
                        <div class="info-note" style="margin-top: var(--spacing-md);">
                            <i class="fas fa-shield-alt"></i>
                            <span>Pastikan scan QRIS dari aplikasi resmi</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <i class="fas fa-clock"></i>
                    <span>QRIS valid 24 jam</span>
                </div>
            </div>
        </div>
    `;
}

// Ganti panggilan generateQRISModal dengan generateQRISModalEnhanced
// Di dalam handleMethodClick, ubah:
// case 'qris': renderModal(generateQRISModal()); break;
// Menjadi:
// case 'qris': renderModal(generateQRISModalEnhanced()); break;
    
    /**
     * Generate DANA Modal HTML
     */
    function generateDANAModal() {
        const dana = state.methods.dana;
        
        return `
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">
                            <i class="fas fa-wallet"></i>
                            <span>DANA</span>
                        </div>
                        <button class="modal-close" aria-label="Tutup modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="method-detail">
                            <div class="method-icon-large">
                                <i class="fas fa-wallet"></i>
                            </div>
                            <h3 class="method-name">DANA</h3>
                            <div class="method-status">
                                <i class="fas fa-circle"></i>
                                <span>Aktif</span>
                            </div>
                            
                            <div class="number-container">
                                <div class="number-label">Nomor DANA</div>
                                <div class="number-value" id="danaNumber">${dana.number}</div>
                            </div>
                            
                            <button class="copy-button" data-number="${dana.number}">
                                <i class="fas fa-copy"></i>
                                <span class="button-text">Salin Nomor</span>
                            </button>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <span>Pastikan nomor tujuan sesuai sebelum transfer</span>
                            </div>
                            
                            ${dana.name ? `
                            <div class="info-note">
                                <i class="fas fa-user-check"></i>
                                <span>Penerima: ${dana.name}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <i class="fas fa-clock"></i>
                        <span>Transaksi 24 jam</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate SeaBank Modal HTML
     */
    function generateSeaBankModal() {
        const seabank = state.methods.seabank;
        
        return `
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">
                            <i class="fas fa-university"></i>
                            <span>SeaBank</span>
                        </div>
                        <button class="modal-close" aria-label="Tutup modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="method-detail">
                            <div class="method-icon-large">
                                <i class="fas fa-university"></i>
                            </div>
                            <h3 class="method-name">SeaBank</h3>
                            <div class="method-status">
                                <i class="fas fa-circle"></i>
                                <span>Aktif</span>
                            </div>
                            
                            <div class="number-container">
                                <div class="number-label">Nomor Rekening</div>
                                <div class="number-value" id="seabankNumber">${seabank.number}</div>
                            </div>
                            
                            <button class="copy-button" data-number="${seabank.number}">
                                <i class="fas fa-copy"></i>
                                <span class="button-text">Salin Nomor Rekening</span>
                            </button>
                            
                            <div class="info-note">
                                <i class="fas fa-info-circle"></i>
                                <span>Pastikan nomor rekening tujuan sesuai</span>
                            </div>
                            
                            ${seabank.name ? `
                            <div class="info-note">
                                <i class="fas fa-building"></i>
                                <span>Nama Penerima: ${seabank.name}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <i class="fas fa-bolt"></i>
                        <span>Transfer instan 24 jam</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ----------------------------------------
    // EVENT HANDLERS
    // ----------------------------------------
    
    /**
     * Handle method card click
     */
    function handleMethodClick(method) {
        switch(method) {
            case 'qris':
                renderModal(generateQRISModal());
                state.currentModal = 'qris';
                break;
            case 'dana':
                renderModal(generateDANAModal());
                state.currentModal = 'dana';
                break;
            case 'seabank':
                renderModal(generateSeaBankModal());
                state.currentModal = 'seabank';
                break;
            default:
                console.warn(`Method ${method} not recognized`);
        }
    }
    
    /**
     * Handle Metode Lainnya panel toggle
     */
    function toggleOtherMethodsPanel() {
        if (!dom.otherPanel) return;
        
        const isActive = dom.otherPanel.classList.contains('active');
        
        if (isActive) {
            dom.otherPanel.classList.remove('active');
            // Optional: animate close
        } else {
            dom.otherPanel.classList.add('active');
            // Scroll ke panel setelah terbuka
            setTimeout(() => {
                dom.otherPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }
    
    /**
     * Close other methods panel
     */
    function closeOtherMethodsPanel() {
        if (dom.otherPanel) {
            dom.otherPanel.classList.remove('active');
        }
    }
    
    /**
     * Disable right click pada elemen sensitif
     */
    function disableRightClick(e) {
        // Hanya disable pada area yang berisi informasi sensitif
        const sensitiveAreas = ['.number-container', '.number-value', '.method-card'];
        let target = e.target;
        
        while (target && target !== document.body) {
            for (const selector of sensitiveAreas) {
                if (target.matches?.(selector)) {
                    e.preventDefault();
                    return false;
                }
            }
            target = target.parentElement;
        }
        return true;
    }
    
    /**
     * Disable drag pada gambar
     */
    function disableDrag(e) {
        const target = e.target;
        if (target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
        return true;
    }
    
    // ----------------------------------------
    // INITIALIZATION
    // ----------------------------------------
    
    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Method cards
        if (dom.methodCards) {
            dom.methodCards.forEach(card => {
                const method = card.getAttribute('data-method');
                if (method && method !== 'other') {
                    card.addEventListener('click', () => handleMethodClick(method));
                }
            });
        }
        
        // Metode Lainnya card
        if (dom.otherMethodCard) {
            dom.otherMethodCard.addEventListener('click', toggleOtherMethodsPanel);
        }
        
        // Panel close button
        if (dom.panelCloseBtn) {
            dom.panelCloseBtn.addEventListener('click', closeOtherMethodsPanel);
        }
        
        // Escape key untuk modal
        document.addEventListener('keydown', handleEscapeKey);
        
        // Click outside untuk modal (delegated ke modal root)
        if (dom.modalRoot) {
            dom.modalRoot.addEventListener('click', handleOutsideClick);
        }
        
        // Proteksi: disable right click pada area sensitif
        document.addEventListener('contextmenu', disableRightClick);
        
        // Proteksi: disable drag pada gambar
        document.addEventListener('dragstart', disableDrag);
    }
    
    /**
     * Initialize UI Controller
     */
    function init() {
        // Get DOM elements
        dom.modalRoot = document.getElementById('modalRoot');
        dom.toastRoot = document.getElementById('toastRoot');
        dom.methodCards = document.querySelectorAll('.method-card:not(.method-other-wrapper)');
        dom.otherMethodCard = document.querySelector('.method-card.method-other-wrapper');
        dom.otherPanel = document.getElementById('otherMethodsPanel');
        dom.panelCloseBtn = document.getElementById('panelCloseBtn');
        dom.body = document.body;
        
        // Log jika ada yang missing
        if (!dom.modalRoot) console.warn('Modal root not found');
        if (!dom.toastRoot) console.warn('Toast root not found');
        
        // Setup event listeners
        setupEventListeners();
        
        // Jika QRIS image placeholder tidak ada, set fallback
        const qrisImagePath = state.methods.qris.imagePath;
        if (qrisImagePath === 'assets/images/qris-placeholder.png') {
            console.warn('⚠️ QRIS image masih menggunakan placeholder. Ganti dengan QRIS asli Anda di ui.js -> state.methods.qris.imagePath');
        }
        
        console.log('✅ Payment Center UI initialized');
    }
    
    // Export public API (opsional, untuk debugging)
    window.paymentCenter = {
        state,
        closeModal,
        openMethod: handleMethodClick,
        toggleOtherPanel: toggleOtherMethodsPanel
    };
    
    // Run initialization ketika DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();