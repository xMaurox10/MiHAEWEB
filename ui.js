// ============== ARCHIVO COMPLETO Y ACTUALIZADO: ui.js ==============

import { initializeLanguage, translations } from './languageManager.js';
import * as gemini from './geminiService.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
// CAMBIO 1: Importamos las nuevas funciones y el logger por defecto
import logger, { registerUserInFirebase, loginUserFromFirebase, signInWithGoogle } from './logger.js';

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
        let currentTheme = 'dark'; // Por defecto
        if (üretim.htmlElement.classList.contains('light')) {
            currentTheme = 'light';
        } else if (üretim.htmlElement.classList.contains('theme-intermediate')) {
            currentTheme = 'intermediate';
        }
        
        const currentIndex = THEMES.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const newTheme = THEMES[nextIndex];
        
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
        setTimeout(() => { canCreateSparkle = true; }, 50);

        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        document.body.appendChild(sparkle);

        sparkle.style.left = `${e.clientX}px`;
        sparkle.style.top = `${e.clientY}px`;

        const randomX = (Math.random() - 0.5) * 80;
        const randomY = (Math.random() - 0.5) * 80;
        sparkle.style.setProperty('--sparkle-translate-x', `${randomX}px`);
        sparkle.style.setProperty('--sparkle-translate-y', `${randomY}px`);

        sparkle.addEventListener('animationend', () => { sparkle.remove(); });
    });
}

/**
 * Muestra un mensaje en el historial del chat.
 * @param {string | HTMLElement} message - El contenido del mensaje.
 * @param {'user' | 'gemini' | 'error'} type - El tipo de mensaje.
 */
function appendChatMessage(message, type) {
    if (!üretim.chatHistoryDiv) return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', 'rounded-xl', 'p-3', 'px-4', 'max-w-[85%]', 'sm:max-w-[80%]', 'text-sm', 'break-words', 'fade-in-up');

    switch(type) {
        case 'user':
            messageDiv.classList.add('bg-accent', 'text-accent-foreground', 'self-end', 'rounded-br-none');
            break;
        case 'gemini':
            messageDiv.classList.add('bg-muted', 'text-foreground', 'self-start', 'rounded-bl-none');
            break;
        case 'error':
            messageDiv.classList.add('bg-destructive', 'text-white', 'self-start', 'rounded-bl-none');
            break;
    }

    if (type !== 'gemini' || typeof message !== 'string') {
        if (message instanceof HTMLElement) {
            messageDiv.appendChild(message);
        } else {
            messageDiv.innerHTML = message;
        }
        üretim.chatHistoryDiv.appendChild(messageDiv);
        üretim.chatHistoryDiv.scrollTop = üretim.chatHistoryDiv.scrollHeight;
        return;
    }

    const contentContainer = document.createElement('div');
    contentContainer.className = 'gemini-response-content';
    
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';

    messageDiv.appendChild(contentContainer);
    messageDiv.appendChild(cursor);
    üretim.chatHistoryDiv.appendChild(messageDiv);

    let i = 0;
    const speed = 15;

    function typeWriter() {
        üretim.chatHistoryDiv.scrollTop = üretim.chatHistoryDiv.scrollHeight;

        if (i < message.length) {
            contentContainer.textContent += message.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else {
            cursor.remove();
            contentContainer.innerHTML = marked.parse(message);
        }
    }

    typeWriter();
}

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
        const iframes = targetSection.querySelectorAll('iframe[data-src]');
        iframes.forEach(iframe => {
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

        try {
            await gemini.sendChatMessage({
                userParts: userParts,
                spinner: üretim.chatSpinner,
                appendChatMessageCallback: appendChatMessage
            });
        } catch(e) {
             appendChatMessage("Lo siento, ha ocurrido un error al contactar con Gemini.", 'error');
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
            if (üretim.pageContainer.style.display !== 'none') {
                showSection('main-menu-section');
                animateCardsOnLoad();
                clearSelectedFile();
            }
        }
    });
};

// ===== FUNCIÓN DE AUTENTICACIÓN ACTUALIZADA CON FIREBASE =====
function setupAuth() {
    const {
        loginScreen, loginForm, pageContainer, loginButton, registerButton,
        loginView, registerView, showLoginViewLink, showRegisterViewLink,
        loginUsernameInput, loginPasswordInput,
        registerUsernameInput, registerPasswordInput, registerConfirmPasswordInput,
        authErrorMessage, googleLoginButton // Se añade el botón de Google
    } = üretim;

    const showAuthError = (messageKey) => {
        const lang = localStorage.getItem('language') || 'es';
        authErrorMessage.textContent = translations[lang][messageKey] || "Error desconocido.";
        authErrorMessage.style.display = 'block';
    };

    const hideAuthError = () => {
        authErrorMessage.style.display = 'none';
        authErrorMessage.textContent = '';
    };

    const transitionToApp = (username) => {
        logger.logLogin(username); // Logueamos el evento

        loginScreen.classList.add('fade-out');
        loginScreen.addEventListener('animationend', () => {
            loginScreen.style.display = 'none';
            pageContainer.style.display = 'block';
            pageContainer.classList.add('fade-in-up');
            animateCardsOnLoad();

            const currentLanguage = localStorage.getItem('language') || 'es';
            addInitialChatMessage(true, currentLanguage, translations);
        }, { once: true });
    };

    showRegisterViewLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideAuthError();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });

    showLoginViewLink.addEventListener('click', (e) => {
        e.preventDefault();
        hideAuthError();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    });

    registerButton.addEventListener('click', async () => {
        hideAuthError();
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;

        if (!username || !password || !confirmPassword) {
            showAuthError('fieldsRequiredError');
            return;
        }
        if (password !== confirmPassword) {
            showAuthError('passwordMismatchError');
            return;
        }

        const result = await registerUserInFirebase(username, password);

        if (result.success) {
            alert(translations[localStorage.getItem('language') || 'es']['registrationSuccess']);
            registerUsernameInput.value = '';
            registerPasswordInput.value = '';
            registerConfirmPasswordInput.value = '';
            showLoginViewLink.click();
        } else {
            showAuthError(result.messageKey);
        }
    });

    const performLogin = async () => {
        hideAuthError();
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value;

        if (!username || !password) {
            showAuthError('fieldsRequiredError');
            return;
        }
        
        const loginSuccessful = await loginUserFromFirebase(username, password);

        if (loginSuccessful) {
            transitionToApp(username);
        } else {
            showAuthError('loginFailedError');
            loginForm.style.animation = 'horizontal-shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
        }
    };
    
    loginButton.addEventListener('click', performLogin);
    loginUsernameInput.addEventListener('keypress', (e) => e.key === 'Enter' && performLogin());
    loginPasswordInput.addEventListener('keypress', (e) => e.key === 'Enter' && performLogin());

    // --- NUEVO: Event Listener para el Login con Google ---
    googleLoginButton.addEventListener('click', async () => {
        hideAuthError();
        const result = await signInWithGoogle();
        if (result.success) {
            transitionToApp(result.user.displayName);
        } else {
            // Puedes crear una clave de traducción específica para errores de Google si quieres
            showAuthError('loginFailedError'); 
        }
    });
}


export function initializeApp() {
    üretim = {
        htmlElement: document.documentElement,
        loginScreen: document.getElementById('login-screen'),
        loginForm: document.getElementById('login-form'),
        pageContainer: document.getElementById('page-container'),
        mainMenuSection: document.getElementById('main-menu-section'),
        
        loginView: document.getElementById('login-view'),
        registerView: document.getElementById('register-view'),
        showLoginViewLink: document.getElementById('show-login-view'),
        showRegisterViewLink: document.getElementById('show-register-view'),
        loginButton: document.getElementById('login-button'),
        registerButton: document.getElementById('register-button'),
        googleLoginButton: document.getElementById('google-login-button'), // Se añade la referencia al botón
        loginUsernameInput: document.getElementById('login-username-input'),
        loginPasswordInput: document.getElementById('login-password-input'),
        registerUsernameInput: document.getElementById('register-username-input'),
        registerPasswordInput: document.getElementById('register-password-input'),
        registerConfirmPasswordInput: document.getElementById('register-confirm-password-input'),
        authErrorMessage: document.getElementById('auth-error-message'),
        
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
        themeToggleIntermediateIcon: document.getElementById('theme-toggle-intermediate-icon'),
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

    const currentLanguage = initializeLanguage(üretim, addInitialChatMessage); 

    initializeTheme();
    initializeSparkleEffect();
    setupAuth(); // Se llama a la función de autenticación actualizada
    setupNavigation();
    setupPasswordModal();
    setupFileUpload();
    setupChat(currentLanguage);
    setupSummarizeButtons(currentLanguage);
    updateFooterYear();
    setupKeyboardShortcuts();
}