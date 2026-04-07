export interface EpsPaymentParams {
  amount: number;
  currency: string;
  order_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  customer_name: string;
  customer_phone: string;
  product_name?: string;
}

export interface EpsPaymentResult {
  paymentUrl: string;
  transactionId?: string;
}

export async function initiatePayment(params: EpsPaymentParams): Promise<EpsPaymentResult> {
  const baseUrl = process.env.EPS_BASE_URL;
  const merchantId = process.env.EPS_MERCHANT_ID;
  const apiKey = process.env.EPS_API_KEY;

  if (!baseUrl || !merchantId || !apiKey) {
    throw new Error('EPS payment credentials not configured');
  }

  const payload = {
    merchant_id: merchantId,
    ...params,
  };

  const res = await fetch(`${baseUrl}/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EPS payment initiation failed: ${res.status} — ${text}`);
  }

  const data = await res.json();

  const paymentUrl = data.payment_url ?? data.redirect_url ?? data.url;
  if (!paymentUrl) {
    throw new Error('EPS did not return a payment URL');
  }

  return { paymentUrl, transactionId: data.transaction_id };
}

export async function verifyPayment(transactionId: string): Promise<boolean> {
  const baseUrl = process.env.EPS_BASE_URL;
  const apiKey = process.env.EPS_API_KEY;

  if (!baseUrl || !apiKey) return false;

  try {
    const res = await fetch(`${baseUrl}/payment/verify?transaction_id=${transactionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'success' || data.payment_status === 'paid';
  } catch {
    return false;
  }
}
