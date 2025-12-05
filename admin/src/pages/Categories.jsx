import { useState, useEffect } from 'react'
import axios from 'axios'
import './categories.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState({ name: '', image: '', link: '', active: true })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('Fetching categories from:', `${API_URL}/categories`)
      const response = await axios.get(`${API_URL}/categories`)
      console.log('Categories response:', response.data)
      const categoryData = response.data.data || []
      console.log('Setting categories:', categoryData)
      setCategories(categoryData)
    } catch (error) {
      console.error('Error fetching categories:', error)
      console.error('Error details:', error.response?.data)
      alert('Failed to load categories: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // Compress and convert to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_WIDTH = 600
            const scaleSize = MAX_WIDTH / img.width
            canvas.width = MAX_WIDTH
            canvas.height = img.height * scaleSize

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg', 0.7))
          }
          img.src = event.target.result
        }
        reader.readAsDataURL(file)
      })
      
      setForm({ ...form, image: base64 })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setForm({ name: '', image: '', link: '', active: true })
    setShowModal(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setForm({ 
      name: category.name, 
      image: category.image || '',
      link: category.link || '',
      active: category.active 
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await axios.delete(`${API_URL}/categories/${id}`)
      alert('Category deleted successfully!')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    console.log('Saving category:', form)
    
    try {
      if (editingCategory) {
        console.log('Updating category:', editingCategory._id)
        const response = await axios.put(`${API_URL}/categories/${editingCategory._id}`, form)
        console.log('Update response:', response.data)
        alert('Category updated successfully!')
      } else {
        console.log('Creating new category')
        const response = await axios.post(`${API_URL}/categories`, form)
        console.log('Create response:', response.data)
        alert('Category added successfully!')
      }
      setShowModal(false)
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      console.error('Error response:', error.response?.data)
      alert('Failed to save category: ' + (error.response?.data?.message || error.message))
    }
  }

  if (loading) {
    return <div className="categories-page"><p>Loading categories...</p></div>
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h2>Shop By Category</h2>
          <p className="subtitle">Manage categories displayed on homepage</p>
        </div>
        <button className="add-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus" /> Add Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
            <p>No categories yet. Click "Add Category" to create your first category.</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat._id} className="category-card">
              <div 
                className="category-preview" 
                onClick={() => cat.link && window.open(cat.link, '_blank')}
                style={{ cursor: cat.link ? 'pointer' : 'default' }}
              >
                {cat.image && (
                  <div className="category-image">
                    <img src={cat.image} alt={cat.name} />
                  </div>
                )}
                <div className="category-header">
                  <h3>{cat.name}</h3>
                  <span className={`status-badge ${cat.active ? 'active' : 'inactive'}`}>
                    {cat.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="category-info">
                  {cat.link && <p className="category-link">Link: {cat.link}</p>}
                </div>
              </div>
              <div className="category-actions">
                <button className="icon-btn edit" onClick={() => handleEdit(cat)} title="Edit">
                  <i className="fa-solid fa-pen" />
                </button>
                <button className="icon-btn delete" onClick={() => handleDelete(cat._id)} title="Delete">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} className="category-form">
              <div className="form-field">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Enter category name (e.g., Men's Fashion)"
                />
              </div>
              
              <div className="form-field">
                <label>Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p className="uploading-text">Uploading...</p>}
                {form.image && (
                  <div className="image-preview">
                    <img src={form.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-field">
                <label>Shop Link (Optional)</label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="e.g., /shop?category=men or /shop"
                />
                <small>Link to navigate when category is clicked on homepage</small>
              </div>

              <div className="form-field">
                <label>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  {' '}Active (Show on homepage)
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
