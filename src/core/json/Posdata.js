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
  { id: 13, name: "Request Leave", icon: "🏖️", isRequestLeave: true },
];

export const fetchCustomCategories = async () => {
  try {
    const products = await fetchProducts();
    
    // First, get the Shopping Bags from non-scan products
    const nonScanProducts = products
      .filter((product) => product.isActive === true && product.productCategoryDto?.productCategoryName?.toLowerCase() === "non scan")
      .map((product) => {
        const [name, icon] = product.name.split("-");
        return {
          id: product.id,
          name: name.trim(),
          icon: icon?.trim() || "📦",
          price: product.pricePerUnit || 0,
          isNonScanProduct: true
        };
      });
    
    // Find only exact "Shopping Bags" in non-scan products
    const shoppingBags = nonScanProducts.filter(product => 
      product.name.toLowerCase() === "shopping bags"
    );
    
    // Get custom products
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
    
    // Combine Shopping Bags with custom products, with Shopping Bags at the beginning
    return [...shoppingBags, ...customProducts];
  } catch (error) {
    return [];
  }
};

export const fetchNonScanProducts = async () => {
  try {
    const products = await fetchProducts();
    const nonSaleProducts = products
      .filter((product) => product.isActive === true && product.productCategoryDto?.productCategoryName?.toLowerCase() === "non scan")
      .map((product) => {
        const [name, icon] = product.name.split("-");
        return {
          id: product.id,
          name: name.trim(),
          icon: icon?.trim() || "📦",
          price: product.pricePerUnit || 0
        };
      })
      .reverse();
    return nonSaleProducts;
  } catch (error) {
    return [];
  }
};