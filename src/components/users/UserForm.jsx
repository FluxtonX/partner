
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X, HelpCircle, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { getMinimumWage } from '@/api/functions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function UserForm({ user, userBusiness, laborTypes, businessState, onSubmit, onCancel }) {
  const [userData, setUserData] = useState(user || {});
  const [userBusinessData, setUserBusinessData] = useState(userBusiness || {});
  const [isFetchingWage, setIsFetchingWage] = useState(false);

  // When payment type changes to 'piece_rate', fetch minimum wage
  useEffect(() => {
    const fetchAndSetMinimumWage = async () => {
      if (userData.payment_type === 'piece_rate' && businessState) {
        setIsFetchingWage(true);
        try {
          const { data } = await getMinimumWage({ state: businessState });
          if (data.success) {
            handleUserChange('hourly_rate', data.minimumWage);
            if (typeof userData.bonus_rate === 'undefined') {
              handleUserChange('bonus_rate', 0.25);
            }
            toast.info(`Hourly rate set to ${businessState}'s minimum wage: $${data.minimumWage.toFixed(2)}`);
          } else {
            toast.error("Could not fetch minimum wage.");
          }
        } catch (error) {
          console.error("Failed to fetch minimum wage:", error);
          toast.error("An error occurred while fetching minimum wage.");
        } finally {
          setIsFetchingWage(false);
        }
      }
    };

    fetchAndSetMinimumWage();
  }, [userData.payment_type, userData.bonus_rate, businessState]);

  const handleUserChange = (key, value) => {
    setUserData(prev => ({ ...prev, [key]: value }));
  };

  const handleBusinessChange = (key, value) => {
    setUserBusinessData(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(userData, userBusinessData);
  };
  
  const paymentTypeFields = {
    hourly: ['hourly_rate'],
    salary: ['salary_amount'],
    commission: ['commission_rate'],
    piece_rate: ['hourly_rate', 'bonus_rate'],
    mileage: ['mileage_rate'],
    mileage_plus: ['hourly_rate', 'mileage_rate', 'bonus_rate']
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user.full_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
            
            {/* --- General Information --- */}
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-sm font-medium px-1">General</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input 
                            value={userData.display_name || ''} 
                            onChange={(e) => handleUserChange('display_name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={userBusinessData.role || ''} onValueChange={(v) => handleBusinessChange('role', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>User Type</Label>
                        <Select value={userData.user_type || ''} onValueChange={(v) => handleUserChange('user_type', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Switch 
                            id="is_trainer" 
                            checked={userData.is_trainer || false} 
                            onCheckedChange={(c) => handleUserChange('is_trainer', c)}
                        />
                        <Label htmlFor="is_trainer">Is a Trainer?</Label>
                    </div>
                </div>
            </fieldset>

            {/* --- Skills & Labor --- */}
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-sm font-medium px-1">Skills</legend>
                <div className="space-y-2">
                    <Label>Primary Labor Type</Label>
                    <Select value={userData.primary_labor_type || ''} onValueChange={(v) => handleUserChange('primary_labor_type', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a labor type" />
                        </SelectTrigger>
                        <SelectContent>
                            {(laborTypes || []).map(lt => (
                                <SelectItem key={lt.name} value={lt.name}>{lt.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </fieldset>

            {/* --- Compensation --- */}
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-sm font-medium px-1">Compensation</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <Select value={userData.payment_type || ''} onValueChange={(v) => handleUserChange('payment_type', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(paymentTypeFields).map(key => (
                                    <SelectItem key={key} value={key}>{key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {paymentTypeFields[userData.payment_type]?.map(field => (
                        <div key={field} className="space-y-2">
                            <Label className="flex items-center gap-1.5">
                                {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                {field === 'hourly_rate' && userData.payment_type === 'piece_rate' && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><HelpCircle className="w-4 h-4 text-slate-500 cursor-help"/></TooltipTrigger>
                                            <TooltipContent>
                                                <p>This is automatically set to the legal minimum wage for your business's jurisdiction.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </Label>
                            <div className="relative">
                                <Input 
                                    type="number"
                                    step="0.01"
                                    value={userData[field] || ''} 
                                    onChange={(e) => handleUserChange(field, parseFloat(e.target.value) || 0)}
                                    readOnly={field === 'hourly_rate' && userData.payment_type === 'piece_rate'}
                                    className={field === 'hourly_rate' && userData.payment_type === 'piece_rate' ? 'bg-slate-100' : ''}
                                />
                                {isFetchingWage && field === 'hourly_rate' && userData.payment_type === 'piece_rate' && (
                                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin"/>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
            
            <DialogFooter className="gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
