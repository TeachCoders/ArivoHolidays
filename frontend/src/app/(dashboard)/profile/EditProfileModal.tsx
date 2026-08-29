"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useUpdateProfile } from "@/feature/auth/api/useAuth";
import { FileUpload } from "@/components/shared/fileUpload";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/shared/PasswordInput";

/**
 * Modal form to edit the logged‑in user's profile.
 * Allows changing the display name, profile picture, and banner image.
 */
export default function EditProfileModal() {
  const { user, isLoading } = useGetCurrentUser();
  const { updateProfile, isUpdatingProfile } = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (password) formData.append("password", password);
    if (profileFile) formData.append("profileImage", profileFile);
    if (bannerFile) formData.append("bannerImage", bannerFile);

    await updateProfile(formData);
    // After successful update the modal will close automatically via dialog state
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn-primary mt-4 px-4 py-2">
          Edit Profile
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          {/* Name */}
          <input
            type="text"
            placeholder="Display name"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Password */}
          <PasswordInput
            placeholder="New Password (leave blank to keep current)"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Profile image */}
          <FileUpload
            title="Profile picture"
            file={profileFile}
            setFile={setProfileFile}
            accept="image/*"
            name="profileImage"
          />

          {/* Banner image */}
          <FileUpload
            title="Banner image"
            file={bannerFile}
            setFile={setBannerFile}
            accept="image/*"
            name="bannerImage"
          />

          <button
            onClick={handleSubmit}
            disabled={isUpdatingProfile}
            className="btn-primary w-full py-2 disabled:opacity-50"
          >
            {isUpdatingProfile ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
