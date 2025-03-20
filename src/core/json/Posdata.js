// src/core/json/Posdata.js

import { fetchProducts } from "../../feature-module/Api/productApi";

export const quickAccess = [
  { id: 1, name: "Opening Amount", icon: "💰" },
  { id: 2, name: "Closing Amount", icon: "📥" },
  { id: 3, name: "Pay Out", icon: "💵" },
  { id: 4, name: "X - Report", icon: "📊" },
  { id: 5, name: "Show X Report", icon: "📜" },
  { id: 6, name: "Logout", icon: "🚪" },
  { id: 7, name: "Label Print", icon: "🏷️" },
  { id: 8, name: "Add Purchase List", icon: "➕" }, // Added new button
  { id: 9, name: "View Purchase List", icon: "📋" }, // Added new button
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