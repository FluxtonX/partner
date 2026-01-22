import React, { useState, useEffect } from 'react';
import { UserAgreement } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import UserAgreementForm from '../components/assets/UserAgreementForm';

export default function UserAgreementsPage() {
  const [agreements, setAgreements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);

  useEffect(() => {
    loadAgreements();
  }, []);

  const loadAgreements = async () => {
    setIsLoading(true);
    try {
      const data = await UserAgreement.list('-created_date');
      setAgreements(data);
    } catch (error) {
      console.error("Failed to load agreements:", error);
      toast.error("Could not load user agreements.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (agreement) => {
    setEditingAgreement(agreement);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agreement? This action cannot be undone.")) {
      try {
        await UserAgreement.delete(id);
        toast.success("Agreement deleted successfully.");
        loadAgreements();
      } catch (error) {
        toast.error("Failed to delete agreement.");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAgreement) {
        await UserAgreement.update(editingAgreement.id, formData);
        toast.success("Agreement updated successfully.");
      } else {
        await UserAgreement.create(formData);
        toast.success("Agreement created successfully.");
      }
      setShowForm(false);
      setEditingAgreement(null);
      loadAgreements();
    } catch (error) {
      toast.error(`Failed to ${editingAgreement ? 'update' : 'create'} agreement.`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Agreements</h1>
        <Button onClick={() => { setEditingAgreement(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Agreement
        </Button>
      </div>

      {showForm && (
        <UserAgreementForm
          agreement={editingAgreement}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditingAgreement(null); }}
        />
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading agreements...</p>
        ) : agreements.length > 0 ? (
          agreements.map(agreement => (
            <Card key={agreement.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{agreement.title} (v{agreement.version})</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(agreement)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(agreement.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 capitalize">
                  Type: {agreement.agreement_type?.replace('_', ' ')}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No user agreements found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}