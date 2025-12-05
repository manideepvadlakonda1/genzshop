import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductModal from '../components/ProductModal'
import './products.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products?sortBy=newest`)
      const list = data.products || []
      setProducts(list)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAdd = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await axios.delete(`${API_URL}/products/${id}`)
      fetchProducts()
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  const handleSave = (action = 'saved') => {
    setShowModal(false)
    fetchProducts()
    const msg = action === 'created' ? 'Product added successfully' : 'Product updated successfully'
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  if (loading) return <div className="loading">Loading products...</div>

  return (
    <div className="products-page">
      {successMsg && <div className="toast success">{successMsg}</div>}
      <div className="products-header">
        <div>
          <h2>Products</h2>
          <p className="subtitle">Manage your saree products</p>
        </div>
        <button className="add-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus" /> Add Product
        </button>
      </div>

      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>CATEGORY</th>
              <th>COLORS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="product-cell">
                    <div className="product-name">{p.name}</div>
                    <div className="product-desc">{p.description}</div>
                  </div>
                </td>
                <td>
                  ₹{p.price?.toLocaleString()} 
                  {p.salePrice && <span className="old-price">₹{p.salePrice.toLocaleString()}</span>}
                </td>
                <td>{p.stock || 0}</td>
                <td>{p.category}</td>
                <td>
                  {p.colors?.length > 0 && (
                    <div className="color-dots">
                      {p.colors.slice(0, 3).map((c, i) => (
                        <span key={i} className="color-dot" style={{ background: c }} title={c} />
                      ))}
                      {p.colors.length > 3 && <span className="color-more">+{p.colors.length - 3}</span>}
                    </div>
                  )}
                </td>
                <td>
                  <div className="actions">
                    <button className="icon-btn edit" onClick={() => handleEdit(p)} title="Edit">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(p._id)} title="Delete">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="empty-state">No products found. Add your first product!</div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default Products
