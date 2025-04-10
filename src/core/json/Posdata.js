import { fetchProducts } from "../../feature-module/Api/productApi";
import { getAllNonScanProductsPage } from "../../feature-module/Api/NonScanProductApi";
import { getNonScanProductByName } from "../../feature-module/Api/NonScanProductApi";

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
    const shoppingBagsResponse = await getNonScanProductByName("Shopping Bags");
    
    let shoppingBagsItem = null;
    if (shoppingBagsResponse?.responseDto?.length > 0) {
      const shoppingBags = shoppingBagsResponse.responseDto[0];
      
      shoppingBagsItem = {
        id: shoppingBags.id,
        name: shoppingBags.nonScanProduct,
        icon: shoppingBags.icon || "🛍️",
        price: shoppingBags.price
      };
    }

    const products = await fetchProducts();
    const customProducts = products
      .filter((product) => 
        product.isActive === true && 
        product.productCategoryDto?.productCategoryName?.toLowerCase() === "custom" &&
        !product.name.startsWith("Shopping Bags")
      )
      .map((product) => {
        const [name, icon] = product.name.split("-");
        return {
          id: product.id,
          name: name.trim(),
          icon: icon?.trim() || "📦",
        };
      });
    return shoppingBagsItem ? [shoppingBagsItem, ...customProducts] : customProducts;
  } catch (error) {
    return [];
  }
};


export const fetchNonScanProducts = async () => {
  try {
    const response = await getAllNonScanProductsPage(1, 100);
    
    if (response?.status && response?.responseDto) {
      const activeNonScanProducts = response.responseDto
        .filter(product => product.isActive === true)
        .map(product => ({
          id: product.id,
          name: product.nonScanProduct,
          icon: product.icon,
          price: product.price
        }));
      return activeNonScanProducts;
    }
    return [];
  } catch (error) {
    return [];
  }
};