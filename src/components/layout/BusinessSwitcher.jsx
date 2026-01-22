import React, { useState, useEffect } from 'react';
import { Business, User } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BusinessSwitcher({ isOpen, onClose, currentUser }) {
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        // This needs to run with elevated privileges to see all businesses.
        // Assuming a backend function or that super_admins can list all businesses.
        // For now, we'll try a direct call which might need policy adjustments.
        const allBusinesses = await Business.list(); 
        setBusinesses(allBusinesses);
      } catch (error) {
        console.error("Failed to fetch businesses:", error);
        toast.error("Could not load business list. You may not have permission.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchBusinesses();
    }
  }, [isOpen]);

  const handleSwitch = async () => {
    if (!selectedBusiness) {
      toast.warning("Please select a business to switch to.");
      return;
    }
    
    try {
      await User.updateMyUserData({ current_business_id: selectedBusiness.id });
      toast.success(`Switched to business: ${selectedBusiness.name}`);
      window.location.reload(); // Reload the page to apply the new business context
    } catch (error) {
      console.error("Failed to switch business:", error);
      toast.error("An error occurred while switching businesses.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Business Context</DialogTitle>
          <DialogDescription>
            As a super admin, you can switch your view to any business on the platform. This will reload the application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <Command>
              <CommandInput placeholder="Search for a business..." />
              <CommandList>
                <CommandEmpty>No businesses found.</CommandEmpty>
                <CommandGroup>
                  {businesses.map((business) => (
                    <CommandItem
                      key={business.id}
                      value={business.name}
                      onSelect={() => {
                        setSelectedBusiness(business);
                      }}
                      className="flex justify-between items-center"
                    >
                      <span>{business.name}</span>
                      {selectedBusiness?.id === business.id && <Check className="w-4 h-4 text-emerald-600" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSwitch} disabled={!selectedBusiness || isLoading}>
                Switch to {selectedBusiness ? `"${selectedBusiness.name}"` : '...'}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}