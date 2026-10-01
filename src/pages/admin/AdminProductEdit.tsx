import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  Copy,
  Sparkles,
  MoveLeft,
  MoveRight,
  Loader2,
  X,
} from 'lucide-react';
import { getProductById, saveProduct, deleteProduct, compressImage } from '../../services/db';
import { Product, ProductCategory, SizeStock } from '../../types';
import toast from 'react-hot-toast';

export const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [nameGu, setNameGu] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Kurti');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [fabric, setFabric] = useState('');
  const [coloursInput, setColoursInput] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionHi, setDescriptionHi] = useState('');
  const [descriptionGu, setDescriptionGu] = useState('');

  // Sizes
  const [sizes, setSizes] = useState<SizeStock[]>([
    { size: 'M', stock: 5 },
    { size: 'L', stock: 5 },
    { size: 'XL', stock: 5 },
    { size: 'XXL', stock: 2 },
  ]);
  const [newSizeName, setNewSizeName] = useState('');

  // Images (up to 5)
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Toggles
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const load = async () => {
        setLoading(true);
        try {
          const p = await getProductById(id);
          if (p) {
            setName(p.name);
            setNameHi(p.name_hi || '');
            setNameGu(p.name_gu || '');
            setCategory(p.category);
            setPrice(p.price);
            setDiscountPrice(p.discountPrice || '');
            setFabric(p.fabric);
            setColoursInput(p.colours?.join(', ') || '');
            setDescription(p.description);
            setDescriptionHi(p.description_hi || '');
            setDescriptionGu(p.description_gu || '');
            setSizes(p.sizes || []);
            setImages(p.images || []);
            setIsVisible(p.isVisible);
            setIsFeatured(p.isFeatured);
          } else {
            toast.error('Product not found');
            navigate('/admin/products');
          }
        } catch {
          toast.error('Error loading product');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEditing, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per product');
      return;
    }

    setUploadingImage(true);
    try {
      const newCompressedImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1200, 0.85);
          newCompressedImages.push(compressed);
        }
      }
      setImages(prev => [...prev, ...newCompressedImages].slice(0, 5));
      toast.success('Images compressed and added');
    } catch {
      toast.error('Failed to process image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const arr = [...images];
    const temp = arr[index];
    arr[index] = arr[newIdx];
    arr[newIdx] = temp;
    setImages(arr);
  };

  const updateSizeStock = (index: number, stock: number) => {
    setSizes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], stock: Math.max(0, stock) };
      return updated;
    });
  };

  const addCustomSize = () => {
    const clean = newSizeName.trim().toUpperCase();
    if (!clean) return;
    if (sizes.some(s => s.size === clean)) {
      toast.error('Size already exists');
      return;
    }
    setSizes(prev => [...prev, { size: clean, stock: 5 }]);
    setNewSizeName('');
  };

  const removeSize = (sizeName: string) => {
    setSizes(prev => prev.filter(s => s.size !== sizeName));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `prod-${Date.now()}`;
  };

  const handleSave = async (andAddAnother = false) => {
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!fabric.trim()) {
      toast.error('Fabric description is required');
      return;
    }
    if (images.length === 0) {
      toast.error('Please upload at least 1 product image');
      return;
    }

    setSaving(true);
    try {
      const prodId = isEditing && id ? id : `prod_${Date.now()}`;
      const slug = isEditing && id ? generateSlug(name) : `${generateSlug(name)}-${Date.now().toString(36).substring(2, 6)}`;
      const colours = coloursInput
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const productPayload: Product = {
        id: prodId,
        name: name.trim(),
        name_hi: nameHi.trim() || undefined,
        name_gu: nameGu.trim() || undefined,
        slug,
        category,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        fabric: fabric.trim(),
        colours,
        description: description.trim() || `${name} in premium ${fabric}.`,
        description_hi: descriptionHi.trim() || undefined,
        description_gu: descriptionGu.trim() || undefined,
        sizes,
        images,
        isVisible,
        isFeatured,
        isNewArrival: true, // Automatically gets New Arrival tag
        createdAt: isEditing ? (await getProductById(id!))?.createdAt || new Date().toISOString() : new Date().toISOString(),
      };

      await saveProduct(productPayload);
      toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');

      if (andAddAnother) {
        setName('');
        setNameHi('');
        setNameGu('');
        setPrice('');
        setDiscountPrice('');
        setFabric('');
        setColoursInput('');
        setDescription('');
        setDescriptionHi('');
        setDescriptionGu('');
        setImages([]);
        navigate('/admin/products/new');
      } else {
        navigate('/admin/products');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = () => {
    setName(`${name} (Copy)`);
    navigate('/admin/products/new');
    toast.success('Product duplicated. You can now tweak and save it as a new product.');
  };

  const handleDelete = async () => {
    if (!id || !confirm(`Permanently delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      navigate('/admin/products');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7B1E3A]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 text-stone-600 hover:text-[#7B1E3A] rounded-xl hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif-brand text-2xl font-bold text-[#7B1E3A]">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-stone-500">
              New arrivals automatically receive the 'NEW' badge for 7 days.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <>
              <button
                type="button"
                onClick={handleDuplicate}
                className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                title="Duplicate Product"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            className="bg-[#FFF8F0] border-2 border-[#7B1E3A] text-[#7B1E3A] hover:bg-[#7B1E3A]/10 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            Save & Add Another
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Core Fields */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Basic Details */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A] border-b border-stone-100 pb-2">
              Product Information (English)
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Royal Bandhani Flared Anarkali Kurti"
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                >
                  <option value="Kurti">Kurti</option>
                  <option value="Co-ord">Co-ord</option>
                  <option value="Western">Western</option>
                  <option value="Dress">Dress</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 899"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3 text-xs md:text-sm font-bold text-[#7B1E3A] focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Strike-through Price (₹)
                </label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={e =>
                    setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="e.g. 1299"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Fabric Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={e => setFabric(e.target.value)}
                  placeholder="e.g. Pure Rayon Cotton with Gold Foil"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Available Colours (Comma separated)
                </label>
                <input
                  type="text"
                  value={coloursInput}
                  onChange={e => setColoursInput(e.target.value)}
                  placeholder="e.g. Maroon, Teal Blue, Olive"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Description (English)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details about cut, sleeves, neckline, and occasion wear..."
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>
          </div>

          {/* Optional Multilingual Translations (Hindi & Gujarati) */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <div>
              <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
                Multi-Language Fields (Optional)
              </h2>
              <p className="text-[11px] text-stone-500">
                If left empty, the site automatically uses English.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Name in Hindi (हिंदी नाम)
                </label>
                <input
                  type="text"
                  value={nameHi}
                  onChange={e => setNameHi(e.target.value)}
                  placeholder="उदा. रॉयल बांधनी अनारकली कुर्ती"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-serif-hi focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Name in Gujarati (ગુજરાતી નામ)
                </label>
                <input
                  type="text"
                  value={nameGu}
                  onChange={e => setNameGu(e.target.value)}
                  placeholder="દા.ત. રોયલ બાંધણી અનારકલી કુર્તી"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-serif-gu focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description in Hindi (हिंदी विवरण)
                </label>
                <textarea
                  rows={2}
                  value={descriptionHi}
                  onChange={e => setDescriptionHi(e.target.value)}
                  placeholder="हिंदी में उत्पाद की जानकारी..."
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description in Gujarati (ગુજરાતી વિગત)
                </label>
                <textarea
                  rows={2}
                  value={descriptionGu}
                  onChange={e => setDescriptionGu(e.target.value)}
                  placeholder="ગુજરાતીમાં પ્રોડક્ટની વિગતો..."
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>
            </div>
          </div>

          {/* Sizes & Stock Manager */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
                Sizes & Available Stock
              </h2>
              <span className="text-[11px] text-stone-500">Set 0 for sold out</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sizes.map((s, idx) => (
                <div
                  key={s.size}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200 relative group"
                >
                  <button
                    type="button"
                    onClick={() => removeSize(s.size)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Size"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <span className="block text-xs font-extrabold text-[#7B1E3A] mb-1">
                    Size: {s.size}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-500">Qty:</span>
                    <input
                      type="number"
                      min={0}
                      value={s.stock}
                      onChange={e => updateSizeStock(idx, Number(e.target.value))}
                      className="w-16 bg-white border border-stone-300 rounded-lg py-1 px-2 text-xs font-bold text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Size */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newSizeName}
                onChange={e => setNewSizeName(e.target.value)}
                placeholder="Custom size (e.g. 3XL, Free)"
                className="bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-1.5 px-3 text-xs w-48"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="bg-[#7B1E3A] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Size</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Images & Toggles */}
        <div className="space-y-6">
          
          {/* Images Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
                Product Photos ({images.length}/5)
              </h2>
            </div>

            {/* Upload Area */}
            {images.length < 5 && (
              <label className="border-2 border-dashed border-[#C9A24B] hover:border-[#7B1E3A] bg-[#FFF8F0]/50 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-6 h-6 text-[#7B1E3A] mb-1.5" />
                <span className="text-xs font-bold text-stone-800">
                  {uploadingImage ? 'Compressing...' : 'Add Photos (Max 5)'}
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5">
                  Pick from camera/gallery • Auto-compressed
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}

            {/* Image Preview List with reordering & deletion */}
            <div className="space-y-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <img
                    src={img}
                    alt={`Image ${idx + 1}`}
                    className="w-14 aspect-[3/4] object-cover rounded-xl bg-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-stone-700 block">
                      {idx === 0 ? 'Primary Cover Photo' : `Gallery Image ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white border text-stone-500 hover:text-[#7B1E3A] disabled:opacity-30"
                        title="Move Up/Left"
                      >
                        <MoveLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'right')}
                        disabled={idx === images.length - 1}
                        className="p-1 rounded bg-white border text-stone-500 hover:text-[#7B1E3A] disabled:opacity-30"
                        title="Move Down/Right"
                      >
                        <MoveRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 rounded bg-white border text-red-500 hover:bg-red-50 ml-auto"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility & Badges Toggles */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A] border-b border-stone-100 pb-2">
              Visibility & Badges
            </h2>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  Show on Website
                </span>
                <span className="text-[10px] text-stone-500">
                  Customers can see and purchase this
                </span>
              </div>
              <input
                type="checkbox"
                checked={isVisible}
                onChange={e => setIsVisible(e.target.checked)}
                className="w-5 h-5 accent-[#7B1E3A] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none pt-2 border-t border-stone-100">
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  Featured Bestseller
                </span>
                <span className="text-[10px] text-stone-500">
                  Highlights on Home page featured section
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-5 h-5 accent-[#7B1E3A] rounded cursor-pointer"
              />
            </label>
          </div>

        </div>
      </div>

    </div>
  );
};
