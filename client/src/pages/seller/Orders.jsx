import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets, dummyOrders } from '../../assets/assets'

const Orders = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulate fetching orders (from dummyOrders for now)
    setOrders(dummyOrders);
  }, []);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Orders List</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order, orderIndex) => (
            <div
              key={orderIndex}
              className="flex flex-col md:flex-row md:items-center gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm"
            >
              {/* Product Info */}
              <div className="flex flex-col md:flex-row gap-4 w-full md:max-w-xs">
                <img
                  className="w-12 h-12 object-cover"
                  src={assets.box_icon}
                  alt="box icon"
                />
                <div>
                  {order.items.map((item, itemIndex) => (
                    <p key={itemIndex} className="font-medium text-sm">
                      {item.product.name}
                      <span className="text-primary"> x {item.quantity}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Address Info */}
              <div className="text-sm md:text-base text-black/60 w-full md:max-w-sm">
                <p className="text-black font-medium">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p>
                  {order.address.street}, {order.address.city}
                </p>
                <p>
                  {order.address.state}, {order.address.zipcode},{" "}
                  {order.address.country}
                </p>
                <p>{order.address.phone}</p>
              </div>

              {/* Order Amount */}
              <p className="font-semibold text-lg text-black/80 w-full md:w-auto">
                {currency}
                {order.amount}
              </p>

              {/* Payment Info */}
              <div className="flex flex-col text-sm text-black/60 w-full md:w-auto">
                <p>Method: {order.paymentType}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>
                  Payment:{" "}
                  <span className={order.isPaid ? "text-green-600" : "text-red-500"}>
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
