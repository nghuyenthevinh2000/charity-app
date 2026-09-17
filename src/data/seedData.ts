import { Fund, DonationInput, MonasteryTransaction } from '../types';

export const initialFunds: Fund[] = [
  {
    id: 'alms',
    name: 'Daily Alms & Nutritious Food',
    description: 'Supporting daily nutritious meal offerings for resident monks and visiting pilgrims.',
    category: 'necessities',
    targetAmount: 1500,
    currentBalance: 1240,
    deadline: '2026-09-22',
    daysRemaining: 5,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Abbot Thich Tam Duc',
      badgeLabel: 'Verified by Abbot ✓'
    },
    supportersCount: 38,
    icon: 'Utensils',
    color: '#D97706'
  },
  {
    id: 'healthcare',
    name: 'Monastery Healthcare & Medicine',
    description: 'Specialized healthcare, geriatric medicines, and medical care for elder and ailing monks.',
    category: 'healthcare',
    targetAmount: 1200,
    currentBalance: 980,
    deadline: '2026-09-28',
    daysRemaining: 11,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Abbot Thich Tam Duc',
      badgeLabel: 'Verified by Abbot ✓'
    },
    supportersCount: 24,
    icon: 'HeartPulse',
    color: '#059669'
  },
  {
    id: 'utilities',
    name: 'Monastery Solar & Clean Water Utilities',
    description: 'Clean energy solar power, mountain water filtration, and eco-friendly monastery utilities.',
    category: 'operations',
    targetAmount: 2000,
    currentBalance: 1650,
    deadline: '2026-10-05',
    daysRemaining: 18,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Steward Thich Minh Niem',
      badgeLabel: 'Verified by Abbot ✓'
    },
    supportersCount: 42,
    icon: 'Zap',
    color: '#B45309'
  },
  {
    id: 'education',
    name: 'Dharma Texts & Sangha Education',
    description: 'Preserving and printing sacred Buddhist sutras, translation efforts, and novice monk education.',
    category: 'special-drive',
    targetAmount: 1000,
    currentBalance: 980,
    deadline: '2026-10-15',
    daysRemaining: 28,
    verifiedStatus: {
      isVerified: true,
      attestedBy: 'Abbot Thich Tam Duc',
      badgeLabel: 'Verified by Abbot ✓'
    },
    supportersCount: 19,
    icon: 'BookOpen',
    color: '#78350F'
  }
];

export const initialDonations: DonationInput[] = [
  {
    id: 'd1',
    txHash: '0x8e2a149f',
    donorName: 'Devotee Ananda',
    isAnonymous: false,
    amount: 50,
    fundId: 'alms',
    date: '2026-09-15',
    prayerIntention: {
      id: 'p1',
      category: 'healing',
      dedicationText: 'Praying for my mother Nguyen Thi Mai recovery from surgery with peace and strength.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-16T06:00:00Z',
      rejoiceCount: 12,
      comments: [
        {
          id: 'c1',
          authorName: 'Venerable Abbot Tam Duc',
          authorRole: 'monk',
          monkTitle: 'Venerable Abbot Tam Duc',
          commentText: 'May the healing light of the Medicine Buddha protect your mother. The Sangha dedicated the morning Heart Sutra chant for her quick recovery. Peace be with your family.',
          createdAt: '2026-09-16T06:30:00Z'
        },
        {
          id: 'c2',
          authorName: 'Devotee Minh Tam',
          authorRole: 'devotee',
          commentText: 'Sending deep prayers and positive energy for your mother! 🙏',
          createdAt: '2026-09-16T07:15:00Z'
        }
      ]
    }
  },
  {
    id: 'd2',
    txHash: '0x3c1b8201',
    donorName: 'Devotee Linh Nguyen',
    isAnonymous: false,
    amount: 40,
    fundId: 'alms',
    date: '2026-09-15',
    prayerIntention: {
      id: 'p2',
      category: 'peace',
      dedicationText: 'For harmony, loving kindness, and mindfulness in our family home.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-16T06:00:00Z',
      rejoiceCount: 8,
      comments: [
        {
          id: 'c3',
          authorName: 'Brother Phap Niem',
          authorRole: 'monk',
          monkTitle: 'Brother Phap Niem',
          commentText: 'Where there is mindfulness, peace blooms effortlessly. Rejoicing in your family merit.',
          createdAt: '2026-09-16T07:00:00Z'
        }
      ]
    }
  },
  {
    id: 'd3',
    txHash: '0x5d9e4412',
    donorName: 'Devotee Tran Van Duc',
    isAnonymous: false,
    amount: 100,
    fundId: 'healthcare',
    date: '2026-09-14',
    prayerIntention: {
      id: 'p3',
      category: 'healing',
      dedicationText: 'Offering medicinal aid in deep gratitude for the elder monks who guide our community.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-15T06:00:00Z',
      rejoiceCount: 15,
      comments: [
        {
          id: 'c4',
          authorName: 'Venerable Abbot Tam Duc',
          authorRole: 'monk',
          monkTitle: 'Venerable Abbot Tam Duc',
          commentText: 'Sadhu! The medicine purchased has already eased Brother Giac Dinh recovery.',
          createdAt: '2026-09-15T07:30:00Z'
        }
      ]
    }
  },
  {
    id: 'd4',
    txHash: '0x7f2c1990',
    donorName: 'The Nguyen Family',
    isAnonymous: false,
    amount: 75,
    fundId: 'alms',
    date: '2026-09-16',
    prayerIntention: {
      id: 'p4',
      category: 'memorial',
      dedicationText: 'In loving memory of Patriarch Nguyen Van Thanh. May his gentle soul dwell in the Pure Land.',
      isPublic: true,
      blessingStatus: 'blessed',
      blessedAt: '2026-09-17T06:00:00Z',
      rejoiceCount: 21,
      comments: [
        {
          id: 'c5',
          authorName: 'Venerable Abbot Tam Duc',
          authorRole: 'monk',
          monkTitle: 'Venerable Abbot Tam Duc',
          commentText: 'His memory continues to bear sweet fruit through your generous heart. Amitabha Buddha.',
          createdAt: '2026-09-17T06:45:00Z'
        }
      ]
    }
  },
  {
    id: 'd5',
    txHash: '0x2a8f001c',
    donorName: 'Anonymous Devotee',
    isAnonymous: true,
    amount: 150,
    fundId: 'utilities',
    date: '2026-09-16',
    prayerIntention: {
      id: 'p5',
      category: 'gratitude',
      dedicationText: 'May the temple bells and light continue to inspire seekers of inner peace.',
      isPublic: true,
      blessingStatus: 'queued',
      rejoiceCount: 5,
      comments: []
    }
  },
  {
    id: 'd6',
    txHash: '0x4b77ee12',
    donorName: 'Devotee Sarah Jenkins',
    isAnonymous: false,
    amount: 35,
    fundId: 'healthcare',
    date: '2026-09-17',
    prayerIntention: {
      id: 'p6',
      category: 'healing',
      dedicationText: 'Wishing strength and speedy healing for all sentient beings suffering from illness.',
      isPublic: true,
      blessingStatus: 'queued',
      rejoiceCount: 3,
      comments: []
    }
  },
  {
    id: 'd7',
    txHash: '0x99a1ee34',
    donorName: 'Devotee Le Quang Bao',
    isAnonymous: false,
    amount: 80,
    fundId: 'education',
    date: '2026-09-16',
    prayerIntention: {
      id: 'p7',
      category: 'peace',
      dedicationText: 'For clarity of mind and wisdom for young students during exam season.',
      isPublic: true,
      blessingStatus: 'queued',
      rejoiceCount: 6,
      comments: []
    }
  }
];

export const initialTransactions: MonasteryTransaction[] = [
  {
    id: 'tx-1',
    txHash: '0xa49f7b11',
    date: '2026-09-16',
    fundId: 'alms',
    inputs: [
      { donationId: 'd1', txHash: '0x8e2a149f', donorName: 'Devotee Ananda', amountContributed: 50 },
      { donationId: 'd2', txHash: '0x3c1b8201', donorName: 'Devotee Linh Nguyen', amountContributed: 40 }
    ],
    spentOutput: {
      id: 's1',
      merchant: 'Green Valley Farmers Market',
      amount: 72.50,
      items: [
        'Organic Tofu (Firm, 15 blocks)',
        'Jasmine Brown Rice (25kg bag)',
        'Fresh Bok Choy & Seasonal Greens',
        'Cold-pressed Sesame Oil'
      ],
      purpose: 'Nutritious breakfast and lunch for 35 resident monks and visiting pilgrims',
      receiptImageUrl: '/docs/mockups/screen2-transparency-ledger.jpg',
      receiptHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verifiedBy: 'Monastery Kitchen Steward Thich Minh Thong',
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
      { donationId: 'd3', txHash: '0x5d9e4412', donorName: 'Devotee Tran Van Duc', amountContributed: 100 }
    ],
    spentOutput: {
      id: 's2',
      merchant: 'Dharma Herbals & Community Pharmacy',
      amount: 86.25,
      items: [
        'Ginseng Herbal Tonic for Elderly Monks',
        'Medical Gauze & Antiseptic Ointment',
        'Blood Pressure Monitor Cuff Replacement'
      ],
      purpose: 'Prescription medicines and geriatric health care supplies for senior monks',
      receiptImageUrl: '/docs/mockups/transparency_ledger_1789656370602.jpg',
      receiptHash: 'sha256:8f4c281a99ef87b001a45cbef712431289fe1234abcd5678ef0123456789abcd',
      verifiedBy: 'Monastery Health Care Attendant Bhikkhu Tam Tinh',
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
      { donationId: 'd5', txHash: '0x2a8f001c', donorName: 'Anonymous Devotee', amountContributed: 150 }
    ],
    spentOutput: {
      id: 's3',
      merchant: 'Pure Mountain Solar & Electric Co.',
      amount: 124.80,
      items: [
        'Main Meditation Hall Solar Inverter Maintenance',
        'Clean Water Filter Cartridge 5-Stage Replacement'
      ],
      purpose: 'Solar battery maintenance and clean drinking water filtration for meditation retreat hall',
      receiptImageUrl: '/docs/mockups/screen2-transparency-ledger.jpg',
      receiptHash: 'sha256:4a8b11cdef9012345678abcdef9012345678abcdef9012345678abcdef901234',
      verifiedBy: 'Monastery Operations Steward Thich Quang Hien',
      verifiedAt: '2026-09-16'
    },
    changeOutput: {
      amount: 25.20,
      destinationFundId: 'utilities'
    }
  }
];
