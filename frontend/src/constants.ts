import { Brand, CarouselItem, Team } from "./types";

export const BRANDS: Brand[] = [
  { id: "nike", name: "耐克", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
  { id: "adidas", name: "阿迪达斯", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
  { id: "jordan", name: "乔丹", logo: "https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg" },
  {
    id: "ua",
    name: "安德玛",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_Armour_logo.svg"
  },
  { id: "puma", name: "彪马", logo: "https://upload.wikimedia.org/wikipedia/zh/b/b3/Puma_Logo.svg" },
  { id: "converse", name: "匡威", logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg" }
];

export const TEAMS: Team[] = [
  { id: "atl", name: "老鹰", city: "亚特兰大", logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png" },
  { id: "bkn", name: "篮网", city: "布鲁克林", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
  { id: "bos", name: "凯尔特人", city: "波士顿", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
  { id: "cha", name: "黄蜂", city: "夏洛特", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png" },
  { id: "chi", name: "公牛", city: "芝加哥", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
  { id: "cle", name: "骑士", city: "克利夫兰", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png" },
  { id: "dal", name: "独行侠", city: "达拉斯", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
  { id: "den", name: "掘金", city: "丹佛", logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
  { id: "det", name: "活塞", city: "底特律", logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png" },
  { id: "gsw", name: "勇士", city: "金州", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png" },
  { id: "hou", name: "火箭", city: "休斯顿", logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png" },
  { id: "ind", name: "步行者", city: "印第安纳", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png" },
  { id: "lac", name: "快船", city: "洛杉矶", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
  { id: "lal", name: "湖人", city: "洛杉矶", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
  { id: "mem", name: "灰熊", city: "孟菲斯", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png" },
  { id: "mia", name: "热火", city: "迈阿密", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
  { id: "mil", name: "雄鹿", city: "密尔沃基", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
  { id: "min", name: "森林狼", city: "明尼苏达", logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png" },
  { id: "nop", name: "鹈鹕", city: "新奥尔良", logo: "https://a.espncdn.com/i/teamlogos/nba/500/no.png" },
  { id: "nyk", name: "尼克斯", city: "纽约", logo: "https://a.espncdn.com/i/teamlogos/nba/500/nyk.png" },
  { id: "okc", name: "雷霆", city: "俄克拉荷马城", logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png" },
  { id: "orl", name: "魔术", city: "奥兰多", logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png" },
  { id: "phi", name: "76人", city: "费城", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png" },
  { id: "phx", name: "太阳", city: "菲尼克斯", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
  { id: "por", name: "开拓者", city: "波特兰", logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png" },
  { id: "sac", name: "国王", city: "萨克拉门托", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png" },
  { id: "sas", name: "马刺", city: "圣安东尼奥", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sas.png" },
  { id: "tor", name: "猛龙", city: "多伦多", logo: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png" },
  { id: "uta", name: "爵士", city: "犹他", logo: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png" },
  { id: "was", name: "奇才", city: "华盛顿", logo: "https://a.espncdn.com/i/teamlogos/nba/500/was.png" }
];

export const HERO_CAROUSEL: CarouselItem[] = [
  {
    id: "hero-special",
    title: "特惠风暴周",
    subtitle: "球衣、球鞋、周边限时直降",
    image: "https://picsum.photos/seed/nba-specials/1600/800",
    categoryId: "special"
  },
  {
    id: "hero-streetwear",
    title: "潮流联名专区",
    subtitle: "热门运动品牌联名新品",
    image: "https://picsum.photos/seed/nba-streetwear/1600/800",
    categoryId: "streetwear"
  },
  {
    id: "hero-allstar",
    title: "全明星典藏",
    subtitle: "纪念款与比赛日限定",
    image: "https://picsum.photos/seed/nba-allstar/1600/800",
    categoryId: "allstar"
  }
];

export const FALLBACK_PRODUCT_IMAGE = "https://picsum.photos/seed/nba-default/600/600";
