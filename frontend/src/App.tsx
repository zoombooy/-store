import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  LayoutGrid,
  Minus,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  X,
  XCircle
} from "lucide-react";

import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getProducts,
  getSummary,
  toggleProductStatus,
  updateProduct
} from "./api";
import { BRANDS, FALLBACK_PRODUCT_IMAGE, HERO_CAROUSEL, TEAMS } from "./constants";
import { CartItem, Category, Product, ProductInput, StoreSummary, Team } from "./types";

type View = "home" | "list" | "admin";
type Filter = { title: string; categoryId?: string; teamId?: string; search?: string };
const CART_KEY = "nba-store-cart";

function fmtPrice(value: number): string {
  return `¥${value.toFixed(0)}`;
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return parsed.filter((x) => x.productId && x.quantity > 0);
  } catch {
    return [];
  }
}

function teamLabel(id: string | null): string {
  if (!id) return "Universal";
  const team = TEAMS.find((x) => x.id === id);
  return team ? `${team.city} ${team.name}` : id;
}

function formatTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (payload: ProductInput, id?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? "",
    price: product?.price ?? 1,
    image: product?.image ?? "",
    teamId: product?.teamId ?? null,
    categoryId: product?.categoryId ?? categories[0]?.id ?? "regular",
    enabled: product?.enabled ?? true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: product?.name ?? "",
      price: product?.price ?? 1,
      image: product?.image ?? "",
      teamId: product?.teamId ?? null,
      categoryId: product?.categoryId ?? categories[0]?.id ?? "regular",
      enabled: product?.enabled ?? true
    });
  }, [product, categories]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(
        {
          ...form,
          image: form.image.trim() || FALLBACK_PRODUCT_IMAGE
        },
        product?.id
      );
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="font-bold">{product ? "Edit Product" : "New Product"}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full border border-zinc-300 inline-flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 grid gap-3">
          <input
            required
            minLength={2}
            maxLength={80}
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
            placeholder="Product name"
            className="h-11 rounded-xl border border-zinc-300 px-3"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required
              min={1}
              type="number"
              value={form.price}
              onChange={(e) => setForm((v) => ({ ...v, price: Number(e.target.value) }))}
              className="h-11 rounded-xl border border-zinc-300 px-3"
            />
            <select
              value={form.categoryId}
              onChange={(e) => setForm((v) => ({ ...v, categoryId: e.target.value }))}
              className="h-11 rounded-xl border border-zinc-300 px-3"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <select
            value={form.teamId ?? ""}
            onChange={(e) => setForm((v) => ({ ...v, teamId: e.target.value || null }))}
            className="h-11 rounded-xl border border-zinc-300 px-3"
          >
            <option value="">Universal Team</option>
            {TEAMS.map((team) => (
              <option key={team.id} value={team.id}>
                {team.city} {team.name}
              </option>
            ))}
          </select>
          <input
            value={form.image}
            onChange={(e) => setForm((v) => ({ ...v, image: e.target.value }))}
            placeholder="Image URL"
            className="h-11 rounded-xl border border-zinc-300 px-3"
          />
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((v) => ({ ...v, enabled: e.target.checked }))}
            />
            Product enabled
          </label>
          <button disabled={saving} className="h-11 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-70">
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CartPanel({
  open,
  items,
  total,
  onClose,
  onInc,
  onDec,
  onRemove
}: {
  open: boolean;
  items: Array<{ product: Product; quantity: number }>;
  total: number;
  onClose: () => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] bg-black/40" onClick={onClose}>
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-zinc-200" onClick={(e) => e.stopPropagation()}>
        <div className="h-full flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="font-bold">Shopping Cart</h3>
            <button onClick={onClose} className="h-8 w-8 rounded-full border border-zinc-300 inline-flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? <p className="text-sm text-zinc-500">Cart is empty.</p> : null}
            {items.map((item) => (
              <div key={item.product.id} className="rounded-2xl border border-zinc-200 p-3 flex gap-3">
                <img src={item.product.image || FALLBACK_PRODUCT_IMAGE} alt={item.product.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2">{item.product.name}</p>
                  <p className="text-sm text-orange-600 font-bold mt-1">{fmtPrice(item.product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => onDec(item.product.id)} className="h-8 w-8 rounded-lg border border-zinc-300 inline-flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onInc(item.product.id)} className="h-8 w-8 rounded-lg border border-zinc-300 inline-flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                    <button onClick={() => onRemove(item.product.id)} className="ml-auto text-xs text-red-600">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-zinc-200 flex items-center justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="font-bold text-orange-600">{fmtPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [filter, setFilter] = useState<Filter>({ title: "Featured Products" });
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<StoreSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => readCart());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adminTab, setAdminTab] = useState<"products" | "categories">("products");
  const [newCategoryName, setNewCategoryName] = useState("");

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [nextCategories, nextProducts, nextSummary] = await Promise.all([
        getCategories(),
        getProducts(true),
        getSummary()
      ]);
      setCategories(nextCategories);
      setProducts(nextProducts);
      setSummary(nextSummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (view !== "home") return;
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % HERO_CAROUSEL.length), 4500);
    return () => window.clearInterval(timer);
  }, [view]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const visibleProducts = useMemo(() => products.filter((p) => p.enabled), [products]);
  const filtered = useMemo(
    () =>
      visibleProducts.filter((p) => {
        if (filter.categoryId && p.categoryId !== filter.categoryId) return false;
        if (filter.teamId && p.teamId !== filter.teamId) return false;
        if (filter.search && !p.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
        return true;
      }),
    [visibleProducts, filter]
  );
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const cartDetails = useMemo(
    () =>
      cart
        .map((x) => ({ product: productMap.get(x.productId), quantity: x.quantity }))
        .filter((x): x is { product: Product; quantity: number } => Boolean(x.product)),
    [cart, productMap]
  );
  const cartCount = useMemo(() => cartDetails.reduce((s, i) => s + i.quantity, 0), [cartDetails]);
  const cartTotal = useMemo(() => cartDetails.reduce((s, i) => s + i.product.price * i.quantity, 0), [cartDetails]);

  function goHome() {
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openCategory(id: string, title?: string) {
    setFilter({ title: title ?? categoryMap.get(id) ?? "Category", categoryId: id });
    setView("list");
  }
  function openTeam(team: Team) {
    setFilter({ title: `${team.city} ${team.name}`, teamId: team.id });
    setView("list");
  }
  function runSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = searchText.trim();
    if (!value) return;
    setFilter({ title: `Search: ${value}`, search: value });
    setView("list");
  }
  function addCart(productId: string) {
    setCart((prev) => {
      const row = prev.find((x) => x.productId === productId);
      if (!row) return [...prev, { productId, quantity: 1 }];
      return prev.map((x) => (x.productId === productId ? { ...x, quantity: x.quantity + 1 } : x));
    });
    setCartOpen(true);
  }
  function incCart(productId: string) {
    setCart((prev) => prev.map((x) => (x.productId === productId ? { ...x, quantity: x.quantity + 1 } : x)));
  }
  function decCart(productId: string) {
    setCart((prev) =>
      prev
        .map((x) => (x.productId === productId ? { ...x, quantity: x.quantity - 1 } : x))
        .filter((x) => x.quantity > 0)
    );
  }
  function removeCart(productId: string) {
    setCart((prev) => prev.filter((x) => x.productId !== productId));
  }

  async function saveProduct(payload: ProductInput, id?: string) {
    try {
      if (id) await updateProduct(id, payload);
      else await createProduct(payload);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Save failed.");
      throw e;
    }
  }
  async function toggleStatus(id: string, enabled: boolean) {
    try {
      await toggleProductStatus(id, enabled);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Status update failed.");
    }
  }
  async function removeProduct(id: string) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Delete failed.");
    }
  }
  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await createCategory(name);
      setNewCategoryName("");
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Create category failed.");
    }
  }
  async function removeCategory(id: string) {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Delete category failed.");
    }
  }

  return (
    <div className="min-h-screen bg-shell text-zinc-900 pb-20 md:pb-8">
      <header className="sticky top-0 z-50 bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={goHome} className="inline-flex items-center gap-2 font-bold hover:text-orange-300">
            <span className="h-9 w-9 rounded-xl bg-orange-500 inline-flex items-center justify-center">
              <ShoppingBag size={18} />
            </span>
            NBA Store / Zhunxin Trade
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <button onClick={goHome} className={`h-10 px-3 rounded-xl ${view === "home" ? "bg-white/15" : "hover:bg-white/10"}`}>Home</button>
            <button onClick={() => setView("admin")} className={`h-10 px-3 rounded-xl ${view === "admin" ? "bg-white/15" : "hover:bg-white/10"}`}>Admin</button>
            <button onClick={() => setCartOpen(true)} className="relative h-10 px-3 rounded-xl hover:bg-white/10 inline-flex items-center gap-2">
              <ShoppingBag size={16} />
              Cart
              {cartCount > 0 ? <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-orange-500 text-[11px] inline-flex items-center justify-center">{cartCount}</span> : null}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {view === "home" ? (
          <>
            <section className="relative rounded-3xl overflow-hidden bg-zinc-900 text-white border border-zinc-800">
              <img src={HERO_CAROUSEL[slide].image} alt={HERO_CAROUSEL[slide].title} className="h-[240px] sm:h-[320px] w-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/40 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Trending</p>
                <h1 className="text-3xl sm:text-4xl font-black">{HERO_CAROUSEL[slide].title}</h1>
                <p className="mt-2 text-sm sm:text-base text-zinc-200 max-w-2xl">{HERO_CAROUSEL[slide].subtitle}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openCategory(HERO_CAROUSEL[slide].categoryId, HERO_CAROUSEL[slide].title)} className="h-10 px-4 rounded-xl bg-orange-500 text-white font-semibold">Shop This Collection</button>
                  <div className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 p-1">
                    {HERO_CAROUSEL.map((s, i) => (
                      <button key={s.id} onClick={() => setSlide(i)} className={`h-7 px-2 rounded-lg text-xs font-semibold ${i === slide ? "bg-white text-zinc-900" : "text-zinc-200"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white/90 border border-zinc-200 shadow-lg p-5 sm:p-6">
              <form onSubmit={runSearch} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search by product keyword" className="h-11 w-full rounded-xl border border-zinc-300 pl-10 pr-3" />
                </div>
                <button className="h-11 px-5 rounded-xl bg-zinc-900 text-white font-semibold">Search</button>
              </form>
            </section>

            <section className="rounded-3xl bg-white/90 border border-zinc-200 shadow-lg p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-xl font-bold">Shop by Team</h2>
                <select defaultValue="" onChange={(e) => { const t = TEAMS.find((x) => x.id === e.target.value); if (t) openTeam(t); }} className="h-10 rounded-xl border border-zinc-300 px-3 text-sm">
                  <option value="" disabled>Quick team select</option>
                  {TEAMS.map((t) => <option key={t.id} value={t.id}>{t.city} {t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {TEAMS.map((team) => (
                  <button key={team.id} onClick={() => openTeam(team)} className="rounded-2xl border border-zinc-200 bg-white p-3 hover:border-orange-300 text-left">
                    <img src={team.logo} alt={team.name} className="h-10 w-10 object-contain" />
                    <p className="mt-2 text-xs font-semibold line-clamp-1">{team.name}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{team.city}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white/90 border border-zinc-200 shadow-lg p-5 sm:p-6">
              <h2 className="text-xl font-bold mb-4">Featured Brands</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {BRANDS.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-zinc-200 bg-white h-24 p-4 flex items-center justify-center">
                    <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain grayscale hover:grayscale-0" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white/90 border border-zinc-200 shadow-lg p-5 sm:p-6">
              <h2 className="text-xl font-bold mb-4">Hot Picks</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleProducts.slice(0, 8).map((p) => (
                  <article key={p.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                    <img src={p.image || FALLBACK_PRODUCT_IMAGE} alt={p.name} className="aspect-square w-full object-cover" />
                    <div className="p-3 space-y-2">
                      <p className="font-semibold line-clamp-2 min-h-10">{p.name}</p>
                      <div className="text-xs text-zinc-500">{categoryMap.get(p.categoryId) ?? p.categoryId}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-600 font-bold">{fmtPrice(p.price)}</span>
                        <button onClick={() => addCart(p.id)} className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold">Add</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {view === "list" ? (
          <section className="rounded-3xl bg-white/90 border border-zinc-200 shadow-lg p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <button onClick={goHome} className="h-9 w-9 rounded-full border border-zinc-300 inline-flex items-center justify-center"><ArrowLeft size={16} /></button>
                <h2 className="text-xl sm:text-2xl font-black">{filter.title}</h2>
              </div>
              <span className="text-sm text-zinc-500">{filtered.length} items</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <article key={p.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                  <img src={p.image || FALLBACK_PRODUCT_IMAGE} alt={p.name} className="aspect-square w-full object-cover" />
                  <div className="p-3 space-y-2">
                    <p className="font-semibold line-clamp-2 min-h-10">{p.name}</p>
                    <div className="text-xs text-zinc-500 flex items-center justify-between">
                      <span>{categoryMap.get(p.categoryId) ?? p.categoryId}</span>
                      <span>{teamLabel(p.teamId)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-600 font-bold">{fmtPrice(p.price)}</span>
                      <button onClick={() => addCart(p.id)} className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold">Add</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!loading && filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-300 mt-6 p-8 text-center text-sm text-zinc-500">No products matched this filter.</div> : null}
          </section>
        ) : null}

        {view === "admin" ? (
          <section className="rounded-3xl bg-white/90 border border-zinc-200 shadow-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">Admin Console</h2>
              <div className="inline-flex rounded-xl bg-zinc-100 p-1">
                <button onClick={() => setAdminTab("products")} className={`h-9 px-4 rounded-lg text-sm font-semibold ${adminTab === "products" ? "bg-white shadow" : "text-zinc-500"}`}>Products</button>
                <button onClick={() => setAdminTab("categories")} className={`h-9 px-4 rounded-lg text-sm font-semibold ${adminTab === "categories" ? "bg-white shadow" : "text-zinc-500"}`}>Categories</button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Total Products</p>
                <p className="mt-2 text-2xl font-black">{summary?.totalProducts ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Enabled Products</p>
                <p className="mt-2 text-2xl font-black text-emerald-600">{summary?.enabledProducts ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Categories</p>
                <p className="mt-2 text-2xl font-black">{summary?.totalCategories ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Last Product Update</p>
                <p className="mt-2 text-sm font-semibold">{formatTime(summary?.latestProductUpdate ?? null)}</p>
              </div>
            </div>

            {adminTab === "products" ? (
              <>
                <div className="flex justify-end">
                  <button onClick={() => { setEditing(null); setEditorOpen(true); }} className="h-10 px-4 rounded-xl bg-orange-500 text-white font-semibold inline-flex items-center gap-2">
                    <Plus size={16} /> New Product
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs">
                      <tr><th className="text-left px-4 py-3">Product</th><th className="text-left px-4 py-3">Price</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.image || FALLBACK_PRODUCT_IMAGE} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                              <div><p className="font-semibold line-clamp-1">{p.name}</p><p className="text-xs text-zinc-500">{teamLabel(p.teamId)}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold">{fmtPrice(p.price)}</td>
                          <td className="px-4 py-3">{categoryMap.get(p.categoryId) ?? p.categoryId}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => void toggleStatus(p.id, !p.enabled)} className={`h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${p.enabled ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"}`}>
                              {p.enabled ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                              {p.enabled ? "Live" : "Hidden"}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setEditing(p); setEditorOpen(true); }} className="h-8 w-8 rounded-lg border border-zinc-300 inline-flex items-center justify-center"><Pencil size={14} /></button>
                              <button onClick={() => void removeProduct(p.id)} className="h-8 w-8 rounded-lg border border-red-200 text-red-600 inline-flex items-center justify-center"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-3">
                  <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" className="h-10 flex-1 rounded-xl border border-zinc-300 px-3" />
                  <button className="h-10 px-4 rounded-xl bg-orange-500 text-white font-semibold inline-flex items-center justify-center gap-2"><Plus size={16} /> Add Category</button>
                </form>
                <div className="rounded-2xl border border-zinc-200 divide-y divide-zinc-200">
                  {categories.map((c) => (
                    <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0"><Tag size={16} className="text-zinc-400" /><span className="font-semibold">{c.name}</span><span className="text-xs text-zinc-500 font-mono">{c.id}</span></div>
                      <button onClick={() => void removeCategory(c.id)} className="h-8 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold">Delete</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        ) : null}
      </main>

      <CartPanel open={cartOpen} items={cartDetails} total={cartTotal} onClose={() => setCartOpen(false)} onInc={incCart} onDec={decCart} onRemove={removeCart} />

      {editorOpen ? <ProductModal product={editing} categories={categories} onClose={() => setEditorOpen(false)} onSave={saveProduct} /> : null}

      <nav className="fixed md:hidden bottom-0 inset-x-0 h-16 border-t border-zinc-200 bg-white/95 z-40">
        <div className="h-full grid grid-cols-3">
          <button onClick={goHome} className={`flex flex-col items-center justify-center text-xs font-semibold ${view === "home" ? "text-orange-600" : "text-zinc-500"}`}><Home size={18} />Home</button>
          <button onClick={() => setView("admin")} className={`flex flex-col items-center justify-center text-xs font-semibold ${view === "admin" ? "text-orange-600" : "text-zinc-500"}`}><LayoutGrid size={18} />Admin</button>
          <button onClick={() => setCartOpen(true)} className="relative flex flex-col items-center justify-center text-xs font-semibold text-zinc-500">
            <ShoppingBag size={18} />
            Cart
            {cartCount > 0 ? <span className="absolute top-2 right-[calc(50%-26px)] h-4 min-w-4 px-1 rounded-full bg-orange-500 text-[10px] text-white font-bold inline-flex items-center justify-center">{cartCount}</span> : null}
          </button>
        </div>
      </nav>
    </div>
  );
}
