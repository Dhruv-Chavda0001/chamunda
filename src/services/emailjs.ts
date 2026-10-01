import { Order } from '../types';

interface EmailJSConfig {
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
}

export async function sendOrderAlertEmail(order: Order, config?: EmailJSConfig): Promise<boolean> {
  const serviceId = config?.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = config?.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = config?.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.info('EmailJS keys not configured in .env. Skipping email notification.');
    return false;
  }

  const itemsList = order.items
    .map(i => `${i.name} (Size: ${i.size}, Qty: ${i.quantity}, Price: ₹${i.price})`)
    .join('\n');

  const adminOrderUrl = `${window.location.origin}/admin/orders/${order.id}`;

  const templateParams = {
    to_email: 'dhruvchavda7383@gmail.com',
    to_name: 'Dhruv Chavda',
    order_id: order.orderId,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || 'N/A',
    delivery_address: `${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`,
    items_summary: itemsList,
    total_amount: `₹${order.totalAmount}`,
    utr_number: order.utrNumber,
    admin_order_url: adminOrderUrl,
    date: new Date(order.createdAt).toLocaleString('en-IN'),
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('EmailJS response error:', errText);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to send EmailJS alert:', err);
    return false;
  }
}
