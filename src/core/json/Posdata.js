// src/core/json/Posdata.js

import { fetchProducts } from "../../feature-module/Api/productApi";

export const quickAccess = [
  // { id: 1, name: "Opening Amount", icon: "💰" },
  { id: 4, name: "X - Report", icon: "📊", isXReport: true },
  { id: 2, name: "Z - Report", icon: "🧾", isZReport: true },
  { id: 3, name: "Pay Out", icon: "💵" },
  { id: 5, name: "Banking", icon: "💰" },
  // { id: 6, name: "Logout", icon: "🚪" },
  { id: 7, name: "Label Print", icon: "🏷️" },
  { id: 8, name: "Add Purchase List", icon: "➕" },
  { id: 9, name: "View Purchase List", icon: "🛍️" },
  { id: 10, name: "Sales List", icon: "📋" },
  { id: 11, name: "Manual Discount", icon: "🪙" },
  { id: 12, name: "Employee Discount", icon: "🎁" },
];

export const fetchCustomCategories = async () => {
  try {
    const products = await fetchProducts();
    const customProducts = products
      .filter((product) => product.isActive === true && product.productCategoryDto?.productCategoryName?.toLowerCase() === "custom")
      .map((product) => {
        const [name, icon] = product.name.split("-");
        return {
          id: product.id,
          name: name.trim(),
          icon: icon?.trim() || "📦",
        };
      });
    return customProducts;
  } catch (error) {
    return [];
  }
};