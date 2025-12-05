import { useState, useEffect } from 'react'
import axios from 'axios'
import './categorySub.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CategorySub = () => {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('categories')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('category')
  const [editingItem, setEditingItem] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '', link: '', active: true })
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', categoryId: '', categoryName: '', image: '', active: true })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/categories`)
      console.log('Categories:', response.data)
      const list = response.data.data || []
      const toMs = (x) => x && x.createdAt ? Date.parse(x.createdAt) || 0 : 0
      list.sort((a,b) => toMs(b) - toMs(a))
      setCategories(list)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/subcategories`)
      console.log('Subcategories:', response.data)
      const list = response.data.data || []
      const toMs = (x) => x && x.createdAt ? Date.parse(x.createdAt) || 0 : 0
      list.sort((a,b) => toMs(b) - toMs(a))
      setSubcategories(list)
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
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
      
      if (type === 'category') {
        setCategoryForm({ ...categoryForm, image: base64 })
      } else {
        setSubcategoryForm({ ...subcategoryForm, image: base64 })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleAddCategory = () => {
    setModalType('category')
    setEditingItem(null)
    setCategoryForm({ name: '', image: '', link: '', active: true })
    setShowModal(true)
  }

  const handleEditCategory = (category) => {
    setModalType('category')
    setEditingItem(category)
    setCategoryForm({ 
      name: category.name, 
      image: category.image || '',
      link: category.link || '',
      active: category.active 
    })
    setShowModal(true)
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure? This will not delete subcategories.')) return
    
    try {
      await axios.delete(`${API_URL}/categories/${id}`)
      alert('Category deleted successfully!')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/categories/${editingItem._id}`, categoryForm)
        alert('Category updated successfully!')
      } else {
        await axios.post(`${API_URL}/categories`, categoryForm)
        alert('Category added successfully!')
      }
      setShowModal(false)
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    }
  }

  const handleAddSubcategory = () => {
    setModalType('subcategory')
    setEditingItem(null)
    setSubcategoryForm({ name: '', categoryId: '', categoryName: '', image: '', active: true })
    setShowModal(true)
  }

  const handleEditSubcategory = (subcategory) => {
    setModalType('subcategory')
    setEditingItem(subcategory)
    setSubcategoryForm({ 
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      categoryName: subcategory.categoryName || '',
      image: subcategory.image || '',
      active: subcategory.active 
    })
    setShowModal(true)
  }

  const handleDeleteSubcategory = async (id) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return
    
    try {
      await axios.delete(`${API_URL}/subcategories/${id}`)
      alert('Subcategory deleted successfully!')
      fetchSubcategories()
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      alert('Failed to delete subcategory')
    }
  }

  const handleSaveSubcategory = async (e) => {
    e.preventDefault()
    
    const selectedCat = categories.find(c => c._id === subcategoryForm.categoryId)
    const formData = {
      ...subcategoryForm,
      categoryName: selectedCat ? selectedCat.name : ''
    }
    
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/subcategories/${editingItem._id}`, formData)
        alert('Subcategory updated successfully!')
      } else {
        await axios.post(`${API_URL}/subcategories`, formData)
        alert('Subcategory added successfully!')
      }
      setShowModal(false)
      fetchSubcategories()
    } catch (error) {
      console.error('Error saving subcategory:', error)
      alert('Failed to save subcategory')
    }
  }

  if (loading) {
    return <div className="category-sub-page"><p>Loading...</p></div>
  }

  return (
    <div className="category-sub-page">
      <div className="page-header">
        <div>
          <h2>Category & Sub</h2>
          <p className="subtitle">Manage categories and subcategories</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <i className="fa-solid fa-layer-group" /> Categories ({categories.length})
        </button>
        <button 
          className={`tab ${activeTab === 'subcategories' ? 'active' : ''}`}
          onClick={() => setActiveTab('subcategories')}
        >
          <i className="fa-solid fa-tags" /> Subcategories ({subcategories.length})
        </button>
      </div>

      {activeTab === 'categories' && (
        <div className="tab-content">
          <div className="content-header">
            <h3>Categories</h3>
            <button className="add-btn" onClick={handleAddCategory}>
              <i className="fa-solid fa-plus" /> Add Category
            </button>
          </div>
          
          <div className="items-grid">
            {categories.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-folder-open" />
                <p>No categories yet. Add your first category!</p>
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat._id} className="item-card">
                  {cat.image && (
                    <div className="item-image">
                      <img src={cat.image} alt={cat.name} />
                    </div>
                  )}
                  <div className="item-info">
                    <h4>{cat.name}</h4>
                    <span className={`status-badge ${cat.active ? 'active' : 'inactive'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                    {cat.link && <p className="item-link">Link: {cat.link}</p>}
                  </div>
                  <div className="item-actions">
                    <button className="icon-btn edit" onClick={() => handleEditCategory(cat)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteCategory(cat._id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'subcategories' && (
        <div className="tab-content">
          <div className="content-header">
            <h3>Subcategories</h3>
            <button className="add-btn" onClick={handleAddSubcategory}>
              <i className="fa-solid fa-plus" /> Add Subcategory
            </button>
          </div>
          
          <div className="items-grid">
            {subcategories.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-tags" />
                <p>No subcategories yet. Add your first subcategory!</p>
              </div>
            ) : (
              subcategories.map(sub => (
                <div key={sub._id} className="item-card">
                  {sub.image && (
                    <div className="item-image">
                      <img src={sub.image} alt={sub.name} />
                    </div>
                  )}
                  <div className="item-info">
                    <h4>{sub.name}</h4>
                    <p className="category-parent">
                      <i className="fa-solid fa-layer-group" /> {sub.categoryName || 'No Category'}
                    </p>
                    <span className={`status-badge ${sub.active ? 'active' : 'inactive'}`}>
                      {sub.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="item-actions">
                    <button className="icon-btn edit" onClick={() => handleEditSubcategory(sub)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteSubcategory(sub._id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showModal && modalType === 'category' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveCategory} className="form">
              <div className="form-field">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  placeholder="e.g., Soft Silk, Cotton"
                />
              </div>
              
              <div className="form-field">
                <label>Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'category')}
                  disabled={uploading}
                />
                {uploading && <p className="uploading-text">Uploading...</p>}
                {categoryForm.image && (
                  <div className="image-preview">
                    <img src={categoryForm.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-field">
                <label>Shop Link (Optional)</label>
                <input
                  type="text"
                  value={categoryForm.link}
                  onChange={(e) => setCategoryForm({ ...categoryForm, link: e.target.value })}
                  placeholder="e.g., /shop?category=Soft Silk"
                />
              </div>

              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={categoryForm.active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                  />
                  Active (Show on homepage)
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">
                  {editingItem ? 'Update' : 'Add'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && modalType === 'subcategory' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveSubcategory} className="form">
              <div className="form-field">
                <label>Parent Category *</label>
                <select
                  value={subcategoryForm.categoryId}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Subcategory Name *</label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  required
                  placeholder="e.g., Tussar Silk, Banarasi"
                />
              </div>
              
              <div className="form-field">
                <label>Subcategory Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'subcategory')}
                  disabled={uploading}
                />
                {uploading && <p className="uploading-text">Uploading...</p>}
                {subcategoryForm.image && (
                  <div className="image-preview">
                    <img src={subcategoryForm.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={subcategoryForm.active}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">
                  {editingItem ? 'Update' : 'Add'} Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategorySub
