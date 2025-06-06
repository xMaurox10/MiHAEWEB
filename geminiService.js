// ============== ARCHIVO COMPLETO: geminiService.js ==============

// --- Configuración y Estado Interno del Servicio ---
const apiKey = ""; // <-- PON TU API KEY DE GEMINI AQUÍ
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

let chatConversationHistory = [];

// --- Función Interna (No se exporta) ---
async function callApi(payload) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.json();
            console.error("API Error Response:", errorBody);
            throw new Error(`Error de red: ${response.status} - ${errorBody.error?.message || 'Unknown Error'}`);
        }
        const result = await response.json();

        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            // Esto puede pasar si Gemini bloquea la respuesta por seguridad.
            console.warn("API response was valid but content was blocked or empty.", result);
            return "No he podido procesar esa solicitud. Inténtalo con otra pregunta.";
        }
    } catch (error) {
        console.error('Error en callApi:', error);
        throw error; // Lanza el error para que la función que llama lo maneje
    }
}


// --- Funciones Públicas (Se exportan para que index.html las use) ---

/**
 * Inicializa el historial del chat con un mensaje de bienvenida.
 */
export function initializeChat(translations, lang) {
    const initialMessageText = translations[lang]?.initialChatMsg || "Hello! How can I help you today?";
    chatConversationHistory = [{
        role: "model",
        parts: [{ text: initialMessageText }]
    }];
    return initialMessageText; // Devuelve el mensaje para que la UI lo muestre
}

/**
 * Pide a Gemini un resumen de una clase.
 */
export async function summarizeClass(options) {
    const { classTitle, classContent, currentLanguage, spinner, output } = options;
    
    spinner.classList.remove('hidden');
    output.classList.add('hidden');
    output.innerHTML = '';

    const promptText = `Por favor, resume la siguiente clase de Hardware y Aplicación Específica: "${classTitle}". El contenido principal incluye: ${classContent}. Proporciona un resumen conciso y útil en ${currentLanguage === 'es' ? 'español' : 'English'}, formateado en Markdown.`;
    const payload = { contents: [{ role: "user", parts: [{ text: promptText }] }] };

    try {
        const textResponse = await callApi(payload);
        output.innerHTML = textResponse; // Asumiendo que la respuesta es HTML o Markdown procesable
    } catch (error) {
        output.innerHTML = `Error al generar el resumen: ${error.message}`;
    } finally {
        output.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

/**
 * Envía un mensaje del usuario (texto y/o archivo) a Gemini y maneja la respuesta.
 */
export async function sendChatMessage(options) {
    const { userParts, spinner, appendChatMessageCallback } = options;
    
    spinner.classList.remove('hidden');

    const apiUserMessage = { role: "user", parts: userParts };
    const currentApiConversation = [...chatConversationHistory, apiUserMessage];

    try {
        const textResponse = await callApi({ contents: currentApiConversation });
        chatConversationHistory.push(apiUserMessage); // Añadir mensaje de usuario al historial si la API tiene éxito
        chatConversationHistory.push({ role: "model", parts: [{ text: textResponse }] });
        appendChatMessageCallback(textResponse, 'gemini');
    } catch (error) {
        appendChatMessageCallback(`Error: ${error.message}`, 'error');
    } finally {
        spinner.classList.add('hidden');
    }
}