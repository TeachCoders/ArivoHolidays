"use client";

interface FORM {
  name: string;
  email: string;
  password: string;
}

import { FileUpload } from "@/components/shared/fileUpload";
import { SelectDropDown } from "@/components/shared/select-dropDown";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import role from "@/lib/role";
import React, { useState } from "react";
import PageLoader from "@/components/shared/PageLoader";
import apiClient from "@/lib/apiClient";
import { errorToast } from "@/components/shared/tost";

export function SingUpClinet() {
  const [selectedRole, setSelectedRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [form, setForm] = useState<FORM>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<FORM>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  


  async function addUser(e?: React.MouseEvent) {
    e?.preventDefault();
    // Basic client-side validation
    let validationErrors: Partial<FORM> = {};
    if (!form.name) validationErrors.name = "Name is required";
    if (!form.email) {
      validationErrors.email = "Email is required";
    } else if (!/^\S+@\S+$/.test(form.email)) {
      validationErrors.email = "Invalid email format";
    }
    if (!form.password) {
      validationErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    
    if (selectedRole) formData.append("role", selectedRole);
    if (file) formData.append("profileImage", file);
    if (bannerImage) formData.append("bannerImage", bannerImage);

    try {
      setIsSubmitting(true);
      await apiClient.post("/user", formData);
    } catch {
      errorToast("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div>
        <h1>Auth</h1>

        <div className="flex flex-col gap-4">

          {/* NAME */}
          <Input
            type="text"
            name="name"
            className="bg-white p-5 rounded"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setForm({ ...form, name: e.target.value });
              setErrors(prev => ({ ...prev, name: undefined }));
            }}
            placeholder="Enter your name"
          />
          {errors.name && <p className="text-brand-danger text-sm">{errors.name}</p>}


          {/* EMAIL */}
          <Input
            type="email"
            name="email"
             className="bg-white p-5 rounded"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-brand-danger text-sm">{errors.email}</p>}


          {/* PASSWORD */}
          <PasswordInput
            className="bg-white p-5 rounded"
            name="password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-brand-danger text-sm">{errors.password}</p>}


          <PasswordInput
            name="password"
            className="bg-white p-5 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter your password"
          />


            <SelectDropDown
              placeholderText="Select Role"            
              data={Object.entries(role).map(([key, value]) => ({
                label: value,
                value: key,
              }))}
              selectedValue={selectedRole}
              onChangeHandler={(value) => setSelectedRole(value)}
            />       


             <FileUpload
                title="Upload logo or profile Image"
                subtitle="PNG, JPG, JPEG upto 5MB"
                file={file}
                setFile={setFile}
              /> 

               <FileUpload
                title="Upload Banner Image"
                subtitle="PNG, JPG, JPEG upto 50MB"
                file={bannerImage}
                setFile={setBannerImage}
              /> 

              <button type="button" className="brandBtn" onClick={(e) => addUser(e)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <PageLoader size="inline" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>

        </div>
      </div>
    </div>
  );
}
