"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNewTeam, useUpdateTeam, useGetTeam } from "@/feature/teams/api/useTeam";
import FormActionButton from "@/components/shared/customBtns";
import { successToast, errorToast } from "@/components/shared/tost";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_TEAM_OPTIONS = [
  "Sales",
  "Operations",
  "Support",
  "IT Maintenance",
];

interface TeamFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function TeamForm({ onSuccess, initialData }: TeamFormProps) {
  const { createNewTeam, isLoading: isCreating } = useCreateNewTeam();
  const { updateTeam, isLoading: isUpdating } = useUpdateTeam();
  const { teams: existingTeams } = useGetTeam();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const isLoading = isCreating || isUpdating;

  const availableOptions = useMemo(() => {
    const existingNames = new Set(
      (existingTeams || []).map((t: any) => t.name?.toLowerCase())
    );
    return ALL_TEAM_OPTIONS.filter(
      (opt) =>
        !existingNames.has(opt.toLowerCase()) ||
        opt.toLowerCase() === initialData?.name?.toLowerCase()
    );
  }, [existingTeams, initialData?.name]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
    };

    if (initialData?.id) {
      updateTeam(
        { id: initialData.id, payload },
        {
          onSuccess: () => {
            successToast("Team updated successfully");
            if (onSuccess) onSuccess();
          },
          onError: (error) => {
            console.error("Failed to update team", error);
            errorToast("Failed to update team. Please try again.");
          },
        }
      );
    } else {
      createNewTeam(payload, {
        onSuccess: () => {
          successToast("Team created successfully");
          if (onSuccess) onSuccess();
          setFormData({ name: "", description: "", isActive: true });
        },
        onError: (error) => {
          console.error("Failed to create team", error);
          errorToast("Failed to create team. Please try again.");
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Team Name
        </Label>
        {initialData?.id ? (
          <Input
            value={formData.name}
            disabled
            className="border-gray-200 bg-gray-50"
          />
        ) : (
          <Select
            value={formData.name}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, name: val }))
            }
          >
            <SelectTrigger className="border-gray-200">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.length === 0 ? (
                <SelectItem value="__none" disabled>
                  All teams created
                </SelectItem>
              ) : (
                availableOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What does this team do?"
          value={formData.description}
          onChange={handleInputChange}
          required
          className="border-gray-200 focus:border-brand-500 min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Team is active
        </Label>
      </div>

      <div className="pt-4">
        <FormActionButton
          text={isLoading ? (initialData ? "Updating Team..." : "Creating Team...") : "Submit"}
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="md"
        />
      </div>
    </form>
  );
}
