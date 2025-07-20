import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// Place order: /api/orders
export const placeOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, notes } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Calculate totals
        const subtotal = cart.items.reduce((total, item) => {
            return total + (item.product.offerPrice * item.quantity);
        }, 0);

        const tax = subtotal * 0.02; // 2% tax
        const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
        const total = subtotal + tax + shipping;

        // Create order items
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.offerPrice
        }));

        // Generate fake transaction ID for online payments
        const transactionId = paymentMethod === 'Online' 
            ? 'TXN' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
            : null;

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            payment: {
                method: paymentMethod || 'COD',
                status: paymentMethod === 'Online' ? 'Paid' : 'Pending',
                transactionId,
                amount: total
            },
            subtotal,
            tax,
            shipping,
            total,
            notes,
            tracking: {
                updates: [{
                    status: 'Order Placed',
                    location: 'DashMart Warehouse',
                    description: 'Your order has been successfully placed and is being processed.'
                }]
            }
        });

        // Clear cart after successful order
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $set: { items: [] } }
        );

        // Populate order details
        const populatedOrder = await Order.findById(order._id)
            .populate('items.product')
            .populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order: populatedOrder
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user orders: /api/orders
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single order: /api/orders/:id
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if user owns this order
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status (seller only): /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update order status
        order.orderStatus = status;

        // Add tracking update based on status
        const trackingUpdates = {
            'Confirmed': {
                status: 'Order Confirmed',
                location: 'DashMart Warehouse',
                description: 'Your order has been confirmed and is being prepared for processing.'
            },
            'Processing': {
                status: 'Processing',
                location: 'DashMart Warehouse',
                description: 'Your order is being processed and will be shipped soon.'
            },
            'Shipped': {
                status: 'Shipped',
                location: 'DashMart Express Hub',
                description: 'Your order has been shipped and is on its way to you.'
            },
            'Delivered': {
                status: 'Delivered',
                location: 'Your Address',
                description: 'Your order has been successfully delivered!'
            },
            'Cancelled': {
                status: 'Cancelled',
                location: 'DashMart Warehouse',
                description: 'Your order has been cancelled.'
            }
        };

        if (trackingUpdates[status]) {
            order.tracking.updates.push(trackingUpdates[status]);
        }

        // Update payment status for COD orders when delivered
        if (status === 'Delivered' && order.payment.method === 'COD') {
            order.payment.status = 'Paid';
        }

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate('items.product')
            .populate('user', 'name email');

        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all orders (seller only): /api/orders/seller/orders
export const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status && status !== 'all') {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate('items.product')
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel order: /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
        }

        // Check if order can be cancelled
        if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
        }

        // Update order
        order.orderStatus = 'Cancelled';
        order.isCancelled = true;
        order.cancelledAt = new Date();
        order.cancelledBy = 'User';
        order.cancelledReason = reason || 'Cancelled by user';

        // Add tracking update
        order.tracking.updates.push({
            status: 'Cancelled',
            location: 'DashMart Warehouse',
            description: 'Order cancelled by user.'
        });

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate('items.product')
            .populate('user', 'name email');

        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get order statistics (seller only): /api/orders/seller/stats
export const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
        const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: { $in: ['Delivered', 'Shipped'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
