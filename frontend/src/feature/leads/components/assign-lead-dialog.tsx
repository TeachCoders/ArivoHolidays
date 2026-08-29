"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { successToast, errorToast } from "@/components/shared/tost";
import PageLoader from "@/components/shared/PageLoader";
import { useGetTeam } from "@/feature/teams/api/useTeam";
import { useAssignLead } from "../api/useLeeds";

interface AssignLeadDialogProps {
  leadId: number;
  children: React.ReactNode;
}

export const AssignLeadDialog: React.FC<AssignLeadDialogProps> = ({ leadId, children }) => {
  const [selectedValue, setSelectedValue] = React.useState<string>("");
  const { teams, isLoading: isTeamsLoading } = useGetTeam();
  const [isOpen, setIsOpen] = React.useState(false);
  const { assignLead, isLoading: isAssigning } = useAssignLead();

  const salesUsers = React.useMemo(() => {
    const salesTeam = teams?.find((i: { name: string }) => i.name.toLowerCase() === "sales");
    return salesTeam?.users || [];
  }, [teams]);

  const handleAssign = () => {
    if (!selectedValue) {
      errorToast("Please select a sales member");
      return;
    }

    assignLead(
      { leadId, assignedToUserId: Number(selectedValue.replace("user_", "")) },
      {
        onSuccess: () => {
          successToast("Lead assigned successfully");
          setIsOpen(false);
          setSelectedValue("");
        },
        onError: (error: any) => {
          errorToast(error?.message || "Failed to assign lead");
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedValue("");
    }
  };

  if (isTeamsLoading) return 'loading..';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-neutral">
              Sales Team Member:
            </label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sales member" />
              </SelectTrigger>
              <SelectContent>
                {salesUsers.map((u: any) => (
                  <SelectItem key={`user_${u.id}`} value={`user_${u.id}`}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAssign} className="btn-primary border-0" disabled={isAssigning}>
            {isAssigning ? (
              <>
                <PageLoader size="inline" className="mr-2" />
                Assigning...
              </>
            ) : (
              "Assign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignLeadDialog;
