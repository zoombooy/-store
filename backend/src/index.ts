import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

type CategoryRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  image: string;
  teamId: string | null;
  categoryId: string;
  enabled: number;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  teamId: string | null;
  categoryId: string;
  enabled: boolean;
};

type ProductInput = {
  name: string;
  price: number;
  image: string;
  teamId: string | null;
  categoryId: string;
  enabled: boolean;
};

const SEED_CATEGORIES: Array<Omit<CategoryRow, "createdAt" | "updatedAt">> = [
  { id: "special", name: "特价专区" },
  { id: "streetwear", name: "潮流专区" },
  { id: "allstar", name: "全明星专区" },
  { id: "regular", name: "常规商品" }
];

const SEED_PRODUCTS: Array<Omit<ProductRow, "createdAt" | "updatedAt">> = [
  {
    id: "p_1",
    name: "湖人24号经典复刻球衣",
    price: 599,
    image: "https://picsum.photos/seed/lakers-jersey/600/600",
    teamId: "lal",
    categoryId: "special",
    enabled: 1
  },
  {
    id: "p_2",
    name: "勇士签名款篮球鞋",
    price: 1299,
    image: "https://picsum.photos/seed/warriors-shoe/600/600",
    teamId: "gsw",
    categoryId: "special",
    enabled: 1
  },
  {
    id: "p_3",
    name: "NBA x Nike 联名卫衣",
    price: 499,
    image: "https://picsum.photos/seed/nike-hoodie/600/600",
    teamId: null,
    categoryId: "streetwear",
    enabled: 1
  },
  {
    id: "p_4",
    name: "公牛复古棒球帽",
    price: 199,
    image: "https://picsum.photos/seed/bulls-cap/600/600",
    teamId: "chi",
    categoryId: "streetwear",
    enabled: 1
  },
  {
    id: "p_5",
    name: "全明星官方比赛球衣",
    price: 899,
    image: "https://picsum.photos/seed/allstar-jersey/600/600",
    teamId: null,
    categoryId: "allstar",
    enabled: 1
  },
  {
    id: "p_6",
    name: "火箭队训练短袖",
    price: 159,
    image: "https://picsum.photos/seed/rockets-tee/600/600",
    teamId: "hou",
    categoryId: "regular",
    enabled: 1
  },
  {
    id: "p_7",
    name: "马刺运动短裤",
    price: 229,
    image: "https://picsum.photos/seed/spurs-shorts/600/600",
    teamId: "sas",
    categoryId: "regular",
    enabled: 1
  },
  {
    id: "p_8",
    name: "凯尔特人围巾",
    price: 99,
    image: "https://picsum.photos/seed/celtics-scarf/600/600",
    teamId: "bos",
    categoryId: "regular",
    enabled: 1
  }
];

const LEGACY_CATEGORY_NAME_MAP: Record<string, string> = {
  "Special Deals": "特价专区",
  Streetwear: "潮流专区",
  "All-Star Picks": "全明星专区",
  "Regular Items": "常规商品"
};

const LEGACY_PRODUCT_NAME_MAP: Record<string, string> = {
  "Lakers #24 Legacy Jersey": "湖人24号经典复刻球衣",
  "Warriors Signature Basketball Shoes": "勇士签名款篮球鞋",
  "NBA x Nike Hoodie": "NBA x Nike 联名卫衣",
  "Chicago Bulls Vintage Cap": "公牛复古棒球帽",
  "All-Star Official Game Jersey": "全明星官方比赛球衣",
  "Houston Rockets Training Tee": "火箭队训练短袖",
  "Spurs Performance Shorts": "马刺运动短裤",
  "Celtics Fan Scarf": "凯尔特人围巾"
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const dbFile =
  process.env.DB_FILE?.trim()
    ? path.resolve(projectRoot, process.env.DB_FILE.trim())
    : path.resolve(projectRoot, "backend", "data", "nba_store.db");

const port = Number(process.env.PORT ?? 3001);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

function nowIso(): string {
  return new Date().toISOString();
}

function rowToCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name };
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    teamId: row.teamId,
    categoryId: row.categoryId,
    enabled: Boolean(row.enabled)
  };
}

function parseProductInput(payload: unknown): ProductInput {
  const body = payload as Partial<ProductInput>;
  const name = (body.name ?? "").toString().trim();
  const image = (body.image ?? "").toString().trim();
  const categoryId = (body.categoryId ?? "").toString().trim();
  const teamIdRaw = (body.teamId ?? "").toString().trim();
  const parsedPrice = Number(body.price);

  if (!name || name.length < 2 || name.length > 80) {
    throw new Error("商品名称长度需在 2-80 个字符之间。");
  }
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    throw new Error("价格必须是大于 0 的数字。");
  }
  if (!image) {
    throw new Error("请填写商品图片地址。");
  }
  if (!categoryId) {
    throw new Error("请选择商品分类。");
  }

  return {
    name,
    price: parsedPrice,
    image,
    categoryId,
    teamId: teamIdRaw || null,
    enabled: body.enabled ?? true
  };
}

function parseCategoryName(payload: unknown): string {
  const body = payload as { name?: unknown };
  const name = (body.name ?? "").toString().trim();
  if (!name || name.length < 2 || name.length > 32) {
    throw new Error("分类名称长度需在 2-32 个字符之间。");
  }
  return name;
}

function initializeDatabase(): Database.Database {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  const db = new Database(dbFile);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      teamId TEXT,
      categoryId TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories (id)
    );
  `);

  const categoryCount = (db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number }).count;
  const productCount = (db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number }).count;

  if (categoryCount === 0) {
    const insertCategory = db.prepare(`
      INSERT INTO categories (id, name, createdAt, updatedAt)
      VALUES (@id, @name, @createdAt, @updatedAt)
    `);

    const timestamp = nowIso();
    for (const category of SEED_CATEGORIES) {
      insertCategory.run({
        ...category,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  }

  if (productCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, price, image, teamId, categoryId, enabled, createdAt, updatedAt)
      VALUES (@id, @name, @price, @image, @teamId, @categoryId, @enabled, @createdAt, @updatedAt)
    `);

    const timestamp = nowIso();
    for (const product of SEED_PRODUCTS) {
      insertProduct.run({
        ...product,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  }

  // Migrate early English seed content to Chinese without overriding custom user data.
  const updateCategoryName = db.prepare("UPDATE categories SET name = ?, updatedAt = ? WHERE name = ?");
  for (const [legacy, next] of Object.entries(LEGACY_CATEGORY_NAME_MAP)) {
    updateCategoryName.run(next, nowIso(), legacy);
  }

  const updateProductName = db.prepare("UPDATE products SET name = ?, updatedAt = ? WHERE name = ?");
  for (const [legacy, next] of Object.entries(LEGACY_PRODUCT_NAME_MAP)) {
    updateProductName.run(next, nowIso(), legacy);
  }

  return db;
}

const db = initializeDatabase();
const app = express();

app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: nowIso()
  });
});

app.get("/api/summary", (_req, res) => {
  const totalProducts = (db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number }).count;
  const enabledProducts = (
    db.prepare("SELECT COUNT(*) as count FROM products WHERE enabled = 1").get() as { count: number }
  ).count;
  const totalCategories = (db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number }).count;
  const latestProductUpdate = (
    db.prepare("SELECT MAX(updatedAt) as updatedAt FROM products").get() as { updatedAt: string | null }
  ).updatedAt;

  res.json({
    totalProducts,
    enabledProducts,
    totalCategories,
    latestProductUpdate
  });
});

app.get("/api/categories", (_req, res) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY name ASC").all() as CategoryRow[];
  res.json(rows.map(rowToCategory));
});

app.post("/api/categories", (req, res) => {
  try {
    const name = parseCategoryName(req.body);
    const id = `cat_${crypto.randomUUID().slice(0, 8)}`;
    const timestamp = nowIso();

    db.prepare(`
      INSERT INTO categories (id, name, createdAt, updatedAt)
      VALUES (?, ?, ?, ?)
    `).run(id, name, timestamp, timestamp);

    const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRow;
    res.status(201).json(rowToCategory(category));
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建分类失败。";
    res.status(400).json({ message });
  }
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRow | undefined;

  if (!category) {
    res.status(404).json({ message: "分类不存在。" });
    return;
  }

  const inUse = db.prepare("SELECT COUNT(*) as count FROM products WHERE categoryId = ?").get(id) as { count: number };
  if (inUse.count > 0) {
    res.status(409).json({ message: "该分类下还有商品，无法删除。" });
    return;
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  res.status(204).send();
});

app.get("/api/products", (req, res) => {
  const categoryId = req.query.categoryId?.toString().trim();
  const teamId = req.query.teamId?.toString().trim();
  const search = req.query.search?.toString().trim();
  const includeDisabled = req.query.includeDisabled?.toString() === "true";

  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (categoryId) {
    clauses.push("categoryId = ?");
    params.push(categoryId);
  }
  if (teamId) {
    clauses.push("teamId = ?");
    params.push(teamId);
  }
  if (search) {
    clauses.push("LOWER(name) LIKE ?");
    params.push(`%${search.toLowerCase()}%`);
  }
  if (!includeDisabled) {
    clauses.push("enabled = 1");
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const query = `SELECT * FROM products ${whereSql} ORDER BY createdAt DESC`;
  const rows = db.prepare(query).all(...params) as ProductRow[];

  res.json(rows.map(rowToProduct));
});

app.post("/api/products", (req, res) => {
  try {
    const payload = parseProductInput(req.body);
    const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(payload.categoryId);
    if (!category) {
      res.status(400).json({ message: "分类不存在。" });
      return;
    }

    const id = `prod_${crypto.randomUUID().slice(0, 10)}`;
    const timestamp = nowIso();

    db.prepare(`
      INSERT INTO products (id, name, price, image, teamId, categoryId, enabled, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      payload.name,
      payload.price,
      payload.image,
      payload.teamId,
      payload.categoryId,
      payload.enabled ? 1 : 0,
      timestamp,
      timestamp
    );

    const created = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow;
    res.status(201).json(rowToProduct(created));
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建商品失败。";
    res.status(400).json({ message });
  }
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
  if (!existing) {
    res.status(404).json({ message: "商品不存在。" });
    return;
  }

  try {
    const payload = parseProductInput(req.body);
    const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(payload.categoryId);
    if (!category) {
      res.status(400).json({ message: "分类不存在。" });
      return;
    }

    db.prepare(`
      UPDATE products
      SET name = ?, price = ?, image = ?, teamId = ?, categoryId = ?, enabled = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      payload.name,
      payload.price,
      payload.image,
      payload.teamId,
      payload.categoryId,
      payload.enabled ? 1 : 0,
      nowIso(),
      id
    );

    const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow;
    res.json(rowToProduct(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新商品失败。";
    res.status(400).json({ message });
  }
});

app.patch("/api/products/:id/status", (req, res) => {
  const { id } = req.params;
  const enabled = Boolean((req.body as { enabled?: unknown }).enabled);
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;

  if (!existing) {
    res.status(404).json({ message: "商品不存在。" });
    return;
  }

  db.prepare("UPDATE products SET enabled = ?, updatedAt = ? WHERE id = ?").run(enabled ? 1 : 0, nowIso(), id);
  const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow;
  res.json(rowToProduct(updated));
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (!existing) {
    res.status(404).json({ message: "商品不存在。" });
    return;
  }

  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  res.status(204).send();
});

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(projectRoot, "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(port, "0.0.0.0", () => {
  console.log(`API server is running at http://localhost:${port}`);
  console.log(`SQLite database: ${dbFile}`);
});
