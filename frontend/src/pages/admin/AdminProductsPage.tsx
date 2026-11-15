import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Bike, Plus, Edit, Copy, Trash2, Search, 
  Check, X, Upload, Star, Eye, Image as ImageIcon, AlertCircle,
  FileText, Sparkles
} from 'lucide-react';
import { Product, Brand, Category, ProductAttribute } from '../../types';
import { apiRequest } from '../../utils/api';
import { compressImageForMobile } from '../../utils/imageUtils';
import { parseGoogleFormResponseText } from '../../utils/googleFormParser';
import { LayoutGrid, Grid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminProductsPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal / Drawer state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageModalProduct, setImageModalProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    return (localStorage.getItem('bajaj_products_view_mode') as any) || 'table';
  });
  const [gridCols, setGridCols] = useState<number>(() => {
    return Number(localStorage.getItem('bajaj_products_grid_cols')) || 3;
  });

  // Unified Specification Boxes (Editable labels, values, deletable, addable, columns)
  interface SpecBoxItem {
    id: string;
    label: string;
    value: string;
    options?: string[];
    attribute_id?: number;
  }
  const [specBoxes, setSpecBoxes] = useState<SpecBoxItem[]>([]);
  const [formCols, setFormCols] = useState<number>(2);

  // Google Form Response Import Modal State
  const [googleFormModalOpen, setGoogleFormModalOpen] = useState(false);
  const [googleFormRawText, setGoogleFormRawText] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [brandId, setBrandId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [mrp, setMrp] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(5);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('IN_STOCK');
  const [description, setDescription] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  // Dynamic attributes values state: map of attribute_id -> value
  const [dynamicValues, setDynamicValues] = useState<Record<number, any>>({});

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Specification Box Handlers (Rename, Update, Delete, Add, Deduplicate)
  const handleRenameSpecLabel = (id: string, newLabel: string) => {
    setSpecBoxes(prev => prev.map(b => b.id === id ? { ...b, label: newLabel } : b));
  };

  const handleUpdateSpecValue = (id: string, newVal: string) => {
    setSpecBoxes(prev => prev.map(b => b.id === id ? { ...b, value: newVal } : b));
  };

  const handleDeleteSpecBox = (id: string) => {
    setSpecBoxes(prev => prev.filter(b => b.id !== id));
  };

  const handleAddSpecBox = () => {
    setSpecBoxes(prev => [
      ...prev,
      {
        id: `spec-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
        label: 'New Specification',
        value: '',
      }
    ]);
  };

  const handleCleanDuplicates = () => {
    const seen = new Set<string>();
    setSpecBoxes(prev => prev.filter(b => {
      const k = b.label.toLowerCase().trim();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }));
    setSuccessMsg('Duplicate specification boxes cleaned!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Google Form Response Ingestion Handler
  const handleApplyGoogleForm = () => {
    const parsed = parseGoogleFormResponseText(googleFormRawText);
    if (!parsed) {
      alert('Could not detect bicycle details from pasted text. Please paste valid form text.');
      return;
    }
    if (parsed.name) setName(parsed.name);
    if (parsed.sellingPrice) setSellingPrice(parsed.sellingPrice);
    if (parsed.mrp) setMrp(parsed.mrp);
    if (parsed.stockQuantity) setStockQuantity(parsed.stockQuantity);
    if (parsed.warrantyInfo) setWarrantyInfo(parsed.warrantyInfo);
    if (parsed.description) setDescription(parsed.description);

    if (parsed.brandName && brands.length > 0) {
      const bMatch = brands.find(b => b.name.toLowerCase().includes(parsed.brandName!.toLowerCase()));
      if (bMatch) setBrandId(bMatch.id);
    }
    if (parsed.categoryName && categories.length > 0) {
      const cMatch = categories.find(c => c.name.toLowerCase().includes(parsed.categoryName!.toLowerCase()));
      if (cMatch) setCategoryId(cMatch.id);
    }

    if (parsed.specBoxes.length > 0) {
      const newBoxes: SpecBoxItem[] = parsed.specBoxes.map((sb, idx) => ({
        id: `gf-spec-${idx}-${Date.now()}`,
        label: sb.label,
        value: sb.value
      }));
      setSpecBoxes(prev => {
        const merged = [...prev];
        newBoxes.forEach(nb => {
          const existingIdx = merged.findIndex(m => m.label.toLowerCase() === nb.label.toLowerCase());
          if (existingIdx >= 0) {
            merged[existingIdx].value = nb.value;
          } else {
            merged.push(nb);
          }
        });
        return merged;
      });
    }

    setGoogleFormModalOpen(false);
    setGoogleFormRawText('');
    setSuccessMsg('Bicycle details populated from Google Form response!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

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
      const uniqueAttrs: ProductAttribute[] = [];
      const seenAttrNames = new Set<string>();
      (attrsRes || []).forEach(a => {
        const norm = (a.name || '').trim().toLowerCase();
        if (norm && !seenAttrNames.has(norm)) {
          seenAttrNames.add(norm);
          uniqueAttrs.push(a);
        }
      });
      setAttributes(uniqueAttrs);
      if (brandsRes.length > 0 && !brandId) setBrandId(brandsRes[0].id);
      if (catsRes.length > 0 && !categoryId) setCategoryId(catsRes[0].id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`BE-${Date.now().toString().slice(-6)}`);
    setModelNumber('');
    setBrandId(brands[0]?.id || 1);
    setCategoryId(categories[0]?.id || 1);
    setSellingPrice('');
    setMrp('');
    setStockQuantity(5);
    setAvailabilityStatus('IN_STOCK');
    setDescription('');
    setWarrantyInfo('1 Year Frame Warranty');
    setDeliveryInfo('Store pickup at Bajaj Enterprises showroom in Bikaner.');
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsPublished(true);
    setDynamicValues({});
    
    // Initialize deduplicated specification boxes
    const initialBoxes: SpecBoxItem[] = [];
    const seen = new Set<string>();
    if (attributes && attributes.length > 0) {
      attributes.forEach(a => {
        const norm = a.name.toLowerCase().trim();
        if (!seen.has(norm)) {
          seen.add(norm);
          initialBoxes.push({
            id: `attr-${a.id}`,
            label: a.name,
            value: a.options_json && a.options_json.length > 0 ? a.options_json[0] : '',
            options: a.options_json || undefined,
            attribute_id: a.id,
          });
        }
      });
    }
    if (initialBoxes.length === 0) {
      initialBoxes.push(
        { id: 'sb-1', label: 'Wheel Size', value: '26 inches', options: ['20 inches', '24 inches', '26 inches', '27.5 inches', '29 inches', '700C'] },
        { id: 'sb-2', label: 'Gear Count', value: 'Single Speed', options: ['Single Speed', '7 Speed', '18 Speed', '21 Speed', '24 Speed'] },
        { id: 'sb-3', label: 'Brake Type', value: 'V-Brakes', options: ['V-Brakes', 'Mechanical Disc Brakes', 'Hydraulic Disc Brakes', 'Caliper Brakes'] },
        { id: 'sb-4', label: 'Frame Material', value: 'Steel', options: ['Steel', 'Alloy (Aluminium 6061)', 'Carbon Fibre'] },
        { id: 'sb-5', label: 'Frame Size', value: '18 inch', options: ['16 inch', '18 inch', '20 inch'] }
      );
    }
    setSpecBoxes(initialBoxes);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setModelNumber(p.model_number || '');
    setBrandId(p.brand_id);
    setCategoryId(p.category_id);
    setSellingPrice(p.selling_price ? p.selling_price.toString() : '');
    setMrp(p.mrp ? p.mrp.toString() : '');
    setStockQuantity(p.stock_quantity);
    setAvailabilityStatus(p.availability_status);
    setDescription(p.description || '');
    setWarrantyInfo(p.warranty_info || '');
    setDeliveryInfo(p.delivery_info || '');
    setIsFeatured(p.is_featured);
    setIsNewArrival(p.is_new_arrival);
    setIsPublished(p.is_published);

    const valMap: Record<number, any> = {};
    p.attributes?.forEach(a => {
      valMap[a.attribute_id] = a.value;
    });
    setDynamicValues(valMap);

    // Populate deduplicated specification boxes
    const loadedBoxes: SpecBoxItem[] = [];
    const seenLabels = new Set<string>();

    if (p.attributes && p.attributes.length > 0) {
      p.attributes.forEach((pa, idx) => {
        const rawLabel = (pa.attribute_name || pa.attribute_key || (pa as any).name || 'Specification').trim();
        const norm = rawLabel.toLowerCase();
        if (seenLabels.has(norm)) return;
        seenLabels.add(norm);

        const matchedGlobal = attributes.find(a =>
          a.id === pa.attribute_id ||
          a.name.toLowerCase() === norm ||
          a.key.toLowerCase() === (pa.attribute_key || '').toLowerCase()
        );

        loadedBoxes.push({
          id: `spec-${idx}-${Date.now()}`,
          label: rawLabel,
          value: String(pa.value || ''),
          options: matchedGlobal?.options_json || undefined,
          attribute_id: pa.attribute_id,
        });
      });
    }

    if (loadedBoxes.length === 0) {
      attributes.forEach(a => {
        const norm = a.name.toLowerCase().trim();
        if (!seenLabels.has(norm)) {
          seenLabels.add(norm);
          loadedBoxes.push({
            id: `attr-${a.id}`,
            label: a.name,
            value: '',
            options: a.options_json || undefined,
            attribute_id: a.id,
          });
        }
      });
    }

    setSpecBoxes(loadedBoxes);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      setErrorMsg('Product name and SKU are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const attrInputs = specBoxes
      .filter(b => b.label.trim())
      .map(b => ({
        attribute_id: b.attribute_id,
        name: b.label.trim(),
        value: b.value.trim(),
      }));

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      model_number: modelNumber.trim() || undefined,
      brand_id: Number(brandId),
      category_id: Number(categoryId),
      selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
      mrp: mrp ? parseFloat(mrp) : null,
      stock_quantity: Number(stockQuantity),
      availability_status: availabilityStatus,
      description: description.trim() || undefined,
      warranty_info: warrantyInfo.trim() || undefined,
      delivery_info: deliveryInfo.trim() || undefined,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      is_published: isPublished,
      attributes: attrInputs,
    };

    try {
      if (editingProduct) {
        await apiRequest(`/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Bicycle "${name}" updated successfully.`);
      } else {
        await apiRequest('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Bicycle "${name}" created successfully.`);
      }
      setModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (p: Product) => {
    try {
      await apiRequest(`/admin/products/${p.id}/duplicate`, { method: 'POST' });
      loadData();
      setSuccessMsg(`Duplicated "${p.name}". Draft saved.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Duplicate failed.');
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to archive bicycle "${p.name}"?`)) return;
    try {
      await apiRequest(`/admin/products/${p.id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed.');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!imageModalProduct) return;
    try {
      const compressed = await compressImageForMobile(file);
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('is_primary', 'false');

      await apiRequest(`/admin/products/${imageModalProduct.id}/images`, {
        method: 'POST',
        body: formData,
      });
      // refresh current product images
      const updated = await apiRequest<Product>(`/admin/products/${imageModalProduct.id}`);
      setImageModalProduct(updated);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Image upload failed.');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (brandFilter && p.brand_id !== Number(brandFilter)) return false;
    if (categoryFilter && p.category_id !== Number(categoryFilter)) return false;
    return true;
  });

  if (authLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Verifying admin authorization...
      </div>
    );
  }

  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Catalogue Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Bicycles & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, duplicate, publish, and manage specifications for bicycles in Bajaj Enterprises catalogue.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bicycle</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by bicycle name, model number, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="w-full md:w-44 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Column & View Layout Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto">
          <button
            type="button"
            onClick={() => {
              setViewMode('table');
              localStorage.setItem('bajaj_products_view_mode', 'table');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('grid');
              localStorage.setItem('bajaj_products_view_mode', 'grid');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Grid
          </button>
          {viewMode === 'grid' && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setGridCols(num);
                    localStorage.setItem('bajaj_products_grid_cols', String(num));
                  }}
                  className={`w-6 h-6 rounded-md text-[11px] font-black transition flex items-center justify-center ${gridCols === num ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table & Grid Views */}
      {viewMode === 'grid' ? (
        <div className={
          gridCols === 1 ? 'grid grid-cols-1 gap-4' :
          gridCols === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' :
          gridCols === 4 ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' :
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        }>
          {filteredProducts.map((p) => {
            const primaryImage = p.images?.[0]?.image_url || '/uploads/demo_avon_city_001.svg';
            return (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                    <img src={primaryImage} alt={p.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block text-xs truncate">{p.name}</span>
                    <span className="text-[11px] text-slate-400 block">{p.brand?.name || 'Brand'} • {p.sku}</span>
                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">₹{p.selling_price?.toLocaleString('en-IN') || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-500">Stock: {p.stock_quantity}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setImageModalProduct(p)}
                      title="Manage Images"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit Bicycle"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      title="Delete Bicycle"
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Bicycle</th>
                <th className="py-3.5 px-4">SKU / Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / MRP</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const primaryImage = p.images?.[0]?.image_url || '/uploads/demo_avon_city_001.svg';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                          <img src={primaryImage} alt={p.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          {p.is_demo && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                              Demo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600 block">{p.sku}</span>
                      <span className="font-bold text-emerald-700 text-[10px]">{p.brand?.name}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {p.category?.name}
                    </td>

                    <td className="py-3.5 px-4">
                      {p.selling_price ? (
                        <div>
                          <span className="font-black text-slate-900">₹{p.selling_price.toLocaleString('en-IN')}</span>
                          {p.mrp && <span className="text-slate-400 text-[10px] block line-through">MRP: ₹{p.mrp.toLocaleString('en-IN')}</span>}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">On enquiry</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        p.stock_quantity <= 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.stock_quantity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setImageModalProduct(p)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Manage Images"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Duplicate as Draft"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                        title="Archive Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Create / Edit Bicycle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pr-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  {editingProduct ? 'Edit Bicycle Details' : 'Add New Bicycle to Catalogue'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure product details, stock, pricing, and dynamic specifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGoogleFormModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition shadow-sm self-start sm:self-auto"
                title="Fetch & populate bicycle details from Google Form or Google Sheet response"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import from Google Form</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bicycle Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AVON City Commuter Pro 26"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU / Model Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AVON-CTY-26"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand *</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Leave empty for 'On enquiry'"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="MRP (for discount display)"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Availability Tag</label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="ON_ENQUIRY">On Enquiry</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Specifications Boxes (Fully Editable Labels, Values, Addable & Deletable) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="font-black text-slate-900 text-xs uppercase tracking-wide block">
                      Bicycle Technical Specifications (साइकिल की विशेषताएं)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Rename labels directly, delete any box, or add custom boxes.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Columns layout toggle */}
                    <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                      <span className="px-1.5 text-slate-400">Cols:</span>
                      <button
                        type="button"
                        onClick={() => setFormCols(1)}
                        className={`px-2 py-0.5 rounded ${formCols === 1 ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        1
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormCols(2)}
                        className={`px-2 py-0.5 rounded ${formCols === 2 ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        2
                      </button>
                    </div>

                    {/* Clean duplicate boxes */}
                    <button
                      type="button"
                      onClick={handleCleanDuplicates}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition"
                      title="Remove duplicate specification boxes"
                    >
                      Clean Duplicates
                    </button>

                    {/* Add new box */}
                    <button
                      type="button"
                      onClick={handleAddSpecBox}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Box</span>
                    </button>
                  </div>
                </div>

                {specBoxes.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl bg-white text-slate-400 text-xs">
                    No specification boxes configured. Click <strong>+ Add Box</strong> to add technical specifications.
                  </div>
                ) : (
                  <div className={formCols === 1 ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
                    {specBoxes.map((box) => (
                      <div key={box.id} className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-sm space-y-1.5 hover:border-emerald-500/50 transition">
                        {/* Editable Label & Delete Box Icon */}
                        <div className="flex items-center justify-between gap-1.5">
                          <input
                            type="text"
                            value={box.label}
                            onChange={(e) => handleRenameSpecLabel(box.id, e.target.value)}
                            placeholder="Label (e.g. Frame Size, Battery, Weight)"
                            className="text-[11px] font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white px-2 py-1 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none flex-1 truncate"
                            title="Click to rename this label"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteSpecBox(box.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                            title="Delete this specification box"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Value Input Box (Dropdown if options exist, otherwise text) */}
                        {box.options && box.options.length > 0 ? (
                          <select
                            value={box.value}
                            onChange={(e) => handleUpdateSpecValue(box.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-emerald-500 focus:outline-none text-slate-800"
                          >
                            <option value="">Select {box.label}...</option>
                            {box.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={box.value}
                            onChange={(e) => handleUpdateSpecValue(box.id, e.target.value)}
                            placeholder={`Enter ${box.label}...`}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-800"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Features</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">Published to Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">Mark as New Arrival</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <span>{saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Form / Google Sheet Response Import Modal */}
      {googleFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setGoogleFormModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-900">
                Import from Google Form Response
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Paste the submitted Google Form responses, Google Sheet row, or key:value lines (English or हिंदी). The bicycle name, pricing, brand, category, and specification boxes will be populated automatically into the form.
            </p>
            <textarea
              rows={6}
              value={googleFormRawText}
              onChange={(e) => setGoogleFormRawText(e.target.value)}
              placeholder="Paste here (e.g. Bicycle Name: AVON Elements, Brand: AVON, Selling Price: 6499, Wheel Size: 26T, Gear Count: 21 Speed, Carrier: Included)"
              className="w-full p-3 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-500 resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGoogleFormModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyGoogleForm}
                disabled={!googleFormRawText.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold disabled:opacity-50"
              >
                Apply to Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {imageModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setImageModalProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Manage Images: {imageModalProduct.name}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Upload photographs, select primary storefront image, or delete images.
            </p>

            <div className="space-y-4">
              <label className="block p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl text-center cursor-pointer bg-slate-50 transition">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-800 block">Click to Upload Bicycle Photograph</span>
                <span className="text-[10px] text-slate-400 block mt-1">Direct from mobile gallery or camera (auto-compressed)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageModalProduct.images?.map((img) => (
                  <div key={img.id} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-1 group">
                    <img src={img.image_url} alt="" className="w-full h-full object-contain" />
                    {img.is_primary ? (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold">
                        Primary
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          await apiRequest(`/admin/products/${imageModalProduct.id}/images/${img.id}/primary`, { method: 'PATCH' });
                          const updated = await apiRequest<Product>(`/admin/products/${imageModalProduct.id}`);
                          setImageModalProduct(updated);
                          loadData();
                        }}
                        className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[9px] hover:bg-emerald-600"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await apiRequest(`/admin/products/${imageModalProduct.id}/images/${img.id}`, { method: 'DELETE' });
                        const updated = await apiRequest<Product>(`/admin/products/${imageModalProduct.id}`);
                        setImageModalProduct(updated);
                        loadData();
                      }}
                      className="absolute top-1 right-1 p-1.5 bg-rose-600 text-white rounded-lg shadow transition opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete photograph"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
