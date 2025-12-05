import { useState, useEffect } from 'react'
import axios from 'axios'
import StatCard from '../components/StatCard'
import RecentOrderItem from '../components/RecentOrderItem'
import { useNavigate } from 'react-router-dom'
import './dashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Dashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    aov: 0
  })
  const [orders, setOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const computeTopProducts = (fetchedOrders) => {
    const productMap = new Map()
    fetchedOrders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!item || !item.productId) return
        const key = item.productId
        const existing = productMap.get(key) || { name: item.name || 'Unknown', quantity: 0, revenue: 0 }
        existing.quantity += item.quantity || 1
        existing.revenue += (item.price || 0) * (item.quantity || 1)
        productMap.set(key, existing)
      })
    })
    return Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        // Fetch orders
        const ordersResp = await axios.get(`${API_URL}/orders`)
        const fetchedOrders = ordersResp.data.orders || ordersResp.data.data || []
        setOrders(fetchedOrders)

        // Fetch products (optional; if fails we fallback to distinct products from orders)
        let productCount = 0
        try {
          const prodResp = await axios.get(`${API_URL}/products`)
          productCount = (prodResp.data.products || prodResp.data.data || []).length
        } catch (e) {
          // derive from orders items
          const distinct = new Set()
          fetchedOrders.forEach(o => (o.items || []).forEach(i => i?.productId && distinct.add(i.productId)))
          productCount = distinct.size
        }

        const revenue = fetchedOrders.reduce((sum, o) => {
          const val = o.totalAmount || o.total || o.subtotal || 0
          return sum + Number(val)
        }, 0)
        const customerEmails = new Set(fetchedOrders.map(o => o.shippingAddress?.email).filter(Boolean))
        const aov = fetchedOrders.length ? revenue / fetchedOrders.length : 0

        setTopProducts(computeTopProducts(fetchedOrders))

        setDashboardData({
          revenue,
          orders: fetchedOrders.length,
          customers: customerEmails.size,
          products: productCount,
          aov
        })
        setError(null)
      } catch (err) {
        console.error('Dashboard data fetch failed:', err)
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="stats-grid">
          <StatCard 
            icon="fa-indian-rupee-sign" 
            value={`₹${dashboardData.revenue.toLocaleString(undefined,{maximumFractionDigits:0})}`} 
            label="Total Revenue" 
            trend={dashboardData.aov ? `AOV ₹${Math.round(dashboardData.aov)}` : ''}
            trendUp={true}
          />
          <StatCard 
            icon="fa-bag-shopping" 
            value={dashboardData.orders} 
            label="Total Orders" 
            trend="Live"
            trendUp={true}
          />
            <StatCard 
            icon="fa-users" 
            value={dashboardData.customers} 
            label="Unique Customers" 
            trend="Distinct emails"
            trendUp={true}
          />
          <StatCard 
            icon="fa-box" 
            value={dashboardData.products} 
            label="Products" 
            trend="Catalog size"
            trendUp={true}
          />
        </div>
      )}

      <div className="dashboard-grid">
        <div className="recent-orders-card">
          <div className="roc-header">
            <h2>Recent Orders</h2>
            <button className="link-btn" onClick={() => navigate('/orders')}>View All</button>
          </div>
          <div className="roc-list">
            {orders.slice(0,5).map(o => (
              <RecentOrderItem key={o.orderId || o._id} order={{
                id: o.orderId || 'N/A',
                customer: o.shippingAddress?.name || o.shippingAddress?.email || 'Unknown',
                amount: o.totalAmount || o.total || o.subtotal || 0,
                time: o.createdAt,
                status: o.status
              }} />
            ))}
            {orders.length === 0 && <div className="empty">No orders yet.</div>}
          </div>
        </div>

        <div className="quick-stats-card">
          <h2>Quick Statistics</h2>
          <div className="quick-stats-list">
            <div className="quick-stat-item">
              <div className="qsi-label">Pending</div>
              <div className="qsi-value">{orders.filter(o => o.status === 'pending').length}</div>
            </div>
            <div className="quick-stat-item">
              <div className="qsi-label">Processing</div>
              <div className="qsi-value">{orders.filter(o => o.status === 'processing').length}</div>
            </div>
            <div className="quick-stat-item">
              <div className="qsi-label">Delivered</div>
              <div className="qsi-value">{orders.filter(o => o.status === 'delivered').length}</div>
            </div>
            <div className="quick-stat-item">
              <div className="qsi-label">Avg Order Value</div>
              <div className="qsi-value">₹{Math.round(dashboardData.aov)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="top-products-card">
          <h2>Top Products</h2>
          <div className="top-products-list">
            {topProducts.map((p, idx) => (
              <div className="top-product-item" key={p.id}>
                <div className="tpi-rank">{idx + 1}</div>
                <div className="tpi-info">
                  <div className="tpi-name">{p.name}</div>
                  <div className="tpi-sales">{p.quantity} sold</div>
                </div>
                <div className="tpi-revenue">₹{Math.round(p.revenue).toLocaleString()}</div>
              </div>
            ))}
            {topProducts.length === 0 && <div className="empty">No product sales data yet.</div>}
          </div>
        </div>

        <div className="recent-activity-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {orders.slice(0,5).map(o => (
              <div className="activity-item" key={o._id || o.orderId}>
                <div className={`activity-icon ${o.status === 'delivered' ? 'success' : (o.status === 'processing' ? 'info' : 'warning')}`}>
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <div className="activity-info">
                  <div className="activity-text">Order {o.orderId || 'N/A'} {o.status}</div>
                  <div className="activity-time">{o.createdAt}</div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="empty">No recent activity.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
