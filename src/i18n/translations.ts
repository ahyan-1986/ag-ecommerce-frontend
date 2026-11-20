export type Language = 'bm' | 'en' | 'cn'

export interface TranslationDict {
  brand: {
    name: string
    slogan: string
    tagline: string
    halalBadge: string
    plantBased: string
    noSugar: string
  }
  nav: {
    home: string
    products: string
    prebioticBenefits: string
    mlmOpportunity: string
    testimonials: string
    aiNutriAdvisor: string
    login: string
    register: string
    dashboard: string
    portal: string
    cart: string
    orders: string
    wallet: string
    profile: string
    logout: string
  }
  hero: {
    tag: string
    titlePart1: string
    titlePart2: string
    titlePart3: string
    description: string
    halalTitle: string
    halalDesc: string
    fibreTitle: string
    fibreDesc: string
    botanicalTitle: string
    botanicalDesc: string
    exploreBtn: string
    joinMlmBtn: string
    socialProof: string
    floatingBadgeTitle: string
    floatingBadgeSub: string
  }
  dopamine: {
    tag: string
    title: string
    subtitle: string
    keyBenefits: string
    targetAudience: string
    tasteProfile: string
    customerPrice: string
    dealerPrice: string
    buyNow: string
    registerWholesale: string
  }
  fibreRoutine: {
    tag: string
    title: string
    description: string
    step1Title: string
    step1Desc: string
    step2Title: string
    step2Desc: string
    step3Title: string
    step3Desc: string
    nutriBoxTitle: string
    inulinVal: string
    inulinLabel: string
    inulinSub: string
    plantVal: string
    plantLabel: string
    plantSub: string
    sugarVal: string
    sugarLabel: string
    sugarSub: string
    antioxVal: string
    antioxLabel: string
    antioxSub: string
    confusedTitle: string
    confusedDesc: string
    askAiBtn: string
  }
  mlm: {
    tag: string
    title: string
    subtitle: string
    card1Title: string
    card1Desc: string
    card1Check: string
    card2Title: string
    card2Desc: string
    card2Check: string
    card3Title: string
    card3Desc: string
    card3Check: string
    joinBtn: string
    instantApproval: string
  }
  testimonials: {
    tag: string
    title: string
  }
  shop: {
    bannerTag: string
    bannerTitle: string
    bannerDesc: string
    searchPlaceholder: string
    allCategories: string
    noProducts: string
    noProductsSub: string
    retailPrice: string
    wholesalePrice: string
    viewDetails: string
  }
  productDetail: {
    backToShop: string
    inStock: string
    brand: string
    benefitsTitle: string
    quantity: string
    totalAmount: string
    addToCart: string
    addedToCart: string
    loginToBuy: string
    howToConsume: string
    ingredients: string
    nutritionFacts: string
    halalCert: string
    bvLabel: string
    pvLabel: string
  }
  aiChat: {
    title: string
    subtitle: string
    activeStatus: string
    greeting: string
    thinking: string
    placeholder: string
    quickPrompts: string[]
  }
  auth: {
    backToHome: string
    portalBadge: string
    loginTitle: string
    loginSubtitle: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    forgotPassword: string
    loginButton: string
    loggingIn: string
    noAccountPrompt: string
    registerNow: string
    registerTitle: string
    registerSubtitle: string
    registerBadge: string
    firstNameLabel: string
    firstNamePlaceholder: string
    lastNameLabel: string
    lastNamePlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    referralCodeLabel: string
    referralCodePlaceholder: string
    optional: string
    registerButton: string
    registering: string
    haveAccountPrompt: string
    loginHere: string
    emailVerificationTitle: string
    emailVerificationDesc: string
    forgotPasswordTitle: string
    forgotPasswordSubtitle: string
    sendResetLink: string
    sending: string
    resetSentTitle: string
    resetSentDesc: string
  }
  member: {
    welcomeBack: string
    communityTag: string
    buyProducts: string
    wellnessGoals: string
    recentOrders: string
    noOrdersYet: string
    viewAllOrders: string
    goldMember: string
    cashWallet: string
    pointsWallet: string
    editProfile: string
    saveChanges: string
    saving: string
    profileSaved: string
    sponsorInfo: string
    noSponsor: string
    foundingPartner: string
    sponsorCode: string
    quickActions: string
    myOrders: string
    rewardsReferral: string
    digitalWallet: string
  }
  footer: {
    about: string
    productLinks: string
    systemLinks: string
    contactUs: string
    operationHours: string
    rightsReserved: string
    privacyPolicy: string
    terms: string
    refundPolicy: string
  }
}

export const translations: Record<Language, TranslationDict> = {
  bm: {
    brand: {
      name: 'Ascend Group',
      slogan: 'NOURISH • NURTURE • NATURE',
      tagline: 'Pemakanan Kesihatan & Komuniti Usahawan Moden',
      halalBadge: '100% Halal Diiktiraf',
      plantBased: 'Berasaskan Tumbuhan',
      noSugar: 'Tanpa Gula Tambahan',
    },
    nav: {
      home: 'Utama',
      products: 'Produk',
      prebioticBenefits: 'Khasiat',
      mlmOpportunity: 'Peluang Usahawan',
      testimonials: 'Testimoni',
      aiNutriAdvisor: 'AI Nutri-Advisor',
      login: 'Log Masuk',
      register: 'Daftar',
      dashboard: 'Papan Pemuka',
      portal: 'Portal Rakan Niaga',
      cart: 'Troli Belian',
      orders: 'Pesanan Saya',
      wallet: 'Dompet Digital',
      profile: 'Profil Pengguna',
      logout: 'Log Keluar',
    },
    hero: {
      tag: 'Nourish • Nurture • Nature | Revolusi Kesihatan Semulajadi',
      titlePart1: 'Kebaikan Semulajadi Untuk ',
      titlePart2: 'Ibu & Keluarga ',
      titlePart3: 'Malaysia',
      description: 'Ascend Group membawakan rangkaian makanan kesihatan prebiotik & minuman botani berkhasiat dengan warna-warna ceria Dopamine Vibes. 100% Halal, tanpa gula tambahan, kaya serat mikrobiom usus untuk keceriaan seisi keluarga.',
      halalTitle: '100% Halal',
      halalDesc: 'Selamat & Suci',
      fibreTitle: 'Serat Prebiotik',
      fibreDesc: 'Kesihatan Usus',
      botanicalTitle: 'Herba Tradisi',
      botanicalDesc: 'Kacip Fatimah & Buah',
      exploreBtn: 'Terokai Koleksi Produk',
      joinMlmBtn: 'Jadi Usahawan Ascend Group',
      socialProof: 'Dipercayai oleh lebih 50,000+ ibu & keluarga di Malaysia',
      floatingBadgeTitle: 'Prebiotik Ubi Ungu',
      floatingBadgeSub: '10.4g Serat Semulajadi / Hidangan',
    },
    dopamine: {
      tag: '✨ Koleksi Warna Dopamine',
      title: 'Pilihan Nutrisi Lengkap Untuk Setiap Keperluan',
      subtitle: 'Setiap produk direka khas dengan warna dopamine bertenaga bagi membangkitkan mood ceria, kesihatan usus, dan kecantikan dalaman anda.',
      keyBenefits: 'Khasiat & Kebaikan Utama:',
      targetAudience: 'Sasaran Pengguna:',
      tasteProfile: 'Profil Rasa:',
      customerPrice: 'Harga Pelanggan:',
      dealerPrice: 'Harga Usahawan:',
      buyNow: 'Beli Sekarang',
      registerWholesale: 'Daftar Usahawan Borong',
    },
    fibreRoutine: {
      tag: '🌿 Panduan Kesihatan Harian',
      title: 'Bina Rutin Serat Harian Anda Dengan Mudah & Berkesan',
      description: '70% sistem imun badan bermula dari usus yang sihat. Rangkaian minuman prebiotik Ascend Group membekalkan serat larut inulin semulajadi yang bertindak sebagai makanan kepada bakteria baik di dalam sistem penghadaman.',
      step1Title: 'Pagi: Segar & Berseri',
      step1Desc: 'Mulakan hari dengan 1 sachet Ascend Berry Bloom atau Prebiotik Ubi Ungu untuk melancarkan pembuangan air besar dan mengembalikan seri wajah.',
      step2Title: 'Tengah Hari: Tenaga Superfood',
      step2Desc: 'Nikmati Prebiotik Avokado & Moringa atau Mangga Passion sebagai snek sihat tanpa gula tambahan bagi mengelakkan rasa lesu.',
      step3Title: 'Malam: Rehat & Kenyang Ringan',
      step3Desc: 'Secawan Prebiotik Koko Gelap & Oat suam mengurangkan rasa lapar malam sambil membekalkan beta-glukan untuk kestabilan kolesterol.',
      nutriBoxTitle: 'Kandungan Nutrisi Setiap Hidangan',
      inulinVal: '10.4g',
      inulinLabel: 'Serat Inulin Prebiotik',
      inulinSub: 'Membina bakteria baik usus',
      plantVal: '100%',
      plantLabel: 'Berasaskan Tumbuhan',
      plantSub: 'Bebas laktosa & selamat',
      sugarVal: '0g',
      sugarLabel: 'Gula Tambahan',
      sugarSub: 'Pemanis semulajadi sihat',
      antioxVal: '8K+',
      antioxLabel: 'Polifenol & Antioksidan',
      antioxSub: 'Perlindungan sel optimum',
      confusedTitle: 'Keliru Memilih Produk?',
      confusedDesc: 'Dapatkan cadangan peribadi dari Penasihat AI kami',
      askAiBtn: 'Tanya AI Sekarang',
    },
    mlm: {
      tag: '👑 Program Usahawan Komuniti Ascend Group',
      title: 'Bina Pendapatan Bersama Produk Kesihatan Permintaan Tinggi',
      subtitle: 'Sertai ribuan wanita dan suri rumah yang berjaya menjana pendapatan bulanan melalui sistem perkongsian keuntungan MLM telus Ascend Group.',
      card1Title: 'Keuntungan Runcit & Borong 30% - 40%',
      card1Desc: 'Nikmati harga belian borong serendah RM 42 seunit dengan margin keuntungan terus yang tinggi pada setiap pesanan pelanggan anda.',
      card1Check: 'Modal Permulaan Rendah',
      card2Title: 'Bonus Kumpulan Rangkaian (3 Peringkat)',
      card2Desc: 'Sistem peratusan komisen bertingkat (5% Level 1, 3% Level 2, 1% Level 3) yang diagihkan secara automatik terus ke Dompet Digital anda.',
      card2Check: 'Bayaran Bonus Pantas',
      card3Title: 'Sokongan Bahan Pemasaran & AI',
      card3Desc: 'Disediakan poster media sosial, copywriting WhatsApp, video promosi, dan pautan rujukan unik untuk memudahkan perkongsian.',
      card3Check: 'Bimbingan & Latihan Disediakan',
      joinBtn: 'Daftar Sebagai Rakan Niaga Ascend Group',
      instantApproval: 'Pendaftaran mudah & kelulusan akaun serta-merta',
    },
    testimonials: {
      tag: '💖 Suara Komuniti',
      title: 'Apa Kata Pengguna & Usahawan Kami',
    },
    shop: {
      bannerTag: 'Koleksi Makanan Kesihatan Dopamine',
      bannerTitle: 'Nutrisi Semulajadi & Halal Untuk Seisi Keluarga',
      bannerDesc: '100% berasaskan tumbuhan, kaya serat prebiotik tanpa gula tambahan. Dapatkan harga diskaun borong khas untuk usahawan berdaftar.',
      searchPlaceholder: 'Cari minuman prebiotik, herba botani, khasiat kesihatan…',
      allCategories: 'Semua Koleksi',
      noProducts: 'Tiada produk ditemui',
      noProductsSub: 'Cuba kata kunci carian yang lain atau pilih kategori berbeza.',
      retailPrice: 'Harga Runcit:',
      wholesalePrice: 'Borong:',
      viewDetails: 'Lihat Info & Beli',
    },
    productDetail: {
      backToShop: 'Kembali ke Kedai',
      inStock: 'Stok Sedia Ada (In Stock)',
      brand: 'Ascend Group',
      benefitsTitle: 'Kebaikan & Khasiat Kesihatan:',
      quantity: 'Kuantiti Pesanan:',
      totalAmount: 'Jumlah Bayaran:',
      addToCart: 'Tambah Ke Troli Belian',
      addedToCart: 'Telah Ditambah ke Troli!',
      loginToBuy: 'Log Masuk Untuk Membeli',
      howToConsume: 'Cara Pengambilan',
      ingredients: 'Bahan Aktif',
      nutritionFacts: 'Fakta Nutrisi',
      halalCert: '100% Halal Diiktiraf',
      bvLabel: 'Nilai BV:',
      pvLabel: 'Nilai PV:',
    },
    aiChat: {
      title: 'AI Nutri-Advisor Ascend Group',
      subtitle: 'Penasihat Kesihatan & Nutrisi Pintar 24/7',
      activeStatus: 'Aktif',
      greeting: 'Salam sejahtera! Saya Penasihat Nutrisi & Kesihatan AI Ascend Group 🌿. Bagaimana saya boleh bantu anda hari ini? Anda boleh tanya mengenai khasiat minuman prebiotik, penjagaan kesihatan wanita, rutin serat keluarga, atau cara jana pendapatan sebagai Usahawan Ascend Group!',
      thinking: 'AI sedang menganalisis panduan nutrisi',
      placeholder: 'Taip soalan mengenai kesihatan usus, herba botani, atau cara belian…',
      quickPrompts: [
        'Saya selalu kembung perut & sembelit, produk mana paling sesuai?',
        'Apakah khasiat Ascend Berry Bloom Kranberi & Kacip Fatimah?',
        'Bolehkah ibu mengandung minum Prebiotik Ubi Ungu?',
        'Bagaimanakah sistem komisen Usahawan Ascend Group berfungsi?',
      ],
    },
    auth: {
      backToHome: 'Kembali ke Laman Utama',
      portalBadge: 'Portal Ahli & Usahawan',
      loginTitle: 'Log Masuk Akaun',
      loginSubtitle: 'Masukkan emel dan kata laluan untuk mengakses akaun anda',
      emailLabel: 'Alamat Emel',
      emailPlaceholder: 'anda@contoh.com',
      passwordLabel: 'Kata Laluan',
      passwordPlaceholder: '••••••••',
      forgotPassword: 'Lupa kata laluan?',
      loginButton: 'Log Masuk Akaun',
      loggingIn: 'Sedang Log Masuk...',
      noAccountPrompt: 'Belum mempunyai akaun?',
      registerNow: 'Daftar Sekarang (Percuma)',
      registerTitle: 'Sertai Komuniti Ascend Group',
      registerSubtitle: 'Nikmati diskaun harga borong sehingga 35% dan ganjaran komisen affiliate',
      registerBadge: 'Daftar Ahli & Usahawan',
      firstNameLabel: 'Nama Pertama',
      firstNamePlaceholder: 'Contoh: Siti',
      lastNameLabel: 'Nama Akhir',
      lastNamePlaceholder: 'Contoh: Aminah',
      phoneLabel: 'Nombor Telefon (WhatsApp)',
      phonePlaceholder: '0123456789',
      referralCodeLabel: 'Kod Rujukan Penaja',
      referralCodePlaceholder: 'Contoh: AM888',
      optional: 'Pilihan',
      registerButton: 'Daftar Sebagai Ahli / Usahawan',
      registering: 'Mendaftar Akaun...',
      haveAccountPrompt: 'Sudah mempunyai akaun?',
      loginHere: 'Log Masuk Di Sini',
      emailVerificationTitle: 'Sila Sahkan Emel Anda',
      emailVerificationDesc: 'Pautan pengesahan telah dihantar ke alamat emel anda. Sila klik pautan tersebut untuk mengaktifkan akaun Ascend Group.',
      forgotPasswordTitle: 'Lupa Kata Laluan?',
      forgotPasswordSubtitle: 'Masukkan alamat emel akaun anda dan kami akan menghantar pautan reset kata laluan.',
      sendResetLink: 'Hantar Pautan Reset',
      sending: 'Menghantar...',
      resetSentTitle: 'Emel Dihantar',
      resetSentDesc: 'Sila periksa peti masuk emel anda untuk pautan menetapkan semula kata laluan.',
    },
    member: {
      welcomeBack: 'Selamat Kembali',
      communityTag: 'Komuniti Pemakanan Kesihatan & Nutrisi Semulajadi Ascend Group',
      buyProducts: 'Beli Produk Kesihatan',
      wellnessGoals: 'Rutin & Sasaran Kesihatan Harian',
      recentOrders: 'Pesanan Terkini',
      noOrdersYet: 'Belum ada pesanan lagi.',
      viewAllOrders: 'Lihat Semua Pesanan',
      goldMember: 'Ahli Emas (Gold Member)',
      cashWallet: 'Baki Tunai Dompet',
      pointsWallet: 'Mata Ganjaran',
      editProfile: 'Kemaskini Profil',
      saveChanges: 'Simpan Perubahan',
      saving: 'Menyimpan...',
      profileSaved: 'Profil berjaya dikemaskini!',
      sponsorInfo: 'Maklumat Penaja',
      noSponsor: 'Anda mendaftar tanpa penaja.',
      foundingPartner: 'Status: Ahli Pengasas (Founding Partner)',
      sponsorCode: 'Kod Penaja',
      quickActions: 'Tindakan Pantas',
      myOrders: 'Pesanan Saya',
      rewardsReferral: 'Ganjaran Rujukan',
      digitalWallet: 'Dompet Digital',
    },
    footer: {
      about: 'Ascend Group adalah platform pemakanan kesihatan berasaskan tumbuhan dan sistem perkongsian usahawan pintar khas untuk komuniti keluarga moden di Malaysia.',
      productLinks: 'Koleksi Produk',
      systemLinks: 'Peluang & Sistem',
      contactUs: 'Hubungi Kami',
      operationHours: 'Waktu Operasi: 9:00 AM - 6:00 PM',
      rightsReserved: 'Hak Cipta Terpelihara.',
      privacyPolicy: 'Dasar Privasi',
      terms: 'Terma & Syarat',
      refundPolicy: 'Polisi Pemulangan',
    },
  },

  en: {
    brand: {
      name: 'Ascend Group',
      slogan: 'NOURISH • NURTURE • NATURE',
      tagline: 'Health Nutrition & Modern Entrepreneur Community',
      halalBadge: '100% Certified Halal',
      plantBased: '100% Plant-Based',
      noSugar: 'Zero Added Sugar',
    },
    nav: {
      home: 'Home',
      products: 'Products',
      prebioticBenefits: 'Benefits',
      mlmOpportunity: 'Entrepreneur',
      testimonials: 'Reviews',
      aiNutriAdvisor: 'AI Nutri-Advisor',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      portal: 'Partner Portal',
      cart: 'Cart',
      orders: 'My Orders',
      wallet: 'E-Wallet',
      profile: 'My Profile',
      logout: 'Sign Out',
    },
    hero: {
      tag: 'Nourish • Nurture • Nature | Natural Wellness Revolution',
      titlePart1: 'Natural Wholesome Goodness for ',
      titlePart2: 'Mothers & Families ',
      titlePart3: 'in Malaysia',
      description: 'Ascend Group delivers nutritious plant-based prebiotic drinks and botanical wellness remedies with uplifting Dopamine Vibes. 100% Halal, zero added sugar, packed with gut microbiome fibre for the whole family.',
      halalTitle: '100% Halal',
      halalDesc: 'Safe & Pure',
      fibreTitle: 'Prebiotic Fibre',
      fibreDesc: 'Gut Wellness',
      botanicalTitle: 'Heritage Herbs',
      botanicalDesc: 'Kacip Fatimah & Fruits',
      exploreBtn: 'Explore Products',
      joinMlmBtn: 'Join Ascend Group Business',
      socialProof: 'Trusted by over 50,000+ mothers and families across Malaysia',
      floatingBadgeTitle: 'Purple Sweet Potato Prebiotic',
      floatingBadgeSub: '10.4g Natural Dietary Fibre / Serving',
    },
    dopamine: {
      tag: '✨ Dopamine Color Lineup',
      title: 'Complete Functional Nutrition for Every Need',
      subtitle: 'Each product is crafted with vibrant dopamine colors to boost mood, enhance gut vitality, and bring out your natural glow.',
      keyBenefits: 'Key Health Benefits:',
      targetAudience: 'Target Audience:',
      tasteProfile: 'Flavor Profile:',
      customerPrice: 'Retail Price:',
      dealerPrice: 'Wholesale Price:',
      buyNow: 'Buy Now',
      registerWholesale: 'Register as Wholesale Dealer',
    },
    fibreRoutine: {
      tag: '🌿 Daily Wellness Guide',
      title: 'Build Your Daily Fibre Routine with Ease & Confidence',
      description: '70% of the body\'s immune system originates in the gut. Ascend Group\'s prebiotic series delivers natural soluble inulin fibre to nourish good microbiome bacteria in your digestive system.',
      step1Title: 'Morning: Glow & Refresh',
      step1Desc: 'Start your morning with 1 sachet of Ascend Berry Bloom or Purple Sweet Potato Prebiotic to promote smooth digestion and radiant skin.',
      step2Title: 'Noon: Superfood Energy',
      step2Desc: 'Enjoy Avocado Moringa or Mango Passion as an afternoon energy boost without added sugar to prevent fatigue.',
      step3Title: 'Night: Relax & Satiated',
      step3Desc: 'A warm cup of Dark Cocoa & Oat reduces late-night hunger cravings while supplying beta-glucans for cholesterol balance.',
      nutriBoxTitle: 'Nutritional Value Per Serving',
      inulinVal: '10.4g',
      inulinLabel: 'Prebiotic Inulin Fibre',
      inulinSub: 'Nourishes beneficial gut flora',
      plantVal: '100%',
      plantLabel: 'Plant-Based Goodness',
      plantSub: 'Lactose-free & family safe',
      sugarVal: '0g',
      sugarLabel: 'Added White Sugar',
      sugarSub: 'Naturally healthy sweetness',
      antioxVal: '8K+',
      antioxLabel: 'Polyphenols & Antioxidants',
      antioxSub: 'Optimal cell defense',
      confusedTitle: 'Need Help Choosing?',
      confusedDesc: 'Get personalized recommendations from our AI Nutritionist',
      askAiBtn: 'Chat with AI Now',
    },
    mlm: {
      tag: '👑 Ascend Group Community Entrepreneur Program',
      title: 'Generate Rewarding Income with High-Demand Health Foods',
      subtitle: 'Join thousands of women and mothers achieving financial freedom through Ascend Group’s transparent 3-tier MLM profit sharing model.',
      card1Title: '30% - 40% Retail & Wholesale Profit',
      card1Desc: 'Enjoy wholesale purchasing prices as low as RM 42/unit with immediate retail profit margins on every order.',
      card1Check: 'Low Startup Capital',
      card2Title: '3-Tier Network Override Bonus',
      card2Desc: 'Tiered commission structure (5% Level 1, 3% Level 2, 1% Level 3) paid out seamlessly directly to your Digital Wallet.',
      card2Check: 'Fast Bonus Payouts',
      card3Title: 'Marketing Collateral & AI Support',
      card3Desc: 'Access social media templates, WhatsApp scripts, video assets, and unique affiliate tracking links for easy sharing.',
      card3Check: 'Full Training Provided',
      joinBtn: 'Become an Ascend Group Partner',
      instantApproval: 'Instant account setup & easy activation',
    },
    testimonials: {
      tag: '💖 Community Voices',
      title: 'What Our Customers & Entrepreneurs Say',
    },
    shop: {
      bannerTag: 'Dopamine Health Food Collection',
      bannerTitle: 'Pure & Certified Halal Nutrition for the Entire Family',
      bannerDesc: '100% plant-based, prebiotic fibre rich with zero added sugar. Unlock exclusive wholesale pricing for registered consultants.',
      searchPlaceholder: 'Search prebiotic drinks, botanicals, wellness benefits…',
      allCategories: 'All Categories',
      noProducts: 'No products found',
      noProductsSub: 'Try adjusting your search terms or selecting a different category.',
      retailPrice: 'Retail Price:',
      wholesalePrice: 'Wholesale:',
      viewDetails: 'View Info & Buy',
    },
    productDetail: {
      backToShop: 'Back to Shop',
      inStock: 'In Stock',
      brand: 'Ascend Group',
      benefitsTitle: 'Health Benefits & Active Efficacy:',
      quantity: 'Order Quantity:',
      totalAmount: 'Total Amount:',
      addToCart: 'Add to Shopping Cart',
      addedToCart: 'Added to Cart Successfully!',
      loginToBuy: 'Login to Purchase',
      howToConsume: 'How to Consume',
      ingredients: 'Active Ingredients',
      nutritionFacts: 'Nutrition Facts',
      halalCert: '100% Certified Halal',
      bvLabel: 'BV Value:',
      pvLabel: 'PV Value:',
    },
    aiChat: {
      title: 'Ascend Group AI Nutri-Advisor',
      subtitle: '24/7 Smart Health & Nutrition Consultant',
      activeStatus: 'Active',
      greeting: 'Hello and welcome! I am Ascend Group\'s AI Nutrition & Wellness Advisor 🌿. How can I assist you today? Feel free to ask about our prebiotic drink benefits, women\'s botanical wellness, family fibre routines, or our MLM business opportunities!',
      thinking: 'AI is analyzing nutritional guidance',
      placeholder: 'Ask anything about gut health, heritage botanicals, or ordering…',
      quickPrompts: [
        'I suffer from bloating and constipation, which product is best?',
        'What are the health benefits of Ascend Berry Bloom Cranberry & Kacip Fatimah?',
        'Is Purple Sweet Potato Prebiotic safe for pregnant mothers?',
        'How does Ascend Group\'s consultant commission system work?',
      ],
    },
    auth: {
      backToHome: 'Back to Home',
      portalBadge: 'Member & Entrepreneur Portal',
      loginTitle: 'Sign In to Your Account',
      loginSubtitle: 'Enter your email and password to access your account',
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      forgotPassword: 'Forgot password?',
      loginButton: 'Sign In',
      loggingIn: 'Signing In...',
      noAccountPrompt: 'Don\'t have an account?',
      registerNow: 'Register Now (Free)',
      registerTitle: 'Join the Ascend Group Community',
      registerSubtitle: 'Enjoy up to 35% wholesale member discount and 3-tier affiliate commissions',
      registerBadge: 'Register Member / Partner',
      firstNameLabel: 'First Name',
      firstNamePlaceholder: 'e.g. Sarah',
      lastNameLabel: 'Last Name',
      lastNamePlaceholder: 'e.g. Lee',
      phoneLabel: 'Phone Number (WhatsApp)',
      phonePlaceholder: '0123456789',
      referralCodeLabel: 'Sponsor Referral Code',
      referralCodePlaceholder: 'e.g. AM888',
      optional: 'Optional',
      registerButton: 'Register as Member / Entrepreneur',
      registering: 'Registering...',
      haveAccountPrompt: 'Already have an account?',
      loginHere: 'Sign In Here',
      emailVerificationTitle: 'Please Verify Your Email',
      emailVerificationDesc: 'A verification link has been sent to your email address. Please click the link to activate your Ascend Group account.',
      forgotPasswordTitle: 'Forgot Password?',
      forgotPasswordSubtitle: 'Enter your registered email address and we will send you a password reset link.',
      sendResetLink: 'Send Reset Link',
      sending: 'Sending...',
      resetSentTitle: 'Reset Email Sent',
      resetSentDesc: 'Please check your inbox for the password reset link.',
    },
    member: {
      welcomeBack: 'Welcome Back',
      communityTag: 'Ascend Group Natural Health & Nutrition Community',
      buyProducts: 'Shop Wellness Products',
      wellnessGoals: 'Daily Wellness Routine & Goals',
      recentOrders: 'Recent Orders',
      noOrdersYet: 'No orders placed yet.',
      viewAllOrders: 'View All Orders',
      goldMember: 'Gold Member',
      cashWallet: 'Cash Wallet Balance',
      pointsWallet: 'Reward Points',
      editProfile: 'Edit Profile Details',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      profileSaved: 'Profile updated successfully!',
      sponsorInfo: 'Sponsor Information',
      noSponsor: 'Registered without a sponsor.',
      foundingPartner: 'Status: Founding Partner',
      sponsorCode: 'Sponsor Code',
      quickActions: 'Quick Actions',
      myOrders: 'My Orders',
      rewardsReferral: 'Referral Rewards',
      digitalWallet: 'Digital Wallet',
    },
    footer: {
      about: 'Ascend Group is a modern plant-based health food brand and smart entrepreneur network built for families across Malaysia.',
      productLinks: 'Product Lineup',
      systemLinks: 'Business & System',
      contactUs: 'Contact Us',
      operationHours: 'Hours: 9:00 AM - 6:00 PM',
      rightsReserved: 'All Rights Reserved.',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Service',
      refundPolicy: 'Refund Policy',
    },
  },

  cn: {
    brand: {
      name: 'Ascend Group',
      slogan: '养护 • 滋养 • 自然',
      tagline: '天然健康营养食品与现代女性创业家社群',
      halalBadge: '100% 清真认证 (Halal)',
      plantBased: '100% 纯植物基',
      noSugar: '无添加蔗糖',
    },
    nav: {
      home: '首页',
      products: '产品系列',
      prebioticBenefits: '益生元功效',
      mlmOpportunity: '创业合伙',
      testimonials: '真实好评',
      aiNutriAdvisor: 'AI 营养健康顾问',
      login: '登录',
      register: '注册',
      dashboard: '用户后台',
      portal: '创业伙伴中心',
      cart: '购物车',
      orders: '我的订单',
      wallet: '数字钱包',
      profile: '个人资料',
      logout: '退出登录',
    },
    hero: {
      tag: '养护 • 滋养 • 自然 | 天然健康新风尚',
      titlePart1: '赋能马来西亚 ',
      titlePart2: '妈妈与现代家庭 ',
      titlePart3: '的纯净天然滋养',
      description: 'Ascend Group（Ascend Group）甄选天然植物基益生元与珍贵草本，融合让人心生欢愉的“多巴胺”缤纷色彩。100% 清真认证、零添加糖、富含肠道益生元纤维，为全家人注入满满健康活力。',
      halalTitle: '100% 清真',
      halalDesc: '安全纯正保障',
      fibreTitle: '高纤益生元',
      fibreDesc: '呵护肠道健康',
      botanicalTitle: '传统草本',
      botanicalDesc: '卡琪花蒂玛与超级水果',
      exploreBtn: '探索健康产品',
      joinMlmBtn: '加入Ascend Group创业平台',
      socialProof: '深受全马超过 50,000+ 妈妈与家庭信赖好评',
      floatingBadgeTitle: '紫薯益生元高纤饮',
      floatingBadgeSub: '每份含 10.4g 天然益生元菊粉',
    },
    dopamine: {
      tag: '✨ 多巴胺缤纷活力系列',
      title: '为每一种健康需求打造的全方位营养配方',
      subtitle: '每一款产品均采用多巴胺明快色调，唤醒愉悦好心情，呵护肠道微生态，绽放由内而外的自然光彩。',
      keyBenefits: '核心健康益处：',
      targetAudience: '适饮人群：',
      tasteProfile: '风味口感：',
      customerPrice: '零售价：',
      dealerPrice: '创业批发价：',
      buyNow: '立即购买',
      registerWholesale: '注册成为批发伙伴',
    },
    fibreRoutine: {
      tag: '🌿 每日纤维健康指南',
      title: '轻松打造您的日常膳食纤维健康习惯',
      description: '人体的70%免疫力源自健康肠道。Ascend Group 益生元系列精选天然菊粉，为肠道有益菌提供充足养分，维持微生态平衡。',
      step1Title: '早晨：清盈透亮',
      step1Desc: '晨起饮用 1 包 Ascend Berry Bloom 或紫薯益生元，促进肠道蠕动排毒，焕发红润气色。',
      step2Title: '午间：超级食物能量补给',
      step2Desc: '下午来一杯牛油果辣木或芒果百香果益生元饮，告别午后疲惫，无糖负担。',
      step3Title: '晚间：舒畅轻饱腹',
      step3Desc: '睡前一杯温热的浓黑可可全麦燕麦饮，富含燕麦葡聚糖，守护心血管健康并提供轻盈饱腹感。',
      nutriBoxTitle: '每份营养含量核心数据',
      inulinVal: '10.4g',
      inulinLabel: '益生元天然菊粉',
      inulinSub: '滋养肠道有益菌群',
      plantVal: '100%',
      plantLabel: '纯植物基配方',
      plantSub: '无乳糖，全家安心饮用',
      sugarVal: '0g',
      sugarLabel: '无添加蔗糖',
      sugarSub: '天然果蔬健康微甜',
      antioxVal: '8K+',
      antioxLabel: '天然多酚与抗氧化物',
      antioxSub: '细胞级抗氧化防护',
      confusedTitle: '不知道如何选择？',
      confusedDesc: '获取 AI 营养顾问为您量身定制的健康建议',
      askAiBtn: '立即咨询 AI',
    },
    mlm: {
      tag: '👑 Ascend Group社群创业家计划',
      title: '携手高复购健康食品，开启丰厚稳健的创业收入',
      subtitle: '加入数千名现代女性与全职宝妈行列，通过 Ascend Group 公平透明的三级分销 MLM 盈利模式实现财富自主。',
      card1Title: '30% - 40% 零售与批发利润',
      card1Desc: '享受低至 RM 42 的批发进货价，每一单客户零售都拥有高额丰厚的利润回报。',
      card1Check: '低启动门槛',
      card2Title: '三级团队网络分红',
      card2Desc: '多层级佣金比例（第1层 5%、第2层 3%、第3层 1%），系统自动核算并即时派发至数字钱包。',
      card2Check: '提现迅速安全',
      card3Title: '全套营销素材与 AI 辅助',
      card3Desc: '提供社媒宣传海报、WhatsApp 转化话术、短视频素材及专属分销链接，轻松开展分享。',
      card3Check: '提供全程培训支持',
      joinBtn: '成为Ascend Group创业合伙人',
      instantApproval: '注册流程极简，即时开通权益',
    },
    testimonials: {
      tag: '💖 社群真实心声',
      title: '来自真实用户与创业伙伴的反馈',
    },
    shop: {
      bannerTag: '多巴胺健康营养专区',
      bannerTitle: '为全家人打造的清真植物基纯净营养',
      bannerDesc: '100% 植物基底，富含益生元纤维且无添加糖。注册创业伙伴可享专属批发优惠价。',
      searchPlaceholder: '搜索益生元饮品、草本植萃、健康功效…',
      allCategories: '全部系列',
      noProducts: '未找到相关产品',
      noProductsSub: '请尝试更换搜索关键词或切换不同分类。',
      retailPrice: '零售价：',
      wholesalePrice: '批发价：',
      viewDetails: '查看详情与选购',
    },
    productDetail: {
      backToShop: '返回商城',
      inStock: '现货发售 (In Stock)',
      brand: 'Ascend Group',
      benefitsTitle: '产品核心功效与健康价值：',
      quantity: '选购数量：',
      totalAmount: '合计金额：',
      addToCart: '加入购物车',
      addedToCart: '已成功加入购物车！',
      loginToBuy: '登录后购买',
      howToConsume: '食用指南',
      ingredients: '天然成分表',
      nutritionFacts: '营养成分表',
      halalCert: '100% 清真认证 (Halal)',
      bvLabel: 'BV 业绩值：',
      pvLabel: 'PV 积分值：',
    },
    aiChat: {
      title: 'Ascend Group AI 营养健康顾问',
      subtitle: '24小时全天候智能营养专家',
      activeStatus: '在线',
      greeting: '您好！我是 Ascend Group Ascend Group的 AI 营养与健康顾问 🌿。今天有什么我可以帮您的吗？您可以向我咨询益生元饮品的功效、女性草本养护、全家纤维搭配，或者了解如何成为 Ascend Group 创业合伙人！',
      thinking: 'AI 正在分析营养配方并组织解答',
      placeholder: '请输入有关肠道健康、草本成分或产品选购的问题…',
      quickPrompts: [
        '我经常便秘胀气，哪款产品最适合？',
        'Ascend Berry Bloom 蔓越莓与卡琪花蒂玛有什么功效？',
        '孕妇可以喝紫薯益生元高纤饮吗？',
        'Ascend Group 创业伙伴的佣金机制是怎样的？',
      ],
    },
    auth: {
      backToHome: '返回首页',
      portalBadge: '会员与创业伙伴中心',
      loginTitle: '登录您的账户',
      loginSubtitle: '请输入您的电子邮箱与密码以进入系统',
      emailLabel: '电子邮箱',
      emailPlaceholder: 'you@example.com',
      passwordLabel: '账户密码',
      passwordPlaceholder: '••••••••',
      forgotPassword: '忘记密码？',
      loginButton: '立即登录',
      loggingIn: '正在登录...',
      noAccountPrompt: '还没有账户？',
      registerNow: '立即免费注册',
      registerTitle: '加入Ascend Group大家庭',
      registerSubtitle: '尊享高达 35% 专属会员批发优惠与三级团队创业分红奖励',
      registerBadge: '注册会员与创业合伙人',
      firstNameLabel: '名字 (First Name)',
      firstNamePlaceholder: '如：美丽',
      lastNameLabel: '姓氏 (Last Name)',
      lastNamePlaceholder: '如：陈',
      phoneLabel: '手机号码 (WhatsApp)',
      phonePlaceholder: '0123456789',
      referralCodeLabel: '推荐人邀请码',
      referralCodePlaceholder: '如：AM888',
      optional: '选填',
      registerButton: '注册成为会员 / 创业合伙人',
      registering: '正在注册...',
      haveAccountPrompt: '已有账户？',
      loginHere: '点此直接登录',
      emailVerificationTitle: '请验证您的电子邮箱',
      emailVerificationDesc: '验证链接已发送至您的电子邮箱，请查收并点击链接激活您的 Ascend Group 账户。',
      forgotPasswordTitle: '找回密码',
      forgotPasswordSubtitle: '请输入您的注册邮箱，系统将向您发送密码重置链接。',
      sendResetLink: '发送重置链接',
      sending: '正在发送...',
      resetSentTitle: '重置邮件已发送',
      resetSentDesc: '请检查您的邮箱收件箱，点击重置链接以设置新密码。',
    },
    member: {
      welcomeBack: '欢迎回来',
      communityTag: 'Ascend Group Ascend Group天然健康营养社群',
      buyProducts: '选购健康产品',
      wellnessGoals: '每日健康生活目标',
      recentOrders: '近期订单记录',
      noOrdersYet: '暂无历史订单。',
      viewAllOrders: '查看所有订单',
      goldMember: '黄金尊贵会员 (Gold Member)',
      cashWallet: '电子钱包现金余额',
      pointsWallet: '健康积分余额',
      editProfile: '编辑个人资料',
      saveChanges: '保存更改',
      saving: '正在保存...',
      profileSaved: '个人资料保存成功！',
      sponsorInfo: '推荐人信息',
      noSponsor: '您注册时未填写推荐人。',
      foundingPartner: '身份：创始合伙人 (Founding Partner)',
      sponsorCode: '推荐人邀请码',
      quickActions: '快捷功能',
      myOrders: '我的订单',
      rewardsReferral: '推荐分红',
      digitalWallet: '数字钱包',
    },
    footer: {
      about: 'Ascend Group Ascend Group是专为马来西亚现代家庭打造的植物基健康营养食品与智慧女性创业平台。',
      productLinks: '产品系列',
      systemLinks: '创业与系统',
      contactUs: '联系我们',
      operationHours: '服务时间：9:00 AM - 6:00 PM',
      rightsReserved: '版权所有。',
      privacyPolicy: '隐私政策',
      terms: '服务条款',
      refundPolicy: '退款政策',
    },
  },
}
