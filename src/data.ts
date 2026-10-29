export type Category =
  | "學習空間"
  | "行政服務"
  | "生活機能"
  | "運動休憩"
  | "交通入口"
  | "演講廳與禮堂";
export interface Place {
  id: string;
  name: string;
  en: string;
  category: Category;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  code?: string;
  description: string;
  highlights: string[];
  source: string;
  node: string;
  parentId?: string;
  floor?: string;
  room?: string;
  aliases?: string[];
}
export const official = {
  map: "https://web.cyut.edu.tw/p/412-1000-4553.php?Lang=zh-tw",
  floors: "https://web.cyut.edu.tw/p/412-1000-4556.php?Lang=zh-tw",
  access: "https://web.cyut.edu.tw/p/412-1000-4555.php?Lang=zh-tw",
  transport: "https://web.cyut.edu.tw/p/412-1000-4559.php?Lang=zh-tw",
  home: "https://www.cyut.edu.tw/",
};
export const campusPlaces: Place[] = [
  {
    id: "library",
    name: "波錠紀念圖書館",
    en: "Poding Memorial Library",
    category: "學習空間",
    x: 88,
    z: 7,
    w: 22,
    d: 53,
    h: 23,
    code: "L",
    node: "r1",
    description:
      "讓探索從一本書開始。波錠紀念圖書館提供館藏查詢、電子資源、閱覽空間與學習服務，是認識朝陽學習生活的一站。",
    highlights: ["館藏與電子資源", "iSpace 學習空間", "樓層與服務資訊"],
    source: "https://www.lib.cyut.edu.tw/",
  },
  {
    id: "admin",
    name: "行政大樓",
    en: "Administration Building",
    category: "行政服務",
    x: 20,
    z: 88,
    w: 43,
    d: 18,
    h: 18,
    node: "b",
    description:
      "到校洽公與認識校務服務的重要地點。前往辦理業務前，建議先從學校官網確認承辦單位與辦公位置。",
    highlights: ["校務服務", "訪客洽公", "請先確認承辦單位"],
    source: official.floors,
  },
  {
    id: "science",
    name: "理工大樓",
    en: "Science & Engineering Building",
    category: "學習空間",
    x: -16,
    z: 40,
    w: 26,
    d: 39,
    h: 26,
    code: "E",
    node: "c3",
    description:
      "理工教學與研究的空間。官方樓層介紹列有專業教室、研究室與實驗相關設施，參訪時請遵守各教室及實驗室的出入規範。",
    highlights: ["專業教室", "研究與實作", "教室代碼 E"],
    source: "https://web.cyut.edu.tw/p/404-1000-18934.php?Lang=zh-tw",
  },
  {
    id: "teaching",
    name: "教學大樓",
    en: "Teaching Building",
    category: "學習空間",
    x: -13,
    z: -53,
    w: 39,
    d: 34,
    h: 29,
    code: "T1",
    node: "l0",
    description:
      "日常上課與自主學習的場域。大樓設有普通教室、語言教室與自主學習區，波錠廳位於二樓。",
    highlights: ["普通與語言教室", "自主學習區", "二樓波錠廳"],
    source: "https://web.cyut.edu.tw/p/404-1000-18935.php?Lang=zh-tw",
  },
  {
    id: "design",
    name: "設計大樓",
    en: "Design Building",
    category: "學習空間",
    x: 39,
    z: -53,
    w: 37,
    d: 34,
    h: 24,
    node: "c0",
    description:
      "認識朝陽設計學習環境的一站。探索建築與創作空間，室內展覽、教室使用與參訪安排請以校方公告為準。",
    highlights: ["設計與創作", "建築觀察", "教學空間"],
    source: official.floors,
  },
  {
    id: "management",
    name: "管理大樓",
    en: "Management Building",
    category: "學習空間",
    x: 91,
    z: -57,
    w: 37,
    d: 33,
    h: 29,
    code: "T2",
    node: "r0",
    description:
      "管理領域的教學空間，也是校園生活機能的一站。官方校園圖標有餐飲與便利商店，實際營業資訊請依現場公告。",
    highlights: ["管理領域教學", "餐飲與便利商店", "教室代碼 T2"],
    source: "https://b05.cyut.edu.tw/p/412-1018-85.php?Lang=zh-tw",
  },
  {
    id: "information",
    name: "資訊大樓",
    en: "Information Building",
    category: "學習空間",
    x: 54,
    z: 60,
    w: 20,
    d: 35,
    h: 25,
    node: "r2",
    description:
      "位在行政大樓與圖書館周邊的教學建築。想找教室或辦公空間，可開啟官方各大樓樓層介紹進一步查詢。",
    highlights: ["資訊學習", "教學空間", "鄰近圖書館"],
    source: official.floors,
  },
  {
    id: "humanities",
    name: "人文與科技大樓",
    en: "Humanities & Technology Building",
    category: "學習空間",
    x: 91,
    z: 73,
    w: 21,
    d: 37,
    h: 26,
    code: "G",
    node: "r2",
    description:
      "人文與科技交會的學習空間。官方圖資服務列有電腦實習教室與自由上機教室，開放及使用方式請查閱最新公告。",
    highlights: ["電腦實習教室", "自由上機空間", "教室代碼 G"],
    source: "https://pmlis.cyut.edu.tw/pcroom.php",
  },
  {
    id: "aviation",
    name: "航空大樓",
    en: "Aviation Building",
    category: "學習空間",
    x: -44,
    z: -101,
    w: 48,
    d: 24,
    h: 22,
    code: "V",
    node: "west-high",
    description:
      "從校園認識航空領域。航空大樓列於官方校園圖，圖資處亦列有大樓內的電腦實習教室；專業設施參訪請先洽校方。",
    highlights: ["航空領域", "專業教學", "教室代碼 V"],
    source: "https://pmlis.cyut.edu.tw/pcroom.php",
  },
  {
    id: "dorm",
    name: "宿舍大樓",
    en: "Dormitory Building",
    category: "生活機能",
    x: 22,
    z: -108,
    w: 54,
    d: 26,
    h: 24,
    node: "north",
    description:
      "校內住宿生活的據點。官方校園圖標示宿舍大樓及餐飲、便利商店；住宿規定、申請及出入資訊請依學校公告。",
    highlights: ["校內住宿", "餐飲與便利商店", "住宿區請尊重隱私"],
    source: official.map,
  },
  {
    id: "plaza",
    name: "紅磚廣場",
    en: "Red Brick Plaza",
    category: "運動休憩",
    x: 22,
    z: 49,
    w: 31,
    d: 28,
    h: 0,
    node: "c3",
    description:
      "位在行政大樓前方的開放廣場。把步調放慢，從這裡看看周圍的理工、資訊與行政建築，感受校園日常。",
    highlights: ["校園散步", "開放空間", "建築觀察"],
    source: official.map,
  },
  {
    id: "field",
    name: "運動場",
    en: "Athletic Field",
    category: "運動休憩",
    x: -91,
    z: -32,
    w: 45,
    d: 104,
    h: 0,
    node: "l1",
    description:
      "環形跑道與開闊的運動空間，是校園西側醒目的地標。場地開放與活動使用請以學校公告及現場管理為準。",
    highlights: ["環形跑道", "戶外運動", "開闊視野"],
    source: official.map,
  },
  {
    id: "gym",
    name: "體育館",
    en: "Gymnasium",
    category: "運動休憩",
    x: -56,
    z: 48,
    w: 26,
    d: 34,
    h: 16,
    node: "l2",
    description:
      "校園運動設施的一環，位在運動場與理工大樓之間。參訪或使用場地前，請先確認當日活動與場地規範。",
    highlights: ["室內體育", "鄰近運動場", "場地使用依公告"],
    source: official.floors,
  },
  {
    id: "courts",
    name: "籃排球場",
    en: "Basketball & Volleyball Courts",
    category: "運動休憩",
    x: -53,
    z: -17,
    w: 24,
    d: 58,
    h: 0,
    node: "l1",
    description:
      "位在運動場與教學區之間的戶外球場。和朋友打球、觀看校園活動，都是認識朝陽生活的另一種方式。",
    highlights: ["戶外球場", "籃球與排球", "校園活動"],
    source: official.map,
  },
  {
    id: "gate",
    name: "校門入口",
    en: "Main Campus Entrance",
    category: "交通入口",
    x: 4,
    z: 166,
    w: 30,
    d: 8,
    h: 5,
    node: "entry",
    description:
      "朝陽科技大學位於臺中市霧峰區吉峰東路 168 號。從校門開始探索；車輛進出、訪客登記與停車請依管制站指示。",
    highlights: ["吉峰東路 168 號", "訪客入校", "校門管制站"],
    source: official.home,
  },
  {
    id: "bus",
    name: "校園公車站",
    en: "Campus Bus Stop",
    category: "交通入口",
    x: -27,
    z: 132,
    w: 15,
    d: 8,
    h: 4,
    node: "entry",
    description:
      "官方校園圖標有校園公車站。前往朝陽前，請透過官方交通資訊與臺中公車即時動態查詢當日路線及班次。",
    highlights: ["大眾運輸", "班次請即時查詢", "校門周邊"],
    source: official.transport,
  },
  {
    id: "parking",
    name: "第一汽車停車場",
    en: "Car Parking Lot I",
    category: "交通入口",
    x: 45,
    z: 133,
    w: 33,
    d: 30,
    h: 0,
    node: "r3",
    description:
      "開車到校時可先了解校內停車配置。可使用車位、收費與入校規範請依現場指示，導覽不提供即時剩餘車位。",
    highlights: ["汽車停車", "依現場管制", "無即時車位資訊"],
    source: official.map,
  },
];
interface HallSpec {
  id: string;
  name: string;
  en: string;
  parentId: string;
  floor: string;
  room?: string;
  source: string;
  description: string;
}
const graduationSource = "https://www.cyut.edu.tw/114gra/";
const designSource =
  "https://web.cyut.edu.tw/p/405-1000-18936,c4556.php?Lang=zh-tw";
const hallSpecs: HallSpec[] = [
  {
    id: "poding-hall",
    name: "波錠廳",
    en: "Poding Hall",
    parentId: "teaching",
    floor: "2F",
    room: "T1-206",
    source: graduationSource,
    description:
      "位於教學大樓二樓的演講與典禮場地。請先抵達教學大樓，再依二樓 T1-206 指標尋找波錠廳；此處與圖書館的波錠紀念廳不同。",
  },
  {
    id: "design-auditorium",
    name: "設計大樓禮堂",
    en: "Design Building Auditorium",
    parentId: "design",
    floor: "1F",
    room: "D-127",
    source: graduationSource,
    description:
      "位於設計大樓一樓，是校級典禮與活動使用的禮堂。參加活動時，請確認主辦單位公告的入場位置及開放時間。",
  },
  {
    id: "sung-hall",
    name: "時選廳",
    en: "Sung’s Hall",
    parentId: "management",
    floor: "3F",
    room: "T2-305",
    source: graduationSource,
    description:
      "位於管理大樓三樓的廳館，亦為校方畢業典禮活動列示場地。到達管理大樓後，請依 T2-305 房號及現場指標前往。",
  },
  {
    id: "yang-hall",
    name: "天生廳",
    en: "Yang’s Hall",
    parentId: "management",
    floor: "4F",
    room: "T2-405",
    source: graduationSource,
    description:
      "位於管理大樓四樓的演講與活動場地。請依 T2-405 房號尋找天生廳，活動入場與場地使用以主辦單位公告為準。",
  },
  {
    id: "chang-hall",
    name: "美智廳",
    en: "Chang’s Hall",
    parentId: "management",
    floor: "6F",
    room: "T2-606",
    source: graduationSource,
    description:
      "位於管理大樓六樓的廳館。參加演講或典禮時，請先確認活動通知，再依 T2-606 房號與現場指引前往。",
  },
  {
    id: "library-lecture",
    name: "圖書館一樓演講廳",
    en: "Library Lecture Hall",
    parentId: "library",
    floor: "1F",
    source: "https://cyutis.cyut.edu.tw/TSLibrarySpace/Home/SiteIntro",
    description:
      "位於波錠紀念圖書館一樓的演講與活動空間。官方場地介紹列有此演講廳；場地借用、設備與入場規範請查閱圖書館公告。",
  },
  {
    id: "science-e103",
    name: "理工大樓演講廳",
    en: "Science & Engineering Lecture Hall",
    parentId: "science",
    floor: "1F",
    room: "E-103",
    source: "https://web.cyut.edu.tw/p/404-1000-18934.php?Lang=zh-tw",
    description:
      "位於理工大樓一樓 E-103。先抵達理工大樓，再依一樓房號與活動通知尋找演講廳；教室與設施使用依校方管理。",
  },
  {
    id: "management-t2104",
    name: "管理大樓演講廳",
    en: "Management Lecture Hall",
    parentId: "management",
    floor: "1F",
    room: "T2-104",
    source: "https://web.cyut.edu.tw/p/405-1000-18937,c4556.php?Lang=zh-tw",
    description:
      "位於管理大樓一樓 T2-104，與三樓時選廳、四樓天生廳及六樓美智廳為不同場地。請依房號確認活動地點。",
  },
  {
    id: "design-d202",
    name: "設計大樓 D-202 演講廳",
    en: "Design Lecture Hall D-202",
    parentId: "design",
    floor: "2F",
    room: "D-202",
    source: designSource,
    description:
      "設計大樓二樓的演講廳之一，房號 D-202。校方將 D-202 至 D-204 分別列為演講廳，請依活動通知確認正確房間。",
  },
  {
    id: "design-d203",
    name: "設計大樓 D-203 演講廳",
    en: "Design Lecture Hall D-203",
    parentId: "design",
    floor: "2F",
    room: "D-203",
    source: designSource,
    description:
      "位於設計大樓二樓 D-203。此處與相鄰的 D-202、D-204 各自獨立；請依現場房號及活動公告確認入口。",
  },
  {
    id: "design-d204",
    name: "設計大樓 D-204 演講廳",
    en: "Design Lecture Hall D-204",
    parentId: "design",
    floor: "2F",
    room: "D-204",
    source: designSource,
    description:
      "位於設計大樓二樓 D-204，屬官方樓層介紹列示的演講廳。前往參加活動時，請依二樓房號與主辦單位指引入場。",
  },
  {
    id: "aviation-conference",
    name: "航空大樓國際會議廳",
    en: "Aviation International Conference Hall",
    parentId: "aviation",
    floor: "5F",
    room: "V-501",
    source: graduationSource,
    description:
      "位於航空大樓五樓 V-501 的國際會議廳，也是校方典禮活動列示場地。抵達航空大樓後，請依五樓與會議廳指標前往。",
  },
  {
    id: "admin-conference",
    name: "行政大樓六樓會議廳",
    en: "Administration Conference Hall",
    parentId: "admin",
    floor: "6F",
    source: "https://web.cyut.edu.tw/p/405-1000-18931,c4556.php?Lang=zh-tw",
    description:
      "官方行政大樓樓層介紹列示的六樓會議廳。參與演講、會議或校務活動前，請確認活動通知與入場安排。",
  },
];
export const halls: Place[] = hallSpecs.map((spec) => {
  const parent = campusPlaces.find((p) => p.id === spec.parentId)!;
  return {
    ...parent,
    ...spec,
    category: "演講廳與禮堂",
    code: spec.room,
    highlights: [
      parent.name,
      spec.floor,
      ...(spec.room ? [spec.room] : []),
      "室內地點",
    ],
    aliases: ["演講廳", "禮堂", "會議廳", parent.name],
  };
});
export const places: Place[] = [...campusPlaces, ...halls];
export function matchesPlace(p: Place, query: string) {
  const normalize = (s: string) => s.toLowerCase().replace(/[\s\-－–]/g, "");
  return normalize(
    [
      p.name,
      p.en,
      p.code ?? "",
      p.floor ?? "",
      ...p.highlights,
      ...(p.aliases ?? []),
    ].join(" "),
  ).includes(normalize(query));
}
export const categories: Category[] = [
  "演講廳與禮堂",
  "學習空間",
  "行政服務",
  "生活機能",
  "運動休憩",
  "交通入口",
];
export const categoryColor: Record<Category, string> = {
  演講廳與禮堂: "#b1844c",
  學習空間: "#b6b5a1",
  行政服務: "#c9ad87",
  生活機能: "#b6a69f",
  運動休憩: "#7e9c78",
  交通入口: "#8d9e9b",
};
export const tours = [
  {
    id: "first",
    title: "第一次來朝陽",
    subtitle: "從校門出發，認識校園的核心風景",
    icon: "sun",
    stops: ["gate", "admin", "plaza", "library", "teaching"],
    tag: "新生・訪客",
  },
  {
    id: "learn",
    title: "學習探索路線",
    subtitle: "走進知識、設計與科技的日常",
    icon: "book",
    stops: [
      "library",
      "management",
      "design",
      "teaching",
      "science",
      "information",
    ],
    tag: "學習・探索",
  },
  {
    id: "slow",
    title: "校園慢步調",
    subtitle: "留一段時間給綠意、運動與生活",
    icon: "leaf",
    stops: ["plaza", "gym", "field", "courts", "dorm"],
    tag: "散步・生活",
  },
];
export const byId = (id: string) => places.find((p) => p.id === id)!;
