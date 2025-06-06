// ============== ARCHIVO COMPLETO Y CORREGIDO: logger.js ==============

// CAMBIO 1: Hemos añadido más funciones de Firestore para manejar usuarios.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tus claves de configuración (esto está perfecto!)
const firebaseConfig = {
  apiKey: "AIzaSyCxCTeSDX1v7wiCA1_l-En6X2cHf9XoLQM",
  authDomain: "haeweb-3ce1f.firebaseapp.com",
  projectId: "haeweb-3ce1f",
  storageBucket: "haeweb-3ce1f.firebasestorage.app",
  messagingSenderId: "614205079618",
  appId: "1:614205079618:web:43710e667bd9bbc19daddb",
  measurementId: "G-QZHSFFK7XN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CLASE ORIGINAL PARA LOGGING ---
class Logger {
    constructor() {
        console.log("Logger inicializado y conectado a Firebase.");
    }

    async logLogin(name) {
        if (!name) {
            console.warn("Intento de login sin nombre.");
            return;
        }
        const logEntry = {
            user: name,
            loginTime: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        try {
            const docRef = await addDoc(collection(db, "logs"), logEntry);
            console.log("✅ ¡Éxito! Registro de login guardado en Firebase con el ID: ", docRef.id);
        } catch (e) {
            console.error("❌ Error al guardar el registro de login en Firebase: ", e);
        }
    }
}
const logger = new Logger();
export default logger;


// --- CAMBIO 2: NUEVAS FUNCIONES DE AUTENTICACIÓN CON FIREBASE ---

/**
 * Registra un nuevo usuario en la colección "users" de Firestore.
 * Primero comprueba si el usuario ya existe.
 * @param {string} username - El nombre de usuario a registrar.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<{success: boolean, messageKey?: string}>}
 */
export async function registerUserInFirebase(username, password) {
    // 1. Comprobar si el usuario ya existe
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.warn(`Intento de registrar un usuario que ya existe: ${username}`);
        return { success: false, messageKey: 'userExistsError' };
    }

    // 2. Si no existe, añadir el nuevo usuario
    try {
        // ADVERTENCIA DE SEGURIDAD MUY IMPORTANTE:
        // En una aplicación REAL, NUNCA guardes la contraseña en texto plano.
        // Deberías "hashearla" usando un algoritmo seguro (como Argon2 o bcrypt)
        // en un entorno de backend (servidor) antes de guardarla.
        // Para este proyecto educativo, la guardamos así para mantener la simplicidad.
        const newUser = {
            username: username,
            password: password, // <-- ¡INSEGURO EN PRODUCCIÓN!
            registeredAt: new Date().toISOString()
        };
        await addDoc(usersRef, newUser);
        console.log(`✅ ¡Éxito! Usuario "${username}" registrado en Firestore.`);
        return { success: true };
    } catch (e) {
        console.error("❌ Error al registrar el usuario en Firestore: ", e);
        return { success: false, messageKey: 'authError' }; // Un error genérico
    }
}

/**
 * Verifica las credenciales de un usuario contra la base de datos de Firestore.
 * @param {string} username - El nombre de usuario.
 * @param {string} password - La contraseña.
 * @returns {Promise<boolean>} - Devuelve true si el login es correcto, false si no.
 */
export async function loginUserFromFirebase(username, password) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`Intento de login de usuario no existente: ${username}`);
        return false; // El usuario no existe
    }

    // Como el username es único, solo debería haber un resultado
    const userData = querySnapshot.docs[0].data();

    // Compara la contraseña (en una app real, compararías hashes)
    if (userData.password === password) {
        console.log(`✅ Login correcto para el usuario: ${username}`);
        return true; // Contraseña correcta
    } else {
        console.warn(`Intento de login con contraseña incorrecta para: ${username}`);
        return false; // Contraseña incorrecta
    }
}