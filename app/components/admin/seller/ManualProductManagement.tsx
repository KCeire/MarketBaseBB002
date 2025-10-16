"use client";

import { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { toast } from '../../ui/Toast';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string;
  images: string[];
  status: 'active' | 'draft' | 'archived';
  inventory: number;
  sku?: string;
  createdAt: string;
}

interface ManualProductManagementProps {
  storeId: string;
  className?: string;
}

export function ManualProductManagement({ storeId, className = "" }: ManualProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    images: [''],
    inventory: 0,
    sku: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // This will be implemented when the backend is ready
      // const response = await fetch(`/api/admin/stores/${storeId}/products`);
      // const data = await response.json();

      // For now, show placeholder data
      setProducts([
        {
          id: '1',
          title: 'Sample Product',
          description: 'This is a sample product entry',
          price: '29.99',
          images: [],
          status: 'draft',
          inventory: 0,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.title.trim() || !newProduct.price.trim()) {
      toast.error('Missing Information', 'Please fill in title and price');
      return;
    }

    const price = parseFloat(newProduct.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Invalid Price', 'Please enter a valid price');
      return;
    }

    try {
      // This will be implemented when the backend is ready
      /*
      const response = await fetch(`/api/admin/stores/${storeId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProduct.title.trim(),
          description: newProduct.description.trim(),
          price: price,
          compareAtPrice: newProduct.compareAtPrice ? parseFloat(newProduct.compareAtPrice) : null,
          images: newProduct.images.filter(img => img.trim()),
          inventory: newProduct.inventory,
          sku: newProduct.sku.trim() || null
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Product Created', 'Product has been created successfully');
        setNewProduct({
          title: '',
          description: '',
          price: '',
          compareAtPrice: '',
          images: [''],
          inventory: 0,
          sku: ''
        });
        setShowCreateForm(false);
        fetchProducts();
      } else {
        toast.error('Creation Failed', result.error || 'Failed to create product');
      }
      */

      // Placeholder for now
      toast.success('Coming Soon', 'Manual product creation will be available soon');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Creation Failed', 'An error occurred while creating the product');
    }
  };

  const addImageField = () => {
    setNewProduct({
      ...newProduct,
      images: [...newProduct.images, '']
    });
  };

  const removeImageField = (index: number) => {
    const newImages = newProduct.images.filter((_, i) => i !== index);
    setNewProduct({
      ...newProduct,
      images: newImages.length > 0 ? newImages : ['']
    });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...newProduct.images];
    newImages[index] = value;
    setNewProduct({
      ...newProduct,
      images: newImages
    });
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manually add and manage your products</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2"
        >
          <Icon name={showCreateForm ? "x" : "plus"} size="sm" />
          <span>{showCreateForm ? 'Cancel' : 'Add Product'}</span>
        </Button>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <div className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Add New Product</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                placeholder="Enter product title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compare At Price
              </label>
              <input
                type="number"
                step="0.01"
                value={newProduct.compareAtPrice}
                onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                placeholder="Product SKU"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Product description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Images
            </label>
            <div className="space-y-2">
              {newProduct.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateImageField(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  {newProduct.images.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImageField(index)}
                    >
                      <Icon name="x" size="sm" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={addImageField}
                className="flex items-center space-x-1"
              >
                <Icon name="plus" size="sm" />
                <span>Add Image</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Inventory Quantity
            </label>
            <input
              type="number"
              min="0"
              value={newProduct.inventory}
              onChange={(e) => setNewProduct({ ...newProduct, inventory: parseInt(e.target.value) || 0 })}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="bg-yellow-900/20 dark:bg-yellow-900/20 border border-yellow-800 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <Icon name="exclamation-triangle" size="sm" className="text-yellow-500 mt-0.5 mr-3" />
              <div>
                <h5 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Coming Soon</h5>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Manual product management is currently under development. For now, you can use the Shopify integration to sync your products.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProduct}
              disabled={!newProduct.title.trim() || !newProduct.price.trim()}
            >
              Create Product
            </Button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Your Products</h4>

        {products.length === 0 ? (
          <div className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6z"/>
                <path d="M6 8h12v2H6V8zm0 4h8v2H6v-2z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">No products added yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Add your first product manually or connect your Shopify store to sync existing products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.title}</h5>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : product.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">${product.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">Stock: {product.inventory}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Icon name="trash" size="sm" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}