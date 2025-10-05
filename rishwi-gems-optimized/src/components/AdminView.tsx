import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadImageToStorage, type Product, categories, functions } from '../lib/supabase';
import { Plus, CreditCard as Edit3, Trash2, Upload, Save, X, Package, TrendingUp, Eye, ShoppingBag } from 'lucide-react';

const AdminView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0],
    function_type: null,
    image_url: '',
    is_for_sale: true
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    // Use Supabase Storage for image upload
    return await uploadImageToStorage(file);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSaving(true);
    try {
      let imageUrl = formData.image_url;
      
      // If there's a new image file, use default image for now
      if (imageFile) {
        console.log('Image file selected, using default image for now');
        imageUrl = '/WhatsApp Image 2025-09-29 at 16.29.12_6c59f301 copy copy copy.jpg';
      } else if (!imageUrl && !editingProduct?.image_url) {
        // Use default image if no image is provided
        imageUrl = '/WhatsApp Image 2025-09-29 at 16.29.12_6c59f301 copy copy copy.jpg';
      }

      const productData = {
        ...formData,
        price: formData.is_for_sale ? parseFloat(formData.price) : 0,
        function_type: formData.function_type,
        image_url: imageUrl
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error instanceof Error ? error.message : 'Database connection issue. Please try again.'}`);
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      function_type: product.function_type,
      image_url: product.image_url,
      is_for_sale: product.is_for_sale
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0],
      function_type: null,
      image_url: '',
      is_for_sale: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setImageFile(null);
    setImagePreview('');
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-luxury-gold/20 border-t-luxury-gold mx-auto mb-6 animate-glow"></div>
            <p className="text-luxury-softWhite text-lg font-medium">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-luxury-black min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-luxury-white">Product Management</h2>
          <p className="text-luxury-softWhite">Manage your jewelry collection</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="bg-luxury-gold text-luxury-black px-6 py-3 rounded-lg font-medium hover:bg-luxury-amber transition-all flex items-center space-x-2 shadow-sm hover:shadow-md animate-glow"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-luxury-charcoal rounded-xl p-6 shadow-sm border border-luxury-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-softWhite">Total Products</p>
              <p className="text-2xl font-bold text-luxury-white">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-luxury-gold" />
          </div>
        </div>
        <div className="bg-luxury-charcoal rounded-xl p-6 shadow-sm border border-luxury-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-softWhite">For Sale</p>
              <p className="text-2xl font-bold text-green-600">{products.filter(p => p.is_for_sale).length}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-luxury-charcoal rounded-xl p-6 shadow-sm border border-luxury-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-softWhite">Showcase Only</p>
              <p className="text-2xl font-bold text-blue-600">{products.filter(p => !p.is_for_sale).length}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-luxury-charcoal rounded-xl p-6 shadow-sm border border-luxury-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-softWhite">Categories</p>
              <p className="text-2xl font-bold text-luxury-gold">{categories.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-luxury-gold" />
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-luxury-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-luxury-charcoal rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-luxury-gold/30 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-luxury-gold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="text-luxury-gold hover:text-luxury-amber p-2 hover:bg-luxury-gold/10 rounded-lg transition-all duration-300"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-luxury-gold/20 border border-luxury-gold/30 rounded-lg">
                <input
                  type="checkbox"
                  id="is_for_sale"
                  checked={formData.is_for_sale}
                  onChange={(e) => setFormData({...formData, is_for_sale: e.target.checked, price: e.target.checked ? formData.price : '0'})}
                  className="w-5 h-5 text-luxury-gold bg-luxury-black border-luxury-gold/30 rounded focus:ring-luxury-gold focus:ring-2"
                />
                <label htmlFor="is_for_sale" className="text-sm text-luxury-softWhite font-medium">
                  Available for sale (uncheck if this item is for rent only)
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-luxury-softWhite mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-luxury-black/50 border border-luxury-gold/30 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-white placeholder-luxury-muted transition-all duration-300"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-luxury-softWhite mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-luxury-black/50 border border-luxury-gold/30 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-white placeholder-luxury-muted transition-all duration-300"
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.is_for_sale && (
                  <div>
                    <label className="block text-sm font-bold text-luxury-softWhite mb-2">
                      Price (Rs) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-luxury-black/50 border border-luxury-gold/30 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-white placeholder-luxury-muted transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-luxury-softWhite mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className={`px-4 py-3 bg-luxury-black/50 border border-luxury-gold/30 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-white transition-all duration-300 ${
                      formData.is_for_sale ? 'w-full' : 'w-full'
                    }`}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div>
                <label className="block text-sm font-bold text-luxury-softWhite mb-2">
                  Product Image
                </label>
                <div className="space-y-4">
                  <input
                    type="url"
                    placeholder="Or enter image URL (https://...)"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-luxury-black/50 border border-luxury-gold/30 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-white placeholder-luxury-muted transition-all duration-300"
                  />
                  
                  <div className="text-center text-luxury-gold text-sm font-medium">OR</div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 bg-luxury-black/50 border border-luxury-gold/30 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-white transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-luxury-gold/20 file:text-luxury-softWhite hover:file:bg-luxury-gold/30"
                  />
                  
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData({...formData, image_url: ''});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <p className="text-sm text-luxury-muted">
                    Upload an image file or enter an image URL above
                  </p>
                </div>
              </div>


              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-luxury-softWhite border border-luxury-gold/30 rounded-lg hover:bg-luxury-gold/10 hover:border-luxury-gold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-3 bg-luxury-gold text-luxury-black rounded-lg hover:bg-luxury-amber flex items-center space-x-2 shadow-lg hover:shadow-xl hover:shadow-luxury-gold/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold animate-glow"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {saving || uploadingImage ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-luxury-charcoal rounded-xl shadow-sm overflow-hidden border border-luxury-gold/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-luxury-black/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-muted uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-muted uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-luxury-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-luxury-charcoal divide-y divide-luxury-gold/10">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-luxury-white">{product.name}</div>
                        <div className="text-sm text-luxury-softWhite truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-luxury-gold/20 text-luxury-gold">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-luxury-white">
                    Rs{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_for_sale
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.is_for_sale ? 'For Sale' : 'For Rent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="text-luxury-gold hover:text-luxury-amber p-1 hover:bg-luxury-gold/10 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <Upload className="w-16 h-16 text-luxury-muted mx-auto mb-4" />
          <h3 className="text-xl font-medium text-luxury-white mb-2">No products yet</h3>
          <p className="text-luxury-softWhite mb-4">Start by adding your first jewelry product</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="bg-luxury-gold text-luxury-black px-6 py-2 rounded-lg font-medium hover:bg-luxury-amber transition-all shadow-sm hover:shadow-md animate-glow"
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminView;