import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const OrderConfirmation = ({ order, onClose }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-50 border-b border-green-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">
                  Order Confirmed!
                </h2>
                <p className="text-green-600">Thank you for your purchase</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Order Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Order ID:</span> #
                  {order._id.slice(-8).toUpperCase()}
                </p>
                <p>
                  <span className="font-medium">Order Date:</span>{" "}
                  {formatDate(order.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Order Time:</span>{" "}
                  {formatTime(order.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    {order.orderStatus}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Payment Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Method:</span>{" "}
                  {order.payment.method}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
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

          {/* Tracking Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Tracking Information
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Tracking Number:</span>{" "}
                {order.tracking.number}
              </p>
              <p>
                <span className="font-medium">Carrier:</span>{" "}
                {order.tracking.carrier}
              </p>
              <p>
                <span className="font-medium">Estimated Delivery:</span>{" "}
                {formatDate(order.tracking.estimatedDelivery)}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Shipping Address
            </h3>
            <div className="text-sm">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipcode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1">📞 {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
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
                    <h4 className="font-medium text-gray-800">
                      {item.product.name}
                    </h4>
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
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
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

          {/* Next Steps */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>• You'll receive an email confirmation shortly</p>
              <p>• Track your order using the tracking number above</p>
              <p>
                • Estimated delivery:{" "}
                {formatDate(order.tracking.estimatedDelivery)}
              </p>
              <p>• For any questions, contact our support team</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-lg flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
