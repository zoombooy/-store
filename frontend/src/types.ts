export interface Team {
  id: string;
  name: string;
  logo: string;
  city: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  teamId: string | null;
  categoryId: string;
  enabled: boolean;
}

export interface ProductInput {
  name: string;
  price: number;
  image: string;
  teamId: string | null;
  categoryId: string;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  categoryId: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface StoreSummary {
  totalProducts: number;
  enabledProducts: number;
  totalCategories: number;
  latestProductUpdate: string | null;
}
