
import React, { useState, useEffect } from 'react';
import { Accreditation, User } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ShieldCheck, AlertTriangle, CheckCircle, ExternalLink, BadgeCheck, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { format, differenceInDays, isBefore } from 'date-fns';
import AccreditationForm from '../components/accreditations/AccreditationForm';

export default function AccreditationsPage() {
  const [accreditations, setAccreditations] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccreditation, setEditingAccreditation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const [accreditationsData, usersData] = await Promise.all([
        Accreditation.list('-expiration_date'),
        User.list()
      ]);
      setAccreditations(accreditationsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (accreditation) => {
    setEditingAccreditation(accreditation);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accreditation?')) {
      try {
        await Accreditation.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting accreditation:', error);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingAccreditation) {
        await Accreditation.update(editingAccreditation.id, formData);
      } else {
        await Accreditation.create(formData);
      }
      setShowForm(false);
      setEditingAccreditation(null);
      loadData();
    } catch (error) {
      console.error('Error saving accreditation:', error);
    }
  };

  const getStatus = (expDate) => {
    const today = new Date();
    const expirationDate = new Date(expDate);
    const daysUntilExpiry = differenceInDays(expirationDate, today);

    if (isBefore(expirationDate, today)) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
    }
    if (daysUntilExpiry <= 30) {
      return { text: `Expires in ${daysUntilExpiry}d`, color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    }
    if (daysUntilExpiry <= 90) {
      return { text: `Expires in ${daysUntilExpiry}d`, color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle };
    }
    return { text: 'Active', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle };
  };
  
  const getUserName = (email) => users.find(u => u.email === email)?.full_name || email;

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <BadgeCheck className="w-8 h-8" />
              User Accreditations
            </h1>
            <p className="text-slate-600">Manage employee licenses and certifications.</p>
          </div>
          <Button onClick={() => { setEditingAccreditation(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Accreditation
          </Button>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Authority</TableHead>
                    <TableHead>Expires On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accreditations.map(acc => {
                    const status = getStatus(acc.expiration_date);
                    return (
                      <TableRow key={acc.id}>
                        <TableCell className="font-medium">{getUserName(acc.user_email)}</TableCell>
                        <TableCell>{acc.license_name}</TableCell>
                        <TableCell>{acc.issuing_authority}</TableCell>
                        <TableCell>{format(new Date(acc.expiration_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={`${status.color} border`}>
                            <status.icon className="w-3 h-3 mr-1" />
                            {status.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          {acc.portal_link && (
                            <a href={acc.portal_link} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                            </a>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(acc)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <AccreditationForm
            accreditation={editingAccreditation}
            users={users}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}
