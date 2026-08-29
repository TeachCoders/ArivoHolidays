"use client";

import React, { useState } from "react";
import { useGetNewUser, useAssignUserToTeam } from "@/feature/auth/api/useAuth";
import FormActionButton from "@/components/shared/customBtns";
import { successToast, errorToast } from "@/components/shared/tost";
import { Label } from "@/components/ui/label";
import { SelectDropDown } from "@/components/shared/select-dropDown";

interface AssignUserFormProps {
  teamId: number;
  teamName?: string;
  onSuccess?: () => void;
}

export function AssignUserForm({ teamId, teamName, onSuccess }: AssignUserFormProps) {
  const { userData, isLoading: isUsersLoading } = useGetNewUser();
  const { assignUser, isAssigning } = useAssignUserToTeam();
  const [selectedUser, setSelectedUser] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) {
      errorToast("Please select a user to assign.");
      return;
    }

    const autoRole = teamName ? teamName.toLowerCase().replace(/[\s-]+/g, "_").replace(/\s+/g, "_") : undefined;

    assignUser(
      { userId: parseInt(selectedUser, 10), teamId, role: autoRole },
      {
        onSuccess: () => {
          successToast("User assigned to team successfully!");
          setSelectedUser("");
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          console.error("Failed to assign user:", error);
          errorToast("Failed to assign user. Please try again.");
        },
      }
    );
  };

  // Filter users to only those not already in this team
  const availableUsers = userData
    ? userData.filter(
        (u: any) => u.teamId !== teamId
      )
    : [];

  const userOptions = availableUsers.map((u: any) => ({
    label: `${u.name} (${u.email})`,
    value: u.id.toString(),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Select User</Label>
        {userOptions.length > 0 ? (
          <SelectDropDown
            data={userOptions}
            placeholderText={isUsersLoading ? "Loading users..." : "Choose a user..."}
            selectedValue={selectedUser}
            onChangeHandler={(value) => setSelectedUser(value)}
          />
        ) : (
          <div className="p-3 text-sm text-amber-600 bg-amber-50 rounded-md border border-amber-200">
            No available users found to assign.
          </div>
        )}
      </div>
      <div className="pt-4">
        <FormActionButton
          text={isAssigning ? "Assigning..." : "Assign User"}
          type="submit"
          isLoading={isAssigning}
          fullWidth
          size="md"
          disabled={userOptions.length === 0}
        />
      </div>
    </form>
  );
}
