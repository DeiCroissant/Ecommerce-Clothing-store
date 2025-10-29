/**
 * Mock Address Data for Development
 * Vietnam Provinces, Districts, and Wards
 */

export const mockAddresses = [
  {
    id: '1',
    label: 'home',
    recipientName: 'Nguyễn Văn A',
    phone: '0901234567',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: '123 Đường Nguyễn Huệ',
    isDefault: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    label: 'office',
    recipientName: 'Nguyễn Văn A',
    phone: '0901234567',
    province: 'Hồ Chí Minh',
    district: 'Quận 3',
    ward: 'Phường Võ Thị Sáu',
    address: '456 Đường Điện Biên Phủ, Tòa nhà ABC, Tầng 5',
    isDefault: false,
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    label: 'other',
    recipientName: 'Trần Thị B',
    phone: '0987654321',
    province: 'Hà Nội',
    district: 'Quận Hoàn Kiếm',
    ward: 'Phường Hàng Bạc',
    address: '789 Phố Hàng Bạc',
    isDefault: false,
    createdAt: '2024-03-10'
  }
]

export const addressLabels = {
  home: {
    icon: '🏠',
    text: 'Nhà riêng',
    color: '#3b82f6'
  },
  office: {
    icon: '🏢',
    text: 'Văn phòng',
    color: '#8b5cf6'
  },
  other: {
    icon: '📍',
    text: 'Khác',
    color: '#71717a'
  }
}

// Vietnam Provinces (Top 10 major cities/provinces)
export const vietnamProvinces = [
  { code: 'HCM', name: 'Hồ Chí Minh' },
  { code: 'HN', name: 'Hà Nội' },
  { code: 'DN', name: 'Đà Nẵng' },
  { code: 'HP', name: 'Hải Phòng' },
  { code: 'CT', name: 'Cần Thơ' },
  { code: 'BD', name: 'Bình Dương' },
  { code: 'DNA', name: 'Đồng Nai' },
  { code: 'KH', name: 'Khánh Hòa' },
  { code: 'LĐ', name: 'Lâm Đồng' },
  { code: 'BT', name: 'Bình Thuận' }
]

// Districts by Province
export const vietnamDistricts = {
  'HCM': [
    { code: 'Q1', name: 'Quận 1' },
    { code: 'Q2', name: 'Quận 2' },
    { code: 'Q3', name: 'Quận 3' },
    { code: 'Q4', name: 'Quận 4' },
    { code: 'Q5', name: 'Quận 5' },
    { code: 'Q6', name: 'Quận 6' },
    { code: 'Q7', name: 'Quận 7' },
    { code: 'Q8', name: 'Quận 8' },
    { code: 'Q9', name: 'Quận 9' },
    { code: 'Q10', name: 'Quận 10' },
    { code: 'Q11', name: 'Quận 11' },
    { code: 'Q12', name: 'Quận 12' },
    { code: 'TB', name: 'Quận Tân Bình' },
    { code: 'TP', name: 'Quận Tân Phú' },
    { code: 'BT', name: 'Quận Bình Thạnh' },
    { code: 'PN', name: 'Quận Phú Nhuận' },
    { code: 'GV', name: 'Quận Gò Vấp' }
  ],
  'HN': [
    { code: 'HK', name: 'Quận Hoàn Kiếm' },
    { code: 'BD', name: 'Quận Ba Đình' },
    { code: 'DD', name: 'Quận Đống Đa' },
    { code: 'HM', name: 'Quận Hai Bà Trưng' },
    { code: 'CG', name: 'Quận Cầu Giấy' },
    { code: 'TH', name: 'Quận Thanh Xuân' },
    { code: 'TX', name: 'Quận Tây Hồ' },
    { code: 'LB', name: 'Quận Long Biên' },
    { code: 'HK', name: 'Quận Hoàng Mai' },
    { code: 'BT', name: 'Quận Bắc Từ Liêm' },
    { code: 'NT', name: 'Quận Nam Từ Liêm' }
  ],
  'DN': [
    { code: 'HC', name: 'Quận Hải Châu' },
    { code: 'TK', name: 'Quận Thanh Khê' },
    { code: 'SK', name: 'Quận Sơn Trà' },
    { code: 'NGC', name: 'Quận Ngũ Hành Sơn' },
    { code: 'LT', name: 'Quận Liên Chiểu' },
    { code: 'CL', name: 'Quận Cẩm Lệ' }
  ],
  'HP': [
    { code: 'HK', name: 'Quận Hồng Bàng' },
    { code: 'LT', name: 'Quận Lê Chân' },
    { code: 'NH', name: 'Quận Ngô Quyền' },
    { code: 'KA', name: 'Quận Kiến An' },
    { code: 'HP', name: 'Quận Hải An' },
    { code: 'DP', name: 'Quận Đồ Sơn' }
  ],
  'CT': [
    { code: 'NK', name: 'Quận Ninh Kiều' },
    { code: 'BP', name: 'Quận Bình Thuỷ' },
    { code: 'CR', name: 'Quận Cái Răng' },
    { code: 'OO', name: 'Quận Ô Môn' },
    { code: 'TP', name: 'Quận Thốt Nốt' }
  ]
}

// Wards by District (Sample for Q1, HCM)
export const vietnamWards = {
  'Q1': [
    { code: 'BN', name: 'Phường Bến Nghé' },
    { code: 'BT', name: 'Phường Bến Thành' },
    { code: 'NT', name: 'Phường Nguyễn Thái Bình' },
    { code: 'PT', name: 'Phường Phạm Ngũ Lão' },
    { code: 'CT', name: 'Phường Cô Giang' },
    { code: 'NT', name: 'Phường Nguyễn Cư Trinh' },
    { code: 'CK', name: 'Phường Cầu Kho' },
    { code: 'CO', name: 'Phường Cầu Ông Lãnh' },
    { code: 'DK', name: 'Phường Đa Kao' },
    { code: 'TH', name: 'Phường Tân Định' }
  ],
  'Q3': [
    { code: 'P1', name: 'Phường 1' },
    { code: 'P2', name: 'Phường 2' },
    { code: 'P3', name: 'Phường 3' },
    { code: 'P4', name: 'Phường 4' },
    { code: 'P5', name: 'Phường 5' },
    { code: 'P6', name: 'Phường 6' },
    { code: 'VTS', name: 'Phường Võ Thị Sáu' }
  ],
  'HK': [
    { code: 'CĐ', name: 'Phường Cửa Đông' },
    { code: 'ĐC', name: 'Phường Đồng Xuân' },
    { code: 'HB', name: 'Phường Hàng Bạc' },
    { code: 'HBM', name: 'Phường Hàng Bài' },
    { code: 'HBG', name: 'Phường Hàng Bông' },
    { code: 'LH', name: 'Phường Lý Thái Tổ' },
    { code: 'TTB', name: 'Phường Tràng Tiền' }
  ],
  'HC': [
    { code: 'TTO', name: 'Phường Thạch Thang' },
    { code: 'HT', name: 'Phường Hải Châu 1' },
    { code: 'HT2', name: 'Phường Hải Châu 2' },
    { code: 'PT', name: 'Phường Phước Ninh' },
    { code: 'TT', name: 'Phường Thanh Bình' }
  ]
}

// Helper function to get districts by province
export function getDistrictsByProvince(provinceName) {
  const provinceCode = vietnamProvinces.find(p => p.name === provinceName)?.code
  return vietnamDistricts[provinceCode] || []
}

// Helper function to get wards by district
export function getWardsByDistrict(districtName) {
  // Extract district code from name (e.g., "Quận 1" → "Q1")
  const districtCode = Object.keys(vietnamWards).find(key => {
    const districts = Object.values(vietnamDistricts).flat()
    return districts.find(d => d.name === districtName && d.code === key)
  })
  return vietnamWards[districtCode] || []
}

// Helper function to format full address
export function formatFullAddress(address) {
  return `${address.address}, ${address.ward}, ${address.district}, ${address.province}`
}

// Helper function to get address label info
export function getAddressLabelInfo(label) {
  return addressLabels[label] || addressLabels.other
}

// Maximum addresses per user
export const MAX_ADDRESSES = 10
