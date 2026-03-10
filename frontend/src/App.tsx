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
const PANEL_CLASS =
  "rounded-3xl border border-white/70 bg-white/78 backdrop-blur-xl shadow-[0_18px_42px_-30px_rgba(15,23,42,0.55)]";
const TABLE_PANEL_CLASS =
  "rounded-3xl border border-white/70 bg-white/82 backdrop-blur-xl shadow-[0_18px_42px_-30px_rgba(15,23,42,0.5)]";

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
  if (!id) return "通用";
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
          <h3 className="font-bold">{product ? "编辑商品" : "新增商品"}</h3>
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
            placeholder="商品名称"
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
            <option value="">通用球队</option>
            {TEAMS.map((team) => (
              <option key={team.id} value={team.id}>
                {team.city} {team.name}
              </option>
            ))}
          </select>
          <input
            value={form.image}
            onChange={(e) => setForm((v) => ({ ...v, image: e.target.value }))}
            placeholder="图片链接"
            className="h-11 rounded-xl border border-zinc-300 px-3"
          />
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((v) => ({ ...v, enabled: e.target.checked }))}
            />
            商品上架
          </label>
          <button disabled={saving} className="h-11 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-70">
            {saving ? "保存中..." : "保存"}
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
            <h3 className="font-bold">购物车</h3>
            <button onClick={onClose} className="h-8 w-8 rounded-full border border-zinc-300 inline-flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? <p className="text-sm text-zinc-500">购物车为空。</p> : null}
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
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-zinc-200 flex items-center justify-between">
            <span className="font-semibold">小计</span>
            <span className="font-bold text-orange-600">{fmtPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [filter, setFilter] = useState<Filter>({ title: "精选商品" });
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
      setError(e instanceof Error ? e.message : "数据加载失败。");
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
    setFilter({ title: title ?? categoryMap.get(id) ?? "分类商品", categoryId: id });
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
    setFilter({ title: `搜索结果：${value}`, search: value });
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
      window.alert(e instanceof Error ? e.message : "保存失败。");
      throw e;
    }
  }
  async function toggleStatus(id: string, enabled: boolean) {
    try {
      await toggleProductStatus(id, enabled);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "状态更新失败。");
    }
  }
  async function removeProduct(id: string) {
    if (!window.confirm("确认删除该商品？")) return;
    try {
      await deleteProduct(id);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "删除失败。");
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
      window.alert(e instanceof Error ? e.message : "新增分类失败。");
    }
  }
  async function removeCategory(id: string) {
    if (!window.confirm("确认删除该分类？")) return;
    try {
      await deleteCategory(id);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "删除分类失败。");
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-shell text-zinc-900 pb-20 md:pb-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] bg-[radial-gradient(circle_at_16%_18%,rgba(249,115,22,0.2),transparent_54%),radial-gradient(circle_at_82%_0%,rgba(56,189,248,0.18),transparent_50%)]" />
      <div className="pointer-events-none absolute -left-16 top-44 -z-10 h-56 w-56 rounded-full bg-orange-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-72 -z-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/82 backdrop-blur-xl shadow-[0_8px_30px_-24px_rgba(15,23,42,0.6)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={goHome} className="inline-flex items-center gap-2 font-bold text-zinc-900 hover:text-orange-600 transition-colors">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_10px_18px_-10px_rgba(249,115,22,0.85)] inline-flex items-center justify-center">
              <ShoppingBag size={18} />
            </span>
            准心贸易
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <button onClick={goHome} className={`h-10 px-3 rounded-xl transition-colors ${view === "home" ? "bg-zinc-900 text-white shadow-sm" : "hover:bg-zinc-100"}`}>首页</button>
            <button onClick={() => setView("admin")} className={`h-10 px-3 rounded-xl transition-colors ${view === "admin" ? "bg-zinc-900 text-white shadow-sm" : "hover:bg-zinc-100"}`}>后台</button>
            <button onClick={() => setCartOpen(true)} className="relative h-10 px-3 rounded-xl hover:bg-zinc-100 inline-flex items-center gap-2 transition-colors">
              <ShoppingBag size={16} />
              购物车
              {cartCount > 0 ? <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-[11px] text-white inline-flex items-center justify-center">{cartCount}</span> : null}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {view === "home" ? (
          <>
            <section className="relative overflow-hidden rounded-[30px] border border-white/40 bg-zinc-900/90 text-white shadow-[0_24px_55px_-34px_rgba(15,23,42,0.95)]">
              <img src={HERO_CAROUSEL[slide].image} alt={HERO_CAROUSEL[slide].title} className="h-[240px] sm:h-[320px] w-full object-cover opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/86 via-zinc-900/40 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-300">本周热卖</p>
                <h1 className="text-3xl sm:text-4xl font-black drop-shadow-sm">{HERO_CAROUSEL[slide].title}</h1>
                <p className="mt-2 text-sm sm:text-base text-zinc-100/95 max-w-2xl">{HERO_CAROUSEL[slide].subtitle}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openCategory(HERO_CAROUSEL[slide].categoryId, HERO_CAROUSEL[slide].title)}
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-[0_12px_24px_-12px_rgba(249,115,22,0.9)]"
                  >
                    进入专区
                  </button>
                  <div className="inline-flex items-center rounded-xl border border-white/40 bg-white/10 p-1 backdrop-blur-sm">
                    {HERO_CAROUSEL.map((s, i) => (
                      <button key={s.id} onClick={() => setSlide(i)} className={`h-7 px-2 rounded-lg text-xs font-semibold transition-colors ${i === slide ? "bg-white text-zinc-900" : "text-zinc-200 hover:text-white"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className={`${PANEL_CLASS} p-5 sm:p-6`}>
              <form onSubmit={runSearch} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="请输入商品关键字搜索"
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white/90 pl-10 pr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <button className="h-11 px-5 rounded-xl bg-zinc-900 text-white font-semibold shadow-[0_12px_24px_-16px_rgba(15,23,42,0.9)]">搜索</button>
              </form>
            </section>

            <section className={`${PANEL_CLASS} p-5 sm:p-6`}>
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-xl font-bold">按球队选购</h2>
                <select defaultValue="" onChange={(e) => { const t = TEAMS.find((x) => x.id === e.target.value); if (t) openTeam(t); }} className="h-10 rounded-xl border border-zinc-200 bg-white/90 px-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                  <option value="" disabled>快速选择球队</option>
                  {TEAMS.map((t) => <option key={t.id} value={t.id}>{t.city} {t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {TEAMS.map((team) => (
                  <button key={team.id} onClick={() => openTeam(team)} className="rounded-2xl border border-zinc-200 bg-white/90 p-3 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_14px_30px_-22px_rgba(249,115,22,0.9)] text-left transition-all">
                    <img src={team.logo} alt={team.name} className="h-10 w-10 object-contain" />
                    <p className="mt-2 text-xs font-semibold line-clamp-1">{team.name}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{team.city}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className={`${PANEL_CLASS} p-5 sm:p-6`}>
              <h2 className="text-xl font-bold mb-4">品牌专区</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {BRANDS.map((b) => (
                  <div key={b.id} className="rounded-2xl border border-zinc-200 bg-white/92 h-24 p-4 flex items-center justify-center transition-transform hover:-translate-y-0.5">
                    <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain grayscale hover:grayscale-0" />
                  </div>
                ))}
              </div>
            </section>

            <section className={`${PANEL_CLASS} p-5 sm:p-6`}>
              <h2 className="text-xl font-bold mb-4">热门推荐</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleProducts.slice(0, 8).map((p) => (
                  <article key={p.id} className="rounded-2xl border border-zinc-200 bg-white/95 overflow-hidden shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)]">
                    <img src={p.image || FALLBACK_PRODUCT_IMAGE} alt={p.name} className="aspect-square w-full object-cover" />
                    <div className="p-3 space-y-2">
                      <p className="font-semibold line-clamp-2 min-h-10">{p.name}</p>
                      <div className="text-xs text-zinc-500">{categoryMap.get(p.categoryId) ?? p.categoryId}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-600 font-bold">{fmtPrice(p.price)}</span>
                        <button onClick={() => addCart(p.id)} className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold shadow-[0_10px_20px_-12px_rgba(15,23,42,0.9)]">加入购物车</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {view === "list" ? (
          <section className={`${PANEL_CLASS} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <button onClick={goHome} className="h-9 w-9 rounded-full border border-zinc-300 inline-flex items-center justify-center"><ArrowLeft size={16} /></button>
                <h2 className="text-xl sm:text-2xl font-black">{filter.title}</h2>
              </div>
              <span className="text-sm text-zinc-500">{filtered.length} 件商品</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <article key={p.id} className="rounded-2xl border border-zinc-200 bg-white/95 overflow-hidden shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)]">
                  <img src={p.image || FALLBACK_PRODUCT_IMAGE} alt={p.name} className="aspect-square w-full object-cover" />
                  <div className="p-3 space-y-2">
                    <p className="font-semibold line-clamp-2 min-h-10">{p.name}</p>
                    <div className="text-xs text-zinc-500 flex items-center justify-between">
                      <span>{categoryMap.get(p.categoryId) ?? p.categoryId}</span>
                      <span>{teamLabel(p.teamId)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-600 font-bold">{fmtPrice(p.price)}</span>
                      <button onClick={() => addCart(p.id)} className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold shadow-[0_10px_20px_-12px_rgba(15,23,42,0.9)]">加入购物车</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!loading && filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-300 mt-6 p-8 text-center text-sm text-zinc-500">没有匹配的商品。</div> : null}
          </section>
        ) : null}

        {view === "admin" ? (
          <section className={`${TABLE_PANEL_CLASS} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">管理后台</h2>
              <div className="inline-flex rounded-xl bg-zinc-100/90 p-1">
                <button onClick={() => setAdminTab("products")} className={`h-9 px-4 rounded-lg text-sm font-semibold transition-colors ${adminTab === "products" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>商品管理</button>
                <button onClick={() => setAdminTab("categories")} className={`h-9 px-4 rounded-lg text-sm font-semibold transition-colors ${adminTab === "categories" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>分类管理</button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">商品总数</p>
                <p className="mt-2 text-2xl font-black">{summary?.totalProducts ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">上架商品</p>
                <p className="mt-2 text-2xl font-black text-emerald-600">{summary?.enabledProducts ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">分类数量</p>
                <p className="mt-2 text-2xl font-black">{summary?.totalCategories ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">最近更新时间</p>
                <p className="mt-2 text-sm font-semibold">{formatTime(summary?.latestProductUpdate ?? null)}</p>
              </div>
            </div>

            {adminTab === "products" ? (
              <>
                <div className="flex justify-end">
                  <button onClick={() => { setEditing(null); setEditorOpen(true); }} className="h-10 px-4 rounded-xl bg-orange-500 text-white font-semibold inline-flex items-center gap-2">
                    <Plus size={16} /> 新增商品
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white/90">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs">
                      <tr><th className="text-left px-4 py-3">商品</th><th className="text-left px-4 py-3">价格</th><th className="text-left px-4 py-3">分类</th><th className="text-left px-4 py-3">状态</th><th className="text-right px-4 py-3">操作</th></tr>
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
                              {p.enabled ? "已上架" : "已下架"}
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
                  <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="请输入分类名称" className="h-10 flex-1 rounded-xl border border-zinc-300 px-3" />
                  <button className="h-10 px-4 rounded-xl bg-orange-500 text-white font-semibold inline-flex items-center justify-center gap-2"><Plus size={16} /> 新增分类</button>
                </form>
                <div className="rounded-2xl border border-zinc-200 divide-y divide-zinc-200">
                  {categories.map((c) => (
                    <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0"><Tag size={16} className="text-zinc-400" /><span className="font-semibold">{c.name}</span><span className="text-xs text-zinc-500 font-mono">{c.id}</span></div>
                      <button onClick={() => void removeCategory(c.id)} className="h-8 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold">删除</button>
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

      <nav className="fixed md:hidden bottom-0 inset-x-0 h-16 border-t border-white/80 bg-white/88 backdrop-blur-xl z-40 shadow-[0_-10px_30px_-20px_rgba(15,23,42,0.55)]">
        <div className="h-full grid grid-cols-3">
          <button onClick={goHome} className={`flex flex-col items-center justify-center text-xs font-semibold ${view === "home" ? "text-orange-600" : "text-zinc-500"}`}><Home size={18} />首页</button>
          <button onClick={() => setView("admin")} className={`flex flex-col items-center justify-center text-xs font-semibold ${view === "admin" ? "text-orange-600" : "text-zinc-500"}`}><LayoutGrid size={18} />后台</button>
          <button onClick={() => setCartOpen(true)} className="relative flex flex-col items-center justify-center text-xs font-semibold text-zinc-500">
            <ShoppingBag size={18} />
            购物车
            {cartCount > 0 ? <span className="absolute top-2 right-[calc(50%-26px)] h-4 min-w-4 px-1 rounded-full bg-orange-500 text-[10px] text-white font-bold inline-flex items-center justify-center">{cartCount}</span> : null}
          </button>
        </div>
      </nav>
    </div>
  );
}
