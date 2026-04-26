"use client";
import React, { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store";
import {
  User, ShoppingBag, Heart, MapPin, Wallet, Shield, Bell, LogOut,
  Loader2, Clock, Truck, CheckCircle, Package, ChevronRight, Edit3, Camera,
  Plus, Trash2, CreditCard, Smartphone, Eye, EyeOff, Monitor, Globe,
  X, Map, Store, Menu, Home, Building, ShoppingCart,
  Phone, AlertCircle, Check, MapPinned, Crosshair, Search, Users, ExternalLink, RefreshCw
} from "lucide-react";

type TabType = "profile" | "orders" | "wishlist" | "addresses" | "wallet" | "security" | "notifications" | "following";
type AddressMode = "delivery" | "pickup";

interface Address {
  id: string;
  label: string;
  type: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

interface PickupStation {
  id: string;
  name: string;
  address: string;
  district: string;
  county: string;
  country: string;
  city?: string;
  region?: string;
  deliveryFee: number;
  isActive: boolean;
  operatingHours?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  items?: Array<{ image?: string; productImage?: string; title?: string; productName?: string; quantity?: number; price?: number }>;
}

interface WalletData {
  balance: number;
  currency: string;
  transactions: Array<{ id: string; description: string; createdAt: string; type: string; amount: number }>;
}

interface PaymentMethod {
  id: string;
  type: string;
  brand?: string;
  last4?: string;
  provider?: string;
  phoneNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

interface Session {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  city: string;
  country: string;
  ipAddress: string;
  lastActive: string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  inStock: boolean;
}

interface FollowedShop {
  id: string;
  name: string;
  bio?: string;
  category: string;
  ratings: number;
  avatar?: string;
  coverBanner?: string;
  productCount: number;
  followedAt: string;
}

// No fallback — show empty state if DB has no terminals

const COUNTRIES = ["Uganda", "Kenya", "Tanzania", "Rwanda"];
// Districts for address form only (not pickup filter — that uses live data from terminals)
const DISTRICTS = ["Kampala", "Wakiso", "Mukono", "Jinja", "Mbarara", "Gulu", "Lira", "Mbale", "Soroti", "Arua", "Fort Portal", "Masaka", "Entebbe"];


// ============ STAT CARD COMPONENT ============
const StatCard = ({ title, count, icon: Icon, color = "blue" }: { title: string; count: number; icon: React.ElementType; color?: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-sm border flex items-center gap-2 min-w-[100px] sm:min-w-[120px] flex-shrink-0">
      <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${colors[color]}`}><Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
      <div className="min-w-0">
        <p className="text-sm sm:text-base font-bold text-gray-800">{count}</p>
        <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">{title}</p>
      </div>
    </div>
  );
};

// ============ PROFILE TAB ============
const ProfileTab = ({ user, profileForm, setProfileForm, isEditing, setIsEditing, isSaving, handleSaveProfile, handleAvatarUpload, handleAvatarDelete, passwordForm, setPasswordForm, showPasswords, setShowPasswords, handleChangePassword }: any) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      {/* Avatar */}
      <div className="flex justify-center sm:justify-start">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg">
            {user?.avatar ? <Image src={user.avatar} alt="" fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">{user?.name?.charAt(0)?.toUpperCase()}</div>}
          </div>
          <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg">
            <Camera className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
          {user?.avatar && (
            <button onClick={handleAvatarDelete} className="absolute bottom-0 left-0 p-1.5 bg-red-600 rounded-full cursor-pointer hover:bg-red-700 transition shadow-lg">
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{user?.name}</h2>
        <p className="text-xs sm:text-sm text-gray-500">{user?.email}</p>
        <p className="text-xs text-gray-400 mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
      </div>
      <button onClick={() => setIsEditing(!isEditing)} className="self-center sm:self-start px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1">
        <Edit3 className="w-3.5 h-3.5" />{isEditing ? "Cancel" : "Edit"}
      </button>
    </div>

    {/* Profile Form */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
        <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} disabled={!isEditing} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={profileForm.email} disabled className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 text-gray-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
        <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} disabled={!isEditing} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
      </div>
    </div>
    {isEditing && (
      <button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Save Changes
      </button>
    )}

    {/* Password Section */}
    <div className="pt-4 border-t">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[{ key: "currentPassword", label: "Current", show: showPasswords.current, toggle: () => setShowPasswords({ ...showPasswords, current: !showPasswords.current }) },
          { key: "newPassword", label: "New", show: showPasswords.new, toggle: () => setShowPasswords({ ...showPasswords, new: !showPasswords.new }) },
          { key: "confirmPassword", label: "Confirm", show: showPasswords.confirm, toggle: () => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm }) }
        ].map(({ key, label, show, toggle }) => (
          <div key={key} className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <input type={show ? "text" : "password"} value={passwordForm[key]} onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })} className="w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={toggle} className="absolute right-2 top-7 text-gray-400 hover:text-gray-600">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
        ))}
      </div>
      <button onClick={handleChangePassword} disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword} className="mt-3 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50">Update Password</button>
    </div>
  </div>
);


// ============ ORDERS TAB ============
const OrdersTab = ({ orders, loading }: { orders: Order[]; loading: boolean }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", processing: "bg-blue-100 text-blue-700", shipped: "bg-purple-100 text-purple-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  if (!orders.length) return (
    <div className="text-center py-8 sm:py-12">
      <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">Start shopping to see your orders here</p>
      <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"><ShoppingBag className="w-4 h-4" />Browse Products</Link>
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Your Orders ({orders.length})</h3>
      {orders.map(order => (
        <Link key={order.id} href={`/orders/${order.id}`} className="block p-3 sm:p-4 border rounded-xl hover:border-blue-300 hover:shadow-sm transition">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                {order.items?.[0]?.image || order.items?.[0]?.productImage ? (
                  <Image
                    src={order.items[0].image || order.items[0].productImage}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : <Package className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Order #{order.id.slice(-8)}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">UGX {order.total?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

// ============ WISHLIST TAB ============
const WishlistTab = () => {
  const { user } = useUser();
  const wishlistItems = useStore((s: any) => s.wishlist) as any[];
  const removeFromWishlistStore = useStore((s: any) => s.removeFromWishlist);
  const addToCart = useStore((s: any) => s.addToCart);
  const cart = useStore((s: any) => s.cart) as any[];

  if (!wishlistItems.length) return (
    <div className="text-center py-8 sm:py-12">
      <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Your wishlist is empty</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">Save items you love for later</p>
      <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
        <Heart className="w-4 h-4" />Explore Products
      </Link>
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Saved Items ({wishlistItems.length})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {wishlistItems.map((item: any) => {
          const inCart = cart.some((c: any) => c.id === item.id);
          return (
            <div key={item.id} className="bg-white border rounded-xl overflow-hidden group flex flex-col">
              <Link href={`/product/${item.slug || item.id}`} className="block flex-1">
                <div className="relative aspect-square bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || ''}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                      unoptimized
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs sm:text-sm font-bold text-teal-700">
                    UGX {(item.price || item.sale_price || 0).toLocaleString('en-UG')}
                  </p>
                </div>
              </Link>
              <div className="flex border-t">
                <button
                  onClick={() => {
                    if (user) addToCart({ id: item.id, title: item.title, price: item.price || item.sale_price || 0, image: item.image, shopId: item.shopId || '' }, user, null, null);
                  }}
                  disabled={!user}
                  className={`flex-1 py-1.5 text-xs flex items-center justify-center gap-1 transition ${inCart ? 'bg-teal-50 text-teal-700' : 'hover:bg-teal-50 text-gray-600 hover:text-teal-700'}`}
                >
                  <ShoppingCart className="w-3 h-3" />
                  {inCart ? 'In Cart' : 'Add'}
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={() => removeFromWishlistStore(item.id, user, null, null)}
                  className="flex-1 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center justify-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ============ ADDRESSES TAB ============
const AddressesTab = ({ addresses, loading, onAdd, onEdit, onDelete, onSetDefault, cartSellerIds }: { addresses: Address[]; loading: boolean; onAdd: () => void; onEdit: (a: Address) => void; onDelete: (id: string) => void; onSetDefault: (id: string) => void; cartSellerIds: string[] }) => {
  const [mode, setMode] = useState<AddressMode>("delivery");
  const [pickupStations, setPickupStations] = useState<PickupStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultPickupId, setDefaultPickupId] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('defaultPickupStation') || '';
    return '';
  });

  const handleSetDefaultPickup = (station: PickupStation) => {
    setDefaultPickupId(station.id);
    localStorage.setItem('defaultPickupStation', station.id);
    localStorage.setItem('defaultPickupStationData', JSON.stringify(station));
  };

  const fetchPickupStations = async () => {
    setStationsLoading(true);
    try {
      const params = new URLSearchParams();
      if (cartSellerIds.length > 0) params.set("sellerIds", cartSellerIds.join(","));
      const r = await fetch(`/api/pickup-stations?${params.toString()}`);
      const data = await r.json();
      setPickupStations(data?.stations || []);
      if (data?.sellers?.length) setSellerInfo(data.sellers);
    } catch {
      setPickupStations([]);
    } finally {
      setStationsLoading(false);
    }
  };

  useEffect(() => {
    fetchPickupStations();
  }, [cartSellerIds]);

  // Derive districts dynamically from fetched terminals
  const availableDistricts = React.useMemo(() =>
    [...new Set(pickupStations.map(s => s.district).filter(Boolean))].sort(),
    [pickupStations]
  );

  const filteredStations = pickupStations.filter(s => {
    const matchesDistrict = !selectedDistrict || s.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch && s.isActive;
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button onClick={() => setMode("delivery")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition ${mode === "delivery" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"}`}>
          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>Home Delivery</span>
        </button>
        <button onClick={() => setMode("pickup")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition ${mode === "pickup" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"}`}>
          <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>Pickup Stations</span>
        </button>
      </div>

      {mode === "delivery" ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Delivery Addresses ({addresses.length})</h3>
            <button onClick={onAdd} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-3.5 h-3.5" />Add Address</button>
          </div>
          {!addresses.length ? (
            <div className="text-center py-8 border-2 border-dashed rounded-xl">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No addresses saved</p>
              <button onClick={onAdd} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add Your First Address</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map(addr => (
                <div key={addr.id} className={`p-3 sm:p-4 border-2 rounded-xl relative ${addr.isDefault ? "border-blue-500 bg-blue-50/50" : "border-gray-200"}`}>
                  {addr.isDefault && <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded-full">Default</span>}
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${addr.type === "home" ? "bg-green-100" : "bg-purple-100"}`}>
                      {addr.type === "home" ? <Home className="w-3.5 h-3.5 text-green-600" /> : <Building className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{addr.label || addr.type}</p>
                      <p className="text-xs text-gray-600">{addr.fullName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{addr.street}{addr.apartment ? `, ${addr.apartment}` : ""}</p>
                  <p className="text-xs text-gray-500">{addr.city}, {addr.region}, {addr.country}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{addr.phone}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <button onClick={() => onEdit(addr)} className="flex-1 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                    {!addr.isDefault && <button onClick={() => onSetDefault(addr.id)} className="flex-1 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg">Set Default</button>}
                    <button onClick={() => onDelete(addr.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Cart seller context banner */}
          {sellerInfo.length > 0 && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-start gap-2">
              <Truck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Pickup stations for your cart</p>
                <p>Showing Link Bus terminals used by: {sellerInfo.map(s => s.shopName).join(", ")}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search pickup stations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            {availableDistricts.length > 1 && (
              <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">All Districts</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <button
              onClick={fetchPickupStations}
              disabled={stationsLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 flex-shrink-0"
              title="Reload stations"
            >
              {stationsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span className="hidden sm:inline">Reload</span>
            </button>
          </div>
          <div className="space-y-2">
            {stationsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : filteredStations.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-xl">
                <Store className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No pickup stations available</p>
                <p className="text-xs text-gray-400 mt-1">No Link Bus terminals found in the database yet</p>
              </div>
            ) : (
              filteredStations.map(station => {
                const isDefault = defaultPickupId === station.id;
                return (
                  <div key={station.id} className={`p-3 sm:p-4 border-2 rounded-xl transition ${isDefault ? 'border-teal-500 bg-teal-50/40' : 'border-gray-200 hover:border-teal-300'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 self-start ${isDefault ? 'bg-teal-100' : 'bg-orange-100'}`}>
                        <Store className={`w-5 h-5 ${isDefault ? 'text-teal-600' : 'text-orange-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-gray-900">{station.name}</h4>
                            {isDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-full">
                                <Check className="w-2.5 h-2.5" /> Default
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                            UGX {station.deliveryFee.toLocaleString('en-UG')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{station.address}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] sm:text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{station.district}</span>
                          {station.operatingHours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{station.operatingHours}</span>}
                          {station.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{station.phone}</span>}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                          {isDefault ? (
                            <button
                              onClick={() => { setDefaultPickupId(''); localStorage.removeItem('defaultPickupStation'); localStorage.removeItem('defaultPickupStationData'); }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                            >
                              Remove as default
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultPickup(station)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition active:scale-95"
                            >
                              <Check className="w-3 h-3" /> Set as Default Pickup
                            </button>
                          )}
                          {/* View on Map */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station.name}, ${station.address || station.city + ', Uganda'}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-teal-400 hover:bg-teal-50 text-gray-600 hover:text-teal-700 text-xs font-medium rounded-lg transition"
                          >
                            <Map className="w-3 h-3" /> View on Map
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};


// ============ ADDRESS MODAL ============
const AddressModal = ({ address, onClose, onSave }: { address: Address | null; onClose: () => void; onSave: () => void }) => {
  const [form, setForm] = useState({
    label: address?.label || "",
    type: address?.type || "home",
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    street: address?.street || "",
    apartment: address?.apartment || "",
    city: address?.city || "",
    region: address?.region || "",
    country: address?.country || "Uganda",
    postalCode: address?.postalCode || "",
    latitude: address?.latitude || 0,
    longitude: address?.longitude || 0,
    isDefault: address?.isDefault || false,
  });
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm(f => ({ ...f, latitude, longitude }));
        // Reverse geocode
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await res.json();
          if (data.address) {
            setForm(f => ({
              ...f,
              street: data.address.road || data.address.pedestrian || data.display_name?.split(",")[0] || f.street,
              city: data.address.city || data.address.town || data.address.village || data.address.suburb || f.city,
              region: data.address.state || data.address.county || f.region,
              country: data.address.country || f.country,
              postalCode: data.address.postcode || f.postalCode,
            }));
          }
        } catch { /* Ignore geocoding errors */ }
        setGpsLoading(false);
      },
      (error) => {
        setGpsError(error.code === 1 ? "Location permission denied" : error.code === 2 ? "Location unavailable" : "Location timeout");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.street || !form.city) {
      alert("Please fill required fields");
      return;
    }
    setSaving(true);
    try {
      if (address?.id) {
        await fetch(`/api/user/addresses/${address.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          body: JSON.stringify(form),
        });
      }
      onSave();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h3 className="text-base sm:text-lg font-semibold">{address ? "Edit Address" : "Add New Address"}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* GPS & Map Buttons */}
          <div className="flex gap-2">
            <button onClick={handleGPS} disabled={gpsLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 disabled:opacity-50 text-sm font-medium">
              {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
              {gpsLoading ? "Getting location..." : "Use GPS"}
            </button>
            <button onClick={() => setShowMap(!showMap)} className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-green-300 text-green-600 rounded-xl hover:bg-green-50 text-sm font-medium">
              <Map className="w-4 h-4" />{showMap ? "Hide Map" : "Pick on Map"}
            </button>
          </div>
          {gpsError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{gpsError}</p>}
          {(form.latitude !== 0 && form.longitude !== 0) && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" />Location: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</p>}

          {/* Map */}
          {showMap && (
            <div className="rounded-xl overflow-hidden border bg-gray-50">
              <div className="relative h-48 sm:h-56 bg-gray-100">
                <iframe
                  key={`${form.latitude}-${form.longitude}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${(form.longitude || 32.58) - 0.05}%2C${(form.latitude || 0.31) - 0.05}%2C${(form.longitude || 32.58) + 0.05}%2C${(form.latitude || 0.31) + 0.05}&layer=mapnik&marker=${form.latitude || 0.31}%2C${form.longitude || 32.58}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
              <div className="p-2 bg-white border-t flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPinned className="w-3 h-3 text-red-500 flex-shrink-0" />
                  {form.latitude !== 0 && form.longitude !== 0
                    ? `Pinned: ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
                    : 'Use GPS to pin your location, then the map will update'}
                </p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${form.latitude || 0.31}&mlon=${form.longitude || 32.58}#map=16/${form.latitude || 0.31}/${form.longitude || 32.58}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  <ExternalLink className="w-3 h-3" /> Open full map
                </a>
              </div>
            </div>
          )}

          {/* Type Selection */}
          <div className="flex gap-2">
            {[{ value: "home", icon: Home, label: "Home" }, { value: "work", icon: Building, label: "Work" }, { value: "other", icon: MapPin, label: "Other" }].map(({ value, icon: Icon, label }) => (
              <button key={value} onClick={() => setForm({ ...form, type: value })} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition ${form.type === value ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Label (optional)</label>
              <input type="text" placeholder="e.g., My Home, Office" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Street Address *</label>
              <input type="text" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Apartment/Suite</label>
              <input type="text" value={form.apartment} onChange={e => setForm({ ...form, apartment: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Region/District</label>
              <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0">
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ============ WALLET TAB ============
const WalletTab = ({ wallet, paymentMethods, loading, orders }: { wallet: WalletData | null; paymentMethods: PaymentMethod[]; loading: boolean; orders: any[] }) => {
  const SUCCESSFUL = ['delivered', 'completed', 'paid'];

  const successfulOrders = orders.filter(o =>
    SUCCESSFUL.includes(o.status?.toLowerCase()) ||
    SUCCESSFUL.includes(o.paymentStatus?.toLowerCase())
  );

  const totalSpent = successfulOrders.reduce((sum, o) => sum + (o.subtotal || o.total || 0) + (o.deliveryFee || 0), 0);
  const avgOrder = successfulOrders.length ? Math.round(totalSpent / successfulOrders.length) : 0;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Spending Summary Card */}
      <div className="bg-gradient-to-br from-teal-600 to-blue-700 p-4 sm:p-6 rounded-2xl text-white">
        <p className="text-xs sm:text-sm opacity-80 mb-1">Total Spent on EasyShop</p>
        <p className="text-2xl sm:text-3xl font-bold">UGX {totalSpent.toLocaleString('en-UG')}</p>
        <p className="text-xs opacity-70 mt-1">{successfulOrders.length} successful order{successfulOrders.length !== 1 ? 's' : ''}</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-[10px] opacity-75 mb-0.5">Avg. Order Value</p>
            <p className="text-sm font-bold">UGX {avgOrder.toLocaleString('en-UG')}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-[10px] opacity-75 mb-0.5">Orders Placed</p>
            <p className="text-sm font-bold">{orders.length} total</p>
          </div>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Successful Orders — Spending History
        </h3>
        {successfulOrders.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-xl">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No completed orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Spending history will appear here once orders are delivered</p>
          </div>
        ) : (
          <div className="space-y-2">
            {successfulOrders.map((order, i) => {
              const orderTotal = (order.subtotal || order.total || 0) + (order.deliveryFee || 0);
              const itemCount = order.items?.length || 0;
              const firstImage = order.items?.[0]?.image || order.items?.[0]?.productImage;
              return (
                <Link key={order.id || i} href={`/orders/${order.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 border border-transparent hover:border-teal-200 rounded-xl transition group">
                  {/* Order thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative">
                    {firstImage ? (
                      <Image src={firstImage} alt="" fill className="object-cover" unoptimized
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Order #{(order.id || '').slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {itemCount > 0 && ` · ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{order.paymentStatus || order.status}</span>
                      {order.paymentMethod && (
                        <span className="text-[10px] text-gray-400 capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  </div>
                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-teal-700">UGX {orderTotal.toLocaleString('en-UG')}</p>
                    {order.deliveryFee > 0 && (
                      <p className="text-[10px] text-gray-400">incl. UGX {order.deliveryFee.toLocaleString('en-UG')} delivery</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* All orders summary */}
      {orders.length > successfulOrders.length && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {orders.length - successfulOrders.length} order{orders.length - successfulOrders.length !== 1 ? 's are' : ' is'} pending/processing and not included in the total above.
        </div>
      )}
    </div>
  );
};

// ============ SECURITY TAB ============
const SecurityTab = ({ sessions, loading, onRevokeSession }: { sessions: Session[]; loading: boolean; onRevokeSession: (id: string) => void }) => {
  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Account Secured banner */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0"><Shield className="w-5 h-5 text-green-600" /></div>
        <div>
          <h3 className="text-sm font-semibold text-green-800">Account Secured</h3>
          <p className="text-xs text-green-600 mt-0.5">Your account is protected with a password. Keep it safe and never share it.</p>
        </div>
      </div>

      {/* Change Password — fully functional */}
      <div className="p-4 border rounded-xl space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-blue-100 rounded-lg"><Shield className="w-4 h-4 text-blue-600" /></div>
          <h4 className="text-sm font-semibold text-gray-900">Change Password</h4>
        </div>
        <PasswordChangeForm />
      </div>

      {/* Security tips */}
      <div className="p-4 border rounded-xl">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" /> Security Tips
        </h4>
        <ul className="space-y-2 text-xs text-gray-600">
          {[
            "Use a strong password with letters, numbers and symbols",
            "Never share your password or OTP with anyone",
            "Log out from shared or public devices after use",
            "Contact support immediately if you notice suspicious activity",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Standalone password change form used inside SecurityTab
const PasswordChangeForm = () => {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async () => {
    if (!form.current || !form.newPass || !form.confirm) { setMsg({ type: 'error', text: 'All fields are required' }); return; }
    if (form.newPass !== form.confirm) { setMsg({ type: 'error', text: "New passwords don't match" }); return; }
    if (form.newPass.length < 6) { setMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return; }

    setSaving(true); setMsg(null);
    try {
      await axiosInstance.post("/api/auth/change-password", {
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setForm({ current: '', newPass: '', confirm: '' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {[
        { key: 'current', label: 'Current Password', showKey: 'current' },
        { key: 'newPass', label: 'New Password', showKey: 'newPass' },
        { key: 'confirm', label: 'Confirm New Password', showKey: 'confirm' },
      ].map(({ key, label, showKey }) => (
        <div key={key} className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
          <div className="relative">
            <input
              type={show[showKey as keyof typeof show] ? 'text' : 'password'}
              value={form[key as keyof typeof form]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey as keyof typeof s] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show[showKey as keyof typeof show] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}
      {msg && (
        <p className={`text-xs flex items-center gap-1 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {msg.text}
        </p>
      )}
      <button onClick={handleSubmit} disabled={saving}
        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </div>
  );
};

// ============ NOTIFICATIONS TAB ============
const NotificationsTab = ({ preferences, setPreferences }: { preferences: any; setPreferences: (p: any) => void }) => {
  const togglePref = (key: string) => setPreferences({ ...preferences, [key]: !preferences[key] });

  const sections = [
    { title: "Channels", items: [
      { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
      { key: "sms", label: "SMS Notifications", desc: "Get text messages for important updates" },
      { key: "push", label: "Push Notifications", desc: "Browser and app notifications" },
    ]},
    { title: "Preferences", items: [
      { key: "orderUpdates", label: "Order Updates", desc: "Shipping and delivery notifications" },
      { key: "promotions", label: "Promotions & Deals", desc: "Special offers and discounts" },
      { key: "newsletter", label: "Newsletter", desc: "Weekly product recommendations" },
    ]},
  ];

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <div key={section.title}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">{section.title}</h3>
          <div className="space-y-2">
            {section.items.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 sm:p-4 border rounded-xl">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <button onClick={() => togglePref(key)} className={`relative w-11 h-6 rounded-full transition shrink-0 ${preferences[key] ? "bg-blue-600" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition ${preferences[key] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Save Preferences</button>
    </div>
  );
};


// ============ FOLLOWING TAB ============
const FollowingTab = () => {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const token = localStorage.getItem("accessToken") || "";
        const r = await fetch("/api/user/following-list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        setFollowing(data?.following || []);
      } catch { setFollowing([]); }
      finally { setLoading(false); }
    };
    fetchFollowing();
  }, []);

  const handleUnfollow = async (shopId: string) => {
    setUnfollowingId(shopId);
    try {
      const token = localStorage.getItem("accessToken") || "";
      await fetch("/api/user/unfollow-shop", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shopId }),
      });
      setFollowing(following.filter(s => s.id !== shopId));
    } catch {
      // Silently fail
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  
  if (!following.length) return (
    <div className="text-center py-8 sm:py-12">
      <Store className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Not following any shops</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">Follow shops to see their updates and new products</p>
      <Link href="/shops" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
        <Store className="w-4 h-4" />Browse Shops
      </Link>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Following ({following.length})</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {following.map(shop => (
          <div key={shop.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition">
            {/* Cover Banner */}
            <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-500 relative">
              {shop.coverBanner && (
                <Image src={shop.coverBanner} alt="" fill className="object-cover" />
              )}
            </div>
            
            {/* Shop Info */}
            <div className="p-3 -mt-6 relative">
              <div className="flex items-end gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-md overflow-hidden relative shrink-0">
                  {shop.avatar ? (
                    <Image src={shop.avatar} alt={shop.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <Store className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{shop.name}</h4>
                  <p className="text-xs text-gray-500">{shop.category}</p>
                </div>
              </div>
              
              {shop.bio && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{shop.bio}</p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />{shop.productCount} products
                </span>
                <span className="flex items-center gap-1">
                  ⭐ {shop.ratings.toFixed(1)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  href={`/shop/${shop.id}`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <ExternalLink className="w-3 h-3" />Visit Shop
                </Link>
                <button
                  onClick={() => handleUnfollow(shop.id)}
                  disabled={unfollowingId === shop.id}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                >
                  {unfollowingId === shop.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Users className="w-3 h-3" />
                  )}
                  Unfollow
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ============ MAIN PROFILE PAGE ============
const ProfilePageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);

  // Unique seller IDs from current cart items
  const cartSellerIds = React.useMemo(() =>
    [...new Set(cart.map((item: any) => item.shopId).filter(Boolean))] as string[],
    [cart]
  );

  const queryTab = (searchParams.get("tab") as TabType) || "profile";
  const [activeTab, setActiveTab] = useState<TabType>(queryTab);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, sms: false, push: true, orderUpdates: true, promotions: false, newsletter: false });

  const navItems = [
    { label: "Profile", icon: User, tab: "profile" as TabType },
    { label: "Orders", icon: ShoppingBag, tab: "orders" as TabType },
    { label: "Wishlist", icon: Heart, tab: "wishlist" as TabType },
    { label: "Following", icon: Users, tab: "following" as TabType },
    { label: "Addresses", icon: MapPin, tab: "addresses" as TabType },
    { label: "Wallet", icon: Wallet, tab: "wallet" as TabType },
    { label: "Security", icon: Shield, tab: "security" as TabType },
    { label: "Alerts", icon: Bell, tab: "notifications" as TabType },
  ];

  useEffect(() => { if (user) setProfileForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" }); }, [user]);
  useEffect(() => { if (activeTab !== queryTab) router.replace(`/profile?tab=${activeTab}`); }, [activeTab, queryTab, router]);
  // Fetch orders on load (needed for stats cards) and whenever orders tab is active
  useEffect(() => { if (user) fetchOrders(); }, [user]);
  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "addresses") fetchAddresses();
    if (activeTab === "wallet") { fetchWallet(); if (!orders.length) fetchOrders(); }
    if (activeTab === "security") fetchSessions();
  }, [activeTab]);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      // Backend expects GET /api/orders?userId=xxx
      const userId = (user as any)?.id || (user as any)?._id;
      const r = await axiosInstance.get(`/api/orders?userId=${userId}`);
      // Backend returns array directly or wrapped in { orders: [] }
      const raw = r.data;
      const list = Array.isArray(raw) ? raw : (raw?.orders || []);
      // Normalise _id → id so the UI works consistently
      setOrders(list.map((o: any) => ({
        ...o,
        id: o._id || o.id,
        total: o.subtotal || o.total || 0,
        items: (o.items || []).map((item: any) => ({
          ...item,
          image: item.image || item.productImage || "",
          title: item.name || item.title || item.productName || "",
        })),
      })));
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const token = localStorage.getItem("accessToken") || "";
      const r = await fetch("/api/user/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setAddresses(data?.addresses || []);
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchWallet = async () => {
    setWalletLoading(true);
    try {
      // No wallet/payment-methods endpoints exist yet — use empty defaults
      setWallet({ balance: 0, currency: "UGX", transactions: [] });
      setPaymentMethods([]);
    } catch {
      setWallet({ balance: 0, currency: "UGX", transactions: [] });
      setPaymentMethods([]);
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    // Sessions endpoint doesn't exist yet — show empty state
    setSessions([]);
    setSessionsLoading(false);
  };

  const handleRevokeSession = async (_id: string) => {
    // Sessions endpoint doesn't exist yet
  };

  const handleLogout = async () => {
    try {
      // Clear local auth state — no server logout endpoint needed
      localStorage.removeItem("accessToken");
      queryClient.clear();
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.put("/api/auth/profile", profileForm);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
    } catch {
      alert("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setIsSaving(true);
    try {
      await axiosInstance.post("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password changed successfully");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const token = localStorage.getItem("accessToken") || "";
      await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(addresses.filter(a => a.id !== id));
    } catch {
      alert("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken") || "";
      await fetch(`/api/user/addresses/${id}/default`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch {
      alert("Failed to set default address");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { alert('Please select an image file'); e.target.value = ''; return; }
    if (f.size > 2 * 1024 * 1024) { alert('Image must be less than 2MB'); e.target.value = ''; return; }

    // Read file as base64 and upload to server-side ImageKit endpoint
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      try {
        // Delete old avatar from ImageKit first if one exists
        if ((user as any)?.avatarFileId) {
          try {
            await axiosInstance.delete('/api/imagekit/delete', { data: { fileId: (user as any).avatarFileId } });
          } catch (_) {
            // Non-fatal — continue even if old file deletion fails
          }
        }

        const uploadRes = await axiosInstance.post('/api/imagekit/upload', {
          file: cleanBase64,
          // Use unique filename every time to avoid ImageKit serving a cached old file
          fileName: `avatar_${(user as any)?.id || Date.now()}_${Date.now()}.jpg`,
          folder: 'user-profiles'
        });
        const data = uploadRes.data;
        if (data?.success && data.url) {
          // Append cache-busting param so Next.js Image always fetches the fresh file
          const freshUrl = `${data.url}?v=${Date.now()}`;
          await axiosInstance.put('/api/auth/profile', { ...profileForm, avatar: freshUrl, avatarFileId: data.fileId });
          queryClient.invalidateQueries({ queryKey: ['user'] });
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        console.error('Avatar upload error', err);
        alert('Failed to upload avatar');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsDataURL(f);
  };

  const handleAvatarDelete = async () => {
    if (!confirm('Delete your profile picture?')) return;
    try {
      // Attempt server-side delete if we have a fileId
      if ((user as any)?.avatarFileId) {
        await axiosInstance.delete('/api/imagekit/delete', { data: { fileId: (user as any).avatarFileId } });
      }
      // Remove avatar reference from user profile
      await axiosInstance.put('/api/auth/profile', { ...profileForm, avatar: null, avatarFileId: null });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err) {
      console.error('Avatar delete error', err);
      alert('Failed to delete avatar');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
        <p className="text-sm text-gray-500 mb-4">Sign in to access your profile</p>
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-6">
        {/* Mobile Header */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden relative shrink-0">
                {user?.avatar ? (
                  <Image src={user.avatar} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500">{navItems.find(n => n.tab === activeTab)?.label}</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg shrink-0">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-xl shadow-lg border overflow-hidden animate-in slide-in-from-top-2">
              <div className="grid grid-cols-4 gap-1 p-2">
                {navItems.map(({ label, icon: Icon, tab }) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium transition ${
                      activeTab === tab ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate w-full text-center">{label}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide -mx-1 px-1">
          <StatCard title="Orders" count={orders.length} icon={Package} color="blue" />
          <StatCard title="Processing" count={orders.filter(o => o.status === "processing").length} icon={Clock} color="orange" />
          <StatCard title="Shipped" count={orders.filter(o => o.status === "shipped").length} icon={Truck} color="purple" />
          <StatCard title="Delivered" count={orders.filter(o => o.status === "delivered").length} icon={CheckCircle} color="green" />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-56 shrink-0">
            <div className="bg-white p-4 rounded-xl shadow-sm sticky top-4">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map(({ label, icon: Icon, tab }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      activeTab === tab ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {activeTab === tab && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm">
              {activeTab === "profile" && (
                <ProfileTab
                  user={user}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  isSaving={isSaving}
                  handleSaveProfile={handleSaveProfile}
                  handleAvatarUpload={handleAvatarUpload}
                  handleAvatarDelete={handleAvatarDelete}
                  passwordForm={passwordForm}
                  setPasswordForm={setPasswordForm}
                  showPasswords={showPasswords}
                  setShowPasswords={setShowPasswords}
                  handleChangePassword={handleChangePassword}
                />
              )}
              {activeTab === "orders" && <OrdersTab orders={orders} loading={ordersLoading} />}
              {activeTab === "wishlist" && <WishlistTab />}
              {activeTab === "following" && <FollowingTab />}
              {activeTab === "addresses" && (
                <AddressesTab
                  addresses={addresses}
                  loading={addressesLoading}
                  onAdd={() => { setEditingAddress(null); setShowAddressModal(true); }}
                  onEdit={(a: Address) => { setEditingAddress(a); setShowAddressModal(true); }}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefaultAddress}
                  cartSellerIds={cartSellerIds}
                />
              )}
              {activeTab === "wallet" && <WalletTab wallet={wallet} paymentMethods={paymentMethods} loading={walletLoading} orders={orders} />}
              {activeTab === "security" && <SecurityTab sessions={sessions} loading={sessionsLoading} onRevokeSession={handleRevokeSession} />}
              {activeTab === "notifications" && <NotificationsTab preferences={notificationPrefs} setPreferences={setNotificationPrefs} />}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => setShowAddressModal(false)}
          onSave={() => { fetchAddresses(); setShowAddressModal(false); }}
        />
      )}
    </div>
  );
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#115061]/20 border-t-[#115061] rounded-full animate-spin" /></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
