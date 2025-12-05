import { useState, useEffect } from 'react'
import axios from 'axios'
import './customers.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      // Fetch orders from API and aggregate customers
      const { data } = await axios.get(`${API_URL}/orders`)
      const orders = data.orders || data.data || []
      const customerMap = new Map()

      orders.forEach(order => {
        const email = order?.shippingAddress?.email
        if (!email) return
        const name = order.shippingAddress?.name || email
        const phone = order.shippingAddress?.phone || ''
        const address = `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`.replace(/^,\s|,\s$/g,'').trim()
        const amount = Number(order.totalAmount || order.total || order.subtotal || 0)
        const createdAt = order.createdAt || order.updatedAt || ''

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            name,
            email,
            phone,
            address,
            totalOrders: 0,
            totalSpent: 0,
            firstOrder: createdAt,
            lastOrder: createdAt,
            orders: []
          })
        }
        const c = customerMap.get(email)
        c.totalOrders += 1
        c.totalSpent += amount
        c.orders.push({
          id: order.orderId || order._id,
          amount,
          status: order.status,
          time: createdAt,
          items: order.items || []
        })
        // update first/last order dates
        if (createdAt) {
          const d = new Date(createdAt)
          if (!c.firstOrder || d < new Date(c.firstOrder)) c.firstOrder = createdAt
          if (!c.lastOrder || d > new Date(c.lastOrder)) c.lastOrder = createdAt
        }
      })

      const list = Array.from(customerMap.values())
      // sort by last order desc
      list.sort((a,b) => new Date(b.lastOrder) - new Date(a.lastOrder))
      setCustomers(list)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers
    .filter(customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer)
    setShowModal(true)
  }

  if (loading) return <div className="loading">Loading customers...</div>

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div>
          <h2>Customer Management</h2>
          <p className="subtitle">View and manage customer information</p>
        </div>
        <div className="customers-stats">
          <div className="stat-card">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">{customers.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active</span>
            <span className="stat-value">{customers.filter(c => c.totalOrders > 0).length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="customers-controls">
        <div className="search-box">
          <i className="fa-solid fa-search" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-table-wrap">
        <table className="customers-table">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>CONTACT</th>
              <th>ORDERS</th>
              <th>TOTAL SPENT</th>
              <th>LAST ORDER</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, idx) => (
              <tr key={idx}>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar">{customer.name?.charAt(0) || 'C'}</div>
                    <div className="customer-name">{customer.name}</div>
                  </div>
                </td>
                <td>
                  <div className="contact-cell">
                    <div>{customer.email}</div>
                    {customer.phone && <div className="muted">{customer.phone}</div>}
                  </div>
                </td>
                <td>{customer.totalOrders}</td>
                <td><strong>₹{Math.round(customer.totalSpent).toLocaleString()}</strong></td>
                <td>{new Date(customer.lastOrder).toLocaleDateString()}</td>
                <td>
                  <button className="icon-btn view" onClick={() => viewCustomerDetails(customer)} title="View Details">
                    <i className="fa-solid fa-eye" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="empty-state">No customers found</div>
        )}
      </div>

      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="customer-details">
              <div className="detail-section">
                <div className="customer-avatar-large">{selectedCustomer.name?.charAt(0) || 'C'}</div>
                <h3>{selectedCustomer.name}</h3>
                <p>{selectedCustomer.email}</p>
              </div>
              <div className="detail-section">
                <h4>Contact Information</h4>
                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Location:</strong> {selectedCustomer.address}</p>
              </div>
              <div className="detail-section">
                <h4>Order Statistics</h4>
                <p><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</p>
                <p><strong>Total Spent:</strong> ₹{Math.round(selectedCustomer.totalSpent).toLocaleString()}</p>
                <p><strong>Average Order:</strong> ₹{selectedCustomer.totalOrders ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2) : '0.00'}</p>
                <p><strong>Last Order:</strong> {new Date(selectedCustomer.lastOrder).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="orders-history">
              <h3>Order History</h3>
              {(selectedCustomer.orders || [])
                .slice()
                .sort((a,b) => new Date(b.time) - new Date(a.time))
                .map((o, idx) => (
                <div key={idx} className="order-row" role="article" aria-label={`Order ${o.id}`}>
                  <div className="order-id">{o.id}</div>
                  <div className="order-time">{new Date(o.time).toLocaleString()}</div>
                  <div className="order-amount">₹{Math.round(o.amount).toLocaleString()}</div>
                  <span className={`status-badge ${o.status}`}>{o.status}</span>
                </div>
              ))}
              {(selectedCustomer.orders || []).length === 0 && <div className="empty-state">No orders</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
