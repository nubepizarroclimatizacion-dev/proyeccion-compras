# Proyección de Compras

Esta es una aplicación Next.js para la planificación financiera, incluyendo ventas, compras y compromisos.

## Descripción

La aplicación permite a los usuarios:
- Registrar ventas mensuales.
- Gestionar compras y categorizarlas, con sugerencias de IA.
- Planificar compromisos diarios (planificados y pagados).
- Calcular y visualizar el presupuesto disponible en función de los datos ingresados.
- Configurar parámetros clave como el porcentaje de presupuesto para compras.

**Nota importante:** Esta aplicación utiliza exclusivamente el SDK web de Firebase para todas las interacciones con la base de datos. No se utiliza el SDK de administrador de Firebase (Admin SDK).

## Primeros Pasos

### 1. Instalar dependencias

Para comenzar, clona el repositorio e instala las dependencias del proyecto:

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto. Puedes copiar el archivo de ejemplo `.env.example` para empezar:

```bash
cp .env.example .env.local
```

Luego, completa el archivo `.env.local` con las credenciales de tu proyecto de Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...

# Dejar en false en Firebase Studio
NEXT_PUBLIC_USE_FIRESTORE_EMULATOR=false
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1
NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

### 3. Configurar Firebase

1.  **Crear un proyecto de Firebase:** Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  **Crear una aplicación web:** Dentro de tu proyecto, crea una nueva aplicación web y copia las credenciales de configuración en tu archivo `.env.local`.
3.  **Habilitar Firestore:** En la sección "Build", habilita "Firestore Database" y créala en modo de producción.
4.  **Habilitar Autenticación:** En la sección "Build", habilita "Authentication". En la pestaña "Sign-in method", habilita el proveedor "Anónimo".
5.  **Reglas de seguridad:** Ve a las reglas de Firestore y establece las siguientes reglas para el desarrollo (recuerda proteger tus datos en producción):

    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```

### 4. Ejecutar la aplicación de desarrollo

Una vez que las dependencias y las variables de entorno estén configuradas, puedes iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador para ver la aplicación.
