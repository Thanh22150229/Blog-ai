import QRCode from 'qrcode';

export async function generateQRCode(data) {
  const transactionData = {
    accountNumber: '8888392630052', // Thay bằng số tài khoản thực tế của bạn
    bank: 'Agribank',
    amount: data.amount,
    content: `Payment for ${data.userId} - ${data.plan}`, // Nội dung để theo dõi
  };
  try {
    return await QRCode.toDataURL(JSON.stringify(transactionData));
  } catch (err) {
    throw new Error('Lỗi tạo mã QR');
  }
}