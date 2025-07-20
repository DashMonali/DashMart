import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { addressAPI, orderAPI } from "../services/api";
import toast from "react-hot-toast";
import OrderConfirmation from "../components/OrderConfirmation";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    getCartAmount,
    user,
  } = useAppContext();
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const product = products.find((item) => item._id === key);
      if (product) {
        product.quantity = cartItems[key];
        tempArray.push(product);
      }
    }
    setCartArray(tempArray);
  };

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getUserAddresses();
      if (response.success) {
        setAddresses(response.addresses);
        // Set default address if available
        const defaultAddress = response.addresses.find(
          (addr) => addr.isDefault
        );
        setSelectedAddress(defaultAddress || response.addresses[0] || null);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cartArray.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Format the address to match the Order model requirements
      const formattedAddress = {
        name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
        phone: selectedAddress.phone,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipcode: selectedAddress.zipcode,
        country: selectedAddress.country,
      };

      const orderData = {
        shippingAddress: formattedAddress,
        paymentMethod: paymentOption,
        notes: "Order placed via DashMart",
      };

      const response = await orderAPI.placeOrder(orderData);

      if (response.success) {
        setPlacedOrder(response.order);
        setShowOrderConfirmation(true);
        toast.success("Order placed successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderConfirmationClose = () => {
    setShowOrderConfirmation(false);
    setPlacedOrder(null);
    navigate("/my-orders");
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  return (
    <>
      {products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16">
          <div className="flex-1 max-w-4xl">
            <h1 className="text-3xl font-medium mb-6">
              Shopping Cart{" "}
              <span className="text-sm text-primary">{getCartCount()}</span>
            </h1>

            {cartArray.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button
                  onClick={() => {
                    navigate("/products");
                    scrollTo(0, 0);
                  }}
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dull transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                  <p className="text-left">Product Details</p>
                  <p className="text-center">Subtotal</p>
                  <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
                  >
                    <div className="flex items-center md:gap-6 gap-3">
                      <div
                        onClick={() => {
                          navigate(
                            `/products/${product.category.toLowerCase()}/${
                              product._id
                            }`
                          );
                          scrollTo(0, 0);
                        }}
                        className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden"
                      >
                        <img
                          className="max-w-full h-full object-cover"
                          src={product.image[0]}
                          alt={product.name}
                        />
                      </div>
                      <div>
                        <p className="hidden md:block font-semibold">
                          {product.name}
                        </p>
                        <div className="font-normal text-gray-500/70">
                          <p>
                            Weight: <span>{product.weight || "N/A"}</span>
                          </p>
                          <div className="flex items-center">
                            <p>Qty:</p>
                            <select
                              onChange={(e) =>
                                updateCartItem(
                                  product._id,
                                  Number(e.target.value)
                                )
                              }
                              value={cartItems[product._id]}
                              className="outline-none"
                            >
                              {Array(
                                cartItems[product._id] > 9
                                  ? cartItems[product._id]
                                  : 9
                              )
                                .fill("")
                                .map((_, index) => (
                                  <option key={index} value={index + 1}>
                                    {index + 1}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-center">
                      {currency}
                      {product.offerPrice * product.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="cursor-pointer mx-auto"
                    >
                      <img
                        src={assets.remove_icon}
                        alt="remove"
                        className="inline-block w-6 h-6"
                      />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="md:w-80 w-full md:ml-8 mt-8 md:mt-0">
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Address Selection */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  Delivery Address
                </h3>
                {addresses.length > 0 ? (
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address._id}
                        className="flex items-start space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address._id}
                          checked={selectedAddress?._id === address._id}
                          onChange={() => setSelectedAddress(address)}
                          className="mt-1"
                        />
                        <div className="text-sm">
                          <p className="font-medium">
                            {address.firstName} {address.lastName}
                          </p>
                          <p className="text-gray-600">{address.street}</p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.zipcode}
                          </p>
                          <p className="text-gray-600">📞 {address.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>No addresses found</p>
                    <button
                      onClick={() => navigate("/add-address")}
                      className="text-primary hover:underline"
                    >
                      Add new address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentOption === "COD"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                    />
                    <span className="text-sm">Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="Online"
                      checked={paymentOption === "Online"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                    />
                    <span className="text-sm">Online Payment (Fake)</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{getCartAmount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (2%):</span>
                  <span>₹{(getCartAmount() * 0.02).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{getCartAmount() > 500 ? "Free" : "₹50"}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>
                    ₹
                    {(
                      getCartAmount() +
                      getCartAmount() * 0.02 +
                      (getCartAmount() > 500 ? 0 : 50)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={loading || !selectedAddress || cartArray.length === 0}
                className="w-full bg-primary text-white py-3 rounded-md mt-4 hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>

              {paymentOption === "Online" && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This is a demo. No real payment will be processed.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading cart...</div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && placedOrder && (
        <OrderConfirmation
          order={placedOrder}
          onClose={handleOrderConfirmationClose}
        />
      )}
    </>
  );
};

export default Cart;
