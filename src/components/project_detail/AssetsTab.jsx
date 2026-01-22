import React, { useState } from 'react';
import { Project } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, PackagePlus, Truck, Home, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetsTab({ project, allAssets, onUpdate }) {
  const [allocatedAssetIds, setAllocatedAssetIds] = useState(project.allocated_asset_ids || []);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const allocatedAssets = allAssets.filter(asset => allocatedAssetIds.includes(asset.id));
  const availableAssets = allAssets.filter(asset => !allocatedAssetIds.includes(asset.id) && asset.status === 'Available');

  const handleSelectionChange = (assetId, isSelected) => {
    setAllocatedAssetIds(prev => 
      isSelected ? [...prev, assetId] : prev.filter(id => id !== assetId)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Project.update(project.id, { allocated_asset_ids: allocatedAssetIds });
      toast.success('Project assets updated successfully!');
      if (onUpdate) onUpdate();
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Failed to update project assets:', error);
      toast.error('Failed to update project assets.');
    } finally {
      setIsSaving(false);
    }
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'Vehicle': return <Truck className="w-4 h-4 text-slate-500" />;
      case 'Tool': return <Wrench className="w-4 h-4 text-slate-500" />;
      case 'Equipment': return <Package className="w-4 h-4 text-slate-500" />;
      case 'Real Estate': return <Home className="w-4 h-4 text-slate-500" />;
      default: return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <CardTitle>Allocated Assets</CardTitle>
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button><PackagePlus className="w-4 h-4 mr-2" /> Allocate Assets</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search available assets..." />
              <CommandList>
                <CommandEmpty>No available assets found.</CommandEmpty>
                <CommandGroup>
                  {availableAssets.map(asset => (
                    <CommandItem key={asset.id} onSelect={() => handleSelectionChange(asset.id, !allocatedAssetIds.includes(asset.id))}>
                      <Checkbox
                        className="mr-2"
                        checked={allocatedAssetIds.includes(asset.id)}
                        onCheckedChange={checked => handleSelectionChange(asset.id, checked)}
                      />
                      <div className="flex items-center gap-2">
                        {getAssetIcon(asset.type)}
                        <span>{asset.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="p-2 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Update Allocation'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        {allocatedAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allocatedAssets.map(asset => (
              <div key={asset.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-slate-200 rounded-md">
                  {getAssetIcon(asset.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{asset.name}</p>
                  <p className="text-xs text-slate-500">{asset.serial_number || 'No S/N'}</p>
                </div>
                <Badge variant={asset.status === 'Available' ? 'secondary' : 'outline'}>
                  {asset.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No assets have been allocated to this project yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}