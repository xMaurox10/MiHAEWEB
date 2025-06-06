import { initializeLanguage, translations } from './languageManager.js';
import * as gemini from './geminiService.js';

let selectedFile = null;
let üretim = {};
const THEMES = ['dark', 'intermediate', 'light'];

/**
 * Aplica un tema específico al documento y actualiza los iconos.
 * @param {'dark' | 'intermediate' | 'light'} theme - El tema a activar.
 */
function applyTheme(theme) {
    // Limpiar clases de tema anteriores
    üretim.htmlElement.classList.remove('light', 'theme-intermediate');

    // Aplicar la clase del nuevo tema (si no es el oscuro por defecto)
    if (theme === 'light') {
        üretim.htmlElement.classList.add('light');
    } else if (theme === 'intermediate') {
        üretim.htmlElement.classList.add('theme-intermediate');
    }
    
    // Actualizar la visibilidad de los iconos
    üretim.themeToggleDarkIcon.classList.toggle('hidden', theme !== 'dark');
    üretim.themeToggleIntermediateIcon.classList.toggle('hidden', theme !== 'intermediate');
    üretim.themeToggleLightIcon.classList.toggle('hidden', theme !== 'light');
}

/**
 * Inicializa el interruptor de tema para ciclar entre 3 estados.
 */
function initializeTheme() {
    const storedTheme = localStorage.getItem('theme') || 'dark'; // Oscuro es el defecto
    applyTheme(storedTheme);
    
    üretim.themeToggleButton.addEventListener('click', () => {
        // Encontrar el tema actual
        let currentTheme = 'dark'; // Por defecto
        if (üretim.htmlElement.classList.contains('light')) {
            currentTheme = 'light';
        } else if (üretim.htmlElement.classList.contains('theme-intermediate')) {
            currentTheme = 'intermediate';
        }
        
        // Encontrar el índice actual y calcular el siguiente
        const currentIndex = THEMES.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const newTheme = THEMES[nextIndex];
        
        // Guardar y aplicar el nuevo tema
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}


/**
 * Inicializa el efecto de chispas que siguen al puntero del ratón.
 */
function initializeSparkleEffect() {
    let canCreateSparkle = true;

    document.addEventListener('mousemove', (e) => {
        if (!canCreateSparkle) return;

        canCreateSparkle = false;
        setTimeout(() => {
            canCreateSparkle = true;
        }, 50); // Limita la creación de chispas a una cada 50ms para no sobrecargar.

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        document.body.appendChild(sparkle);

        // Posiciona la chispa en el cursor
        sparkle.style.left = `${e.clientX}px`;
        sparkle.style.top = `${e.clientY}px`;

        // Añade un movimiento aleatorio final a cada chispa
        const randomX = (Math.random() - 0.5) * 80;
        const randomY = (Math.random() - 0.5) * 80;
        sparkle.style.setProperty('--sparkle-translate-x', `${randomX}px`);
        sparkle.style.setProperty('--sparkle-translate-y', `${randomY}px`);

        // Limpia la chispa del DOM cuando la animación termina
        sparkle.addEventListener('animationend', () => {
            sparkle.remove();
        });
    });
}


// --- El resto de las funciones no necesitan cambios ---

function appendChatMessage(message, type) {
    if (!üretim.chatHistoryDiv) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', 'rounded-xl', 'p-3', 'px-4', 'max-w-[80%]', 'text-sm', 'break-words');
    
    if (type === 'user') {
        messageDiv.classList.add('bg-accent', 'text-accent-foreground', 'self-end', 'rounded-br-lg');
    } else if (type === 'gemini') {
        messageDiv.classList.add('bg-muted', 'text-foreground', 'self-start', 'rounded-bl-lg');
    } else {
        messageDiv.classList.add('bg-destructive', 'text-white', 'self-start', 'rounded-bl-lg');
    }

    if (message instanceof HTMLElement) { messageDiv.appendChild(message); }
    else { messageDiv.innerHTML = message; }
    
    üretim.chatHistoryDiv.appendChild(messageDiv);
    üretim.chatHistoryDiv.scrollTop = üretim.chatHistoryDiv.scrollHeight;
};

function addInitialChatMessage(languageChanged = false, lang, trans) {
    if (!üretim.chatHistoryDiv) return;
    if (!languageChanged && üretim.chatHistoryDiv.children.length > 1) return;
    üretim.chatHistoryDiv.innerHTML = '';
    const initialMessageText = gemini.initializeChat(trans, lang);
    appendChatMessage(initialMessageText, 'gemini');
};


function showSection(sectionIdToShow) {
    if (üretim.classDetailSections) {
        üretim.classDetailSections.forEach(section => {
            section.style.display = (section.id === sectionIdToShow) ? 'block' : 'none';
        });
    }
    if (üretim.mainMenuSection) {
        üretim.mainMenuSection.style.display = (sectionIdToShow === 'main-menu-section') ? 'block' : 'none';
    }
    if (üretim.passwordPromptModal) {
        üretim.passwordPromptModal.style.display = 'none';
    }
    
    const targetSection = document.getElementById(sectionIdToShow);
    if (targetSection) {
        // Carga perezosa de iframes solo para la sección que se va a mostrar
        const iframes = targetSection.querySelectorAll('iframe[data-src]');
        iframes.forEach(iframe => {
            // Solo carga el src si no ha sido cargado antes
            if (iframe.dataset.src && !iframe.src) {
                iframe.src = iframe.dataset.src;
            }
        });

        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function animateCardsOnLoad() {
    const cards = document.querySelectorAll('.class-card');
    cards.forEach(card => card.classList.remove('fade-in-up'));
    setTimeout(() => {
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 70}ms`;
            card.classList.add('fade-in-up');
        });
    }, 10);
}

function setupNavigation() {
    if (!üretim.allClassCards) return;
    üretim.allClassCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.dataset.target;
            if (targetId === 'clase-detail-examenes') {
                if (üretim.passwordPromptModal) {
                    üretim.passwordPromptModal.style.display = 'flex';
                    if (üretim.passwordInputEl) {
                        üretim.passwordInputEl.value = '';
                        üretim.passwordInputEl.focus();
                    }
                    if (üretim.passwordError) üretim.passwordError.style.display = 'none';
                }
            } else {
                showSection(targetId);
            }
        });
    });
    if (!üretim.backButtons) return;
    üretim.backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showSection('main-menu-section');
            animateCardsOnLoad();
            document.querySelectorAll('[id^="summary-output-"]').forEach(output => {
                output.classList.add('hidden');
                output.innerHTML = '';
            });

            // Descarga todos los iframes para liberar memoria y recursos
            document.querySelectorAll('.class-detail-section iframe').forEach(iframe => {
                iframe.src = 'about:blank';
            });

            clearSelectedFile();
        });
    });
};

function setupPasswordModal() {
    if (!üretim.submitPasswordButton || !üretim.passwordInputEl || !üretim.passwordPromptModal || !üretim.passwordError || !üretim.cancelPasswordButton) {
        return;
    }
    const handlePasswordSubmit = () => {
        if (üretim.passwordInputEl.value === 'Meteoro') {
            üretim.passwordPromptModal.style.display = 'none';
            showSection('clase-detail-examenes');
        } else {
            üretim.passwordError.style.display = 'block';
            üretim.passwordInputEl.focus();
        }
        üretim.passwordInputEl.value = '';
    };
    üretim.submitPasswordButton.addEventListener('click', handlePasswordSubmit);
    üretim.passwordInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePasswordSubmit();
    });
    üretim.cancelPasswordButton.addEventListener('click', () => {
        üretim.passwordPromptModal.style.display = 'none';
        if (üretim.passwordInputEl) üretim.passwordInputEl.value = '';
        if (üretim.passwordError) üretim.passwordError.style.display = 'none';
    });
};

function clearSelectedFile() {
    selectedFile = null;
    if (üretim.fileUploadInput) üretim.fileUploadInput.value = '';
    if (üretim.fileNameDisplay) üretim.fileNameDisplay.textContent = '';
    if (üretim.clearFileButton) üretim.clearFileButton.classList.add('hidden');
};

function setupFileUpload() {
    if (!üretim.fileUploadInput || !üretim.fileNameDisplay || !üretim.clearFileButton) {
        return;
    }
    üretim.fileUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e_reader) => {
                selectedFile = {
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                    data: e_reader.target.result.split(',')[1]
                };
                const lang = localStorage.getItem('language') || 'es';
                const fileAttachedText = translations[lang]?.fileAttached || "Adjunto:";
                üretim.fileNameDisplay.textContent = `${fileAttachedText} ${file.name}`;
                üretim.clearFileButton.classList.remove('hidden');
            };
            reader.onerror = () => { clearSelectedFile(); };
            reader.readAsDataURL(file);
        } else {
            clearSelectedFile();
        }
    });
    üretim.clearFileButton.addEventListener('click', clearSelectedFile);
};

async function setupChat(currentLanguage) {
    if (!üretim.sendChatButton || !üretim.chatInput || !üretim.chatSpinner) {
        return;
    }
    const handleSendMessage = async () => {
        const userMessageText = üretim.chatInput.value.trim();
        if (!userMessageText && !selectedFile) return;

        const userParts = [];
        const messageDisplayContainer = document.createElement('div');
        
        if (userMessageText) {
            userParts.push({ text: userMessageText });
            messageDisplayContainer.appendChild(document.createTextNode(userMessageText));
        }
        if (selectedFile) {
            userParts.push({ inlineData: { mimeType: selectedFile.type, data: selectedFile.data } });
            if (selectedFile.type.startsWith('image/')) {
                if (userMessageText) messageDisplayContainer.appendChild(document.createElement('br'));
                const imgPreview = document.createElement('img');
                imgPreview.src = `data:${selectedFile.type};base64,${selectedFile.data}`;
                imgPreview.className = 'max-w-[200px] h-auto rounded-md mt-2 inline-block';
                messageDisplayContainer.appendChild(imgPreview);
            } else {
                const langDict = translations[currentLanguage];
                const fileInfoText = ` [${langDict?.fileAttached || "File Attached:"} ${selectedFile.name}]`;
                messageDisplayContainer.appendChild(document.createTextNode(fileInfoText));
            }
        }
        appendChatMessage(messageDisplayContainer, 'user');
        üretim.chatInput.value = '';
        clearSelectedFile();

        const skeletonDiv = document.createElement('div');
        skeletonDiv.id = "gemini-skeleton";
        skeletonDiv.className = `chat-message self-start rounded-xl rounded-bl-lg p-3 px-4 w-24 h-10 bg-muted animate-pulse`;
        üretim.chatHistoryDiv.appendChild(skeletonDiv);
        üretim.chatHistoryDiv.scrollTop = üretim.chatHistoryDiv.scrollHeight;

        try {
            await gemini.sendChatMessage({
                userParts: userParts,
                spinner: üretim.chatSpinner,
                appendChatMessageCallback: appendChatMessage
            });
        } finally {
            const skeleton = document.getElementById('gemini-skeleton');
            if (skeleton) skeleton.remove();
        }
    };
    üretim.sendChatButton.addEventListener('click', handleSendMessage);
    üretim.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
};

function setupSummarizeButtons(currentLanguage) {
    if (!üretim.summarizeButtons) return;
    üretim.summarizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const classId = button.dataset.classId;
            const spinner = document.getElementById(`summarize-spinner-${classId}`);
            const output = document.getElementById(`summary-output-${classId}`);
            if (!spinner || !output) return;
            gemini.summarizeClass({
                classTitle: button.dataset.classTitle,
                classContent: button.dataset.classContent,
                currentLanguage: currentLanguage,
                spinner: spinner,
                output: output
            });
        });
    });
};

function updateFooterYear() {
    if (üretim.currentYearSpan) {
        üretim.currentYearSpan.textContent = new Date().getFullYear();
    }
};

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        const activeElement = document.activeElement;
        const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);
        if (((event.key === 'z' || event.key === 'Z') || event.key === 'Escape') && !isTyping) {
            event.preventDefault();
            showSection('main-menu-section');
            animateCardsOnLoad();
            clearSelectedFile();
        }
    });
};

export function initializeApp() {
    üretim = {
        htmlElement: document.documentElement,
        pageContainer: document.getElementById('page-container'),
        mainMenuSection: document.getElementById('main-menu-section'),
        classDetailSections: document.querySelectorAll('.class-detail-section'),
        allClassCards: document.querySelectorAll('.class-card'),
        backButtons: document.querySelectorAll('.back-button'),
        summarizeButtons: document.querySelectorAll('.summarize-class-button'),
        chatHistoryDiv: document.getElementById('chat-history'),
        chatInput: document.getElementById('chat-input'),
        sendChatButton: document.getElementById('send-chat-button'),
        chatSpinner: document.getElementById('chat-spinner'),
        fileUploadInput: document.getElementById('file-upload'),
        fileNameDisplay: document.getElementById('file-name-display'),
        clearFileButton: document.getElementById('clear-file-button'),
        passwordPromptModal: document.getElementById('password-prompt-modal'),
        passwordInputEl: document.getElementById('password-input'),
        submitPasswordButton: document.getElementById('submit-password-button'),
        cancelPasswordButton: document.getElementById('cancel-password-button'),
        passwordError: document.getElementById('password-error'),
        themeToggleButton: document.getElementById('theme-toggle'), 
        themeToggleDarkIcon: document.getElementById('theme-toggle-dark-icon'), 
        themeToggleIntermediateIcon: document.getElementById('theme-toggle-intermediate-icon'), // Nuevo
        themeToggleLightIcon: document.getElementById('theme-toggle-light-icon'), 
        languageToggleButton: document.getElementById('language-toggle'),
        currentYearSpan: document.getElementById('current-year'),
    };
    
    window.makeFullScreen = (iframeId) => {
        const iframe = document.getElementById(iframeId);
        if (!iframe) return;
        if (iframe.requestFullscreen) iframe.requestFullscreen();
        else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
    };

    initializeTheme();
    initializeSparkleEffect(); // <-- AÑADIDO: Activa el efecto de chispas
    const currentLanguage = initializeLanguage(üretim, addInitialChatMessage); 
    setupNavigation();
    setupPasswordModal();
    setupFileUpload();
    setupChat(currentLanguage);
    setupSummarizeButtons(currentLanguage);
    updateFooterYear();
    setupKeyboardShortcuts();
    showSection('main-menu-section');
    animateCardsOnLoad();
}