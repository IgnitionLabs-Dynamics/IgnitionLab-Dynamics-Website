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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import api from '../lib/api';
import { toast } from 'sonner';
import { Plus, Car, ChevronRight, Trash2 } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    make: '',
    model: '',
    variant: '',
    engine_code: '',
    ecu_type: '',
    vin: '',
    registration_number: '',
    year: new Date().getFullYear(),
    fuel_type: '',
    gearbox: '',
    odometer_at_last_visit: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, customersRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/customers'),
      ]);
      setVehicles(vehiclesRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        ...formData,
        year: parseInt(formData.year),
        odometer_at_last_visit: formData.odometer_at_last_visit ? parseInt(formData.odometer_at_last_visit) : null,
      });
      toast.success('Vehicle created successfully');
      setDialogOpen(false);
      setFormData({
        customer_id: '',
        make: '',
        model: '',
        variant: '',
        engine_code: '',
        ecu_type: '',
        vin: '',
        registration_number: '',
        year: new Date().getFullYear(),
        fuel_type: '',
        gearbox: '',
        odometer_at_last_visit: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      toast.error('Failed to create vehicle');
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
              Vehicles
            </h1>
            <p className="text-zinc-400">Manage your vehicle database</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-vehicle-button"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold text-white">
                  Add New Vehicle
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="customer_id" className="text-zinc-300">
                      Customer <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                      required
                    >
                      <SelectTrigger data-testid="vehicle-customer-select" className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id} className="text-white hover:bg-zinc-800">
                            {customer.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="make" className="text-zinc-300">
                      Make <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="make"
                      data-testid="vehicle-make-input"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      placeholder="e.g., Maruti"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model" className="text-zinc-300">
                      Model <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="model"
                      data-testid="vehicle-model-input"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      placeholder="e.g., Swift"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="variant" className="text-zinc-300">
                      Variant <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="variant"
                      value={formData.variant}
                      onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      placeholder="e.g., ZXi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-zinc-300">
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="engine_code" className="text-zinc-300">
                      Engine Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="engine_code"
                      value={formData.engine_code}
                      onChange={(e) => setFormData({ ...formData, engine_code: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                      placeholder="e.g., K12M"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ecu_type" className="text-zinc-300">
                      ECU Type <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ecu_type"
                      data-testid="vehicle-ecu-input"
                      value={formData.ecu_type}
                      onChange={(e) => setFormData({ ...formData, ecu_type: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                      placeholder="e.g., Bosch ME17.9.64"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vin" className="text-zinc-300">
                      VIN <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vin"
                      data-testid="vehicle-vin-input"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                      placeholder="17-character VIN"
                      maxLength={17}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration_number" className="text-zinc-300">
                      Registration Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="registration_number"
                      data-testid="vehicle-reg-input"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                      placeholder="e.g., MH01AB1234"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuel_type" className="text-zinc-300">
                      Fuel Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.fuel_type}
                      onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                      required
                    >
                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="Petrol" className="text-white">Petrol</SelectItem>
                        <SelectItem value="Diesel" className="text-white">Diesel</SelectItem>
                        <SelectItem value="CNG" className="text-white">CNG</SelectItem>
                        <SelectItem value="Electric" className="text-white">Electric</SelectItem>
                        <SelectItem value="Hybrid" className="text-white">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gearbox" className="text-zinc-300">
                      Gearbox <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.gearbox}
                      onValueChange={(value) => setFormData({ ...formData, gearbox: value })}
                      required
                    >
                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                        <SelectValue placeholder="Select gearbox" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="Manual" className="text-white">Manual</SelectItem>
                        <SelectItem value="Automatic" className="text-white">Automatic</SelectItem>
                        <SelectItem value="AMT" className="text-white">AMT</SelectItem>
                        <SelectItem value="DCT" className="text-white">DCT</SelectItem>
                        <SelectItem value="CVT" className="text-white">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="odometer_at_last_visit" className="text-zinc-300">
                      Odometer (km)
                    </Label>
                    <Input
                      id="odometer_at_last_visit"
                      type="number"
                      value={formData.odometer_at_last_visit}
                      onChange={(e) => setFormData({ ...formData, odometer_at_last_visit: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      placeholder="Current odometer reading"
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
                  data-testid="submit-vehicle-button"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
                >
                  Create Vehicle
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vehicles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`}>
              <Card
                data-testid="vehicle-card"
                className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6 card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                    <Car className="w-6 h-6 text-amber-500" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-3">
                  {vehicle.make} {vehicle.model}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500">Registration</p>
                    <p className="font-mono text-white">{vehicle.registration_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">ECU Type</p>
                    <p className="font-mono text-xs text-amber-500">{vehicle.ecu_type}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {vehicles.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
            <Car className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No vehicles yet</h3>
            <p className="text-zinc-500 mb-4">Start by adding your first vehicle</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}