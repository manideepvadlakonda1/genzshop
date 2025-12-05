import { useState, useEffect } from 'react'
import axios from 'axios'
import './orders.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('Fetching orders from API...')
      const response = await axios.get(`${API_URL}/orders`)
      console.log('Orders response:', response.data)
      const fetchedOrders = response.data.orders || response.data.data || []
      console.log('Fetched orders:', fetchedOrders)
      setOrders(fetchedOrders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      console.error('Error details:', error.response?.data)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order:', orderId, 'to status:', newStatus)
      const response = await axios.put(`${API_URL}/orders/${orderId}`, { status: newStatus })
      console.log('Update response:', response.data)
      
      if (response.data.success) {
        // Update local state
        const updatedOrders = orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
        setOrders(updatedOrders)
        console.log('Order status updated successfully')
        
        // Show success message
        alert(`✓ Order status updated to "${newStatus}" successfully!`)
      } else {
        throw new Error(response.data.message || 'Update failed')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      console.error('Error details:', error.response?.data)
      alert('✗ Failed to update order status: ' + (error.response?.data?.message || error.message))
      // Refresh orders to revert to actual state
      await fetchOrders()
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9800'
      case 'processing': return '#2196f3'
      case 'shipped': return '#9c27b0'
      case 'delivered': return '#4caf50'
      case 'cancelled': return '#f44336'
      default: return '#757575'
    }
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  if (loading) return <div className="loading">Loading orders...</div>

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h2>Orders Management</h2>
          <p className="subtitle">Manage and track customer orders</p>
        </div>
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{orders.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{orders.filter(o => o.status === 'pending').length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Delivered</span>
            <span className="stat-value">{orders.filter(o => o.status === 'delivered').length}</span>
          </div>
        </div>
      </div>

      <div className="orders-controls">
        <div className="search-box">
          <i className="fa-solid fa-search" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
          <button className={filter === 'processing' ? 'active' : ''} onClick={() => setFilter('processing')}>Processing</button>
          <button className={filter === 'shipped' ? 'active' : ''} onClick={() => setFilter('shipped')}>Shipped</button>
          <button className={filter === 'delivered' ? 'active' : ''} onClick={() => setFilter('delivered')}>Delivered</button>
          <button className={filter === 'cancelled' ? 'active' : ''} onClick={() => setFilter('cancelled')}>Cancelled</button>
        </div>
      </div>

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>DATE</th>
              <th>ITEMS</th>
              <th>TOTAL</th>
              <th>PAYMENT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.orderId}>
                <td><strong>#{order.orderId?.slice(-8)}</strong></td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{order.shippingAddress?.name || `${order.shippingInfo?.firstName} ${order.shippingInfo?.lastName}`}</div>
                    <div className="customer-email">{order.shippingAddress?.email || order.shippingInfo?.email}</div>
                  </div>
                </td>
                <td>{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                <td>{order.items?.length || 0}</td>
                <td>₹{(order.totalAmount || order.total)?.toLocaleString()}</td>
                <td>
                  <span className="payment-badge">{order.paymentMethod || 'COD'}</span>
                </td>
                <td>
                  <select 
                    className="status-select"
                    style={{ borderColor: getStatusColor(order.status), color: getStatusColor(order.status) }}
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button className="icon-btn view" onClick={() => viewOrderDetails(order)} title="View Details">
                    <i className="fa-solid fa-eye" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="empty-state">No orders found</div>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.orderId?.slice(-8)}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="order-details">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.shippingAddress?.name || `${selectedOrder.shippingInfo?.firstName} ${selectedOrder.shippingInfo?.lastName}`}</p>
                <p><strong>Email:</strong> {selectedOrder.shippingAddress?.email || selectedOrder.shippingInfo?.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || selectedOrder.shippingInfo?.phone}</p>
              </div>
              <div className="detail-section">
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress?.address || selectedOrder.shippingInfo?.address}</p>
                <p>{selectedOrder.shippingAddress?.city || selectedOrder.shippingInfo?.city}, {selectedOrder.shippingAddress?.state || selectedOrder.shippingInfo?.state} {selectedOrder.shippingAddress?.zipCode || selectedOrder.shippingInfo?.zipCode}</p>
              </div>
              <div className="detail-section">
                <h3>Order Items</h3>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p><strong>{item.name}</strong></p>
                      <p>Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="item-total">₹{(item.quantity * item.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="detail-section">
                <h3>Payment Summary</h3>
                <p><strong>Subtotal:</strong> ₹{(selectedOrder.subtotal || selectedOrder.total - selectedOrder.shippingCost || 0)?.toLocaleString()}</p>
                <p><strong>Shipping:</strong> ₹{(selectedOrder.shippingCost || 10)?.toLocaleString()}</p>
                <p className="total-amount"><strong>Total:</strong> ₹{(selectedOrder.totalAmount || selectedOrder.total)?.toLocaleString()}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'pending'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
