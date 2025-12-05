import { useState, useEffect } from 'react'
import axios from 'axios'
import './productModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
// Configure axios defaults
axios.defaults.timeout = 60000
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.put['Content-Type'] = 'application/json'

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '',
    category: '',
    subcategory: '',
    collection: '',
    fabric: '',
    colors: [],
    images: [],
    isBestseller: false,
  })

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [colorInput, setColorInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const fetchedCategories = await fetchCategories()
      
      // If editing a product, load its subcategories
      if (product && product.category && fetchedCategories.length > 0) {
        await fetchSubcategoriesByCategory(product.category, fetchedCategories)
      }
    }
    
    init()
  }, [])

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        stock: product.stock || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        collection: product.collection || '',
        fabric: product.fabric || '',
        colors: product.colors || [],
        images: product.images || [],
        isBestseller: product.isBestseller || false,
      })
    }
  }, [product])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`)
      const fetchedCategories = response.data.data || []
      setCategories(fetchedCategories)
      return fetchedCategories
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
      return []
    }
  }

  const fetchSubcategoriesByCategory = async (categoryName, categoriesList = categories) => {
    try {
      // Find the category ID from the category name
      const category = categoriesList.find(cat => cat.name === categoryName)
      if (!category) {
        console.log('Category not found:', categoryName)
        setSubcategories([])
        return
      }
      
      console.log('Fetching subcategories for category:', category.name, category._id)
      const response = await axios.get(`${API_URL}/subcategories/category/${category._id}`)
      console.log('Subcategories response:', response.data)
      setSubcategories(response.data.data || [])
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      setSubcategories([])
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // When category changes, fetch subcategories and reset subcategory
    if (name === 'category') {
      setForm(prev => ({
        ...prev,
        category: value,
        subcategory: '' // Reset subcategory when category changes
      }))
      if (value) {
        fetchSubcategoriesByCategory(value)
      } else {
        setSubcategories([])
      }
      return
    }
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addColor = () => {
    if (!colorInput.trim()) return
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, colorInput.trim()]
    }))
    setColorInput('')
  }

  const removeColor = (index) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (form.images.length + files.length > 4) {
      alert('Maximum 4 images allowed')
      return
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB.`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        // Compress image before storing
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Resize to max 600px width while maintaining aspect ratio
          const maxWidth = 600
          const scale = Math.min(1, maxWidth / img.width)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // Convert to base64 with reduced quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6)
          
          setForm(prev => ({
            ...prev,
            images: [...prev.images, compressedBase64]
          }))
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: parseInt(form.stock) || 0,
      }

      console.log('Submitting product:', payload)

      if (product) {
        const response = await axios.put(`${API_URL}/products/${product._id}`, payload, {
          timeout: 60000,
          headers: { 'Content-Type': 'application/json' }
        })
        console.log('Update response:', response)
        onSave('updated')
        return
      } else {
        const response = await axios.post(`${API_URL}/products`, payload, {
          timeout: 60000,
          headers: { 'Content-Type': 'application/json' }
        })
        console.log('Create response:', response)
        onSave('created')
        return
      }
    } catch (error) {
      console.error('Save error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error'
      alert('Failed to save product: ' + errorMsg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-field">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Product description"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-field">
              <label>Sale Price (₹)</label>
              <input
                type="number"
                name="salePrice"
                value={form.salePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-field">
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Subcategory</label>
              <select 
                name="subcategory" 
                value={form.subcategory} 
                onChange={handleChange}
                disabled={!form.category}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => <option key={sub._id} value={sub.name}>{sub.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Collection</label>
              <input
                type="text"
                name="collection"
                value={form.collection}
                onChange={handleChange}
                placeholder="e.g., Tussar & Bhagalpuri Elegance"
              />
            </div>
            <div className="form-field">
              <label>Fabric</label>
              <input
                type="text"
                name="fabric"
                value={form.fabric}
                onChange={handleChange}
                placeholder="e.g., Silk, Cotton, Chanderi"
              />
            </div>
          </div>

          <div className="form-field">
            <label>
              <input
                type="checkbox"
                name="isBestseller"
                checked={form.isBestseller}
                onChange={handleChange}
              />
              {' '}Mark as Bestseller (will appear in homepage bestsellers section)
            </label>
          </div>

          <div className="form-field">
            <label>Available Colors</label>
            <div className="add-group">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="Color name or hex code"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <button type="button" className="add-btn-sm" onClick={addColor}>Add</button>
            </div>
            <div className="tags">
              {form.colors.map((color, i) => (
                <span key={i} className="tag">
                  <span className="color-preview" style={{ background: color }} />
                  {color}
                  <button type="button" onClick={() => removeColor(i)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Product Images (Max 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <div className="image-grid">
              {form.images.map((img, i) => (
                <div key={i} className="image-preview">
                  <img src={img} alt="" />
                  <button type="button" className="remove-img" onClick={() => removeImage(i)}>×</button>
                </div>
              ))}
              {form.images.length < 4 && (
                <label htmlFor="image-upload" className="upload-box">
                  <i className="fa-regular fa-image" />
                  <p>Add Image</p>
                  <small>Click to upload from device</small>
                </label>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal
