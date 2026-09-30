import { z } from "zod";

export const CATEGORIES = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
] as const;

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductDraftSchema = ProductSchema.omit({
  id: true,
});

export type ProductDraft = z.infer<typeof ProductDraftSchema>;

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type ProductList = z.infer<typeof ProductListSchema>;

const API_BASE = "https://dummyjson.com";

export const SORT_FIELDS = [
  "title",
  "price",
  "stock",
] as const;

export const SearchQuerySchema = z.object({
  q: z.string().trim(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(30),
  sortBy: z.enum(SORT_FIELDS),
});

export type SearchQuery = z.infer<
  typeof SearchQuerySchema
>;

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 12,
  sortBy: "title",
};

export function buildProductUrl(
  query: SearchQuery
): string {
  const params = new URLSearchParams();

  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", "asc");

  params.set(
    "select",
    "id,title,price,stock,category,description,thumbnail"
  );

  if (query.q.trim()) {
    params.set("q", query.q.trim());

    return `${API_BASE}/products/search?${params.toString()}`;
  }

  return `${API_BASE}/products?${params.toString()}`;
}

export async function fetchProducts(
  query: SearchQuery
): Promise<ProductList> {
  const response = await fetch(
    buildProductUrl(query),
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`
    );
  }

  const data = await response.json();

  const result =
    ProductListSchema.safeParse(data);

  if (!result.success) {
    console.error(result.error);

    throw new Error(
      "รูปแบบข้อมูลจาก DummyJSON ไม่ตรงกับที่กำหนดไว้"
    );
  }

  return result.data;
}