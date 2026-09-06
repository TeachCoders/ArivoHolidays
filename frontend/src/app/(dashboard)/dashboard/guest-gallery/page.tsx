"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, Image as ImageIcon, X } from "lucide-react";
import { useGuestGallery, useCreateGuestGallery, useUpdateGuestGallery, useDeleteGuestGallery } from "@/feature/guestGallery/api";
import BannerImageUpload from "@/components/shared/BannerImageUpload";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import apiClient from "@/lib/apiClient";

export default function GuestGalleryAdmin() {
  const { data, isLoading } = useGuestGallery(1, 100);
  const createMutation = useCreateGuestGallery();
  const updateMutation = useUpdateGuestGallery();
  const deleteMutation = useDeleteGuestGallery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    imageUrls: [] as string[],
    caption: "",
    location: "",
    displayOrder: 0,
    isActive: true,
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ imageUrls: [], caption: "", location: "", displayOrder: 0, isActive: true });
    setPendingFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      imageUrls: [item.imageUrl],
      caption: item.caption || "",
      location: item.location || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setPendingFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.imageUrls.length === 0 && pendingFiles.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    setIsUploading(true);

    try {
      let finalUrls = [...formData.imageUrls];
      
      // Upload newly cropped files
      if (pendingFiles.length > 0) {
        for (let i = 0; i < pendingFiles.length; i++) {
          const fd = new FormData();
          fd.append("category", "gallery");
          fd.append("filename", `guest-gallery-${Date.now()}-${i}`);
          fd.append("label", `Guest Gallery ${i}`);
          fd.append("file", pendingFiles[i]);
          
          const res = await apiClient.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          const url = res.data?.url;
          if (url) finalUrls.push(url);
        }
      }

      if (finalUrls.length === 0) {
         toast.error("Image upload failed. No URLs generated.");
         setIsUploading(false);
         return;
      }

      if (editingId) {
        await updateMutation.mutateAsync({ 
          id: editingId, 
          data: { ...formData, imageUrl: finalUrls[0] } 
        });
        toast.success("Image updated successfully");
      } else {
        await Promise.all(
          finalUrls.map(url => 
            createMutation.mutateAsync({ 
              caption: formData.caption,
              location: formData.location,
              displayOrder: formData.displayOrder,
              isActive: formData.isActive,
              imageUrl: url 
            })
          )
        );
        toast.success(finalUrls.length > 1 ? "Images added to gallery" : "Image added to gallery");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save image(s)");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this photo?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Image removed from gallery");
      } catch (error) {
        toast.error("Failed to delete image");
      }
    }
  };



  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Guest Gallery & Traveler Moments</h1>
          <p className="text-slate-500 mt-1">Manage traveler photos shown in the slider and upcoming gallery page.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 bg-[#D4561A] hover:bg-[#b04513]">
          <Plus size={18} /> Add Photo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4561A]"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...(data?.data || [])].sort((a, b) => a.displayOrder - b.displayOrder).map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
              <div className="aspect-[4/3] relative bg-slate-100">
                <img src={item.imageUrl} alt={item.caption || "Guest Photo"} className="w-full h-full object-cover" />
                {!item.isActive && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Hidden</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => openEditModal(item)} className="p-2 bg-white rounded-full text-slate-800 hover:text-[#D4561A] transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded-full text-slate-800 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-slate-800 truncate">{item.caption || "No Caption"}</p>
                <p className="text-sm text-slate-500 mt-1 truncate">{item.location || "Unknown Location"}</p>
                <p className="text-xs text-slate-400 mt-2">Order: {item.displayOrder}</p>
              </div>
            </div>
          ))}
          {(!data?.data || data.data.length === 0) && (
            <div className="col-span-full">
              <EmptyState 
                title="No photos added yet" 
                description="Click 'Add Photo' to start building your gallery." 
                icon={ImageIcon} 
                action={
                  <Button onClick={openAddModal} variant="outline" className="text-sm">
                    Create your first gallery photo
                  </Button>
                }
              />
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">{editingId ? 'Edit Photo' : 'Add New Photo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Photo(s)</label>
                <BannerImageUpload 
                  value={formData.imageUrls}
                  onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: urls }))}
                  onFilesSelect={(files) => setPendingFiles(files)}
                  folderPath="gallery"
                  label={editingId ? "Update Photo" : "Upload Multiple Photos"}
                  maxImages={editingId ? 1 : 20}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Caption</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#D4561A]/20 focus:border-[#D4561A] outline-none" 
                  value={formData.caption} 
                  onChange={(e) => setFormData({...formData, caption: e.target.value})} 
                  placeholder="e.g. Amazing time at the Taj Mahal!"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#D4561A]/20 focus:border-[#D4561A] outline-none" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  placeholder="e.g. Agra, India"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Display Order</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#D4561A]/20 focus:border-[#D4561A] outline-none" 
                    value={formData.displayOrder} 
                    onChange={(e) => setFormData({...formData, displayOrder: Number(e.target.value)})} 
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-[#D4561A] focus:ring-[#D4561A]"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <span className="text-sm font-semibold text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUploading || createMutation.isPending || updateMutation.isPending} className="bg-[#D4561A] hover:bg-[#b04513]">
                  {isUploading ? 'Uploading...' : editingId ? 'Save Changes' : 'Upload Photo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
