import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { productAPI } from "../../services/api";
import toast from "react-hot-toast";

const ProductList = () => {
  const { currency } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getSellerProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Error fetching seller products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStock = async (productId, currentStatus) => {
    try {
      const response = await productAPI.toggleStock(productId);
      if (response.success) {
        // Update local state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, inStock: !product.inStock }
              : product
          )
        );
        toast.success(
          `Product ${
            response.product.inStock ? "added to" : "removed from"
          } stock`
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to update stock status");
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const response = await productAPI.deleteProduct(productId);
        if (response.success) {
          setProducts((prevProducts) =>
            prevProducts.filter((product) => product._id !== productId)
          );
          toast.success("Product deleted successfully");
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete product");
      }
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  if (loading) {
    return (
      <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Products</h2>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading products...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">
              No products found. Add your first product!
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold truncate">Product</th>
                  <th className="px-4 py-3 font-semibold truncate">Category</th>
                  <th className="px-4 py-3 font-semibold truncate hidden md:block">
                    Selling Price
                  </th>
                  <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                  <th className="px-4 py-3 font-semibold truncate">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="border border-gray-300 rounded overflow-hidden">
                        <img
                          src={product.image[0]}
                          alt="Product"
                          className="w-16"
                        />
                      </div>
                      <span className="truncate max-sm:hidden w-full">
                        {product.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {currency}
                      {product.offerPrice}
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={product.inStock}
                          onChange={() =>
                            handleToggleStock(product._id, product.inStock)
                          }
                        />
                        <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-primary transition-colors duration-200"></div>
                        <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleDeleteProduct(product._id, product.name)
                        }
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
