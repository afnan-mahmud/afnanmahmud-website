export async function sendOtp(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env.BULKSMS_API_KEY;
  const senderId = process.env.BULKSMS_SENDER_ID;

  if (!apiKey || !senderId) {
    console.error('BulkSMSBD credentials not configured');
    return false;
  }

  const message = `Your Afnan Mahmud OTP is: ${code}. Valid for 5 minutes.`;

  try {
    const res = await fetch('https://bulksmsbd.net/api/smsapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        number: phone,
        message,
      }),
    });

    const data = await res.json();
    // BulkSMSBD returns response_code 202 on success
    return data.response_code === 202;
  } catch (err) {
    console.error('SMS send error:', err);
    return false;
  }
}
