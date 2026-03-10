import { Brand, CarouselItem, Team } from './types';

export const BRANDS: Brand[] = [
  { id: 'nike', name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { id: 'adidas', name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
  { id: 'jordan', name: 'Jordan', logo: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' },
  { id: 'ua', name: 'Under Armour', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Under_Armour_logo.svg' },
  { id: 'puma', name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/zh/b/b3/Puma_Logo.svg' },
  { id: 'converse', name: 'Converse', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg' }
];

export const TEAMS: Team[] = [
  { id: 'atl', name: 'Hawks', city: 'Atlanta', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png' },
  { id: 'bkn', name: 'Nets', city: 'Brooklyn', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png' },
  { id: 'bos', name: 'Celtics', city: 'Boston', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' },
  { id: 'cha', name: 'Hornets', city: 'Charlotte', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png' },
  { id: 'chi', name: 'Bulls', city: 'Chicago', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { id: 'cle', name: 'Cavaliers', city: 'Cleveland', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png' },
  { id: 'dal', name: 'Mavericks', city: 'Dallas', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png' },
  { id: 'den', name: 'Nuggets', city: 'Denver', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png' },
  { id: 'det', name: 'Pistons', city: 'Detroit', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png' },
  { id: 'gsw', name: 'Warriors', city: 'Golden State', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png' },
  { id: 'hou', name: 'Rockets', city: 'Houston', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png' },
  { id: 'ind', name: 'Pacers', city: 'Indiana', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png' },
  { id: 'lac', name: 'Clippers', city: 'Los Angeles', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png' },
  { id: 'lal', name: 'Lakers', city: 'Los Angeles', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
  { id: 'mem', name: 'Grizzlies', city: 'Memphis', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png' },
  { id: 'mia', name: 'Heat', city: 'Miami', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png' },
  { id: 'mil', name: 'Bucks', city: 'Milwaukee', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png' },
  { id: 'min', name: 'Timberwolves', city: 'Minnesota', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png' },
  { id: 'nop', name: 'Pelicans', city: 'New Orleans', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png' },
  { id: 'nyk', name: 'Knicks', city: 'New York', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/nyk.png' },
  { id: 'okc', name: 'Thunder', city: 'Oklahoma City', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png' },
  { id: 'orl', name: 'Magic', city: 'Orlando', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png' },
  { id: 'phi', name: '76ers', city: 'Philadelphia', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png' },
  { id: 'phx', name: 'Suns', city: 'Phoenix', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png' },
  { id: 'por', name: 'Trail Blazers', city: 'Portland', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png' },
  { id: 'sac', name: 'Kings', city: 'Sacramento', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png' },
  { id: 'sas', name: 'Spurs', city: 'San Antonio', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sas.png' },
  { id: 'tor', name: 'Raptors', city: 'Toronto', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png' },
  { id: 'uta', name: 'Jazz', city: 'Utah', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png' },
  { id: 'was', name: 'Wizards', city: 'Washington', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/was.png' }
];

export const HERO_CAROUSEL: CarouselItem[] = [
  {
    id: 'hero-special',
    title: 'Special Deals Week',
    subtitle: 'Flash markdowns for jerseys, sneakers, and fan packs',
    image: 'https://picsum.photos/seed/nba-specials/1600/800',
    categoryId: 'special'
  },
  {
    id: 'hero-streetwear',
    title: 'Streetwear Drop',
    subtitle: 'Latest capsule collabs from top sportswear labels',
    image: 'https://picsum.photos/seed/nba-streetwear/1600/800',
    categoryId: 'streetwear'
  },
  {
    id: 'hero-allstar',
    title: 'All-Star Collection',
    subtitle: 'Commemorative editions and game-day exclusives',
    image: 'https://picsum.photos/seed/nba-allstar/1600/800',
    categoryId: 'allstar'
  }
];

export const FALLBACK_PRODUCT_IMAGE = 'https://picsum.photos/seed/nba-default/600/600';
