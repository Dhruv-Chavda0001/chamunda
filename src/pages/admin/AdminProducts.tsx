import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  AlertCircle,
  Copy,
  SlidersHorizontal,
  Flame,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, deleteDemoProducts } from '../../services/db';
import { Product, ProductCategory } from '../../types';
import toast from 'react-hot-toast';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'in_stock' | 'sold_out'>('All');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadProducts = async () => {
    try {
      const list = await getProducts();
      setProducts(list);
    } catch (e) {
      console.warn('Error fetching products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    window.addEventListener('cf_products_updated', loadProducts);
    return () => window.removeEventListener('cf_products_updated', loadProducts);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;

      const totalStock = p.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
      if (stockFilter === 'in_stock' && totalStock <= 0) return false;
      if (stockFilter === 'sold_out' && totalStock > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [products, categoryFilter, stockFilter, searchQuery]);

  // Quick Action: Toggle Visibility
  const toggleVisibility = async (product: Product) => {
    try {
      const updated = { ...product, isVisible: !product.isVisible };
      await saveProduct(updated);
      toast.success(
        `Product "${product.name}" is now ${updated.isVisible ? 'Visible' : 'Hidden'}`
      );
      loadProducts();
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  // Quick Action: Mark Sold Out (sets all size stocks to 0)
  const markSoldOut = async (product: Product) => {
    if (!confirm(`Mark "${product.name}" as sold out across all sizes?`)) return;
    try {
      const updated = {
        ...product,
        sizes: product.sizes.map(s => ({ ...s, stock: 0 })),
      };
      await saveProduct(updated);
      toast.success(`"${product.name}" marked as sold out`);
      loadProducts();
    } catch {
      toast.error('Failed to mark sold out');
    }
  };

  // Quick Action: Delete
  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await deleteProduct(productId);
      toast.success('Product deleted');
      setSelectedIds(prev => prev.filter(id => id !== productId));
      loadProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  // Delete Demo Products
  const handleDeleteDemoProducts = async () => {
    if (
      !confirm(
        'Delete all 8 initial demo products? This will leave only the products you added yourself.'
      )
    )
      return;

    try {
      const count = await deleteDemoProducts();
      toast.success(`Deleted ${count} demo products successfully`);
      loadProducts();
    } catch {
      toast.error('Failed to delete demo products');
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkHide = async () => {
    try {
      for (const id of selectedIds) {
        const p = products.find(prod => prod.id === id);
        if (p) {
          await saveProduct({ ...p, isVisible: false });
        }
      }
      toast.success(`Hidden ${selectedIds.length} products`);
      setSelectedIds([]);
      loadProducts();
    } catch {
      toast.error('Bulk hide failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} selected products permanently?`)) return;
    try {
      for (const id of selectedIds) {
        await deleteProduct(id);
      }
      toast.success(`Deleted ${selectedIds.length} products`);
      setSelectedIds([]);
      loadProducts();
    } catch {
      toast.error('Bulk delete failed');
    }
  };

  const hasDemoProducts = products.some(p => p.isDemo || p.id.startsWith('prod-demo-'));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
            Catalog Management
          </span>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#7B1E3A]">
            Products ({products.length})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasDemoProducts && (
            <button
              onClick={handleDeleteDemoProducts}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs"
              title="Delete demo items before launching"
            >
              Delete Demo Products
            </button>
          )}

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#C9A24B]/30 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-full py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#FFF8F0]/40 border border-stone-300 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[#7B1E3A]"
          >
            <option value="All">All Categories</option>
            <option value="Kurti">Kurtis</option>
            <option value="Co-ord">Co-ords</option>
            <option value="Western">Western</option>
            <option value="Dress">Dresses</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="bg-[#FFF8F0]/40 border border-stone-300 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[#7B1E3A]"
          >
            <option value="All">All Stock Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="sold_out">Sold Out Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#7B1E3A] text-white p-3 rounded-2xl flex items-center justify-between shadow-md text-xs animate-in fade-in">
          <span className="font-bold">
            {selectedIds.length} products selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkHide}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-semibold"
            >
              Hide Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg font-semibold"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#C9A24B]/30 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFF8F0] border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="p-0.5">
                    {selectedIds.length > 0 &&
                    selectedIds.length === filteredProducts.length ? (
                      <CheckSquare className="w-4 h-4 text-[#7B1E3A]" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Breakdown</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(product => {
                const totalStock =
                  product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
                const isSelected = selectedIds.includes(product.id);

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      isSelected ? 'bg-[#FFF8F0]' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleSelectOne(product.id)}
                        className="p-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#7B1E3A]" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-300" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || '/logo.png'}
                          alt={product.name}
                          className="w-10 h-14 object-cover object-top rounded-lg bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="font-bold text-stone-900 hover:text-[#7B1E3A] line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <span className="text-[11px] text-stone-500 block truncate">
                            {product.fabric}
                          </span>
                          {product.isDemo && (
                            <span className="inline-block mt-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold px-1 rounded">
                              Demo Item
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-stone-700">
                      {product.category}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-[#7B1E3A]">
                        ₹{product.price}
                      </span>
                      {product.discountPrice && product.discountPrice > product.price && (
                        <span className="text-[11px] text-stone-400 line-through block">
                          ₹{product.discountPrice}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes?.map(s => (
                          <span
                            key={s.size}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              s.stock > 0
                                ? 'bg-stone-100 text-stone-800'
                                : 'bg-red-50 text-red-500 line-through'
                            }`}
                          >
                            {s.size}:{s.stock}
                          </span>
                        ))}
                      </div>
                      <span
                        className={`text-[10px] font-semibold mt-0.5 block ${
                          totalStock <= 0
                            ? 'text-red-600 font-bold'
                            : totalStock <= 3
                            ? 'text-amber-600'
                            : 'text-stone-500'
                        }`}
                      >
                        Total: {totalStock}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleVisibility(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          product.isVisible
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {product.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{product.isVisible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Edit */}
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="p-1.5 text-stone-600 hover:text-[#7B1E3A] rounded-lg hover:bg-stone-100"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Mark Sold Out */}
                        {totalStock > 0 && (
                          <button
                            onClick={() => markSoldOut(product)}
                            className="p-1.5 text-stone-400 hover:text-amber-600 rounded-lg hover:bg-stone-100 text-[10px] font-bold"
                            title="Mark Sold Out"
                          >
                            Zero Stock
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-stone-500 text-xs">
            No products match the selected filters.
          </div>
        )}
      </div>

    </div>
  );
};
