// ============== ARCHIVO COMPLETO: languageManager.js ==============

const translations = {
    es: {
        pageMetaTitle: "Hardware y Aplicación Específica",
        pageTitle: "Hardware y Aplicación Específica",
        pageSubtitle: "Explorando el mundo del procesamiento de señales y microcontroladores",
        mainMenuTitle: "Selecciona un Tema",
        chatWithGemini: "Chat con Gemini",
        chatInputPlaceholder: "Escribe tu mensaje...",
        attachFile: "Adjuntar Archivo",
        sendChatButton: "Enviar",
        card0Title: "0. Introducción al Procesado de Señales Digitales",
        card0Desc: "Conceptos fundamentales de DSP.",
        card1Title: "1. Puertos y Retardos",
        card1Desc: "Primeros pasos con microcontroladores y programación.",
        card2Title: "2. Displays de 7 Segmentos y Teoría de Señal",
        card2Desc: "Visualización de datos y fundamentos de señal.",
        card3Title: "3. Interrupciones INTx y LCD",
        card3Desc: "Manejo de eventos y pantallas de cristal líquido.",
        card4Title: "4. Teclado e Interrupción RB",
        card4Desc: "Interacción con teclados matriciales.",
        card5Title: "5. Temporizaciones",
        card5Desc: "Manejo de tiempos y eventos con temporizadores.",
        card6Title: "6. Convertidores AD I",
        card6Desc: "Conversión de señales analógicas a digitales (parte 1).",
        card7Title: "7. Convertidores AD II y Sensores",
        card7Desc: "Conversión de señales analógicas a digitales (parte 2) y uso de sensores.",
        card8Title: "8. Convertidores DA",
        card8Desc: "Conversión de señales digitales a analógicas.",
        card9Title: "9. Control Secuencial",
        card9Desc: "Implementación de sistemas secuenciales con microcontroladores.",
        card10Title: "10. Filtros + Audio",
        card10Desc: "Conceptos de filtrado de señales y aplicaciones de audio.",
        card11Title: "11. VHDL",
        card11Desc: "Descripción de hardware con VHDL.",
        card12Title: "12. GPUs",
        card12Desc: "Aplicaciones y funcionamiento de las Unidades de Procesamiento Gráfico.",
        cardExamsTitle: "Exámenes",
        cardExamsDesc: "Sección dedicada a la evaluación y práctica.",
        backToMenuButton: "← Volver al Menú Principal",
        videoPrincipal: "Video Principal",
        googlePresentation: "Presentación de Google",
        fullscreenButton: "Pantalla completa",
        theorySignals1: "Teoría Señales Parte 1",
        theorySignals2: "Teoría Señales Parte 2",
        theory1: "Teoría Parte 1",
        theory2: "Teoría Parte 2",
        summarySignalsPDF: "Resumen Señales (PDF)",
        summaryPDF: "Resumen",
        summarizeClassButton: "Resumir Clase",
        claseDetail0Title: "0. Introducción al Procesado de Señales Digitales",
        claseDetail1Title: "1. Puertos y Retardos",
        claseDetail2Title: "2. Displays de 7 Segmentos y Teoría de Señal",
        videoExplicativo: "Video Explicativo",
        theoryDocument1: "Documento de Teoría 1",
        theoryDocument2: "Documento de Teoría 2",
        pdfSummary: "PDF Resumen",
        practiceDocument: "Documento de Práctica",
        noSpecificTheoryDoc: "No hay documento de teoría específico para esta clase.",
        examsSectionTitle: "Sección de Exámenes",
        examsWelcome: "¡Bienvenido a la sección de exámenes! Aquí podrás encontrar recursos para evaluar tus conocimientos y practicar lo aprendido en las clases.",
        examsPlaceholder: "Actualmente, esta sección es un marcador de posición. En el futuro, podrías añadir:",
        examsItem1: "Exámenes de práctica con preguntas de opción múltiple.",
        examsItem2: "Ejercicios interactivos.",
        examsItem3: "Soluciones a problemas típicos.",
        examsItem4: "Enlaces a recursos externos para preparación de exámenes.",
        examsStayTuned: "¡Mantente atento a las actualizaciones!",
        rightsReserved: "Todos los derechos reservados.",
        coursePage: "Página creada para el curso de Hardware y Aplicación Específica.",
        examsAccessTitle: "Acceso a Exámenes",
        examsPasswordPrompt: "Por favor, introduce la contraseña para continuar.",
        passwordPlaceholder: "Contraseña",
        passwordError: "Contraseña incorrecta. Inténtalo de nuevo.",
        cancelButton: "Cancelar",
        accessButton: "Acceder",
        langToggleTitle: "Cambiar idioma",
        themeToggleTitle: "Cambiar tema", // <-- CLAVE AÑADIDA
        initialChatMsg: "¡Hola! Soy tu asistente de Hardware y Aplicación Específica. ¿En qué puedo ayudarte hoy?",
        fileAttached: "Adjunto:",
        apiErrorUnexpected: "Respuesta inesperada de la API o contenido vacío.",
        apiErrorNetwork: "Error de red:",
        apiErrorGeneral: "No se pudo obtener respuesta.",
        errorReadingFile: "Error al leer el archivo."
    },
    en: {
        pageMetaTitle: "Hardware and Specific Application",
        pageTitle: "Hardware and Specific Application",
        pageSubtitle: "Exploring the world of signal processing and microcontrollers",
        mainMenuTitle: "Select a Topic",
        chatWithGemini: "Chat with Gemini",
        chatInputPlaceholder: "Type your message...",
        attachFile: "Attach File",
        sendChatButton: "Send",
        card0Title: "0. Introduction to Digital Signal Processing",
        card0Desc: "Fundamental DSP concepts.",
        card1Title: "1. Ports and Delays",
        card1Desc: "First steps with microcontrollers and programming.",
        card2Title: "2. 7-Segment Displays and Signal Theory",
        card2Desc: "Data visualization and signal fundamentals.",
        card3Title: "3. INTx Interrupts and LCD",
        card3Desc: "Event handling and liquid crystal displays.",
        card4Title: "4. Keyboard and RB Interrupt",
        card4Desc: "Interaction with matrix keyboards.",
        card5Title: "5. Timings",
        card5Desc: "Time and event management with timers.",
        card6Title: "6. AD Converters I",
        card6Desc: "Analog to digital signal conversion (part 1).",
        card7Title: "7. AD Converters II and Sensors",
        card7Desc: "Analog to digital signal conversion (part 2) and sensor usage.",
        card8Title: "8. DA Converters",
        card8Desc: "Digital to analog signal conversion.",
        card9Title: "9. Sequential Control",
        card9Desc: "Implementation of sequential systems with microcontrollers.",
        card10Title: "10. Filters + Audio",
        card10Desc: "Signal filtering concepts and audio applications.",
        card11Title: "11. VHDL",
        card11Desc: "Hardware description with VHDL.",
        card12Title: "12. GPUs",
        card12Desc: "Applications and operation of Graphics Processing Units.",
        cardExamsTitle: "Exams",
        cardExamsDesc: "Section dedicated to assessment and practice.",
        backToMenuButton: "← Back to Main Menu",
        videoPrincipal: "Main Video",
        googlePresentation: "Google Presentation",
        fullscreenButton: "Fullscreen",
        theorySignals1: "Signal Theory Part 1",
        theorySignals2: "Signal Theory Part 2",
        theory1: "Theory Part 1",
        theory2: "Theory Part 2",
        summarySignalsPDF: "Signal Summary (PDF)",
        summaryPDF: "Summary",
        summarizeClassButton: "Summarize Class",
        claseDetail0Title: "0. Introduction to Digital Signal Processing",
        claseDetail1Title: "1. Ports and Delays",
        claseDetail2Title: "2. 7-Segment Displays and Signal Theory",
        videoExplicativo: "Explanatory Video",
        theoryDocument1: "Theory Document 1",
        theoryDocument2: "Theory Document 2",
        pdfSummary: "PDF Summary",
        practiceDocument: "Practice Document",
        noSpecificTheoryDoc: "No specific theory document for this class.",
        examsSectionTitle: "Exams Section",
        examsWelcome: "Welcome to the exams section! Here you can find resources to assess your knowledge and practice what you've learned.",
        examsPlaceholder: "Currently, this section is a placeholder. In the future, you could add:",
        examsItem1: "Practice exams with multiple-choice questions.",
        examsItem2: "Interactive exercises.",
        examsItem3: "Solutions to typical problems.",
        examsItem4: "Links to external resources for exam preparation.",
        examsStayTuned: "Stay tuned for updates!",
        rightsReserved: "All rights reserved.",
        coursePage: "Page created for the Hardware and Specific Application course.",
        examsAccessTitle: "Exam Access",
        examsPasswordPrompt: "Please enter the password to continue.",
        passwordPlaceholder: "Password",
        passwordError: "Incorrect password. Try again.",
        cancelButton: "Cancel",
        accessButton: "Access",
        langToggleTitle: "Change language",
        themeToggleTitle: "Change theme", // <-- KEY ADDED
        initialChatMsg: "Hello! I'm your Hardware and Specific Application assistant. How can I help you today?",
        fileAttached: "Attached:",
        apiErrorUnexpected: "Unexpected API response or empty content.",
        apiErrorNetwork: "Network error:",
        apiErrorGeneral: "Could not get a response.",
        errorReadingFile: "Error reading file."
    }
};

function translatePage(lang, üretim) {
    if (!translations[lang]) {
        console.warn(`Language ${lang} not found in translations.`);
        return;
    }
    const langDict = translations[lang];

    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.dataset.translateKey;
        if (langDict[key]) el.textContent = langDict[key];
    });
    document.querySelectorAll('[data-translate-placeholder-key]').forEach(el => {
        const key = el.dataset.translatePlaceholderKey;
        if (langDict[key]) el.placeholder = langDict[key];
    });
    document.querySelectorAll('[data-translate-title-key]').forEach(el => {
        const key = el.dataset.translateTitleKey;
        if (langDict[key]) el.title = langDict[key];
    });

    üretim.htmlElement.lang = lang;
    if (üretim.languageToggleButton) {
        üretim.languageToggleButton.textContent = lang === 'es' ? 'EN' : 'ES';
    }
}

export function initializeLanguage(üretim, addInitialChatMessage) {
    let currentLanguage = localStorage.getItem('language') || 'es';

    const updateLanguage = (newLang) => {
        currentLanguage = newLang;
        localStorage.setItem('language', newLang);
        translatePage(currentLanguage, üretim);
        addInitialChatMessage(true, currentLanguage, translations);
    };

    if (üretim.languageToggleButton) {
        üretim.languageToggleButton.addEventListener('click', () => {
            const newLang = currentLanguage === 'es' ? 'en' : 'es';
            updateLanguage(newLang);
        });
    }

    updateLanguage(currentLanguage);

    return currentLanguage;
}

export { translations };    