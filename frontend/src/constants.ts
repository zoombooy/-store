import { Brand, CarouselItem, Team } from "./types";

export const BRANDS: Brand[] = [
  { id: "nike", name: "\u8010\u514b", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
  { id: "adidas", name: "\u963f\u8fea\u8fbe\u65af", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
  { id: "jordan", name: "\u4e54\u4e39", logo: "https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg" },
  { id: "under-armour", name: "\u5b89\u5fb7\u739b", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_Armour_logo.svg" },
  { id: "puma", name: "\u5f6a\u9a6c", logo: "https://upload.wikimedia.org/wikipedia/zh/b/b3/Puma_Logo.svg" },
  { id: "converse", name: "\u5321\u5a01", logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg" }
];

// Lakers, Warriors, Spurs, Rockets, Celtics, Heat first. Hawks last.
export const TEAMS: Team[] = [
  { id: "lal", name: "\u6e56\u4eba", city: "\u6d1b\u6749\u77f6", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
  { id: "gsw", name: "\u52c7\u58eb", city: "\u91d1\u5dde", logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png" },
  { id: "sas", name: "\u9a6c\u523a", city: "\u5723\u5b89\u4e1c\u5c3c\u5965", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sas.png" },
  { id: "hou", name: "\u706b\u7bad", city: "\u4f11\u65af\u987f", logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png" },
  { id: "bos", name: "\u51ef\u5c14\u7279\u4eba", city: "\u6ce2\u58eb\u987f", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
  { id: "mia", name: "\u70ed\u706b", city: "\u8fc8\u963f\u5bc6", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
  { id: "bkn", name: "\u7bee\u7f51", city: "\u5e03\u9c81\u514b\u6797", logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
  { id: "nyk", name: "\u5c3c\u514b\u65af", city: "\u7ebd\u7ea6", logo: "https://a.espncdn.com/i/teamlogos/nba/500/nyk.png" },
  { id: "phi", name: "76\u4eba", city: "\u8d39\u57ce", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png" },
  { id: "tor", name: "\u731b\u9f99", city: "\u591a\u4f26\u591a", logo: "https://a.espncdn.com/i/teamlogos/nba/500/tor.png" },
  { id: "chi", name: "\u516c\u725b", city: "\u829d\u52a0\u54e5", logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
  { id: "cle", name: "\u9a91\u58eb", city: "\u514b\u5229\u592b\u5170", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png" },
  { id: "det", name: "\u6d3b\u585e", city: "\u5e95\u7279\u5f8b", logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png" },
  { id: "ind", name: "\u6b65\u884c\u8005", city: "\u5370\u7b2c\u5b89\u7eb3", logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png" },
  { id: "mil", name: "\u96c4\u9e7f", city: "\u5bc6\u5c14\u6c83\u57fa", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
  { id: "cha", name: "\u9ec4\u8702", city: "\u590f\u6d1b\u7279", logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png" },
  { id: "orl", name: "\u9b54\u672f", city: "\u5965\u5170\u591a", logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png" },
  { id: "was", name: "\u5947\u624d", city: "\u534e\u76db\u987f", logo: "https://a.espncdn.com/i/teamlogos/nba/500/was.png" },
  { id: "den", name: "\u6398\u91d1", city: "\u4e39\u4f5b", logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
  { id: "min", name: "\u68ee\u6797\u72fc", city: "\u660e\u5c3c\u82cf\u8fbe", logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png" },
  { id: "okc", name: "\u96f7\u9706", city: "\u4fc4\u514b\u62c9\u8377\u9a6c\u57ce", logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png" },
  { id: "por", name: "\u5f00\u62d3\u8005", city: "\u6ce2\u7279\u5170", logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png" },
  { id: "uta", name: "\u7235\u58eb", city: "\u72b9\u4ed6", logo: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png" },
  { id: "lac", name: "\u5feb\u8239", city: "\u6d1b\u6749\u77f6", logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
  { id: "phx", name: "\u592a\u9633", city: "\u83f2\u5c3c\u514b\u65af", logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
  { id: "sac", name: "\u56fd\u738b", city: "\u8428\u514b\u62c9\u95e8\u6258", logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png" },
  { id: "dal", name: "\u72ec\u884c\u4fa0", city: "\u8fbe\u62c9\u65af", logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
  { id: "mem", name: "\u7070\u718a", city: "\u5b5f\u83f2\u65af", logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png" },
  { id: "nop", name: "\u9e48\u9e55", city: "\u65b0\u5965\u5c14\u826f", logo: "https://a.espncdn.com/i/teamlogos/nba/500/no.png" },
  { id: "atl", name: "\u8001\u9e70", city: "\u4e9a\u7279\u5170\u5927", logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png" }
];

export const HERO_CAROUSEL: CarouselItem[] = [
  {
    id: "hero-special",
    title: "\u7279\u60e0\u98ce\u66b4\u5468",
    subtitle: "\u7403\u8863\u3001\u7403\u978b\u3001\u5468\u8fb9\u9650\u65f6\u76f4\u964d",
    image: "https://picsum.photos/seed/nba-specials/1600/800",
    categoryId: "special"
  },
  {
    id: "hero-streetwear",
    title: "\u6f6e\u6d41\u8054\u540d\u4e13\u533a",
    subtitle: "\u70ed\u95e8\u8fd0\u52a8\u54c1\u724c\u8054\u540d\u65b0\u54c1",
    image: "https://picsum.photos/seed/nba-streetwear/1600/800",
    categoryId: "streetwear"
  },
  {
    id: "hero-allstar",
    title: "\u5168\u660e\u661f\u5178\u85cf",
    subtitle: "\u7eaa\u5ff5\u6b3e\u4e0e\u6bd4\u8d5b\u65e5\u9650\u5b9a",
    image: "https://picsum.photos/seed/nba-allstar/1600/800",
    categoryId: "allstar"
  }
];

export const FALLBACK_PRODUCT_IMAGE = "https://picsum.photos/seed/nba-default/600/600";
