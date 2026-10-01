export type ProductCategory = 'Kurti' | 'Co-ord' | 'Western' | 'Dress' | 'Other';

export interface SizeStock {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  name_hi?: string;
  name_gu?: string;
  slug: string;
  category: ProductCategory;
  price: number;
  discountPrice?: number;
  fabric: string;
  colours: string[];
  description: string;
  description_hi?: string;
  description_gu?: string;
  sizes: SizeStock[];
  images: string[];
  isVisible: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: string;
  isDemo?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  maxStock: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | 'Payment Pending'
  | 'Payment Received'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderId: string; // e.g. "CF-20261001-0001"
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentScreenshotUrl: string;
  utrNumber: string;
  policyAccepted: boolean;
  isSeenByAdmin: boolean;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  upiQrImageUrl: string;
  upiId: string;
  upiHolderName: string;
  shopWhatsapp: string;
  shopName: string;
  shopEmail: string;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  bannerText: string;
  bannerImageUrl?: string;
  announcementEnabled: boolean;
  policyText: {
    delivery: string;
    noReturnNoExchange: string;
    prepaidOnly: string;
    privacy: string;
  };
  sizeChart: Record<string, { bust: string; waist: string; hip: string; length: string }>;
}

export type Language = 'en' | 'hi' | 'gu';
