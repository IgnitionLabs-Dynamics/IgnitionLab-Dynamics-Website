import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import api from '../lib/api';
import { toast } from 'sonner';
import { Plus, Phone, Mail, User, ChevronRight, Trash2 } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    instagram_handle: '',
    address: '',
    gst_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      toast.success('Customer created successfully');
      setDialogOpen(false);
      setFormData({
        full_name: '',
        phone_number: '',
        whatsapp_number: '',
        email: '',
        instagram_handle: '',
        address: '',
        gst_number: '',
        notes: '',
      });
      fetchCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
      toast.error('Failed to create customer');
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/customers/${customerId}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete customer');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              Customers
            </h1>
            <p className="text-zinc-400">Manage your customer database</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-customer-button"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold text-white">
                  Add New Customer
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="full_name" className="text-zinc-300">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      data-testid="customer-name-input"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone_number" className="text-zinc-300">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone_number"
                      data-testid="customer-phone-input"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp_number" className="text-zinc-300">
                      WhatsApp Number
                    </Label>
                    <Input
                      id="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram_handle" className="text-zinc-300">
                      Instagram Handle
                    </Label>
                    <Input
                      id="instagram_handle"
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      placeholder="@username"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address" className="text-zinc-300">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gst_number" className="text-zinc-300">
                      GST Number
                    </Label>
                    <Input
                      id="gst_number"
                      value={formData.gst_number}
                      onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes" className="text-zinc-300">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      rows={3}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  data-testid="submit-customer-button"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
                >
                  Create Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Customers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Link key={customer.id} to={`/customers/${customer.id}`}>
              <Card
                data-testid="customer-card"
                className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6 card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                    <User className="w-6 h-6 text-amber-500" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-3">
                  {customer.full_name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-zinc-400">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="font-mono">{customer.phone_number}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center text-sm text-zinc-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>
                {customer.notes && (
                  <p className="mt-3 text-xs text-zinc-500 truncate">{customer.notes}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>

        {customers.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
            <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No customers yet</h3>
            <p className="text-zinc-500 mb-4">Start by adding your first customer</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}