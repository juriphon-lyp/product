"use client";

import { useEffect, useState } from "react";

import {
  defaultQuery,
  fetchProducts,
} from "@/lib/products";

import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";

import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";

type LoadState =
  | "loading"
  | "error"
  | "ready";

export default function ProductExplorer() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [addedProducts, setAddedProducts] =
    useState<Product[]>([]);

  const [editing, setEditing] =
    useState<Product | null>(null);

  const [status, setStatus] =
    useState<LoadState>("loading");

  const [errorMessage, setErrorMessage] =
    useState("");

  // =========================
  // แสดงผลลัพธ์
  // =========================

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  // =========================
  // แสดง Error
  // =========================

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "เรียกข้อมูลไม่สำเร็จ"
    );

    setStatus("error");
  }

  // =========================
  // ค้นหา / โหลดสินค้า
  // =========================

  async function loadProducts(
    query: SearchQuery
  ) {
    setStatus("loading");
    setErrorMessage("");

    try {
      const list =
        await fetchProducts(query);

      // ค้นหาสินค้าที่เพิ่มเอง
      const localProducts =
        addedProducts.filter(
          (product) =>
            product.title
              .toLowerCase()
              .includes(
                query.q.toLowerCase()
              )
        );

      // รวมสินค้าจาก API
      // กับสินค้าที่เพิ่มเอง
      const allProducts = [
        ...localProducts,
        ...list.products,
      ];

      // =========================
      // เรียงข้อมูล
      // =========================

      allProducts.sort((a, b) => {
        if (query.sortBy === "title") {
          return a.title.localeCompare(
            b.title
          );
        }

        if (query.sortBy === "price") {
          return a.price - b.price;
        }

        return a.stock - b.stock;
      });

      // จำกัดจำนวนรายการ
      const result =
        allProducts.slice(
          0,
          query.limit
        );

      showResult({
        products: result,
        total: result.length,
        skip: 0,
        limit: query.limit,
      });
    } catch (error) {
      showError(error);
    }
  }

  // =========================
  // โหลดข้อมูลครั้งแรก
  // =========================

  useEffect(() => {
    fetchProducts(defaultQuery)
      .then(showResult)
      .catch(showError);
  }, []);

  // =========================
  // เพิ่ม / แก้ไขสินค้า
  // =========================

  function saveProduct(
    draft: ProductDraft
  ) {
    // =========================
    // กรณีแก้ไขสินค้า
    // =========================

    if (editing) {
      const updatedProduct: Product = {
        ...editing,
        ...draft,
        id: editing.id,
      };

      // อัปเดตสินค้าที่แสดงอยู่
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editing.id
            ? updatedProduct
            : product
        )
      );

      // อัปเดตสินค้าที่เพิ่มเอง
      setAddedProducts((prev) =>
        prev.map((product) =>
          product.id === editing.id
            ? updatedProduct
            : product
        )
      );

      setEditing(null);

      return;
    }

    // =========================
    // กรณีเพิ่มสินค้าใหม่
    // =========================

    const newProduct: Product = {
      ...draft,
      id: Date.now(),
    };

    setAddedProducts((prev) => [
      ...prev,
      newProduct,
    ]);

    setProducts((prev) => [
      newProduct,
      ...prev,
    ]);
  }

  // =========================
  // ลบสินค้า
  // =========================

  function removeProduct(id: number) {
    setProducts((prev) =>
      prev.filter(
        (product) =>
          product.id !== id
      )
    );

    setAddedProducts((prev) =>
      prev.filter(
        (product) =>
          product.id !== id
      )
    );

    if (editing?.id === id) {
      setEditing(null);
    }
  }

  // =========================
  // ยกเลิกการแก้ไข
  // =========================

  function cancelEdit() {
    setEditing(null);
  }

  return (
    <main>
      {/* =========================
          Heading
      ========================= */}

      <h1>รายการสินค้า</h1>

      {/* =========================
          Search
      ========================= */}

      <ProductSearchForm
        onSearch={loadProducts}
      />

      {/* =========================
          Add / Edit Form
      ========================= */}

      <ProductForm
        editing={editing}
        onSave={saveProduct}
        onCancel={cancelEdit}
      />

      {/* =========================
          Product Section
      ========================= */}

      <section
        aria-live="polite"
        className="product-section"
      >
        {/* Loading */}

        {status === "loading" && (
          <div className="status-message">
            กำลังโหลดข้อมูล...
          </div>
        )}

        {/* Error */}

        {status === "error" && (
          <p
            role="alert"
            className="error-message"
          >
            {errorMessage}
          </p>
        )}

        {/* Empty */}

        {status === "ready" &&
          products.length === 0 && (
            <div className="empty-message">
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
            </div>
          )}

        {/* =========================
            Product Cards
        ========================= */}

        {status === "ready" &&
          products.length > 0 && (
            <div className="product-grid">
              {products.map((item) => (
                <article
                  className="product-card"
                  key={item.id}
                >
                  {/* Product Image */}

                  <div className="product-image">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                      />
                    ) : (
                      <div className="no-image">
                        ไม่มีรูป
                      </div>
                    )}
                  </div>

                  {/* Product Information */}

                  <div className="product-info">
                    {/* Category */}

                    <span className="product-category">
                      {item.category}
                    </span>

                    {/* Name */}

                    <h2>
                      {item.title}
                    </h2>

                    {/* Price */}

                    <div className="product-price">
                      ฿
                      {item.price.toLocaleString(
                        "th-TH",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </div>

                    {/* Stock */}

                    <div className="product-stock">
                      <span>
                        คงเหลือ
                      </span>

                      <strong>
                        {item.stock}
                      </strong>

                      <span>
                        ชิ้น
                      </span>
                    </div>

                    {/* Actions */}

                    <div className="card-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          setEditing(item)
                        }
                      >
                        แก้ไข
                      </button>

                      <button
                        type="button"
                        className="delete"
                        data-action="delete"
                        onClick={() =>
                          removeProduct(
                            item.id
                          )
                        }
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}

