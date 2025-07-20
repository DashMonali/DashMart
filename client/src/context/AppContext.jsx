import { createContext, useContext, useEffect, useState } from "react";
import { authAPI, productAPI, cartAPI, sellerAPI } from "../services/api";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});
  const [loading, setLoading] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check user authentication
      const userResponse = await authAPI.getProfile();
      if (userResponse.success) {
        setUser(userResponse.user);
      }
    } catch (error) {
      // User not logged in, which is fine
      if (import.meta.env.DEV) {
        console.log("User not authenticated");
      }
    }

    try {
      // Check seller authentication
      const sellerResponse = await sellerAPI.getProfile();
      if (sellerResponse.success) {
        setIsSeller(true);
      }
    } catch (error) {
      // Seller not logged in, which is fine
      if (import.meta.env.DEV) {
        console.log("Seller not authenticated");
      }
    }
  };

  // Fetch all products
  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts(params);
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      toast.error("Failed to fetch products. Please refresh the page.");
      if (import.meta.env.DEV) {
        console.error("Error fetching products:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (itemId) => {
    try {
      if (!user) {
        setShowUserLogin(true);
        return;
      }

      const response = await cartAPI.addToCart(itemId, 1);
      if (response.success) {
        // Update local cart state
        const newCartItems = {};
        response.cart.items.forEach((item) => {
          newCartItems[item.product._id] = item.quantity;
        });
        setCartItems(newCartItems);
        toast.success("Added to Cart");
      }
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  // Update Cart Item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await cartAPI.updateCartItem(itemId, quantity);
      if (response.success) {
        const newCartItems = {};
        response.cart.items.forEach((item) => {
          newCartItems[item.product._id] = item.quantity;
        });
        setCartItems(newCartItems);
        toast.success("Cart Updated");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update cart");
    }
  };

  // Remove Product from Cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await cartAPI.removeFromCart(itemId);
      if (response.success) {
        const newCartItems = {};
        response.cart.items.forEach((item) => {
          newCartItems[item.product._id] = item.quantity;
        });
        setCartItems(newCartItems);
        toast.success("Removed from Cart");
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove from cart");
    }
  };

  // Get Cart Items Count
  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };

  // Get Cart Total Amount
  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [productId, quantity]) => {
      const product = products.find((p) => p._id === productId);
      return total + (product?.offerPrice || 0) * quantity;
    }, 0);
  };

  // Load cart on user login
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems({});
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.success) {
        const newCartItems = {};
        response.cart.items.forEach((item) => {
          newCartItems[item.product._id] = item.quantity;
        });
        setCartItems(newCartItems);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error loading cart:", error);
      }
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    loading,
    fetchProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
