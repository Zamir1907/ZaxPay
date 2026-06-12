/* ========================================
   PAYMENT CENTER - CLIPBOARD UTILITY
   Copy to Clipboard | Fallback Support | Visual Feedback
   ======================================== */

(function() {
    'use strict';
    
    // ----------------------------------------
    // PRIVATE VARIABLES
    // ----------------------------------------
    
    // Track copy operations untuk menghindari race condition
    let isCopying = false;
    
    // Simpan timeout ID untuk cleanup
    let feedbackTimeouts = new Map();
    
    // ----------------------------------------
    // HELPER FUNCTIONS
    // ----------------------------------------
    
    /**
     * Tampilkan toast notification melalui global toast module
     */
    function showToast(message, type = 'success') {
        if (window.toast && typeof window.toast.show === 'function') {
            window.toast.show(message, type);
        } else {
            // Fallback jika toast.js belum load
            console.log(`[Toast] ${type}: ${message}`);
        }
    }
    
    /**
     * Cleanup feedback pada tombol setelah timeout
     */
    function clearButtonFeedback(button) {
        if (!button) return;
        
        // Hapus timeout yang ada
        if (feedbackTimeouts.has(button)) {
            clearTimeout(feedbackTimeouts.get(button));
            feedbackTimeouts.delete(button);
        }
        
        // Hapus class success
        button.classList.remove('success');
        
        // Reset icon dan text
        const icon = button.querySelector('i');
        const textSpan = button.querySelector('.button-text');
        
        if (icon) {
            icon.className = 'fas fa-copy';
        }
        
        if (textSpan) {
            // Cek apakah button untuk DANA atau SeaBank
            if (button.getAttribute('data-number')) {
                const isDANA = textSpan.textContent.includes('DANA') || textSpan.textContent.includes('Nomor');
                const isSeaBank = textSpan.textContent.includes('Rekening');
                
                if (isDANA) {
                    textSpan.textContent = 'Salin Nomor';
                } else if (isSeaBank) {
                    textSpan.textContent = 'Salin Nomor Rekening';
                } else {
                    textSpan.textContent = 'Salin';
                }
            }
        }
    }
    
    /**
     * Berikan visual feedback sukses pada tombol
     */
    function showSuccessFeedback(button) {
        if (!button) return;
        
        // Cleanup feedback sebelumnya
        clearButtonFeedback(button);
        
        // Tambah class success
        button.classList.add('success');
        
        // Ubah icon jadi check
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-check-circle';
        }
        
        // Ubah text jadi "Tersalin!"
        const textSpan = button.querySelector('.button-text');
        if (textSpan) {
            const originalText = textSpan.textContent;
            textSpan.textContent = 'Tersalin!';
            // Simpan original text untuk restore nanti
            button.setAttribute('data-original-text', originalText);
        }
        
        // Set timeout untuk restore (2 detik)
        const timeoutId = setTimeout(() => {
            clearButtonFeedback(button);
        }, 2000);
        
        feedbackTimeouts.set(button, timeoutId);
    }
    
    /**
     * Berikan visual feedback error pada tombol
     */
    function showErrorFeedback(button) {
        if (!button) return;
        
        // Cleanup feedback sebelumnya
        clearButtonFeedback(button);
        
        // Tambah class error (opsional, jika ada styling)
        button.classList.add('error');
        
        // Ubah icon jadi exclamation
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-exclamation-triangle';
        }
        
        // Ubah text jadi "Gagal!"
        const textSpan = button.querySelector('.button-text');
        if (textSpan) {
            const originalText = textSpan.textContent;
            textSpan.textContent = 'Gagal!';
            button.setAttribute('data-original-text', originalText);
        }
        
        // Set timeout untuk restore (2 detik)
        const timeoutId = setTimeout(() => {
            clearButtonFeedback(button);
            button.classList.remove('error');
        }, 2000);
        
        feedbackTimeouts.set(button, timeoutId);
    }
    
    // ----------------------------------------
    // CORE COPY FUNCTIONS
    // ----------------------------------------
    
    /**
     * Copy menggunakan Clipboard API modern
     * Support: Chrome 66+, Edge 79+, Firefox 63+, Safari 13.1+
     */
    async function copyWithClipboardAPI(text, button) {
        try {
            // Cek apakah clipboard API tersedia
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                throw new Error('Clipboard API not supported');
            }
            
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Clipboard API failed:', err);
            return false;
        }
    }
    
    /**
     * Copy menggunakan execCommand (fallback untuk browser lama)
     * Support: Almost all browsers
     */
    function copyWithExecCommand(text, button) {
        let success = false;
        
        // Buat textarea temporary
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        textarea.setAttribute('readonly', '');
        
        document.body.appendChild(textarea);
        
        // Select dan copy
        try {
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            success = document.execCommand('copy');
        } catch (err) {
            console.error('execCommand copy failed:', err);
            success = false;
        }
        
        // Cleanup
        document.body.removeChild(textarea);
        
        return success;
    }
    
    /**
     * Main copy function - auto memilih method terbaik
     */
    async function copyToClipboard(text, button) {
        // Validasi input
        if (!text || typeof text !== 'string') {
            console.error('Invalid text to copy:', text);
            showToast('Teks tidak valid', 'error');
            if (button) showErrorFeedback(button);
            return false;
        }
        
        // Prevent multiple simultaneous copy dari button yang sama
        if (isCopying && button) {
            console.warn('Copy already in progress');
            return false;
        }
        
        if (button) {
            isCopying = true;
        }
        
        let success = false;
        
        try {
            // Coba dengan Clipboard API dulu
            success = await copyWithClipboardAPI(text, button);
            
            // Fallback ke execCommand jika Clipboard API gagal
            if (!success) {
                success = copyWithExecCommand(text, button);
            }
            
            // Handle hasil
            if (success) {
                showToast('✅ Nomor berhasil disalin!', 'success');
                if (button) showSuccessFeedback(button);
                
                // Optional: tambah efek ripple/animasi tambahan
                if (button) {
                    button.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        if (button) button.style.transform = '';
                    }, 150);
                }
            } else {
                throw new Error('All copy methods failed');
            }
        } catch (err) {
            console.error('Copy failed:', err);
            showToast('❌ Gagal menyalin. Silakan salin manual.', 'error');
            if (button) showErrorFeedback(button);
            success = false;
        } finally {
            if (button) {
                isCopying = false;
            }
        }
        
        return success;
    }
    
    /**
     * Copy text tanpa visual feedback (untuk penggunaan internal)
     */
    async function copySilent(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }
        
        let success = false;
        
        try {
            success = await copyWithClipboardAPI(text);
            if (!success) {
                success = copyWithExecCommand(text);
            }
        } catch (err) {
            console.error('Silent copy failed:', err);
            success = false;
        }
        
        return success;
    }
    
    // ----------------------------------------
    // CLEANUP FUNCTION
    // ----------------------------------------
    
    /**
     * Cleanup semua timeout feedback (dipanggil jika perlu)
     */
    function cleanupAllFeedback() {
        for (const [button, timeoutId] of feedbackTimeouts) {
            clearTimeout(timeoutId);
            clearButtonFeedback(button);
        }
        feedbackTimeouts.clear();
    }
    
    // ----------------------------------------
    // EXPOSE PUBLIC API
    // ----------------------------------------
    
    // Export ke global window object
    window.copyToClipboard = copyToClipboard;
    window.copySilent = copySilent;
    window.cleanupCopyFeedback = cleanupAllFeedback;
    
    // Optional: tambahkan utility untuk debug
    if (window.paymentCenter) {
        window.paymentCenter.copy = {
            copyToClipboard,
            copySilent,
            cleanupAllFeedback
        };
    }
    
    // ----------------------------------------
    // AUTO CLEANUP PADA PAGE UNLOAD
    // ----------------------------------------
    
    window.addEventListener('beforeunload', () => {
        cleanupAllFeedback();
    });
    
    // Log initialization
    console.log('✅ Copy module initialized (Clipboard API + execCommand fallback)');
    
})();