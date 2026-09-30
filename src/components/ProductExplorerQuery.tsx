"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductSearchForm from "./ProductSearchForm";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type { SearchQuery } from "@/lib/products";

export default function ProductExplorerQuery() {
    const [query, setQuery] = useState<SearchQuery>(defaultQuery);

    const { data, isPending, isError, error } = useQuery({
        queryKey: ["products", query],
        queryFn: () => fetchProducts(query),
    });

    async function search(next: SearchQuery) {
        setQuery(next);
    }

    return (
        <main>
            <ProductSearchForm onSearch={search} />

            {isPending && <p>กำลังโหลดข้อมูล</p>}
            {isError && <p role="alert">{error.message}</p>}
            {data?.products.length === 0 && <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>}

            {data && data.products.length > 0 && (
                <ul>
                    {data.products.map((item) => (
                        <li key={item.id}>
                            {item.title} {item.price}
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
