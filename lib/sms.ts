export async function sendOtp(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env.BULKSMS_API_KEY;
  const senderId = process.env.BULKSMS_SENDER_ID;

  if (!apiKey || !senderId) {
    console.error('BulkSMSBD credentials not configured');
    return false;
  }

  const message = `Your Afnan Mahmud OTP is: ${code}. Valid for 5 minutes.`;

  // BulkSMSBD expects a number with the 88 country code, e.g. 8801XXXXXXXXX.
  const number = phone.startsWith('88') ? phone : `88${phone}`;

  // BulkSMSBD expects form-encoded params (not JSON) and a `type` field.
  const params = new URLSearchParams({
    api_key: apiKey,
    type: 'text',
    senderid: senderId,
    number,
    message,
  });

  try {
    const res = await fetch('https://bulksmsbd.net/api/smsapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();
    // BulkSMSBD returns response_code 202 on success
    if (data.response_code !== 202) {
      console.error('BulkSMSBD send failed:', data);
      return false;
    }
    return true;
  } catch (err) {
    console.error('SMS send error:', err);
    return false;
  }
}
