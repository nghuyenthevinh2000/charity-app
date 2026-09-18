import { Fund, DonationInput, MonasteryTransaction } from '../types';

/**
 * Vietnamese Seed Data for Lotus Grove Sanctuary (Tịnh Xá Sen Vàng)
 *
 * @file seedDataVI.ts
 * Prioritizes Vietnamese terminology, cultural context, and monk titles over English
 * across all funds, donations, prayer intentions, and UTXO transactions.
 *
 * DEPRECATION NOTICE:
 * The legacy English seed data in `src/data/seedData.ts` is now deprecated in favor of this file.
 * To maintain backward compatibility, legacy English datasets are available via `seedData.ts` or
 * re-exported as `initialFundsEN`, `initialDonationsEN`, and `initialTransactionsEN`.
 */

export const initialFundsVI: Fund[] = [
  {
    id: 'alms',
    name: 'Cúng Dường Trai Tăng & Thực Dưỡng',
    description: 'Cúng dường các bữa ăn thanh tịnh, dinh dưỡng mỗi ngày cho chư Tăng nội tự và Phật tử thập phương về tu học.',
    category: 'necessities',
    targetAmount: 1500,
    currentBalance: 1240,
    deadline: '2026-09-22',
    daysRemaining: 5,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Hòa Thượng Thích Tâm Đức',
      badgeLabel: 'Chứng thực bởi Thầy Trụ Trì ✓'
    },
    supportersCount: 38,
    icon: 'Utensils',
    color: '#D97706'
  },
  {
    id: 'healthcare',
    name: 'Y Dược & Chăm Sóc Sức Khỏe Chư Tăng',
    description: 'Thuốc men chuyên biệt, thảo dược dưỡng sinh và chăm sóc y tế cho chư tôn đức trưởng lão và chư Tăng khi hữu sự.',
    category: 'healthcare',
    targetAmount: 1200,
    currentBalance: 980,
    deadline: '2026-09-28',
    daysRemaining: 11,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Hòa Thượng Thích Tâm Đức',
      badgeLabel: 'Chứng thực bởi Thầy Trụ Trì ✓'
    },
    supportersCount: 24,
    icon: 'HeartPulse',
    color: '#059669'
  },
  {
    id: 'utilities',
    name: 'Năng Lượng Mặt Trời & Nước Sạch Tịnh Xá',
    description: 'Hệ thống điện năng lượng mặt trời thanh tịnh, lọc nước nguồn tự nhiên và các công trình tiện ích sinh thái tại tịnh xá.',
    category: 'operations',
    targetAmount: 2000,
    currentBalance: 1650,
    deadline: '2026-10-05',
    daysRemaining: 18,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Thầy Quản Sự Thích Minh Niệm',
      badgeLabel: 'Chứng thực bởi Thầy Trụ Trì ✓'
    },
    supportersCount: 42,
    icon: 'Zap',
    color: '#B45309'
  },
  {
    id: 'education',
    name: 'Ấn Tống Kinh Điển & Phật Học Tăng Đoàn',
    description: 'Bảo tồn, in ấn kinh điển Phật giáo đại thừa, dịch thuật thánh điển và trợ duyên việc tu học cho chư Tăng Ni trẻ.',
    category: 'special-drive',
    targetAmount: 1000,
    currentBalance: 980,
    deadline: '2026-10-15',
    daysRemaining: 28,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Hòa Thượng Thích Tâm Đức',
      badgeLabel: 'Chứng thực bởi Thầy Trụ Trì ✓'
    },
    supportersCount: 19,
    icon: 'BookOpen',
    color: '#78350F'
  }
];

export const initialDonationsVI: DonationInput[] = [
  {
    id: 'd1',
    txHash: '0x8e2a149f',
    donorName: 'Phật Tử Ananda (Devotee Ananda)',
    isAnonymous: false,
    amount: 50,
    fundId: 'alms',
    date: '2026-09-15',
    prayerIntention: {
      id: 'p1',
      category: 'healing',
      dedicationText: 'Cầu an cho thân mẫu Nguyễn Thị Mai sớm bình phục sau phẫu thuật, thân tâm an lạc, nhiều nghị lực và an lành.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-16T06:00:00Z',
      rejoiceCount: 12,
      comments: [
        {
          id: 'c1',
          authorName: 'Hòa Thượng Viện Chủ Thích Tâm Đức (Venerable Abbot Tam Duc)',
          authorRole: 'monk',
          monkTitle: 'Hòa Thượng Viện Chủ (Venerable Abbot)',
          commentText: 'Nguyện ánh sáng từ bi của Đức Phật Dược Sư gia hộ cho thân mẫu của con. Tăng đoàn đã hồi hướng công đức thời tụng Bát Nhã sáng nay cầu chúc bà sớm bình phục. Nguyện gia quyến luôn an lành.',
          createdAt: '2026-09-16T06:30:00Z'
        },
        {
          id: 'c2',
          authorName: 'Phật Tử Minh Tâm',
          authorRole: 'devotee',
          commentText: 'Gửi trọn lòng thành kính và nguyện cầu năng lượng an lành cho bác gái sớm bình phục! 🙏',
          createdAt: '2026-09-16T07:15:00Z'
        }
      ]
    }
  },
  {
    id: 'd2',
    txHash: '0x3c1b8201',
    donorName: 'Phật Tử Linh Nguyễn',
    isAnonymous: false,
    amount: 40,
    fundId: 'alms',
    date: '2026-09-15',
    prayerIntention: {
      id: 'p2',
      category: 'peace',
      dedicationText: 'Cầu nguyện cho gia đạo luôn hòa thuận, tràn đầy tình thương yêu và luôn sống trong chánh niệm tỉnh thức.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-16T06:00:00Z',
      rejoiceCount: 8,
      comments: [
        {
          id: 'c3',
          authorName: 'Thầy Pháp Niệm',
          authorRole: 'monk',
          monkTitle: 'Đại Đức Thích Pháp Niệm',
          commentText: 'Nơi nào có chánh niệm, nơi ấy an lạc tự nhiên đơm hoa kết trái. Xin tùy hỷ công đức cùng gia đình con.',
          createdAt: '2026-09-16T07:00:00Z'
        }
      ]
    }
  },
  {
    id: 'd3',
    txHash: '0x5d9e4412',
    donorName: 'Phật Tử Trần Văn Đức',
    isAnonymous: false,
    amount: 100,
    fundId: 'healthcare',
    date: '2026-09-14',
    prayerIntention: {
      id: 'p3',
      category: 'healing',
      dedicationText: 'Phát tâm cúng dường y dược với lòng tri ân sâu sắc đến chư Tôn đức Trưởng lão đã luôn từ bi dẫn dắt cộng đồng.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-15T06:00:00Z',
      rejoiceCount: 15,
      comments: [
        {
          id: 'c4',
          authorName: 'Hòa Thượng Viện Chủ Thích Tâm Đức (Venerable Abbot Tam Duc)',
          authorRole: 'monk',
          monkTitle: 'Hòa Thượng Viện Chủ (Venerable Abbot)',
          commentText: 'Lành thay (Sadhu)! Số thuốc men này đã kịp thời hỗ trợ Thầy Giác Định phục hồi sức khỏe tốt đẹp.',
          createdAt: '2026-09-15T07:30:00Z'
        }
      ]
    }
  },
  {
    id: 'd4',
    txHash: '0x7f2c1990',
    donorName: 'Gia Đình Họ Nguyễn (The Nguyen Family)',
    isAnonymous: false,
    amount: 75,
    fundId: 'alms',
    date: '2026-09-16',
    prayerIntention: {
      id: 'p4',
      category: 'memorial',
      dedicationText: 'Thành kính tưởng niệm và hồi hướng công đức cho hương linh Cụ ông Nguyễn Văn Thành vãng sanh Cực Lạc.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-17T06:00:00Z',
      rejoiceCount: 21,
      comments: [
        {
          id: 'c5',
          authorName: 'Hòa Thượng Viện Chủ Thích Tâm Đức (Venerable Abbot Tam Duc)',
          authorRole: 'monk',
          monkTitle: 'Hòa Thượng Viện Chủ (Venerable Abbot)',
          commentText: 'Tấm lòng hiếu nghĩa của quý vị sẽ tiếp tục đơm hoa kết trái lành. Nam Mô A Di Đà Phật.',
          createdAt: '2026-09-17T06:45:00Z'
        }
      ]
    }
  },
  {
    id: 'd5',
    txHash: '0x2a8f001c',
    donorName: 'Phật Tử Ẩn Danh',
    isAnonymous: true,
    amount: 150,
    fundId: 'utilities',
    date: '2026-09-16',
    prayerIntention: {
      id: 'p5',
      category: 'gratitude',
      dedicationText: 'Nguyện tiếng chuông chùa và ánh sáng chánh pháp luôn soi đường, mang lại an lạc cho mọi người hữu duyên.',
      isPublic: true,
      blessingStatus: 'queued',
      rejoiceCount: 5,
      comments: []
    }
  },
  {
    id: 'd6',
    txHash: '0x4b77ee12',
    donorName: 'Phật Tử Sarah Jenkins',
    isAnonymous: false,
    amount: 35,
    fundId: 'healthcare',
    date: '2026-09-17',
    prayerIntention: {
      id: 'p6',
      category: 'healing',
      dedicationText: 'Cầu chúc sức khỏe, an lành và mau chóng bình phục cho tất cả chúng sinh đang chịu nỗi đau bệnh tật.',
      isPublic: true,
      blessingStatus: 'queued',
      rejoiceCount: 3,
      comments: []
    }
  },
  {
    id: 'd7',
    txHash: '0x99a1ee34',
    donorName: 'Phật Tử Lê Quang Bảo',
    isAnonymous: false,
    amount: 80,
    fundId: 'education',
    date: '2026-09-16',
    prayerIntention: {
      id: 'p7',
      category: 'peace',
      dedicationText: 'Cầu cho các sĩ tử tâm trí sáng suốt, thanh tịnh và đạt nhiều trí tuệ trong mùa thi cử sắp tới.',
      isPublic: true,
      blessingStatus: 'queued',
      rejoiceCount: 6,
      comments: []
    }
  }
];

export const initialTransactionsVI: MonasteryTransaction[] = [
  {
    id: 'tx-1',
    txHash: '0xa49f7b11',
    date: '2026-09-16',
    fundId: 'alms',
    inputs: [
      { donationId: 'd1', txHash: '0x8e2a149f', donorName: 'Phật Tử Ananda', amountContributed: 50 },
      { donationId: 'd2', txHash: '0x3c1b8201', donorName: 'Phật Tử Linh Nguyễn', amountContributed: 40 }
    ],
    spentOutput: {
      id: 's1',
      merchant: 'Chợ Nông Sản Thung Lũng Xanh (Green Valley Farmers Market)',
      amount: 72.50,
      items: [
        'Đậu Hũ Hữu Cơ Thanh Tịnh (Organic Tofu, 15 blocks)',
        'Gạo Lứt Hương Lài Tự Nhiên (Jasmine Brown Rice, 25kg bag)',
        'Cải Thìa Tươi & Rau Củ Tươi Theo Mùa (Fresh Bok Choy & Seasonal Greens)',
        'Dầu Mè Ép Lạnh Nguyên Chất (Cold-pressed Sesame Oil)'
      ],
      purpose: 'Chuẩn bị bữa điểm tâm và cơm trưa thanh đạm, giàu dinh dưỡng cho 35 chư Tăng và Phật tử về tịnh xá tu học',
      receiptImageUrl: '/images/verified-groceries-receipt.jpg',
      receiptHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verifiedBy: 'Tri Sự Ban Ẩm Thực Tịnh Xá - Thầy Thích Minh Thông (Kitchen Steward)',
      verifiedAt: '2026-09-16'
    },
    changeOutput: {
      amount: 17.50,
      destinationFundId: 'alms'
    }
  },
  {
    id: 'tx-2',
    txHash: '0xb51e992a',
    date: '2026-09-15',
    fundId: 'healthcare',
    inputs: [
      { donationId: 'd3', txHash: '0x5d9e4412', donorName: 'Phật Tử Trần Văn Đức', amountContributed: 100 }
    ],
    spentOutput: {
      id: 's2',
      merchant: 'Hiệu Thuốc Thảo Dược & Y Dược Cộng Đồng Pháp Hoa (Dharma Herbals)',
      amount: 86.25,
      items: [
        'Thảo Dược Bổ Khí Nhân Sâm Dưỡng Sinh (Ginseng Herbal Tonic for Elderly Monks)',
        'Băng Gạc Y Tế Vô Trùng & Thuốc Mỡ Kháng Viêm (Medical Gauze & Antiseptic Ointment)',
        'Bộ Phụ Kiện Vòng Bít Máy Đo Huyết Áp Điện Tử (Blood Pressure Monitor Cuff)'
      ],
      purpose: 'Thuốc theo toa và vật tư chăm sóc y tế chuyên biệt cho chư tôn đức trưởng lão tại tịnh xá',
      receiptImageUrl: '/images/verified-pharmacy-receipt.jpg',
      receiptHash: 'sha256:8f4c281a99ef87b001a45cbef712431289fe1234abcd5678ef0123456789abcd',
      verifiedBy: 'Thị Giả Chăm Sóc Sức Khỏe - Tỳ Kheo Thích Tâm Tịnh (Health Care Attendant)',
      verifiedAt: '2026-09-15'
    },
    changeOutput: {
      amount: 13.75,
      destinationFundId: 'healthcare'
    }
  },
  {
    id: 'tx-3',
    txHash: '0xc89d443f',
    date: '2026-09-16',
    fundId: 'utilities',
    inputs: [
      { donationId: 'd5', txHash: '0x2a8f001c', donorName: 'Phật Tử Ẩn Danh', amountContributed: 150 }
    ],
    spentOutput: {
      id: 's3',
      merchant: 'Công Ty Điện & Năng Lượng Mặt Trời Núi Xanh (Pure Mountain Solar)',
      amount: 124.80,
      items: [
        'Bảo Trì Bộ Biến Tần Năng Lượng Mặt Trời (Main Meditation Hall Solar Inverter)',
        'Thay Bộ Lõi Lọc Nước Tinh Khiết Chuẩn Sinh Hoạt (Clean Water Filter Cartridge)'
      ],
      purpose: 'Bảo trì dàn ắc quy năng lượng mặt trời và hệ thống lọc nước uống tinh khiết cho thiền đường khóa tu',
      receiptImageUrl: '/images/verified-solar-receipt.jpg',
      receiptHash: 'sha256:4a8b11cdef9012345678abcdef9012345678abcdef9012345678abcdef901234',
      verifiedBy: 'Tri Sự Hạ Tầng Tịnh Xá - Thầy Thích Quang Hiển',
      verifiedAt: '2026-09-16'
    },
    changeOutput: {
      amount: 25.20,
      destinationFundId: 'utilities'
    }
  }
];

// Primary active exports
export const initialFunds = initialFundsVI;
export const initialDonations = initialDonationsVI;
export const initialTransactions = initialTransactionsVI;

/**
 * @deprecated Legacy English seed data from `src/data/seedData.ts`.
 * Use `initialFundsVI`, `initialDonationsVI`, `initialTransactionsVI` instead.
 */
export {
  initialFunds as initialFundsEN,
  initialDonations as initialDonationsEN,
  initialTransactions as initialTransactionsEN,
} from './seedData';
