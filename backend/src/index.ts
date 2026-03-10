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
  { id: "special", name: "Special Deals" },
  { id: "streetwear", name: "Streetwear" },
  { id: "allstar", name: "All-Star Picks" },
  { id: "regular", name: "Regular Items" }
];

const SEED_PRODUCTS: Array<Omit<ProductRow, "createdAt" | "updatedAt">> = [
  {
    id: "p_1",
    name: "Lakers #24 Legacy Jersey",
    price: 599,
    image: "https://picsum.photos/seed/lakers-jersey/600/600",
    teamId: "lal",
    categoryId: "special",
    enabled: 1
  },
  {
    id: "p_2",
    name: "Warriors Signature Basketball Shoes",
    price: 1299,
    image: "https://picsum.photos/seed/warriors-shoe/600/600",
    teamId: "gsw",
    categoryId: "special",
    enabled: 1
  },
  {
    id: "p_3",
    name: "NBA x Nike Hoodie",
    price: 499,
    image: "https://picsum.photos/seed/nike-hoodie/600/600",
    teamId: null,
    categoryId: "streetwear",
    enabled: 1
  },
  {
    id: "p_4",
    name: "Chicago Bulls Vintage Cap",
    price: 199,
    image: "https://picsum.photos/seed/bulls-cap/600/600",
    teamId: "chi",
    categoryId: "streetwear",
    enabled: 1
  },
  {
    id: "p_5",
    name: "All-Star Official Game Jersey",
    price: 899,
    image: "https://picsum.photos/seed/allstar-jersey/600/600",
    teamId: null,
    categoryId: "allstar",
    enabled: 1
  },
  {
    id: "p_6",
    name: "Houston Rockets Training Tee",
    price: 159,
    image: "https://picsum.photos/seed/rockets-tee/600/600",
    teamId: "hou",
    categoryId: "regular",
    enabled: 1
  },
  {
    id: "p_7",
    name: "Spurs Performance Shorts",
    price: 229,
    image: "https://picsum.photos/seed/spurs-shorts/600/600",
    teamId: "sas",
    categoryId: "regular",
    enabled: 1
  },
  {
    id: "p_8",
    name: "Celtics Fan Scarf",
    price: 99,
    image: "https://picsum.photos/seed/celtics-scarf/600/600",
    teamId: "bos",
    categoryId: "regular",
    enabled: 1
  }
];

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
    throw new Error("Product name must be between 2 and 80 characters.");
  }
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    throw new Error("Price must be a positive number.");
  }
  if (!image) {
    throw new Error("Product image URL is required.");
  }
  if (!categoryId) {
    throw new Error("Category is required.");
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
    throw new Error("Category name must be between 2 and 32 characters.");
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
    const message = error instanceof Error ? error.message : "Failed to create category.";
    res.status(400).json({ message });
  }
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRow | undefined;

  if (!category) {
    res.status(404).json({ message: "Category not found." });
    return;
  }

  const inUse = db.prepare("SELECT COUNT(*) as count FROM products WHERE categoryId = ?").get(id) as { count: number };
  if (inUse.count > 0) {
    res.status(409).json({ message: "Cannot delete category that still has products." });
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
      res.status(400).json({ message: "Category does not exist." });
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
    const message = error instanceof Error ? error.message : "Failed to create product.";
    res.status(400).json({ message });
  }
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
  if (!existing) {
    res.status(404).json({ message: "Product not found." });
    return;
  }

  try {
    const payload = parseProductInput(req.body);
    const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(payload.categoryId);
    if (!category) {
      res.status(400).json({ message: "Category does not exist." });
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
    const message = error instanceof Error ? error.message : "Failed to update product.";
    res.status(400).json({ message });
  }
});

app.patch("/api/products/:id/status", (req, res) => {
  const { id } = req.params;
  const enabled = Boolean((req.body as { enabled?: unknown }).enabled);
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;

  if (!existing) {
    res.status(404).json({ message: "Product not found." });
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
    res.status(404).json({ message: "Product not found." });
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
