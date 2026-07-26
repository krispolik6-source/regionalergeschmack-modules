// js/translations-asian.js – tłumaczenia UI dla języków azjatyckich

function ui(nav, home, categories, extra = {}) {
    return { nav, home, categories, ...extra };
}

export const ASIAN_LANG_OPTIONS = Object.freeze([
    { code: 'zh', flag: '🇨🇳', label: '简体中文', short: 'ZH' },
    { code: 'zh-tw', flag: '🇹🇼', label: '繁體中文', short: 'ZH-TW' },
    { code: 'ja', flag: '🇯🇵', label: '日本語', short: 'JA' },
    { code: 'ko', flag: '🇰🇷', label: '한국어', short: 'KO' },
    { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt', short: 'VI' },
    { code: 'ms', flag: '🇲🇾', label: 'Bahasa Melayu', short: 'MS' },
    { code: 'id', flag: '🇮🇩', label: 'Bahasa Indonesia', short: 'ID' },
    { code: 'th', flag: '🇹🇭', label: 'ภาษาไทย', short: 'TH' },
    { code: 'hi', flag: '🇮🇳', label: 'हिन्दी', short: 'HI' }
]);

const ZH = ui(
    { home: '首页', map: '地图', premium: '高级版', favorites: '收藏', cart: '购物车', profile: '个人资料' },
    {
        heroTitle: '支持本地。<br>有意识饮食。<br>更好生活。',
        heroTagline: '🌍 发现您附近的区域生产商',
        getLocation: '获取位置',
        findNearby: '查找附近',
        recommendedTitle: '⭐ 推荐农户',
        recommendedPlaceholder: '即将推出：精选推荐',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: '搜索产品、餐厅、商店或生产商...',
        hubLabel: '搜索与快捷入口',
        chipsLabel: '快捷筛选',
        chip: { products: '产品', restaurants: '餐厅', shops: '商店', farmers: '农民', favorites: '收藏' }
    },
    {
        all: { name: '全部', desc: '所有类别' },
        restaurants: { name: '餐厅', desc: '地方特色菜' },
        farmers: { name: '农民', desc: '新鲜农产品' },
        bakeries: { name: '面包店', desc: '新鲜烘焙食品' },
        meat: { name: '肉类/肉店', desc: '地方香肠与肉制品' },
        shops: { name: '商店', desc: '本地产品' },
        vending: { name: '自动售货机', desc: '24小时' },
        favorites: { name: '收藏', desc: '已保存地点' }
    },
    {
        a11y: { darkMode: '深色模式', lightMode: '浅色模式', chooseLanguage: '选择语言', menu: '菜单', premium: '高级版', map: '地图', searchRadius: '搜索半径（公里）' },
        map: { gps: 'GPS', osm: 'OSM', loadError: '无法加载地图。' },
        btn: { details: '详情', favorite: '收藏', favoriteSaved: '已收藏', addToCart: '加入购物车', addedToCart: '已添加', navigate: '导航', close: '关闭', back: '返回', remove: '移除', more: '更多', less: '更少', login: '登录', toMap: '前往地图', discover: '发现产品', checkout: '结账', clearCart: '清空购物车' },
        favorites: { title: '收藏', subtitle: '您保存的地点和生产商', empty: '暂无收藏', emptySub: '在地图上将生产商标记为收藏。' },
        cart: { title: '购物车', subtitle: '您在区域供应商处的购物', empty: '购物车为空', emptySub: '从您喜爱的地方添加产品。', total: '合计', product: '产品' },
        profile: { title: '个人资料', subtitle: '您的设置', guest: '访客', guestSub: '登录以保存收藏并跟踪订单。', darkMode: '深色模式', notifications: '通知', language: '语言' },
        msg: { loading: '加载中...', noProducts: '暂无可用产品。', checkoutSoon: '结账 – 即将推出', loginSoon: '登录 – 即将推出', menuSoon: '菜单 – 即将推出', premiumSoon: '高级版 – 即将推出', locationDenied: '位置访问被拒绝。', locationUnavailable: '无法确定您的位置。', addedToFavorites: '已添加到收藏', removedFromFavorites: '已从收藏移除', viewError: '无法加载此视图。', error: '错误' },
        search: { noResults: '此搜索无结果。' },
        producer: {
            openUntil: '营业至 {time}',
            distance: '{distance} 米',
            types: { farmer: '农户', bakery: '面包店', restaurant: '餐厅', meat: '肉店', shop: '超市', vending: '自动售货机', honey: '养蜂场', dairy: '乳制品', fruit: '水果', vegetables: '蔬菜', forest: '林产品', other: '供应商' }
        },
        productDefault: '区域产品'
    }
);

const ZH_TW = ui(
    { home: '首頁', map: '地圖', favorites: '收藏', cart: '購物車', profile: '個人資料' },
    {
        heroTitle: '支持本地。<br>有意識飲食。<br>更好生活。',
        heroTagline: '🌍 發現您附近的區域生產商',
        getLocation: '獲取位置',
        findNearby: '查找附近',
        recommendedTitle: '⭐ 推薦農戶',
        recommendedPlaceholder: '即將推出：精選推薦',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: '搜尋產品、餐廳、商店或生產商...',
        hubLabel: '搜尋與快捷入口',
        chipsLabel: '快捷篩選',
        chip: { products: '產品', restaurants: '餐廳', shops: '商店', farmers: '農民', favorites: '收藏' }
    },
    {
        all: { name: '全部', desc: '所有類別' },
        restaurants: { name: '餐廳', desc: '地方特色菜' },
        farmers: { name: '農民', desc: '新鮮農產品' },
        bakeries: { name: '麵包店', desc: '新鮮烘焙食品' },
        meat: { name: '肉類/肉店', desc: '地方香腸與肉製品' },
        shops: { name: '商店', desc: '本地產品' },
        vending: { name: '自動販賣機', desc: '24小時' },
        favorites: { name: '收藏', desc: '已儲存地點' }
    },
    {
        a11y: { darkMode: '深色模式', lightMode: '淺色模式', chooseLanguage: '選擇語言', menu: '選單', premium: '進階版', map: '地圖', searchRadius: '搜尋半徑（公里）' },
        map: { gps: 'GPS', osm: 'OSM', loadError: '無法載入地圖。' },
        btn: { details: '詳情', favorite: '收藏', favoriteSaved: '已收藏', addToCart: '加入購物車', addedToCart: '已新增', navigate: '導航', close: '關閉', remove: '移除', more: '更多', less: '更少', login: '登入', toMap: '前往地圖', discover: '發現產品', checkout: '結帳', clearCart: '清空購物車' },
        favorites: { title: '收藏', subtitle: '您儲存的地點和生產商', empty: '暫無收藏', emptySub: '在地圖上將生產商標記為收藏。' },
        cart: { title: '購物車', subtitle: '您在區域供應商的購物', empty: '購物車為空', emptySub: '從您喜愛的地方新增產品。', total: '合計', product: '產品' },
        profile: { title: '個人資料', subtitle: '您的設定', guest: '訪客', guestSub: '登入以儲存收藏並追蹤訂單。', darkMode: '深色模式', notifications: '通知', language: '語言' },
        msg: { loading: '載入中...', noProducts: '暫無可用產品。', checkoutSoon: '結帳 – 即將推出', loginSoon: '登入 – 即將推出', menuSoon: '選單 – 即將推出', premiumSoon: '進階版 – 即將推出', locationDenied: '位置存取被拒絕。', locationUnavailable: '無法確定您的位置。', addedToFavorites: '已新增到收藏', removedFromFavorites: '已從收藏移除', viewError: '無法載入此檢視。', error: '錯誤' },
        search: { noResults: '此搜尋無結果。' },
        producer: {
            openUntil: '營業至 {time}',
            distance: '{distance} 公尺',
            types: { farmer: '農戶', bakery: '麵包店', restaurant: '餐廳', meat: '肉店', shop: '超市', vending: '自動販賣機', honey: '養蜂場', dairy: '乳製品', fruit: '水果', vegetables: '蔬菜', forest: '林產品', other: '供應商' }
        },
        productDefault: '區域產品'
    }
);

const JA = ui(
    { home: 'ホーム', map: '地図', favorites: 'お気に入り', cart: 'カート', profile: 'プロフィール' },
    {
        heroTitle: '地元を支援。<br>意識して食べる。<br>より良く暮らす。',
        heroTagline: '🌍 近くの地域生産者を発見',
        getLocation: '位置情報を取得',
        findNearby: '近くを探す',
        recommendedTitle: '⭐ おすすめの農家',
        recommendedPlaceholder: '近日公開：おすすめの農家',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: '製品、レストラン、店舗、生産者を検索...',
        hubLabel: '検索とクイックアクセス',
        chipsLabel: 'クイックフィルター',
        chip: { products: '製品', restaurants: 'レストラン', shops: '店舗', farmers: '農家', favorites: 'お気に入り' }
    },
    {
        all: { name: 'すべて', desc: 'すべてのカテゴリ' },
        restaurants: { name: 'レストラン', desc: '郷土料理' },
        farmers: { name: '農家', desc: '新鮮な農産物' },
        bakeries: { name: 'パン屋', desc: '焼きたてのパン' },
        meat: { name: '肉/精肉店', desc: '地域のソーセージ' },
        shops: { name: '店舗', desc: '地元の製品' },
        vending: { name: '自動販売機', desc: '24時間' },
        favorites: { name: 'お気に入り', desc: '保存した場所' }
    },
    {
        a11y: { darkMode: 'ダークモード', lightMode: 'ライトモード', chooseLanguage: '言語を選択', menu: 'メニュー', premium: 'プレミアム', map: '地図', searchRadius: '検索半径（km）' },
        map: { gps: 'GPS', osm: 'OSM', loadError: '地図を読み込めませんでした。' },
        btn: { details: '詳細', favorite: 'お気に入り', favoriteSaved: '保存済み', addToCart: 'カートに追加', addedToCart: '追加しました', navigate: 'ナビゲート', close: '閉じる', remove: '削除', more: 'もっと', less: '減らす', login: 'ログイン', toMap: '地図へ', discover: '製品を探す', checkout: 'レジへ', clearCart: 'カートを空にする' },
        favorites: { title: 'お気に入り', subtitle: '保存した場所と生産者', empty: 'お気に入りはありません', emptySub: '地図で生産者をお気に入りに追加してください。' },
        cart: { title: 'カート', subtitle: '地域の提供者からの購入', empty: 'カートは空です', emptySub: 'お気に入りの場所から製品を追加してください。', total: '合計', product: '製品' },
        profile: { title: 'プロフィール', subtitle: '設定', guest: 'ゲスト', guestSub: 'ログインしてお気に入りを保存し注文を追跡。', darkMode: 'ダークモード', notifications: '通知', language: '言語' },
        msg: { loading: '読み込み中...', noProducts: '利用可能な製品がありません。', checkoutSoon: 'レジ – 近日公開', loginSoon: 'ログイン – 近日公開', menuSoon: 'メニュー – 近日公開', premiumSoon: 'プレミアム – 近日公開', locationDenied: '位置情報へのアクセスが拒否されました。', locationUnavailable: '位置を特定できませんでした。', addedToFavorites: 'お気に入りに追加しました', removedFromFavorites: 'お気に入りから削除しました', viewError: 'ビューを読み込めませんでした。', error: 'エラー' },
        search: { noResults: 'この検索の結果はありません。' },
        producer: {
            openUntil: '{time}まで営業',
            distance: '{distance} m',
            types: { farmer: '農家', bakery: 'パン屋', restaurant: 'レストラン', meat: '精肉店', shop: 'スーパー', vending: '自動販売機', honey: '養蜂場', dairy: '乳製品', fruit: '果物', vegetables: '野菜', forest: '林産物', other: '提供者' }
        },
        productDefault: '地域の製品'
    }
);

const KO = ui(
    { home: '홈', map: '지도', favorites: '즐겨찾기', cart: '장바구니', profile: '프로필' },
    {
        heroTitle: '지역을 응원하세요.<br>의식적으로 먹으세요.<br>더 나은 삶.',
        heroTagline: '🌍 근처 지역 생산자를 발견하세요',
        getLocation: '위치 가져오기',
        findNearby: '주변 찾기',
        recommendedTitle: '⭐ 추천 농부',
        recommendedPlaceholder: '곧 제공: 추천 농부',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: '제품, 레스토랑, 상점 또는 생산자 검색...',
        hubLabel: '검색 및 빠른 접근',
        chipsLabel: '빠른 필터',
        chip: { products: '제품', restaurants: '레스토랑', shops: '상점', farmers: '농부', favorites: '즐겨찾기' }
    },
    {
        all: { name: '전체', desc: '모든 카테고리' },
        restaurants: { name: '레스토랑', desc: '지역 요리' },
        farmers: { name: '농부', desc: '신선한 농산물' },
        bakeries: { name: '빵집', desc: '갓 구운 빵' },
        meat: { name: '육류/정육점', desc: '지역 소시지' },
        shops: { name: '상점', desc: '지역 제품' },
        vending: { name: '자판기', desc: '24시간' },
        favorites: { name: '즐겨찾기', desc: '저장한 장소' }
    },
    {
        a11y: { darkMode: '다크 모드', lightMode: '라이트 모드', chooseLanguage: '언어 선택', menu: '메뉴', premium: '프리미엄', map: '지도', searchRadius: '검색 반경(km)' },
        map: { gps: 'GPS', osm: 'OSM', loadError: '지도를 불러올 수 없습니다.' },
        btn: { details: '상세정보', favorite: '즐겨찾기', favoriteSaved: '저장됨', addToCart: '장바구니에 담기', addedToCart: '추가됨', navigate: '길찾기', close: '닫기', remove: '삭제', more: '더보기', less: '줄이기', login: '로그인', toMap: '지도로 이동', discover: '제품 탐색', checkout: '결제', clearCart: '장바구니 비우기' },
        favorites: { title: '즐겨찾기', subtitle: '저장한 장소와 생산자', empty: '즐겨찾기 없음', emptySub: '지도에서 생산자를 즐겨찾기에 추가하세요.' },
        cart: { title: '장바구니', subtitle: '지역 공급업체에서의 구매', empty: '장바구니가 비어 있습니다', emptySub: '즐겨찾는 곳에서 제품을 추가하세요.', total: '합계', product: '제품' },
        profile: { title: '프로필', subtitle: '설정', guest: '게스트', guestSub: '로그인하여 즐겨찾기를 저장하고 주문을 추적하세요.', darkMode: '다크 모드', notifications: '알림', language: '언어' },
        msg: { loading: '로딩 중...', noProducts: '이용 가능한 제품이 없습니다.', checkoutSoon: '결제 – 곧 제공', loginSoon: '로그인 – 곧 제공', menuSoon: '메뉴 – 곧 제공', premiumSoon: '프리미엄 – 곧 제공', locationDenied: '위치 접근이 거부되었습니다.', locationUnavailable: '위치를 확인할 수 없습니다.', addedToFavorites: '즐겨찾기에 추가됨', removedFromFavorites: '즐겨찾기에서 제거됨', viewError: '화면을 불러올 수 없습니다.', error: '오류' },
        search: { noResults: '이 검색에 대한 결과가 없습니다.' },
        producer: {
            openUntil: '{time}까지 영업',
            distance: '{distance} m',
            types: { farmer: '농부', bakery: '빵집', restaurant: '레스토랑', meat: '정육점', shop: '슈퍼마켓', vending: '자판기', honey: '양봉장', dairy: '유제품', fruit: '과일', vegetables: '채소', forest: '임산물', other: '공급업체' }
        },
        productDefault: '지역 제품'
    }
);

const VI = ui(
    { home: 'Trang chủ', map: 'Bản đồ', favorites: 'Yêu thích', cart: 'Giỏ hàng', profile: 'Hồ sơ' },
    {
        heroTitle: 'Ủng hộ địa phương.<br>Ăn uống có ý thức.<br>Sống tốt hơn.',
        heroTagline: '🌍 Khám phá nhà sản xuất địa phương gần bạn',
        getLocation: 'Lấy vị trí',
        findNearby: 'Tìm gần đây',
        recommendedTitle: '⭐ Nông dân được đề xuất',
        recommendedPlaceholder: 'Sắp ra mắt: nông dân được đề xuất',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'Tìm sản phẩm, nhà hàng, cửa hàng hoặc nhà sản xuất...',
        hubLabel: 'Tìm kiếm và truy cập nhanh',
        chipsLabel: 'Bộ lọc nhanh',
        chip: { products: 'Sản phẩm', restaurants: 'Nhà hàng', shops: 'Cửa hàng', farmers: 'Nông dân', favorites: 'Yêu thích' }
    },
    {
        all: { name: 'Tất cả', desc: 'Tất cả danh mục' },
        restaurants: { name: 'Nhà hàng', desc: 'Món ăn địa phương' },
        farmers: { name: 'Nông dân', desc: 'Sản phẩm tươi' },
        bakeries: { name: 'Tiệm bánh', desc: 'Bánh mới nướng' },
        meat: { name: 'Thịt/Cửa hàng thịt', desc: 'Xúc xích địa phương' },
        shops: { name: 'Cửa hàng', desc: 'Sản phẩm địa phương' },
        vending: { name: 'Máy bán hàng tự động', desc: '24/7' },
        favorites: { name: 'Yêu thích', desc: 'Địa điểm đã lưu' }
    },
    {
        a11y: { darkMode: 'Chế độ tối', lightMode: 'Chế độ sáng', chooseLanguage: 'Chọn ngôn ngữ', menu: 'Menu', premium: 'Premium', map: 'Bản đồ', searchRadius: 'Bán kính tìm kiếm (km)' },
        map: { gps: 'GPS', osm: 'OSM', loadError: 'Không thể tải bản đồ.' },
        btn: { details: 'Chi tiết', favorite: 'Yêu thích', favoriteSaved: 'Đã lưu', addToCart: 'Thêm vào giỏ hàng', addedToCart: 'Đã thêm', navigate: 'Điều hướng', close: 'Đóng', remove: 'Xóa', more: 'Thêm', less: 'Ít hơn', login: 'Đăng nhập', toMap: 'Đến bản đồ', discover: 'Khám phá sản phẩm', checkout: 'Thanh toán', clearCart: 'Xóa giỏ hàng' },
        favorites: { title: 'Yêu thích', subtitle: 'Địa điểm và nhà sản xuất đã lưu', empty: 'Chưa có mục yêu thích', emptySub: 'Đánh dấu nhà sản xuất trên bản đồ là yêu thích.' },
        cart: { title: 'Giỏ hàng', subtitle: 'Mua sắm từ nhà cung cấp địa phương', empty: 'Giỏ hàng trống', emptySub: 'Thêm sản phẩm từ địa điểm yêu thích.', total: 'Tổng', product: 'Sản phẩm' },
        profile: { title: 'Hồ sơ', subtitle: 'Cài đặt của bạn', guest: 'Khách', guestSub: 'Đăng nhập để lưu yêu thích và theo dõi đơn hàng.', darkMode: 'Chế độ tối', notifications: 'Thông báo', language: 'Ngôn ngữ' },
        msg: { loading: 'Đang tải...', noProducts: 'Không có sản phẩm.', checkoutSoon: 'Thanh toán – sắp có', loginSoon: 'Đăng nhập – sắp có', menuSoon: 'Menu – sắp có', premiumSoon: 'Premium – sắp có', locationDenied: 'Quyền truy cập vị trí bị từ chối.', locationUnavailable: 'Không thể xác định vị trí.', addedToFavorites: 'Đã thêm vào yêu thích', removedFromFavorites: 'Đã xóa khỏi yêu thích', viewError: 'Không thể tải màn hình.', error: 'Lỗi' },
        search: { noResults: 'Không có kết quả cho tìm kiếm này.' },
        producer: {
            openUntil: 'Mở đến {time}',
            distance: '{distance} m',
            types: { farmer: 'Nông dân', bakery: 'Tiệm bánh', restaurant: 'Nhà hàng', meat: 'Cửa hàng thịt', shop: 'Siêu thị', vending: 'Máy bán hàng', honey: 'Trại ong', dairy: 'Sữa', fruit: 'Trái cây', vegetables: 'Rau củ', forest: 'Sản phẩm rừng', other: 'Nhà cung cấp' }
        },
        productDefault: 'Sản phẩm địa phương'
    }
);

const MS = ui(
    { home: 'Utama', map: 'Peta', favorites: 'Kegemaran', cart: 'Troli', profile: 'Profil' },
    {
        heroTitle: 'Sokong tempatan.<br>Makan dengan sedar.<br>Hidup lebih baik.',
        heroTagline: '🌍 Temui pengeluar serantau berhampiran anda',
        getLocation: 'Dapatkan lokasi',
        findNearby: 'Cari berdekatan',
        recommendedTitle: '⭐ Petani disyorkan',
        recommendedPlaceholder: 'Tidak lama lagi: petani pilihan',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'Cari produk, restoran, kedai atau pengeluar...',
        hubLabel: 'Carian dan akses pantas',
        chipsLabel: 'Penapis pantas',
        chip: { products: 'Produk', restaurants: 'Restoran', shops: 'Kedai', farmers: 'Petani', favorites: 'Kegemaran' }
    },
    {
        all: { name: 'Semua', desc: 'Semua kategori' },
        restaurants: { name: 'Restoran', desc: 'Hidangan serantau' },
        farmers: { name: 'Petani', desc: 'Produk segar' },
        bakeries: { name: 'Kedai roti', desc: 'Roti segar' },
        meat: { name: 'Daging/Kedai daging', desc: 'Sosej serantau' },
        shops: { name: 'Kedai', desc: 'Produk tempatan' },
        vending: { name: 'Mesin layan diri', desc: '24/7' },
        favorites: { name: 'Kegemaran', desc: 'Tempat tersimpan' }
    },
    {
        a11y: { darkMode: 'Mod gelap', lightMode: 'Mod cerah', chooseLanguage: 'Pilih bahasa', menu: 'Menu', premium: 'Premium', map: 'Peta', searchRadius: 'Jejari carian (km)' },
        map: { gps: 'GPS', osm: 'OSM', loadError: 'Peta tidak dapat dimuatkan.' },
        btn: { details: 'Butiran', favorite: 'Kegemaran', favoriteSaved: 'Disimpan', addToCart: 'Masukkan ke troli', addedToCart: 'Ditambah', navigate: 'Navigasi', close: 'Tutup', remove: 'Buang', more: 'Lagi', less: 'Kurang', login: 'Log masuk', toMap: 'Ke peta', discover: 'Terokai produk', checkout: 'Bayar', clearCart: 'Kosongkan troli' },
        favorites: { title: 'Kegemaran', subtitle: 'Tempat dan pengeluar tersimpan', empty: 'Tiada kegemaran lagi', emptySub: 'Tandakan pengeluar pada peta sebagai kegemaran.' },
        cart: { title: 'Troli', subtitle: 'Pembelian anda dari pembekal serantau', empty: 'Troli kosong', emptySub: 'Tambah produk dari tempat kegemaran.', total: 'Jumlah', product: 'Produk' },
        profile: { title: 'Profil', subtitle: 'Tetapan anda', guest: 'Tetamu', guestSub: 'Log masuk untuk menyimpan kegemaran dan menjejak pesanan.', darkMode: 'Mod gelap', notifications: 'Pemberitahuan', language: 'Bahasa' },
        msg: { loading: 'Memuatkan...', noProducts: 'Tiada produk tersedia.', checkoutSoon: 'Bayar – tidak lama lagi', loginSoon: 'Log masuk – tidak lama lagi', menuSoon: 'Menu – tidak lama lagi', premiumSoon: 'Premium – tidak lama lagi', locationDenied: 'Akses lokasi ditolak.', locationUnavailable: 'Lokasi tidak dapat ditentukan.', addedToFavorites: 'Ditambah ke kegemaran', removedFromFavorites: 'Dikeluarkan dari kegemaran', viewError: 'Paparan tidak dapat dimuatkan.', error: 'Ralat' },
        search: { noResults: 'Tiada hasil untuk carian ini.' },
        producer: {
            openUntil: 'Buka hingga {time}',
            distance: '{distance} m',
            types: { farmer: 'Petani', bakery: 'Kedai roti', restaurant: 'Restoran', meat: 'Kedai daging', shop: 'Pasar raya', vending: 'Mesin layan diri', honey: 'Lebah', dairy: 'Tenusu', fruit: 'Buah-buahan', vegetables: 'Sayur-sayuran', forest: 'Produk hutan', other: 'Pembekal' }
        },
        productDefault: 'Produk serantau'
    }
);

const ID = ui(
    { home: 'Beranda', map: 'Peta', favorites: 'Favorit', cart: 'Keranjang', profile: 'Profil' },
    {
        heroTitle: 'Dukung lokal.<br>Makan dengan sadar.<br>Hidup lebih baik.',
        heroTagline: '🌍 Temukan produsen regional di dekat Anda',
        getLocation: 'Dapatkan lokasi',
        findNearby: 'Cari di sekitar',
        recommendedTitle: '⭐ Petani rekomendasi',
        recommendedPlaceholder: 'Segera: petani rekomendasi',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'Cari produk, restoran, toko, atau produsen...',
        hubLabel: 'Pencarian dan akses cepat',
        chipsLabel: 'Filter cepat',
        chip: { products: 'Produk', restaurants: 'Restoran', shops: 'Toko', farmers: 'Petani', favorites: 'Favorit' }
    },
    {
        all: { name: 'Semua', desc: 'Semua kategori' },
        restaurants: { name: 'Restoran', desc: 'Hidangan regional' },
        farmers: { name: 'Petani', desc: 'Produk segar' },
        bakeries: { name: 'Toko roti', desc: 'Roti segar' },
        meat: { name: 'Daging/Toko daging', desc: 'Sosis regional' },
        shops: { name: 'Toko', desc: 'Produk lokal' },
        vending: { name: 'Mesin penjual otomatis', desc: '24/7' },
        favorites: { name: 'Favorit', desc: 'Tempat tersimpan' }
    },
    {
        a11y: { darkMode: 'Mode gelap', lightMode: 'Mode terang', chooseLanguage: 'Pilih bahasa', menu: 'Menu', premium: 'Premium', map: 'Peta', searchRadius: 'Radius pencarian (km)' },
        map: { gps: 'GPS', osm: 'OSM', loadError: 'Peta tidak dapat dimuat.' },
        btn: { details: 'Detail', favorite: 'Favorit', favoriteSaved: 'Tersimpan', addToCart: 'Tambahkan ke keranjang', addedToCart: 'Ditambahkan', navigate: 'Navigasi', close: 'Tutup', remove: 'Hapus', more: 'Lebih', less: 'Kurang', login: 'Masuk', toMap: 'Ke peta', discover: 'Temukan produk', checkout: 'Bayar', clearCart: 'Kosongkan keranjang' },
        favorites: { title: 'Favorit', subtitle: 'Tempat dan produsen tersimpan', empty: 'Belum ada favorit', emptySub: 'Tandai produsen di peta sebagai favorit.' },
        cart: { title: 'Keranjang', subtitle: 'Pembelian Anda dari pemasok regional', empty: 'Keranjang kosong', emptySub: 'Tambahkan produk dari tempat favorit.', total: 'Total', product: 'Produk' },
        profile: { title: 'Profil', subtitle: 'Pengaturan Anda', guest: 'Tamu', guestSub: 'Masuk untuk menyimpan favorit dan melacak pesanan.', darkMode: 'Mode gelap', notifications: 'Notifikasi', language: 'Bahasa' },
        msg: { loading: 'Memuat...', noProducts: 'Tidak ada produk tersedia.', checkoutSoon: 'Bayar – segera hadir', loginSoon: 'Masuk – segera hadir', menuSoon: 'Menu – segera hadir', premiumSoon: 'Premium – segera hadir', locationDenied: 'Akses lokasi ditolak.', locationUnavailable: 'Lokasi tidak dapat ditentukan.', addedToFavorites: 'Ditambahkan ke favorit', removedFromFavorites: 'Dihapus dari favorit', viewError: 'Tampilan tidak dapat dimuat.', error: 'Kesalahan' },
        search: { noResults: 'Tidak ada hasil untuk pencarian ini.' },
        producer: {
            openUntil: 'Buka hingga {time}',
            distance: '{distance} m',
            types: { farmer: 'Petani', bakery: 'Toko roti', restaurant: 'Restoran', meat: 'Toko daging', shop: 'Supermarket', vending: 'Mesin otomatis', honey: 'Peternakan lebah', dairy: 'Susu', fruit: 'Buah', vegetables: 'Sayuran', forest: 'Produk hutan', other: 'Pemasok' }
        },
        productDefault: 'Produk regional'
    }
);

const TH = ui(
    { home: 'หน้าแรก', map: 'แผนที่', favorites: 'รายการโปรด', cart: 'ตะกร้าสินค้า', profile: 'โปรไฟล์' },
    {
        heroTitle: 'สนับสนุนท้องถิ่น.<br>กินอย่างมีสติ.<br>ใช้ชีวิตที่ดีขึ้น.',
        heroTagline: '🌍 ค้นพบผู้ผลิตในภูมิภาคใกล้คุณ',
        getLocation: 'รับตำแหน่ง',
        findNearby: 'ค้นหาใกล้เคียง',
        recommendedTitle: '⭐ เกษตรกรแนะนำ',
        recommendedPlaceholder: 'เร็วๆ นี้: เกษตรกรแนะนำ',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'ค้นหาผลิตภัณฑ์ ร้านอาหาร ร้านค้า หรือผู้ผลิต...',
        hubLabel: 'ค้นหาและทางลัด',
        chipsLabel: 'ตัวกรองด่วน',
        chip: { products: 'ผลิตภัณฑ์', restaurants: 'ร้านอาหาร', shops: 'ร้านค้า', farmers: 'ชาวนา', favorites: 'รายการโปรด' }
    },
    {
        all: { name: 'ทั้งหมด', desc: 'ทุกหมวดหมู่' },
        restaurants: { name: 'ร้านอาหาร', desc: 'อาหารท้องถิ่น' },
        farmers: { name: 'ชาวนา', desc: 'ผลิตภัณฑ์สด' },
        bakeries: { name: 'ร้านเบเกอรี่', desc: 'ขนมปังสด' },
        meat: { name: 'เนื้อ/ร้านขายเนื้อ', desc: 'ไส้กรอกท้องถิ่น' },
        shops: { name: 'ร้านค้า', desc: 'ผลิตภัณฑ์ท้องถิ่น' },
        vending: { name: 'เครื่องจำหน่ายสินค้าอัตโนมัติ', desc: '24 ชม.' },
        favorites: { name: 'รายการโปรด', desc: 'สถานที่ที่บันทึก' }
    },
    {
        a11y: { darkMode: 'โหมดมืด', lightMode: 'โหมดสว่าง', chooseLanguage: 'เลือกภาษา', menu: 'เมนู', premium: 'พรีเมียม', map: 'แผนที่', searchRadius: 'รัศมีค้นหา (กม.)' },
        map: { gps: 'GPS', osm: 'OSM', loadError: 'ไม่สามารถโหลดแผนที่ได้' },
        btn: { details: 'รายละเอียด', favorite: 'รายการโปรด', favoriteSaved: 'บันทึกแล้ว', addToCart: 'เพิ่มในตะกร้า', addedToCart: 'เพิ่มแล้ว', navigate: 'นำทาง', close: 'ปิด', remove: 'ลบ', more: 'เพิ่ม', less: 'ลด', login: 'เข้าสู่ระบบ', toMap: 'ไปแผนที่', discover: 'ค้นพบผลิตภัณฑ์', checkout: 'ชำระเงิน', clearCart: 'ล้างตะกร้า' },
        favorites: { title: 'รายการโปรด', subtitle: 'สถานที่และผู้ผลิตที่บันทึก', empty: 'ยังไม่มีรายการโปรด', emptySub: 'ทำเครื่องหมายผู้ผลิตบนแผนที่เป็นรายการโปรด' },
        cart: { title: 'ตะกร้าสินค้า', subtitle: 'การซื้อของคุณจากผู้จัดหาท้องถิ่น', empty: 'ตะกร้าว่าง', emptySub: 'เพิ่มผลิตภัณฑ์จากสถานที่โปรด', total: 'รวม', product: 'ผลิตภัณฑ์' },
        profile: { title: 'โปรไฟล์', subtitle: 'การตั้งค่าของคุณ', guest: 'ผู้เยี่ยมชม', guestSub: 'เข้าสู่ระบบเพื่อบันทึกรายการโปรดและติดตามคำสั่งซื้อ', darkMode: 'โหมดมืด', notifications: 'การแจ้งเตือน', language: 'ภาษา' },
        msg: { loading: 'กำลังโหลด...', noProducts: 'ไม่มีผลิตภัณฑ์', checkoutSoon: 'ชำระเงิน – เร็วๆ นี้', loginSoon: 'เข้าสู่ระบบ – เร็วๆ นี้', menuSoon: 'เมนู – เร็วๆ นี้', premiumSoon: 'พรีเมียม – เร็วๆ นี้', locationDenied: 'ปฏิเสธการเข้าถึงตำแหน่ง', locationUnavailable: 'ไม่สามารถระบุตำแหน่งได้', addedToFavorites: 'เพิ่มในรายการโปรดแล้ว', removedFromFavorites: 'ลบออกจากรายการโปรดแล้ว', viewError: 'ไม่สามารถโหลดหน้าจอได้', error: 'ข้อผิดพลาด' },
        search: { noResults: 'ไม่พบผลลัพธ์สำหรับการค้นหานี้' },
        producer: {
            openUntil: 'เปิดถึง {time}',
            distance: '{distance} ม.',
            types: { farmer: 'เกษตรกร', bakery: 'ร้านเบเกอรี่', restaurant: 'ร้านอาหาร', meat: 'ร้านขายเนื้อ', shop: 'ซูเปอร์มาร์เก็ต', vending: 'ตู้จำหน่ายอัตโนมัติ', honey: 'ฟาร์มผึ้ง', dairy: 'นม', fruit: 'ผลไม้', vegetables: 'ผัก', forest: 'ผลิตภัณฑ์ป่า', other: 'ผู้จัดหา' }
        },
        productDefault: 'ผลิตภัณฑ์ท้องถิ่น'
    }
);

const HI = ui(
    { home: 'होम', map: 'मानचित्र', favorites: 'पसंदीदा', cart: 'कार्ट', profile: 'प्रोफ़ाइल' },
    {
        heroTitle: 'स्थानीय का समर्थन करें.<br>जागरूकता से खाएं.<br>बेहतर जीवन।',
        heroTagline: '🌍 अपने पास के क्षेत्रीय उत्पादकों को खोजें',
        getLocation: 'स्थान प्राप्त करें',
        findNearby: 'पास में खोजें',
        recommendedTitle: '⭐ अनुशंसित किसान',
        recommendedPlaceholder: 'जल्द: अनुशंसित किसान',
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'उत्पाद, रेस्तरां, दुकानें या उत्पादक खोजें...',
        hubLabel: 'खोज और त्वरित पहुँच',
        chipsLabel: 'त्वरित फ़िल्टर',
        chip: { products: 'उत्पाद', restaurants: 'रेस्तरां', shops: 'दुकानें', farmers: 'किसान', favorites: 'पसंदीदा' }
    },
    {
        all: { name: 'सभी', desc: 'सभी श्रेणियाँ' },
        restaurants: { name: 'रेस्तरां', desc: 'क्षेत्रीय व्यंजन' },
        farmers: { name: 'किसान', desc: 'ताज़े उत्पाद' },
        bakeries: { name: 'बेकरी', desc: 'ताज़ी बेकरी वस्तुएँ' },
        meat: { name: 'मांस/कसाई की दुकान', desc: 'क्षेत्रीय सॉसेज' },
        shops: { name: 'दुकानें', desc: 'स्थानीय उत्पाद' },
        vending: { name: 'वेंडिंग मशीन', desc: '24/7' },
        favorites: { name: 'पसंदीदा', desc: 'सहेजे गए स्थान' }
    },
    {
        a11y: { darkMode: 'डार्क मोड', lightMode: 'लाइट मोड', chooseLanguage: 'भाषा चुनें', menu: 'मेनू', premium: 'प्रीमियम', map: 'मानचित्र', searchRadius: 'खोज त्रिज्या (किमी)' },
        map: { gps: 'GPS', osm: 'OSM', loadError: 'मानचित्र लोड नहीं हो सका।' },
        btn: { details: 'विवरण', favorite: 'पसंदीदा', favoriteSaved: 'सहेजा गया', addToCart: 'कार्ट में जोड़ें', addedToCart: 'जोड़ा गया', navigate: 'नेविगेट करें', close: 'बंद करें', remove: 'हटाएँ', more: 'अधिक', less: 'कम', login: 'साइन इन', toMap: 'मानचित्र पर जाएँ', discover: 'उत्पाद खोजें', checkout: 'चेकआउट', clearCart: 'कार्ट खाली करें' },
        favorites: { title: 'पसंदीदा', subtitle: 'आपके सहेजे स्थान और उत्पादक', empty: 'अभी कोई पसंदीदा नहीं', emptySub: 'मानचित्र पर उत्पादकों को पसंदीदा चिह्नित करें।' },
        cart: { title: 'कार्ट', subtitle: 'क्षेत्रीय आपूर्तिकर्ताओं से आपकी खरीदारी', empty: 'कार्ट खाली है', emptySub: 'पसंदीदा स्थानों से उत्पाद जोड़ें।', total: 'कुल', product: 'उत्पाद' },
        profile: { title: 'प्रोफ़ाइल', subtitle: 'आपकी सेटिंग्स', guest: 'अतिथि', guestSub: 'पसंदीदा सहेजने और ऑर्डर ट्रैक करने के लिए साइन इन करें।', darkMode: 'डार्क मोड', notifications: 'सूचनाएँ', language: 'भाषा' },
        msg: { loading: 'लोड हो रहा है...', noProducts: 'कोई उत्पाद उपलब्ध नहीं।', checkoutSoon: 'चेकआउट – जल्द आ रहा है', loginSoon: 'साइन इन – जल्द आ रहा है', menuSoon: 'मेनू – जल्द आ रहा है', premiumSoon: 'प्रीमियम – जल्द आ रहा है', locationDenied: 'स्थान पहुँच अस्वीकृत।', locationUnavailable: 'स्थान निर्धारित नहीं हो सका।', addedToFavorites: 'पसंदीदा में जोड़ा गया', removedFromFavorites: 'पसंदीदा से हटाया गया', viewError: 'दृश्य लोड नहीं हो सका।', error: 'त्रुटि' },
        search: { noResults: 'इस खोज के लिए कोई परिणाम नहीं।' },
        producer: {
            openUntil: '{time} तक खुला',
            distance: '{distance} मी',
            types: { farmer: 'किसान', bakery: 'बेकरी', restaurant: 'रेस्तरां', meat: 'कसाई', shop: 'सुपरमार्केट', vending: 'वेंडिंग मशीन', honey: 'मधुमक्खी पालन', dairy: 'डेयरी', fruit: 'फल', vegetables: 'सब्ज़ियाँ', forest: 'वन उत्पाद', other: 'आपूर्तिकर्ता' }
        },
        productDefault: 'क्षेत्रीय उत्पाद'
    }
);

function asianDeepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            out[key] = asianDeepMerge(out[key] || {}, source[key]);
        } else {
            out[key] = source[key];
        }
    }
    return out;
}

/** Uzupełnienie brakujących kluczy UI w językach azjatyckich */
const ASIAN_UI_EXTRA = {
    zh: {
        map: { dataLoading: '正在加载供应商…', dataCached: 'API 不可用 – 显示已保存数据。', dataError: '无法加载数据。', radiusFilter: '🔵 范围：{km} 公里（{count} 个地点）' },
        shell: { label: '主导航' },
        reviews: { title: '评价', add: '添加评价', empty: '暂无评价。', userName: '您的姓名', rating: '评分', comment: '评论', submit: '提交', saved: '评价已保存' },
        msg: { addedToCart: '已加入购物车', removedFromCart: '已从购物车移除', connectionError: '连接错误' }
    },
    'zh-tw': {
        nav: { premium: '進階版' },
        map: { dataLoading: '正在載入供應商…', dataCached: 'API 無法使用 – 顯示已儲存資料。', dataError: '無法載入資料。', radiusFilter: '🔵 範圍：{km} 公里（{count} 個地點）' },
        shell: { label: '主導航' },
        reviews: { title: '評價', add: '新增評價', empty: '暫無評價。', userName: '您的姓名', rating: '評分', comment: '評論', submit: '送出', saved: '評價已儲存' },
        msg: { addedToCart: '已加入購物車', removedFromCart: '已從購物車移除', connectionError: '連線錯誤' }
    },
    ja: {
        nav: { premium: 'プレミアム' },
        map: { dataLoading: '提供者を読み込み中…', dataCached: 'API 利用不可 – 保存データを表示中。', dataError: 'データを読み込めませんでした。', radiusFilter: '🔵 範囲：{km} km（{count} 件）' },
        shell: { label: 'メインナビゲーション' },
        reviews: { title: 'レビュー', add: 'レビューを追加', empty: 'レビューはまだありません。', userName: 'お名前', rating: '評価', comment: 'コメント', submit: '送信', saved: 'レビューを保存しました' },
        msg: { addedToCart: 'カートに追加しました', removedFromCart: 'カートから削除しました', connectionError: '接続エラー' }
    },
    ko: {
        nav: { premium: '프리미엄' },
        map: { dataLoading: '공급자 로딩 중…', dataCached: 'API 사용 불가 – 저장된 데이터 표시.', dataError: '데이터를 불러올 수 없습니다.', radiusFilter: '🔵 범위: {km} km ({count}곳)' },
        shell: { label: '주 내비게이션' },
        reviews: { title: '리뷰', add: '리뷰 추가', empty: '아직 리뷰가 없습니다.', userName: '이름', rating: '평점', comment: '댓글', submit: '제출', saved: '리뷰가 저장되었습니다' },
        msg: { addedToCart: '장바구니에 추가됨', removedFromCart: '장바구니에서 제거됨', connectionError: '연결 오류' }
    },
    vi: {
        nav: { premium: 'Premium' },
        map: { dataLoading: 'Đang tải nhà cung cấp…', dataCached: 'API không khả dụng – hiển thị dữ liệu đã lưu.', dataError: 'Không thể tải dữ liệu.', radiusFilter: '🔵 Phạm vi: {km} km ({count} địa điểm)' },
        shell: { label: 'Điều hướng chính' },
        reviews: { title: 'Đánh giá', add: 'Thêm đánh giá', empty: 'Chưa có đánh giá.', userName: 'Tên của bạn', rating: 'Xếp hạng', comment: 'Bình luận', submit: 'Gửi', saved: 'Đánh giá đã lưu' },
        msg: { addedToCart: 'Đã thêm vào giỏ hàng', removedFromCart: 'Đã xóa khỏi giỏ hàng', connectionError: 'Lỗi kết nối' }
    },
    ms: {
        nav: { premium: 'Premium' },
        map: { dataLoading: 'Memuatkan pembekal…', dataCached: 'API tidak tersedia – data tersimpan dipaparkan.', dataError: 'Data tidak dapat dimuatkan.', radiusFilter: '🔵 Julat: {km} km ({count} tempat)' },
        shell: { label: 'Navigasi utama' },
        reviews: { title: 'Ulasan', add: 'Tambah ulasan', empty: 'Tiada ulasan lagi.', userName: 'Nama anda', rating: 'Penilaian', comment: 'Komen', submit: 'Hantar', saved: 'Ulasan disimpan' },
        msg: { addedToCart: 'Ditambah ke troli', removedFromCart: 'Dikeluarkan dari troli', connectionError: 'Ralat sambungan' }
    },
    id: {
        nav: { premium: 'Premium' },
        map: { dataLoading: 'Memuat pemasok…', dataCached: 'API tidak tersedia – menampilkan data tersimpan.', dataError: 'Data tidak dapat dimuat.', radiusFilter: '🔵 Jangkauan: {km} km ({count} tempat)' },
        shell: { label: 'Navigasi utama' },
        reviews: { title: 'Ulasan', add: 'Tambah ulasan', empty: 'Belum ada ulasan.', userName: 'Nama Anda', rating: 'Penilaian', comment: 'Komentar', submit: 'Kirim', saved: 'Ulasan disimpan' },
        msg: { addedToCart: 'Ditambahkan ke keranjang', removedFromCart: 'Dihapus dari keranjang', connectionError: 'Kesalahan koneksi' }
    },
    th: {
        nav: { premium: 'พรีเมียม' },
        map: { dataLoading: 'กำลังโหลดผู้ให้บริการ…', dataCached: 'API ไม่พร้อมใช้งาน – แสดงข้อมูลที่บันทึกไว้', dataError: 'ไม่สามารถโหลดข้อมูลได้', radiusFilter: '🔵 รัศมี: {km} กม. ({count} แห่ง)' },
        shell: { label: 'การนำทางหลัก' },
        reviews: { title: 'รีวิว', add: 'เพิ่มรีวิว', empty: 'ยังไม่มีรีวิว', userName: 'ชื่อของคุณ', rating: 'คะแนน', comment: 'ความคิดเห็น', submit: 'ส่ง', saved: 'บันทึกรีวิวแล้ว' },
        msg: { addedToCart: 'เพิ่มในตะกร้าแล้ว', removedFromCart: 'ลบออกจากตะกร้าแล้ว', connectionError: 'ข้อผิดพลาดการเชื่อมต่อ' }
    },
    hi: {
        nav: { premium: 'प्रीमियम' },
        map: { dataLoading: 'आपूर्तिकर्ता लोड हो रहे हैं…', dataCached: 'API उपलब्ध नहीं – सहेजा डेटा दिखाया जा रहा है।', dataError: 'डेटा लोड नहीं हो सका।', radiusFilter: '🔵 दायरा: {km} किमी ({count} स्थान)' },
        shell: { label: 'मुख्य नेविगेशन' },
        reviews: { title: 'समीक्षाएँ', add: 'समीक्षा जोड़ें', empty: 'अभी कोई समीक्षा नहीं।', userName: 'आपका नाम', rating: 'रेटिंग', comment: 'टिप्पणी', submit: 'जमा करें', saved: 'समीक्षा सहेजी गई' },
        msg: { addedToCart: 'कार्ट में जोड़ा गया', removedFromCart: 'कार्ट से हटाया गया', connectionError: 'कनेक्शन त्रुटि' }
    }
};

const ASIAN_RAW = { zh: ZH, 'zh-tw': ZH_TW, ja: JA, ko: KO, vi: VI, ms: MS, id: ID, th: TH, hi: HI };
const ASIAN_BUILT = {};
for (const [code, lang] of Object.entries(ASIAN_RAW)) {
    ASIAN_BUILT[code] = asianDeepMerge(lang, ASIAN_UI_EXTRA[code] || {});
}

export const ASIAN_TRANSLATIONS = Object.freeze(ASIAN_BUILT);

/** Opisy katalogu – tylko tłumaczenia danych OSM (bez demo) */
export const ASIAN_CATALOG = Object.freeze({
    zh: {},
    'zh-tw': {},
    ja: {},
    ko: {},
    vi: {},
    ms: {},
    id: {},
    th: {},
    hi: {}
});
