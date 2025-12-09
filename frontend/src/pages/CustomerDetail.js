import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from '../components/ui/dialog';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  Car as CarIcon,
  Instagram,
  MessageCircle,
  FileText,
  Plus,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    instagram_handle: '',
    address: '',
    gst_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      const [customerRes, vehiclesRes] = await Promise.all([
        api.get(`/customers/${customerId}`),
        api.get(`/vehicles?customer_id=${customerId}`),
      ]);
      setCustomer(customerRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      full_name: customer.full_name || '',
      phone_number: customer.phone_number || '',
      whatsapp_number: customer.whatsapp_number || '',
      email: customer.email || '',
      instagram_handle: customer.instagram_handle || '',
      address: customer.address || '',
      gst_number: customer.gst_number || '',
      notes: customer.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/customers/${customerId}`, editFormData);
      toast.success('Customer updated successfully');
      setEditDialogOpen(false);
      fetchCustomerData();
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast.error('Failed to update customer');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Customer not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            onClick={() => navigate('/customers')}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                {customer.full_name}
              </h1>
              <p className="text-zinc-400">Customer Details</p>
            </div>
            <Button
              onClick={handleEditClick}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold uppercase tracking-wider"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
              <h2 className="font-heading text-xl font-bold text-white mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-amber-500 mr-3" />
                  <div>
                    <p className="text-xs text-zinc-500">Phone</p>
                    <p className="font-mono text-white">{customer.phone_number}</p>
                  </div>
                </div>
                {customer.whatsapp_number && (
                  <div className="flex items-center text-sm">
                    <MessageCircle className="w-4 h-4 text-green-500 mr-3" />
                    <div>
                      <p className="text-xs text-zinc-500">WhatsApp</p>
                      <p className="font-mono text-white">{customer.whatsapp_number}</p>
                    </div>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-blue-500 mr-3" />
                    <div>
                      <p className="text-xs text-zinc-500">Email</p>
                      <p className="text-white">{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer.instagram_handle && (
                  <div className="flex items-center text-sm">
                    <Instagram className="w-4 h-4 text-pink-500 mr-3" />
                    <div>
                      <p className="text-xs text-zinc-500">Instagram</p>
                      <p className="text-white">{customer.instagram_handle}</p>
                    </div>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 text-red-500 mr-3 mt-1" />
                    <div>
                      <p className="text-xs text-zinc-500">Address</p>
                      <p className="text-white">{customer.address}</p>
                    </div>
                  </div>
                )}
                {customer.gst_number && (
                  <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-xs text-zinc-500">GST Number</p>
                      <p className="font-mono text-white">{customer.gst_number}</p>
                    </div>
                  </div>
                )}
              </div>
              {customer.notes && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-2">Notes</p>
                  <p className="text-sm text-zinc-300">{customer.notes}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Vehicles */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
                Vehicles ({vehicles.length})
              </h2>
            </div>

            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`}>
                  <Card
                    data-testid="vehicle-card"
                    className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6 card-hover cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center flex-shrink-0">
                          <CarIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading text-xl font-bold text-white mb-2">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-zinc-500">Registration</p>
                              <p className="font-mono text-white">{vehicle.registration_number}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">VIN</p>
                              <p className="font-mono text-white text-xs">{vehicle.vin}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">ECU Type</p>
                              <p className="font-mono text-white text-xs">{vehicle.ecu_type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500">Year</p>
                              <p className="text-white">{vehicle.year}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}

              {vehicles.length === 0 && (
                <Card className="bg-zinc-900/50 border-zinc-800 p-8 text-center">
                  <CarIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400 mb-2">No vehicles yet</h3>
                  <p className="text-zinc-500 mb-4">Add a vehicle for this customer</p>
                  <Button
                    onClick={() => navigate('/vehicles')}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Edit Customer Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl font-bold text-white">
                Edit Customer Details
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="full_name" className="text-zinc-300">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number" className="text-zinc-300">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone_number"
                    value={editFormData.phone_number}
                    onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp_number" className="text-zinc-300">
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp_number"
                    value={editFormData.whatsapp_number}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp_number: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="email" className="text-zinc-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram_handle" className="text-zinc-300">
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram_handle"
                    value={editFormData.instagram_handle}
                    onChange={(e) => setEditFormData({ ...editFormData, instagram_handle: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <Label htmlFor="gst_number" className="text-zinc-300">
                    GST Number
                  </Label>
                  <Input
                    id="gst_number"
                    value={editFormData.gst_number}
                    onChange={(e) => setEditFormData({ ...editFormData, gst_number: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address" className="text-zinc-300">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes" className="text-zinc-300">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500 text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-bold uppercase tracking-wider"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditDialogOpen(false)}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}