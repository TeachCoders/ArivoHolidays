"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useGetCurrentUser } from "@/feature/auth/api/useAuth";
import { useUpdateProfile } from "@/feature/auth/api/useAuth";
import { FileUpload } from "@/components/shared/fileUpload";
import { errorToast, successToast } from "@/components/shared/tost";
import PageLoader from "@/components/shared/PageLoader";

export default function ProfilePage() {
  const { user, isLoading, isError } = useGetCurrentUser();
  const { updateProfile, isUpdatingProfile } = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const handleSave = async () => {
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (profileFile) formData.append("profileImage", profileFile);
    if (bannerFile) formData.append("bannerImage", bannerFile);
    try {
      await updateProfile(formData);
      successToast("Profile updated");
    } catch (e) {
      errorToast("Failed to update profile");
    }
  };

  if (isLoading) {
    return <PageLoader size="section" text="Loading profile..." />;
  }
  if (isError || !user) {
    return <div className="flex items-center justify-center h-full"><p className="text-red-500">Failed to load profile.</p></div>;
  }

  const { name: userName, email, role, profileImage, bannerImage } = user;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded shadow">
      {/* Banner Image */}
      {bannerImage && (
        <div className="w-full h-48 relative rounded">
          <Image src={`/${bannerImage}`} alt="Banner" fill className="object-cover rounded" />
        </div>
      )}
      <FileUpload title="Banner Image" file={bannerFile} setFile={setBannerFile} accept="image/*" name="bannerImage" />
      {/* Profile Image & Basic Info */}
      <div className="flex items-center space-x-6">
        {profileImage && (
          <Image src={`/${profileImage}`} alt="Profile" width={120} height={120} className="rounded-full border-2 border-white shadow" />
        )}
        <FileUpload title="Profile Image" file={profileFile} setFile={setProfileFile} accept="image/*" name="profileImage" />
        <div>
          <h2 className="h5">{userName}</h2>
          <p className="text-gray-600">{email}</p>
          <p className="text-sm text-gray-5 uppercase">{role?.replace(/_/g, " ")}</p>
        </div>
      </div>
      {/* Name edit */}
      <input type="text" placeholder="Display name" className="w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={handleSave} disabled={isUpdatingProfile} className="btn-primary w-full py-2 disabled:opacity-50">
        {isUpdatingProfile ? "Saving…" : "Save Changes"}
      </button>
      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-gray-700">Role</h3>
          <p>{role}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-700">Team</h3>
          <p>{user.team?.name ?? "-"}</p>
        </div>
      </div>
    </div>
  );
}
