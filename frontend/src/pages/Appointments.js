import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
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
import { formatDate } from '../lib/utils';
import { Calendar, Clock, Plus, User, Car, Check, X } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    appointment_date: '',
    appointment_time: '',
    service_type: '',
    notes: '',
    status: 'scheduled',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, customersRes, vehiclesRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/customers'),
        api.get('/vehicles'),
      ]);
      setAppointments(appointmentsRes.data);
      setCustomers(customersRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', formData);
      toast.success('Appointment scheduled successfully');
      setDialogOpen(false);
      setFormData({
        customer_id: '',
        vehicle_id: '',
        appointment_date: '',
        appointment_time: '',
        service_type: '',
        notes: '',
        status: 'scheduled',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Failed to schedule appointment');
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      toast.success(`Appointment ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
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
              Appointments
            </h1>
            <p className="text-zinc-400">Schedule and manage customer appointments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="schedule-appointment-button"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold text-white">
                  Schedule New Appointment
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_id" className="text-zinc-300">
                      Customer <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                      required
                    >
                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id} className="text-white">
                            {customer.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="vehicle_id" className="text-zinc-300">
                      Vehicle <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.vehicle_id}
                      onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                      required
                      disabled={!formData.customer_id}
                    >
                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {vehicles
                          .filter((v) => v.customer_id === formData.customer_id)
                          .map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id} className="text-white">
                              {vehicle.make} {vehicle.model} ({vehicle.registration_number})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="appointment_date" className="text-zinc-300">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="appointment_date"
                      data-testid="appointment-date-input"
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="appointment_time" className="text-zinc-300">
                      Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="appointment_time"
                      data-testid="appointment-time-input"
                      type="time"
                      value={formData.appointment_time}
                      onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="service_type" className="text-zinc-300">
                      Service Type <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="service_type"
                      data-testid="appointment-service-input"
                      value={formData.service_type}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                      placeholder="e.g., ECU Tuning, Diagnostics, Stage 1 Upgrade"
                      required
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
                      placeholder="Any special requirements or notes"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  data-testid="submit-appointment-button"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
                >
                  Schedule Appointment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map((appointment) => {
              const customer = customers.find((c) => c.id === appointment.customer_id);
              const vehicle = vehicles.find((v) => v.id === appointment.vehicle_id);

              return (
                <Card
                  key={appointment.id}
                  data-testid="appointment-card"
                  className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-white">
                            {appointment.service_type}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-zinc-400 mt-1">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(appointment.appointment_date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm mb-3">
                        {customer && (
                          <div className="flex items-center space-x-2 px-3 py-2 bg-zinc-800/30 rounded-sm">
                            <User className="w-4 h-4 text-blue-500" />
                            <span className="text-white">{customer.full_name}</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-400">{customer.phone_number}</span>
                          </div>
                        )}
                        {vehicle && (
                          <div className="flex items-center space-x-2 px-3 py-2 bg-zinc-800/30 rounded-sm">
                            <Car className="w-4 h-4 text-amber-500" />
                            <span className="text-white">
                              {vehicle.make} {vehicle.model}
                            </span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-400">{vehicle.registration_number}</span>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <p className="text-sm text-zinc-300 mt-2">{appointment.notes}</p>
                      )}
                    </div>

                    {/* Status Actions */}
                    <div className="flex space-x-2 ml-4">
                      {appointment.status === 'scheduled' && (
                        <Button
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          data-testid="confirm-appointment-button"
                          size="sm"
                          className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <>
                          <Button
                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                            size="sm"
                            className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20"
                          >
                            Complete
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            data-testid="cancel-appointment-button"
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">No appointments scheduled</h3>
              <p className="text-zinc-500 mb-4">Schedule your first appointment</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
