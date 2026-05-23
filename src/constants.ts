export const ALL_BANKS = [
  { code: 'VCB', bin: '970436', name: 'Vietcombank' },
  { code: 'TCB', bin: '970407', name: 'Techcombank' },
  { code: 'MB', bin: '970422', name: 'MB Bank' },
  { code: 'VPB', bin: '970432', name: 'VPBank' },
  { code: 'BIDV', bin: '970418', name: 'BIDV' },
  { code: 'VBA', bin: '970405', name: 'Agribank' },
  { code: 'ICB', bin: '970415', name: 'VietinBank' },
  { code: 'ACB', bin: '970416', name: 'ACB' },
  { code: 'STB', bin: '970403', name: 'Sacombank' },
  { code: 'TPB', bin: '970423', name: 'TPBank' },
  { code: 'SHB', bin: '970443', name: 'SHB' },
  { code: 'HDB', bin: '970437', name: 'HDBank' },
  { code: 'EIB', bin: '970431', name: 'Eximbank' },
  { code: 'MSB', bin: '970426', name: 'MSB' },
  { code: 'OCB', bin: '970448', name: 'OCB' },
  { code: 'SEAB', bin: '970440', name: 'SeABank' },
  { code: 'NAB', bin: '970428', name: 'Nam A Bank' },
  { code: 'KLB', bin: '970452', name: 'Kienlongbank' },
  { code: 'CAKE', bin: '546034', name: 'CAKE by VPBank' },
  { code: 'MOMO', bin: '971025', name: 'Ví MoMo' },
  { code: 'VIB', bin: '970441', name: 'VIB' },
  { code: 'SCB', bin: '970429', name: 'SCB' },
  { code: 'BAB', bin: '970409', name: 'Bac A Bank' },
  { code: 'PVCOM', bin: '970412', name: 'PVcomBank' },
  { code: 'OCEAN', bin: '970414', name: 'OceanBank' },
  { code: 'NCB', bin: '970419', name: 'NCB' },
  { code: 'LPB', bin: '970449', name: 'LPBank' },
  { code: 'CBB', bin: '970444', name: 'CBBank' },
  { code: 'BVB', bin: '970438', name: 'BaoViet Bank' },
  { code: 'DOB', bin: '970406', name: 'DongA Bank' },
  { code: 'GPB', bin: '970408', name: 'GPBank' },
  { code: 'SGB', bin: '970400', name: 'Saigonbank' },
  { code: 'VAB', bin: '970427', name: 'VietA Bank' },
  { code: 'ABB', bin: '970425', name: 'ABBank' },
  { code: 'TIMO', bin: '963388', name: 'Timo by Ban Viet' },
  { code: 'VNPAY', bin: '970400', name: 'VNPAY' }, // Example bin
  { code: 'ZALOPAY', bin: '970400', name: 'ZaloPay' }, // Example bin
];

export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
