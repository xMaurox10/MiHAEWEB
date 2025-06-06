// ============== ARCHIVO COMPLETO Y ACTUALIZADO: logger.js ==============

// Imports de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Se importa el SDK de autenticación y los proveedores
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Configuración de Firebase (sin cambios)
const firebaseConfig = {
  apiKey: "AIzaSyCxCTeSDX1v7wiCA1_l-En6X2cHf9XoLQM",
  authDomain: "haeweb-3ce1f.firebaseapp.com",
  projectId: "haeweb-3ce1f",
  storageBucket: "haeweb-3ce1f.firebasestorage.app",
  messagingSenderId: "614205079618",
  appId: "1:614205079618:web:43710e667bd9bbc19daddb",
  measurementId: "G-QZHSFFK7XN"
};

// Inicialización de servicios
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Se inicializa el servicio de autenticación
const auth = getAuth(app);


// --- CLASE ORIGINAL PARA LOGGING (SIN CAMBIOS) ---
class Logger {
    constructor() {
        console.log("Logger inicializado y conectado a Firebase.");
    }
    async logLogin(name) {
        if (!name) {
            console.warn("Intento de login sin nombre.");
            return;
        }
        const logEntry = { user: name, loginTime: new Date().toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
        try {
            await addDoc(collection(db, "logs"), logEntry);
            console.log("✅ ¡Éxito! Registro de login guardado en Firebase.");
        } catch (e) {
            console.error("❌ Error al guardar el registro de login en Firebase: ", e);
        }
    }
}
const logger = new Logger();
export default logger;


// --- FUNCIONES DE AUTENTICACIÓN CON FIREBASE ---

/**
 * Registra un nuevo usuario en la colección "users" de Firestore.
 * Primero comprueba si el usuario ya existe.
 * @param {string} username - El nombre de usuario a registrar.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<{success: boolean, messageKey?: string}>}
 */
export async function registerUserInFirebase(username, password) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.warn(`Intento de registrar un usuario que ya existe: ${username}`);
        return { success: false, messageKey: 'userExistsError' };
    }

    try {
        // ADVERTENCIA DE SEGURIDAD MUY IMPORTANTE:
        // En una aplicación REAL, NUNCA guardes la contraseña en texto plano.
        // Deberías "hashearla" usando un algoritmo seguro (como Argon2 o bcrypt)
        // en un entorno de backend (servidor) antes de guardarla.
        // Para este proyecto educativo, la guardamos así para mantener la simplicidad.
        const newUser = {
            username: username,
            password: password, // <-- ¡INSEGURO EN PRODUCCIÓN!
            authMethod: "custom", // Indicamos el método
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
    const q = query(usersRef, where("username", "==", username), where("authMethod", "==", "custom"));
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

/**
 * Inicia el proceso de login con Google usando un popup.
 * Si el usuario es nuevo, lo guarda en la colección "users" de Firestore.
 * @returns {Promise<{success: boolean, user?: any, error?: any}>}
 */
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        // 1. Abrir el popup de Google para iniciar sesión
        const result = await signInWithPopup(auth, provider);
        const googleUser = result.user;
        console.log("✅ Autenticación con Google correcta:", googleUser);

        // 2. Comprobar si el usuario ya existe en nuestra base de datos de "users"
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", googleUser.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // 3. Si es un usuario nuevo, guardamos su información en Firestore
            console.log(`Usuario nuevo de Google: ${googleUser.displayName}. Guardando en Firestore...`);
            const newUser = {
                uid: googleUser.uid, // El ID único de Google
                username: googleUser.displayName,
                email: googleUser.email,
                authMethod: "google",
                registeredAt: new Date().toISOString()
            };
            await addDoc(usersRef, newUser);
        }

        // 4. Devolvemos el usuario para que la UI pueda continuar
        return { success: true, user: googleUser };

    } catch (error) {
        console.error("❌ Error durante el inicio de sesión con Google:", error);
        return { success: false, error: error };
    }
}