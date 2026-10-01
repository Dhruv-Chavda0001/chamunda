import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { Product, Order, ShopSettings, OrderStatus } from '../types';
import { initialDemoProducts, defaultShopSettings } from '../data/demoProducts';
import { sendOrderAlertEmail } from './emailjs';

// Local storage keys for fallback/instant preview
const STORAGE_KEYS = {
  PRODUCTS: 'chamunda_products',
  ORDERS: 'chamunda_orders',
  TRACKING: 'chamunda_tracking',
  SETTINGS: 'chamunda_settings',
};

// Initialize local seed data if empty
function initializeLocalStore() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialDemoProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultShopSettings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRACKING)) {
    localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify({}));
  }
}

initializeLocalStore();

// ==========================================
// PRODUCTS SERVICE
// ==========================================

export async function getProducts(): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      }
    } catch (err) {
      console.warn('Firestore fetch failed, checking local store:', err);
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return stored ? JSON.parse(stored) : initialDemoProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function saveProduct(product: Product): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, product);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    }
  }

  // Always update local cache
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  const products: Product[] = stored ? JSON.parse(stored) : [];
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent('cf_products_updated'));
}

export async function deleteProduct(productId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (stored) {
    const products: Product[] = JSON.parse(stored);
    const filtered = products.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('cf_products_updated'));
  }
}

export async function deleteDemoProducts(): Promise<number> {
  let deletedCount = 0;
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      for (const d of snapshot.docs) {
        const data = d.data() as Product;
        if (data.isDemo || d.id.startsWith('prod-demo-')) {
          await deleteDoc(doc(db, 'products', d.id));
          deletedCount++;
        }
      }
    } catch (err) {
      console.warn('Firestore bulk delete error:', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (stored) {
    const products: Product[] = JSON.parse(stored);
    const filtered = products.filter(p => !p.isDemo && !p.id.startsWith('prod-demo-'));
    deletedCount = products.length - filtered.length;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('cf_products_updated'));
  }
  return deletedCount;
}

// ==========================================
// ORDERS SERVICE
// ==========================================

function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CF-${year}${month}${day}-${randomSuffix}`;
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'orderId' | 'createdAt' | 'updatedAt' | 'isSeenByAdmin'>
): Promise<Order> {
  const newId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderId = generateOrderId();
  const nowIso = new Date().toISOString();

  const newOrder: Order = {
    ...orderInput,
    id: newId,
    orderId,
    isSeenByAdmin: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Reduce product stock for each item
  const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  let products: Product[] = storedProducts ? JSON.parse(storedProducts) : [];

  for (const item of newOrder.items) {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      const sizeObj = prod.sizes.find(s => s.size === item.size);
      if (sizeObj) {
        sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);
      }
    }
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

  // Save order to Firestore if configured
  if (isFirebaseConfigured && db) {
    const firestore = db;
    try {
      await runTransaction(firestore, async transaction => {
        // Create order doc
        const orderRef = doc(firestore, 'orders', newId);
        transaction.set(orderRef, newOrder);

        // Create order tracking doc
        const trackingKey = `${orderId.toUpperCase()}_${newOrder.customer.phone.slice(-4)}`;
        const trackingRef = doc(firestore, 'orderTracking', trackingKey);
        transaction.set(trackingRef, {
          orderId,
          orderStatus: newOrder.orderStatus,
          courierName: newOrder.courierName || '',
          trackingNumber: newOrder.trackingNumber || '',
          phoneLast4: newOrder.customer.phone.slice(-4),
          updatedAt: nowIso,
        });
      });
    } catch (err) {
      console.warn('Firestore transaction failed, saving to local store:', err);
    }
  }

  // Save to local orders
  const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
  orders.unshift(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

  // Save tracking locally
  const storedTracking = localStorage.getItem(STORAGE_KEYS.TRACKING);
  const trackingObj = storedTracking ? JSON.parse(storedTracking) : {};
  const trackingKey = `${orderId.toUpperCase()}_${newOrder.customer.phone.slice(-4)}`;
  trackingObj[trackingKey] = {
    orderId,
    orderStatus: newOrder.orderStatus,
    courierName: newOrder.courierName || '',
    trackingNumber: newOrder.trackingNumber || '',
    phoneLast4: newOrder.customer.phone.slice(-4),
    updatedAt: nowIso,
  };
  localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(trackingObj));

  // Dispatch event for real-time admin notification
  window.dispatchEvent(new CustomEvent('cf_new_order', { detail: newOrder }));
  window.dispatchEvent(new CustomEvent('cf_orders_updated'));
  window.dispatchEvent(new CustomEvent('cf_products_updated'));

  // Trigger EmailJS alert in background
  sendOrderAlertEmail(newOrder).catch(e => console.warn('EmailJS error:', e));

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    } catch (err) {
      console.warn('Firestore getOrders error:', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return stored ? JSON.parse(stored) : [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find(o => o.id === id || o.orderId === id) || null;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  courierName?: string,
  trackingNumber?: string,
  adminNote?: string,
  restoreStockOnCancel?: boolean
): Promise<void> {
  const nowIso = new Date().toISOString();
  let existingOrder: Order | null = null;

  // Retrieve current order
  const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
  const orderIndex = orders.findIndex(o => o.id === orderId || o.orderId === orderId);

  if (orderIndex >= 0) {
    existingOrder = orders[orderIndex];
    orders[orderIndex] = {
      ...existingOrder,
      orderStatus: status,
      courierName: courierName !== undefined ? courierName : existingOrder.courierName,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : existingOrder.trackingNumber,
      adminNote: adminNote !== undefined ? adminNote : existingOrder.adminNote,
      updatedAt: nowIso,
    };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Update tracking entry
    const storedTracking = localStorage.getItem(STORAGE_KEYS.TRACKING);
    const trackingObj = storedTracking ? JSON.parse(storedTracking) : {};
    const trackingKey = `${existingOrder.orderId.toUpperCase()}_${existingOrder.customer.phone.slice(-4)}`;
    if (trackingObj[trackingKey]) {
      trackingObj[trackingKey] = {
        ...trackingObj[trackingKey],
        orderStatus: status,
        courierName: courierName !== undefined ? courierName : existingOrder.courierName,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : existingOrder.trackingNumber,
        updatedAt: nowIso,
      };
      localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(trackingObj));
    }

    // If cancelled and restore stock requested
    if (status === 'Cancelled' && restoreStockOnCancel) {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProducts) {
        const prods: Product[] = JSON.parse(storedProducts);
        for (const item of existingOrder.items) {
          const p = prods.find(pr => pr.id === item.productId);
          if (p) {
            const sz = p.sizes.find(s => s.size === item.size);
            if (sz) {
              sz.stock += item.quantity;
            }
          }
        }
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
        window.dispatchEvent(new CustomEvent('cf_products_updated'));
      }
    }
  }

  if (isFirebaseConfigured && db && existingOrder) {
    try {
      const docRef = doc(db, 'orders', existingOrder.id);
      await updateDoc(docRef, {
        orderStatus: status,
        courierName: courierName ?? existingOrder.courierName ?? '',
        trackingNumber: trackingNumber ?? existingOrder.trackingNumber ?? '',
        adminNote: adminNote ?? existingOrder.adminNote ?? '',
        updatedAt: nowIso,
      });

      const trackingKey = `${existingOrder.orderId.toUpperCase()}_${existingOrder.customer.phone.slice(-4)}`;
      const trackingRef = doc(db, 'orderTracking', trackingKey);
      await setDoc(
        trackingRef,
        {
          orderId: existingOrder.orderId,
          orderStatus: status,
          courierName: courierName ?? existingOrder.courierName ?? '',
          trackingNumber: trackingNumber ?? existingOrder.trackingNumber ?? '',
          phoneLast4: existingOrder.customer.phone.slice(-4),
          updatedAt: nowIso,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore update order error:', err);
    }
  }

  window.dispatchEvent(new CustomEvent('cf_orders_updated'));
}

export async function markOrderAsSeen(orderId: string): Promise<void> {
  const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (storedOrders) {
    const orders: Order[] = JSON.parse(storedOrders);
    const o = orders.find(ord => ord.id === orderId || ord.orderId === orderId);
    if (o) {
      o.isSeenByAdmin = true;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('cf_orders_updated'));
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'orders', orderId), { isSeenByAdmin: true });
    } catch (err) {
      // ignore
    }
  }
}

// Live real-time listener for Orders in Admin
export function subscribeOrders(onUpdate: (orders: Order[]) => void): () => void {
  // If Firestore is available, attach onSnapshot
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
          onUpdate(list);
        },
        error => {
          handleFirestoreError(error, OperationType.GET, 'orders');
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Firestore onSnapshot error, falling back to local events:', err);
    }
  }

  // Local event listener fallback
  const handler = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    onUpdate(stored ? JSON.parse(stored) : []);
  };

  window.addEventListener('cf_orders_updated', handler);
  window.addEventListener('storage', handler);
  handler();

  return () => {
    window.removeEventListener('cf_orders_updated', handler);
    window.removeEventListener('storage', handler);
  };
}

// Track Order Lookup
export async function trackOrder(orderId: string, phone: string) {
  const cleanId = orderId.trim().toUpperCase();
  const cleanPhone = phone.trim();
  const last4 = cleanPhone.slice(-4);
  const trackingKey = `${cleanId}_${last4}`;

  if (isFirebaseConfigured && db) {
    try {
      const trackRef = doc(db, 'orderTracking', trackingKey);
      const snapshot = await getDoc(trackRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (err) {
      console.warn('Firestore tracking lookup error:', err);
    }
  }

  // Fallback to local storage
  const storedTracking = localStorage.getItem(STORAGE_KEYS.TRACKING);
  if (storedTracking) {
    const map = JSON.parse(storedTracking);
    if (map[trackingKey]) {
      return map[trackingKey];
    }
  }

  // Also check orders collection
  const orders = await getOrders();
  const match = orders.find(
    o => o.orderId.toUpperCase() === cleanId && o.customer.phone.endsWith(last4)
  );

  if (match) {
    return {
      orderId: match.orderId,
      orderStatus: match.orderStatus,
      courierName: match.courierName || '',
      trackingNumber: match.trackingNumber || '',
      updatedAt: match.updatedAt,
    };
  }

  return null;
}

// ==========================================
// SETTINGS SERVICE
// ==========================================

export async function getShopSettings(): Promise<ShopSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'shop'));
      if (snap.exists()) {
        return snap.data() as ShopSettings;
      }
    } catch (err) {
      console.warn('Firestore settings fetch error:', err);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : defaultShopSettings;
}

export async function saveShopSettings(settings: ShopSettings): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'settings', 'shop'), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/shop');
    }
  }

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('cf_settings_updated'));
}

// ==========================================
// IMAGE UPLOAD / COMPRESSION UTILS
// ==========================================

export async function compressImage(file: File, maxDimension = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = err => reject(err);
    };
    reader.onerror = err => reject(err);
  });
}

export async function uploadImageFile(
  file: File,
  folder: 'screenshots' | 'products' | 'settings',
  customId?: string
): Promise<string> {
  const compressedBase64 = await compressImage(file);

  // If Firebase Storage is configured, upload blob
  if (isFirebaseConfigured && storage) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${customId || Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Convert data URL to blob
      const res = await fetch(compressedBase64);
      const blob = await res.blob();

      await uploadBytes(storageRef, blob, { contentType: file.type || 'image/jpeg' });
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload failed, storing compressed data URL:', err);
    }
  }

  // Fallback: return compressed base64 data URL
  return compressedBase64;
}
