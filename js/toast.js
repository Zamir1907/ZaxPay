/* ========================================
   PAYMENT CENTER - TOAST NOTIFICATION
   Premium Toast System | Stack Queue | Auto Dismiss
   ======================================== */

(function() {
    'use strict';
    
    // ----------------------------------------
    // CONFIGURATION
    // ----------------------------------------
    
    const CONFIG = {
        maxToasts: 3,           // Maksimal toast yang tampil bersamaan
        duration: 3000,         // Durasi toast dalam ms (3 detik)
        animationDuration: 300,  // Durasi animasi masuk/keluar
        spacing: 16,            // Jarak antar toast (px)
        position: 'bottom-right' // Posisi: top-right, top-left, bottom-right, bottom-left
    };
    
    // ----------------------------------------
    // PRIVATE VARIABLES
    // ----------------------------------------
    
    let toastContainer = null;
    let activeToasts = [];      // Array of active toast elements
    let toastQueue = [];        // Queue untuk toast yang menunggu
    
    // Toast type configurations
    const TOAST_TYPES = {
        success: {
            icon: 'fas fa-check-circle',
            color: '#00E676',
            bgGradient: 'linear-gradient(135deg, rgba(0, 230, 118, 0.15), rgba(0, 230, 118, 0.05))'
        },
        error: {
            icon: 'fas fa-exclamation-circle',
            color: '#FF5252',
            bgGradient: 'linear-gradient(135deg, rgba(255, 82, 82, 0.15), rgba(255, 82, 82, 0.05))'
        },
        info: {
            icon: 'fas fa-info-circle',
            color: '#00E5FF',
            bgGradient: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 229, 255, 0.05))'
        },
        warning: {
            icon: 'fas fa-exclamation-triangle',
            color: '#FFB300',
            bgGradient: 'linear-gradient(135deg, rgba(255, 179, 0, 0.15), rgba(255, 179, 0, 0.05))'
        }
    };
    
    // ----------------------------------------
    // HELPER FUNCTIONS
    // ----------------------------------------
    
    /**
     * Create toast container if not exists
     */
    function ensureContainer() {
        if (toastContainer && document.body.contains(toastContainer)) {
            return toastContainer;
        }
        
        // Cari container existing
        const existingContainer = document.getElementById('toastRoot');
        if (existingContainer) {
            toastContainer = existingContainer;
        } else {
            // Create container if not found
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastRoot';
            document.body.appendChild(toastContainer);
        }
        
        // Apply container styles
        applyContainerStyles();
        
        return toastContainer;
    }
    
    /**
     * Apply styles to toast container based on position
     */
    function applyContainerStyles() {
        if (!toastContainer) return;
        
        toastContainer.style.position = 'fixed';
        toastContainer.style.zIndex = '1100';
        toastContainer.style.pointerEvents = 'none';
        
        // Position based on config
        switch (CONFIG.position) {
            case 'top-right':
                toastContainer.style.top = '20px';
                toastContainer.style.right = '20px';
                toastContainer.style.bottom = 'auto';
                toastContainer.style.left = 'auto';
                break;
            case 'top-left':
                toastContainer.style.top = '20px';
                toastContainer.style.left = '20px';
                toastContainer.style.right = 'auto';
                toastContainer.style.bottom = 'auto';
                break;
            case 'bottom-left':
                toastContainer.style.bottom = '20px';
                toastContainer.style.left = '20px';
                toastContainer.style.top = 'auto';
                toastContainer.style.right = 'auto';
                break;
            case 'bottom-right':
            default:
                toastContainer.style.bottom = '20px';
                toastContainer.style.right = '20px';
                toastContainer.style.top = 'auto';
                toastContainer.style.left = 'auto';
                break;
        }
    }
    
    /**
     * Update positions of all active toasts
     */
    function updateToastPositions() {
        let offset = 0;
        
        // Reverse for bottom positions (toast terbaru di bawah)
        const isBottom = CONFIG.position.includes('bottom');
        const toasts = isBottom ? [...activeToasts].reverse() : activeToasts;
        
        toasts.forEach((toast, index) => {
            if (!toast || !toast.isConnected) return;
            
            const toastHeight = toast.offsetHeight;
            let position = 0;
            
            if (isBottom) {
                // Bottom position: dari bawah ke atas
                position = offset;
                offset += toastHeight + CONFIG.spacing;
                toast.style.bottom = `${position}px`;
                toast.style.top = 'auto';
            } else {
                // Top position: dari atas ke bawah
                position = offset;
                offset += toastHeight + CONFIG.spacing;
                toast.style.top = `${position}px`;
                toast.style.bottom = 'auto';
            }
        });
    }
    
    /**
     * Remove toast from DOM and active list
     */
    function removeToast(toastElement, animate = true) {
        const index = activeToasts.indexOf(toastElement);
        if (index > -1) {
            activeToasts.splice(index, 1);
        }
        
        if (animate && toastElement && toastElement.isConnected) {
            // Add exit animation
            toastElement.style.animation = 'slideOut 0.2s ease forwards';
            
            setTimeout(() => {
                if (toastElement && toastElement.isConnected) {
                    toastElement.remove();
                }
                updateToastPositions();
                processQueue();
            }, 200);
        } else {
            if (toastElement && toastElement.isConnected) {
                toastElement.remove();
            }
            updateToastPositions();
            processQueue();
        }
    }
    
    /**
     * Process queued toasts
     */
    function processQueue() {
        if (activeToasts.length < CONFIG.maxToasts && toastQueue.length > 0) {
            const nextToast = toastQueue.shift();
            createToastElement(nextToast.message, nextToast.type);
        }
    }
    
    /**
     * Create toast DOM element
     */
    function createToastElement(message, type = 'success') {
        // Ensure container exists
        const container = ensureContainer();
        if (!container) return null;
        
        // Get type configuration
        const typeConfig = TOAST_TYPES[type] || TOAST_TYPES.success;
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        // Set inner HTML
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${typeConfig.icon}"></i>
            </div>
            <div class="toast-content">
                <p class="toast-message">${escapeHtml(message)}</p>
            </div>
            <button class="toast-close" aria-label="Tutup notifikasi">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;
        
        // Apply styles
        applyToastStyles(toast, typeConfig);
        
        // Add to container
        container.appendChild(toast);
        
        // Add to active toasts
        activeToasts.push(toast);
        
        // Update positions
        updateToastPositions();
        
        // Add entrance animation
        toast.style.animation = 'slideIn 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
        
        // Setup auto dismiss
        let timeoutId = setTimeout(() => {
            if (toast && toast.isConnected) {
                removeToast(toast);
            }
        }, CONFIG.duration);
        
        // Store timeout on toast element for cleanup
        toast._timeoutId = timeoutId;
        
        // Setup close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (toast._timeoutId) {
                    clearTimeout(toast._timeoutId);
                }
                removeToast(toast);
            });
        }
        
        // Pause auto dismiss on hover
        toast.addEventListener('mouseenter', () => {
            if (toast._timeoutId) {
                clearTimeout(toast._timeoutId);
                toast._timeoutId = null;
            }
            // Pause progress bar animation
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.animationPlayState = 'paused';
            }
        });
        
        toast.addEventListener('mouseleave', () => {
            if (!toast._timeoutId && toast.isConnected) {
                toast._timeoutId = setTimeout(() => {
                    if (toast && toast.isConnected) {
                        removeToast(toast);
                    }
                }, CONFIG.duration);
                
                // Resume progress bar animation
                const progressBar = toast.querySelector('.toast-progress');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            }
        });
        
        return toast;
    }
    
    /**
     * Apply CSS styles to toast element
     */
    function applyToastStyles(toast, typeConfig) {
        // Add style element if not exists
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = getToastStyles();
            document.head.appendChild(style);
        }
        
        // Apply inline styles untuk dynamic values
        toast.style.cssText = `
            position: absolute;
            width: 360px;
            max-width: calc(100vw - 40px);
            background: var(--bg-glass-solid, rgba(18, 18, 26, 0.95));
            backdrop-filter: blur(16px);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px ${typeConfig.color}20;
            cursor: default;
            transition: all 0.2s ease;
            pointer-events: auto;
            overflow: hidden;
        `;
    }
    
    /**
     * Get CSS styles for toast animations and components
     */
    function getToastStyles() {
        return `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
            
            .toast-notification {
                position: relative;
            }
            
            .toast-notification:hover {
                transform: translateX(-4px);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
            }
            
            .toast-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .toast-icon i {
                font-size: 20px;
            }
            
            .toast-content {
                flex: 1;
            }
            
            .toast-message {
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.4;
                color: var(--text-primary, #FFFFFF);
            }
            
            .toast-close {
                flex-shrink: 0;
                background: none;
                border: none;
                color: var(--text-tertiary, #6A6A7A);
                cursor: pointer;
                padding: 4px;
                border-radius: 6px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .toast-close:hover {
                color: var(--error, #FF5252);
                background: rgba(255, 82, 82, 0.1);
                transform: scale(1.1);
            }
            
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, ${TOAST_TYPES.success.color}, ${TOAST_TYPES.info.color});
                animation: progress ${CONFIG.duration}ms linear forwards;
                transform-origin: left;
            }
            
            @keyframes progress {
                from {
                    transform: scaleX(1);
                }
                to {
                    transform: scaleX(0);
                }
            }
            
            /* Toast type specific icon colors */
            .toast-success .toast-icon i {
                color: ${TOAST_TYPES.success.color};
            }
            
            .toast-error .toast-icon i {
                color: ${TOAST_TYPES.error.color};
            }
            
            .toast-info .toast-icon i {
                color: ${TOAST_TYPES.info.color};
            }
            
            .toast-warning .toast-icon i {
                color: ${TOAST_TYPES.warning.color};
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .toast-notification {
                    width: calc(100vw - 32px);
                    max-width: none;
                    padding: 12px;
                }
                
                .toast-message {
                    font-size: 13px;
                }
                
                .toast-icon i {
                    font-size: 18px;
                }
            }
        `;
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Change toast position dynamically
     */
    function setPosition(position) {
        const validPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
        if (validPositions.includes(position)) {
            CONFIG.position = position;
            applyContainerStyles();
            updateToastPositions();
        }
    }
    
    /**
     * Change max concurrent toasts
     */
    function setMaxToasts(max) {
        if (typeof max === 'number' && max > 0) {
            CONFIG.maxToasts = max;
            // Remove excess toasts if needed
            while (activeToasts.length > CONFIG.maxToasts) {
                const excessToast = activeToasts.pop();
                if (excessToast && excessToast.isConnected) {
                    removeToast(excessToast, true);
                }
            }
            updateToastPositions();
            processQueue();
        }
    }
    
    /**
     * Clear all active toasts
     */
    function clearAll() {
        const toasts = [...activeToasts];
        toasts.forEach(toast => {
            if (toast._timeoutId) {
                clearTimeout(toast._timeoutId);
            }
            removeToast(toast, true);
        });
        toastQueue = [];
    }
    
    // ----------------------------------------
    // MAIN PUBLIC API
    // ----------------------------------------
    
    /**
     * Show a toast notification
     * @param {string} message - Pesan yang akan ditampilkan
     * @param {string} type - Tipe toast: 'success', 'error', 'info', 'warning'
     */
    function showToast(message, type = 'success') {
        if (!message || typeof message !== 'string') {
            console.warn('Toast: Invalid message');
            return;
        }
        
        // Validate type
        const validTypes = ['success', 'error', 'info', 'warning'];
        if (!validTypes.includes(type)) {
            type = 'success';
        }
        
        // Check if we can show immediately or need to queue
        if (activeToasts.length < CONFIG.maxToasts) {
            createToastElement(message, type);
        } else {
            toastQueue.push({ message, type });
        }
    }
    
    /**
     * Show success toast (shortcut)
     */
    function showSuccess(message) {
        showToast(message, 'success');
    }
    
    /**
     * Show error toast (shortcut)
     */
    function showError(message) {
        showToast(message, 'error');
    }
    
    /**
     * Show info toast (shortcut)
     */
    function showInfo(message) {
        showToast(message, 'info');
    }
    
    /**
     * Show warning toast (shortcut)
     */
    function showWarning(message) {
        showToast(message, 'warning');
    }
    
    // ----------------------------------------
    // EXPOSE PUBLIC API
    // ----------------------------------------
    
    window.toast = {
        show: showToast,
        success: showSuccess,
        error: showError,
        info: showInfo,
        warning: showWarning,
        clearAll: clearAll,
        setPosition: setPosition,
        setMaxToasts: setMaxToasts,
        config: CONFIG
    };
    
    // Optional: tambahkan ke paymentCenter global
    if (window.paymentCenter) {
        window.paymentCenter.toast = window.toast;
    }
    
    // ----------------------------------------
    // INITIALIZATION
    // ----------------------------------------
    
    // Create container on load
    document.addEventListener('DOMContentLoaded', () => {
        ensureContainer();
        console.log('✅ Toast module initialized');
    });
    
    // Jika DOM sudah siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureContainer);
    } else {
        ensureContainer();
    }
    
})();