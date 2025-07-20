const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    // Don't log sensitive information in production
    if (import.meta.env.DEV) {
      console.error("API Error:", error);
    }
    throw error;
  }
};

// Helper function for file uploads
const uploadCall = async (endpoint, formData) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData, // Don't set Content-Type for FormData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Upload Error:", error);
    }
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: (userData) =>
    apiCall("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall("/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiCall("/user/logout", {
      method: "POST",
    }),

  getProfile: () => apiCall("/user/profile"),
};

// Seller APIs
export const sellerAPI = {
  register: (sellerData) =>
    apiCall("/seller/register", {
      method: "POST",
      body: JSON.stringify(sellerData),
    }),

  login: (credentials) =>
    apiCall("/seller/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiCall("/seller/logout", {
      method: "POST",
    }),

  getProfile: () => apiCall("/seller/profile"),

  updateProfile: (profileData) =>
    apiCall("/seller/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// Upload APIs
export const uploadAPI = {
  uploadSingleImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return uploadCall("/upload/single", formData);
  },

  uploadMultipleImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    return uploadCall("/upload/multiple", formData);
  },

  deleteImage: (publicId) =>
    apiCall(`/upload/${publicId}`, {
      method: "DELETE",
    }),

  getOptimizedImage: (
    publicId,
    width = 400,
    height = 400,
    quality = "auto"
  ) => {
    const params = new URLSearchParams({ publicId, width, height, quality });
    return apiCall(`/upload/optimize?${params}`);
  },
};

// Product APIs
export const productAPI = {
  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products?${queryString}`);
  },

  getProduct: (id) => apiCall(`/products/${id}`),

  createProduct: (productData) =>
    apiCall("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id) =>
    apiCall(`/products/${id}`, {
      method: "DELETE",
    }),

  toggleStock: (id) =>
    apiCall(`/products/${id}/stock`, {
      method: "PUT",
    }),

  getSellerProducts: () => apiCall("/products/seller/products"),
};

// Cart APIs
export const cartAPI = {
  getCart: () => apiCall("/cart"),

  addToCart: (productId, quantity = 1) =>
    apiCall("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItem: (productId, quantity) =>
    apiCall("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    }),

  removeFromCart: (productId) =>
    apiCall(`/cart/remove/${productId}`, {
      method: "DELETE",
    }),

  clearCart: () =>
    apiCall("/cart/clear", {
      method: "DELETE",
    }),

  getCartCount: () => apiCall("/cart/count"),
};

// Order APIs
export const orderAPI = {
  placeOrder: (orderData) =>
    apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  getUserOrders: () => apiCall("/orders"),

  getOrder: (id) => apiCall(`/orders/${id}`),

  updateOrderStatus: (id, status) =>
    apiCall(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/orders/seller/orders?${queryString}`);
  },

  cancelOrder: (id, reason) =>
    apiCall(`/orders/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  getOrderStats: () => apiCall("/orders/seller/stats"),
};

// Address APIs
export const addressAPI = {
  getUserAddresses: () => apiCall("/addresses"),

  addAddress: (addressData) =>
    apiCall("/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    }),

  updateAddress: (id, addressData) =>
    apiCall(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    }),

  deleteAddress: (id) =>
    apiCall(`/addresses/${id}`, {
      method: "DELETE",
    }),

  setDefaultAddress: (id) =>
    apiCall(`/addresses/${id}/default`, {
      method: "PUT",
    }),
};
