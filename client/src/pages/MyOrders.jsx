import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { orderAPI } from "../services/api";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId, reason) => {
    try {
      const response = await orderAPI.cancelOrder(orderId, reason);
      if (response.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? response.order : order
          )
        );
        toast.success("Order cancelled successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-purple-100 text-purple-800";
      case "Shipped":
        return "bg-indigo-100 text-indigo-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="mt-16 px-6 md:px-16 lg:px-24 xl:px-32">
        <h1 className="text-3xl font-medium mb-6">My Orders</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 px-6 md:px-16 lg:px-24 xl:px-32">
      <h1 className="text-3xl font-medium mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No orders found</p>
          <p className="text-sm text-gray-400">
            Start shopping to see your orders here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder === order._id ? null : order._id
                      )
                    }
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    {selectedOrder === order._id
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-semibold text-lg">₹{order.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{order.payment.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-medium">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {selectedOrder === order._id && (
                <div className="border-t pt-4 space-y-4">
                  {/* Tracking Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Tracking Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <span className="font-medium">Tracking Number:</span>{" "}
                          {order.tracking.number}
                        </p>
                        <p>
                          <span className="font-medium">Carrier:</span>{" "}
                          {order.tracking.carrier}
                        </p>
                        <p>
                          <span className="font-medium">
                            Estimated Delivery:
                          </span>{" "}
                          {formatDate(order.tracking.estimatedDelivery)}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Payment Status:</span>
                          <span
                            className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              order.payment.status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.payment.status}
                          </span>
                        </p>
                        {order.payment.transactionId && (
                          <p>
                            <span className="font-medium">Transaction ID:</span>{" "}
                            {order.payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Shipping Address
                    </h4>
                    <div className="text-sm">
                      <p className="font-medium">
                        {order.shippingAddress.name}
                      </p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zipcode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      <p className="mt-1">📞 {order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.product.image[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              {item.product.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{item.price}</p>
                            <p className="text-sm text-gray-600">
                              Total: ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (2%):</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>
                          {order.shipping === 0 ? "Free" : `₹${order.shipping}`}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Order Button */}
                  {!["Shipped", "Delivered", "Cancelled"].includes(
                    order.orderStatus
                  ) && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const reason = prompt(
                            "Please provide a reason for cancellation:"
                          );
                          if (reason) {
                            cancelOrder(order._id, reason);
                          }
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
