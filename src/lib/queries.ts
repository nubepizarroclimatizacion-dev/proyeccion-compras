
import { lazyGetDb } from './firebase-db';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import type { SettingsGlobal, VentasMes, Compra, CompromisoDia } from './schemas';

// --- Settings ---
const defaultSettings: SettingsGlobal = {
  percentCompras: 80,
  timezone: 'America/Argentina/Tucuman',
};

export async function getSettingsGlobal(): Promise<SettingsGlobal> {
  const db = await lazyGetDb();
  if (!db) return defaultSettings;
  const docRef = doc(db, 'settings', 'global');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...defaultSettings, ...docSnap.data() } as SettingsGlobal;
  }
  return defaultSettings;
}

export async function upsertSettingsGlobal(data: Partial<SettingsGlobal>): Promise<void> {
  const db = await lazyGetDb();
  if (!db) return;
  const docRef = doc(db, 'settings', 'global');
  await setDoc(docRef, data, { merge: true });
}

// --- Ventas ---
export async function getVentas(ym: string): Promise<VentasMes | null> {
  const db = await lazyGetDb();
  if (!db) return null;
  const docRef = doc(db, 'ventasMensuales', ym);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as VentasMes;
  }
  return null;
}

export async function setVentas(ym: string, ventas: number): Promise<void> {
  const db = await lazyGetDb();
  if (!db) return;
  const docRef = doc(db, 'ventasMensuales', ym);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    await updateDoc(docRef, {
      ventas,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(docRef, {
      ym,
      ventas,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function listUltimasVentas(count = 12): Promise<VentasMes[]> {
    const db = await lazyGetDb();
    if (!db) return [];
    const q = query(collection(db, 'ventasMensuales'), orderBy('ym', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as VentasMes);
}

// --- Compras ---
export async function listComprasByYm(ym: string): Promise<Compra[]> {
  const db = await lazyGetDb();
  if (!db) return [];
  const q = query(collection(db, 'compras'), where('ym', '==', ym), orderBy('fecha', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Compra));
}

export async function addCompra(data: Omit<Compra, 'id'>): Promise<string | undefined> {
  const db = await lazyGetDb();
  if (!db) return;
  const { id, ...compraData } = data as Compra; // zod ensures this
  const docRef = await addDoc(collection(db, 'compras'), {
    ...compraData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteCompra(id: string): Promise<void> {
  const db = await lazyGetDb();
  if (!db) return;
  await deleteDoc(doc(db, 'compras', id));
}

// --- Compromisos ---
export async function listCompromisosByYm(ym: string): Promise<CompromisoDia[]> {
    const db = await lazyGetDb();
    if (!db) return [];
    const q = query(collection(db, 'compromisosDiarios'), where('ym', '==', ym));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CompromisoDia);
}

export async function upsertCompromisoDia(data: Pick<CompromisoDia, 'fecha' | 'ym'> & Partial<Pick<CompromisoDia, 'plan' | 'pagado'>>): Promise<void> {
    const db = await lazyGetDb();
    if (!db) return;
    const { fecha, ...updateData } = data;
    const docRef = doc(db, 'compromisosDiarios', fecha);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        fecha: data.fecha,
        ym: data.ym,
        plan: data.plan ?? 0,
        pagado: data.pagado ?? 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
}
