import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Plus, Camera, Upload, Trash2, Printer, 
  Search, Eye, Check, AlertCircle, Edit, Star, Sparkles, 
  HelpCircle, ArrowUpDown, Tag, DollarSign, Package, X 
} from 'lucide-react';
import { Product, Brand, Category, ProductAttribute } from '../../types';
import { apiRequest } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import { useHelp } from '../../context/HelpContext';

export const AdminCatalogueStudioPage: React.FC = () => {
  const { settings } = useSettings();
  const { isHelpMode } = useHelp();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Print Mode Modal
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Quick Photo Upload Modal
  const [photoModalProduct, setPhotoModalProduct] = useState<Product | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Create / Edit Bicycle Modal with direct photo capture
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brandId, setBrandId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [mrp, setMrp] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(5);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('IN_STOCK');
  const [description, setDescription] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('1 Year Frame Warranty');
  const [dynamicValues, setDynamicValues] = useState<Record<number, any>>({});
  
  // Staged photos for creation
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedPreviews, setStagedPreviews] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, brandsRes, catsRes, attrsRes] = await Promise.all([
        apiRequest<{ items: Product[] }>('/admin/products?page_size=100'),
        apiRequest<Brand[]>('/admin/brands'),
        apiRequest<Category[]>('/admin/categories'),
        apiRequest<ProductAttribute[]>('/admin/attributes'),
      ]);
      setProducts(prodsRes.items || []);
      setBrands(brandsRes || []);
      setCategories(catsRes || []);
      setAttributes(attrsRes || []);
      if (brandsRes.length > 0 && !brandId) setBrandId(brandsRes[0].id);
      if (catsRes.length > 0 && !categoryId) setCategoryId(catsRes[0].id);
    } catch (err: any) {
      console.error('Failed to load catalogue studio', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Stock Adjust (+1 or -1)
  const adjustStock = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.stock_quantity + delta);
    try {
      await apiRequest(`/admin/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: product.name,
          sku: product.sku,
          brand_id: product.brand_id,
          category_id: product.category_id,
          selling_price: product.selling_price,
          mrp: product.mrp,
          stock_quantity: newQty,
          availability_status: newQty > 0 ? (newQty <= 2 ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
          description: product.description,
          warranty_info: product.warranty_info,
          is_published: product.is_published,
        }),
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_quantity: newQty } : p));
      setFeedbackMsg(`Stock updated for ${product.name}: ${newQty} in store.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      alert('Failed to update stock.');
    }
  };

  // Upload Photo to existing bicycle
  const handlePhotoUpload = async (file: File) => {
    if (!photoModalProduct) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_primary', 'true');
      formData.append('alt_text', `${photoModalProduct.name} photograph`);

      const token = localStorage.getItem('bajaj_admin_token');
      const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/products/${photoModalProduct.id}/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const updated = await apiRequest<Product>(`/admin/products/${photoModalProduct.id}`);
      setPhotoModalProduct(updated);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setFeedbackMsg('New bicycle photograph uploaded and set as primary!');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error uploading photograph.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Open Create Bicycle Modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`BE-${Date.now().toString().slice(-5)}`);
    setBrandId(brands[0]?.id || 1);
    setCategoryId(categories[0]?.id || 1);
    setSellingPrice('');
    setMrp('');
    setStockQuantity(5);
    setAvailabilityStatus('IN_STOCK');
    setDescription('');
    setWarrantyInfo('1 Year Frame Warranty');
    setDynamicValues({});
    setStagedFiles([]);
    setStagedPreviews([]);
    setEditModalOpen(true);
  };

  // Open Edit Bicycle Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBrandId(p.brand_id);
    setCategoryId(p.category_id);
    setSellingPrice(p.selling_price ? String(p.selling_price) : '');
    setMrp(p.mrp ? String(p.mrp) : '');
    setStockQuantity(p.stock_quantity);
    setAvailabilityStatus(p.availability_status);
    setDescription(p.description || '');
    setWarrantyInfo(p.warranty_info || '');
    
    const attrMap: Record<number, any> = {};
    p.attributes?.forEach((val) => {
      attrMap[val.attribute_id] = val.value;
    });
    setDynamicValues(attrMap);
    setStagedFiles([]);
    setStagedPreviews([]);
    setEditModalOpen(true);
  };

  // Handle file staging in create modal
  const handleStageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArr = Array.from(e.target.files);
    setStagedFiles(prev => [...prev, ...filesArr]);
    
    filesArr.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setStagedPreviews(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit Create or Edit Bicycle
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a bicycle name.');
      return;
    }
    setSaving(true);

    try {
      const payload: any = {
        name,
        sku,
        brand_id: Number(brandId),
        category_id: Number(categoryId),
        selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
        mrp: mrp ? parseFloat(mrp) : null,
        stock_quantity: Number(stockQuantity),
        availability_status: availabilityStatus,
        description,
        warranty_info: warrantyInfo,
        delivery_info: 'Store pickup at Bajaj Enterprises, Kote Gate, Bikaner.',
        is_published: true,
        is_featured: false,
        is_new_arrival: true,
        attributes: Object.entries(dynamicValues)
          .filter(([_, val]) => val !== '' && val !== null && val !== undefined)
          .map(([attrId, val]) => ({
            attribute_id: Number(attrId),
            value: String(val),
          })),
      };

      let savedProduct: Product;
      if (editingProduct) {
        savedProduct = await apiRequest<Product>(`/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        savedProduct = await apiRequest<Product>('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      // If files were staged, upload them to the saved bicycle now!
      if (stagedFiles.length > 0) {
        const token = localStorage.getItem('bajaj_admin_token');
        for (let i = 0; i < stagedFiles.length; i++) {
          const file = stagedFiles[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('is_primary', i === 0 ? 'true' : 'false');
          formData.append('alt_text', `${name} photo ${i + 1}`);

          await fetch(`http://127.0.0.1:8000/api/v1/admin/products/${savedProduct.id}/images`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        }
      }

      setEditModalOpen(false);
      await loadData();
      setFeedbackMsg(`Bicycle "${name}" saved to catalogue with photos!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error saving bicycle.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter ? p.brand?.slug === brandFilter : true;
    const matchesCat = categoryFilter ? p.category?.slug === categoryFilter : true;
    return matchesSearch && matchesBrand && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>Product Catalogue Studio (सचित्र साइकिल कैटलॉग)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture product-wise details with photographs, manage showroom prices & stock, and generate print-ready catalogues.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print / PDF Catalogue (कैटलॉग प्रिंट करें)</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                setFeedbackMsg('Loading demo bicycles into catalogue...');
                await apiRequest('/admin/demo-data/seed', { method: 'POST' });
                await loadData();
                setFeedbackMsg('Success: 5 sample bicycles with photos and specs loaded to Catalogue Studio!');
                setTimeout(() => setFeedbackMsg(null), 4000);
              } catch (err: any) {
                alert(err.message || 'Failed to seed demo data.');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Load Sample Bicycles (डेमो साइकिलें)</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bicycle with Photos (नई साइकिल जोड़ें)</span>
          </button>
        </div>
      </div>

      {/* Non-Tech Help Box */}
      {isHelpMode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">
              💡 Catalogue Studio Help (सरल सहायता):
            </strong>
            <p>
              यह सेक्शन विशेष रूप से साइकिलों की फोटो और विवरण एक साथ देखने और प्रबंधित करने के लिए बनाया गया है।
              हर साइकिल कार्ड पर दिए गए <strong>"📸 Change/Add Photo"</strong> बटन से आप अपने मोबाइल या कंप्यूटर से साइकिल की फोटो तुरंत अपलोड कर सकते हैं।
              साथ ही <strong>"Print / PDF Catalogue"</strong> से आप ग्राहकों को व्हाट्सएप पर भेजने या दुकान में दिखाने के लिए सुंदर कैटलॉग निकाल सकते हैं!
            </p>
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search & Taxonomy Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bicycle name, model or SKU / साइकिल खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Brands (सभी ब्रांड्स)</option>
          {brands.map(b => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Categories (सभी श्रेणियां)</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <span className="text-xs font-bold text-slate-500 self-center px-2">
          {filteredProducts.length} Bicycles in Catalogue
        </span>
      </div>

      {/* Product-Wise Visual Catalogue Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Loading catalogue studio...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No Bicycles Match Your Filter</h3>
          <p className="text-xs text-slate-500">Try clearing filters, load sample bicycles, or add a new bicycle with photographs.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              Add New Bicycle Now
            </button>
            <button
              onClick={async () => {
                try {
                  setFeedbackMsg('Loading demo bicycles into catalogue...');
                  await apiRequest('/admin/demo-data/seed', { method: 'POST' });
                  await loadData();
                  setFeedbackMsg('Success: 5 sample bicycles with photos and specs loaded to Catalogue Studio!');
                  setTimeout(() => setFeedbackMsg(null), 4000);
                } catch (err: any) {
                  alert(err.message || 'Failed to seed demo data.');
                }
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load 5 Sample Bicycles with Photos (चित्र सहित 5 डेमो साइकिलें लोड करें)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const primaryImg = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;
            
            // Extract key dynamic specs
            const wheelSize = product.attributes?.find(a => a.attribute_key === 'wheel_size')?.value;
            const gearCount = product.attributes?.find(a => a.attribute_key === 'gear_count')?.value;
            const frameMat = product.attributes?.find(a => a.attribute_key === 'frame_material')?.value;
            const brakeType = product.attributes?.find(a => a.attribute_key === 'brake_type')?.value;

            return (
              <div 
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container with Badges & Quick Photo Button */}
                  <div className="relative aspect-[4/3] bg-slate-50 border-b border-slate-100 flex items-center justify-center p-4">
                    {primaryImg ? (
                      <img 
                        src={primaryImg} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300" 
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <Camera className="w-10 h-10 text-slate-300 mx-auto" />
                        <span className="text-[11px] text-slate-400 block font-medium">No Photograph Attached</span>
                      </div>
                    )}

                    {/* Brand Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                      {product.brand?.name || 'Brand'}
                    </span>

                    {/* Stock Status Badge */}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      product.stock_quantity > 0 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in Stock` : 'Out of Stock'}
                    </span>

                    {/* Photo Action Overlay Button */}
                    <button
                      type="button"
                      onClick={() => setPhotoModalProduct(product)}
                      className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-black/75 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-sm transition shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{primaryImg ? 'Change / Add Photos' : 'Upload Photograph'}</span>
                    </button>

                    {/* Demo Flag Badge */}
                    {product.is_demo && (
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-amber-500 text-white rounded-md text-[9px] font-bold">
                        Demo Record
                      </span>
                    )}
                  </div>

                  {/* Bicycle Details Card Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {product.category?.name || 'Category'} • SKU: {product.sku}
                      </span>
                      <h3 className="font-black text-slate-900 text-base leading-snug mt-0.5">
                        {product.name}
                      </h3>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 pt-1 border-t border-slate-100">
                      {product.selling_price ? (
                        <>
                          <span className="text-lg font-black text-slate-900">
                            ₹{product.selling_price.toLocaleString('en-IN')}
                          </span>
                          {product.mrp && product.mrp > product.selling_price && (
                            <>
                              <span className="text-xs text-slate-400 line-through">
                                MRP ₹{product.mrp.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          Contact Showroom for Price
                        </span>
                      )}
                    </div>

                    {/* Key Specifications Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {wheelSize && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                          Wheel: {wheelSize}
                        </span>
                      )}
                      {gearCount && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold">
                          Gears: {gearCount}
                        </span>
                      )}
                      {frameMat && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-semibold">
                          Frame: {frameMat}
                        </span>
                      )}
                      {brakeType && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-semibold">
                          Brakes: {brakeType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Quick Controls */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Quick Stock Controls */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold">Showroom Stock:</span>
                    <button
                      type="button"
                      onClick={() => adjustStock(product, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center transition"
                      title="Decrease stock by 1"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-800 px-1 text-xs">
                      {product.stock_quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustStock(product, +1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center transition"
                      title="Increase stock by 1"
                    >
                      +
                    </button>
                  </div>

                  {/* Edit Bicycle Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-xl font-bold text-[11px] transition"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK PHOTO UPLOAD MODAL */}
      {photoModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setPhotoModalProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              <span>Photograph Manager: {photoModalProduct.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Upload side-angle bicycle photographs. Supports JPG, PNG, WEBP from your phone or computer.
            </p>

            {/* Direct Upload Box */}
            <label className="block p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl text-center cursor-pointer bg-slate-50 transition group">
              <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-slate-800 block">
                {uploadingPhoto ? 'Uploading photograph...' : 'Click to Select / Take Bicycle Photo'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Will automatically become the primary picture in the customer catalogue
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingPhoto}
                onChange={(e) => {
                  if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>

            {/* Existing Images Gallery */}
            <div className="mt-6 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Current Photographs:</span>
              <div className="grid grid-cols-3 gap-3">
                {photoModalProduct.images?.map((img) => (
                  <div key={img.id} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-1 group">
                    <img src={img.image_url} alt="" className="w-full h-full object-contain" />
                    {img.is_primary ? (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[8px] font-bold">
                        Primary
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          await apiRequest(`/admin/products/${photoModalProduct.id}/images/${img.id}/primary`, { method: 'PATCH' });
                          const updated = await apiRequest<Product>(`/admin/products/${photoModalProduct.id}`);
                          setPhotoModalProduct(updated);
                          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                        }}
                        className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[8px] hover:bg-emerald-600"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await apiRequest(`/admin/products/${photoModalProduct.id}/images/${img.id}`, { method: 'DELETE' });
                        const updated = await apiRequest<Product>(`/admin/products/${photoModalProduct.id}`);
                        setPhotoModalProduct(updated);
                        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BICYCLE MODAL (WITH DIRECT PHOTO STAGING) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              {editingProduct ? `Edit Bicycle: ${editingProduct.name}` : 'Add New Bicycle to Catalogue'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter bicycle specifications, showroom selling price, and attach photographs.
            </p>

            <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs">
              {/* Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Bicycle Name / साइकिल का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AVON City Commuter 26T"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    SKU / Model Code (मॉडल कोड) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Brand / ब्रांड (AVON, HERCULES आदि) *
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Category / श्रेणी (City, Geared आदि) *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Selling Price / बिक्री कीमत (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5499"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    MRP / अधिकतम खुदरा मूल्य (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5999"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Showroom Stock / उपलब्ध संख्या
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Specifications */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">
                  Bicycle Technical Specifications (साइकिल की विशेषताएं)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attributes.map((attr) => {
                    const currentVal = dynamicValues[attr.id] || '';
                    return (
                      <div key={attr.id} className="space-y-1">
                        <label className="block font-semibold text-slate-700 text-[11px]">
                          {attr.name} {attr.unit ? `(${attr.unit})` : ''}
                        </label>
                        {attr.field_type === 'dropdown' && attr.options_json ? (
                          <select
                            value={currentVal}
                            onChange={(e) => setDynamicValues({ ...dynamicValues, [attr.id]: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                          >
                            <option value="">Select {attr.name}...</option>
                            {attr.options_json.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={currentVal}
                            onChange={(e) => setDynamicValues({ ...dynamicValues, [attr.id]: e.target.value })}
                            placeholder={`Enter ${attr.name}...`}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photos Staging Box (Attach Photos Right In The Form!) */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Attach Photographs for Catalogue (साइकिल की फोटो जोड़ें)</span>
                </span>
                
                <label className="block p-4 border border-dashed border-emerald-300 rounded-xl text-center cursor-pointer bg-white hover:bg-emerald-50 transition">
                  <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[11px] font-bold text-emerald-800 block">
                    Click to select one or multiple photos from phone/computer
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleStageFiles}
                    className="hidden"
                  />
                </label>

                {/* Previews of Staged Photos */}
                {stagedPreviews.length > 0 && (
                  <div className="flex gap-2 pt-2 overflow-x-auto">
                    {stagedPreviews.map((prev, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-200 flex-shrink-0 bg-white">
                        <img src={prev} alt="" className="w-full h-full object-contain" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] text-center font-bold">
                            Main Photo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Description / मुख्य विवरण
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comfortable commuter cycle with durable frame..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <span>{saving ? 'Saving...' : 'Save to Catalogue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT-READY CATALOGUE MODAL / PDF VIEW */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 max-h-[92vh] overflow-y-auto shadow-2xl relative print:p-0 print:shadow-none">
            {/* Header Controls (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Customer Catalogue & Price List (प्रिंट या PDF प्रारूप)
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to print or save as PDF to send to customers on WhatsApp.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF (प्रिंट करें)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE CATALOGUE DOCUMENT */}
            <div className="space-y-6">
              {/* Showroom Letterhead */}
              <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {settings.store_name || 'BAJAJ ENTERPRISES'}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {settings.store_address || 'Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India'}
                  </p>
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    Authorised Retail Dealership: AVON, HERCULES & Leading Brands
                  </p>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span className="block font-bold text-slate-900">
                    Phone / WhatsApp: {settings.store_whatsapp || settings.store_phone || '+91 98290 XXXXX'}
                  </span>
                  <span className="block">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="block text-emerald-600 font-bold">Official Bicycle Catalogue</span>
                </div>
              </div>

              {/* 2-Column Catalogue Grid */}
              <div className="grid grid-cols-2 gap-4">
                {products.map((item) => {
                  const img = item.images?.find(i => i.is_primary)?.image_url || item.images?.[0]?.image_url;
                  const wheel = item.attributes?.find(a => a.attribute_key === 'wheel_size')?.value;
                  const gears = item.attributes?.find(a => a.attribute_key === 'gear_count')?.value;
                  const brakes = item.attributes?.find(a => a.attribute_key === 'brake_type')?.value;

                  return (
                    <div 
                      key={item.id}
                      className="border border-slate-200 rounded-2xl p-3.5 flex gap-3.5 bg-slate-50/50 break-inside-avoid"
                    >
                      {/* Photo */}
                      <div className="w-28 h-28 bg-white rounded-xl border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center">
                        {img ? (
                          <img src={img} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Camera className="w-8 h-8 text-slate-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                          {item.brand?.name} • {item.category?.name}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block">
                          SKU: {item.sku}
                        </span>

                        {/* Price */}
                        <div className="pt-1 flex items-baseline gap-2">
                          <span className="font-black text-slate-900 text-sm">
                            {item.selling_price ? `₹${item.selling_price.toLocaleString('en-IN')}` : 'On Enquiry'}
                          </span>
                          {item.mrp && item.selling_price && item.mrp > item.selling_price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              MRP ₹{item.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Key Specs */}
                        <div className="text-[10px] text-slate-600 space-y-0.5 pt-0.5">
                          {wheel && <div>• Wheel Size: <strong>{wheel}</strong></div>}
                          {gears && <div>• Gears: <strong>{gears}</strong></div>}
                          {brakes && <div>• Brakes: <strong>{brakes}</strong></div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Showroom Footer Note */}
              <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  Visit our Bikaner showroom on Alakh Sagar Road, Kote Gate for test rides, fitting and instant pickup!
                </p>
                <p className="text-[10px]">
                  All bicycles come fully assembled and precision-tuned with manufacturer warranty support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
