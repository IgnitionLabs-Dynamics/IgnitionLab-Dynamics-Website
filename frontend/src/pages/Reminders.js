import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';
import { Bell, Calendar, Check, X, Car, User } from 'lucide-react';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReminders();
  }, [filter]);

  const fetchReminders = async () => {
    try {
      const remindersRes = await api.get(`/reminders${filter !== 'all' ? `?status=${filter}` : ''}`);
      const remindersData = remindersRes.data;
      setReminders(remindersData);

      // Fetch vehicles and customers for reminders
      const vehicleIds = [...new Set(remindersData.map(r => r.vehicle_id))];
      const customerIds = [...new Set(remindersData.map(r => r.customer_id))];

      const [vehiclesRes, customersRes] = await Promise.all([
        Promise.all(vehicleIds.map(id => api.get(`/vehicles/${id}`).catch(() => null))),
        Promise.all(customerIds.map(id => api.get(`/customers/${id}`).catch(() => null))),
      ]);

      const vehiclesMap = {};
      vehiclesRes.forEach(res => {
        if (res?.data) vehiclesMap[res.data.id] = res.data;
      });

      const customersMap = {};
      customersRes.forEach(res => {
        if (res?.data) customersMap[res.data.id] = res.data;
      });

      setVehicles(vehiclesMap);
      setCustomers(customersMap);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reminderId, newStatus) => {
    try {
      await api.put(`/reminders/${reminderId}?status=${newStatus}`);
      toast.success(`Reminder marked as ${newStatus}`);
      fetchReminders();
    } catch (error) {
      console.error('Failed to update reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const getReminderTypeColor = (type) => {
    switch (type) {
      case 'follow_up':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'service':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'retune':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const isOverdue = (reminderDate) => {
    return new Date(reminderDate) < new Date();
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
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            Reminders
          </h1>
          <p className="text-zinc-400">Manage follow-ups, service reminders, and retunes</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <Button
            onClick={() => setFilter('pending')}
            data-testid="filter-pending-button"
            variant={filter === 'pending' ? 'default' : 'outline'}
            className={
              filter === 'pending'
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter('completed')}
            data-testid="filter-completed-button"
            variant={filter === 'completed' ? 'default' : 'outline'}
            className={
              filter === 'completed'
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }
          >
            Completed
          </Button>
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={
              filter === 'all'
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }
          >
            All
          </Button>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {reminders.length > 0 ? (
            reminders.map((reminder) => {
              const vehicle = vehicles[reminder.vehicle_id];
              const customer = customers[reminder.customer_id];
              const overdue = isOverdue(reminder.reminder_date) && reminder.status === 'pending';

              return (
                <Card
                  key={reminder.id}
                  data-testid="reminder-card"
                  className={`bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6 ${
                    overdue ? 'border-red-500/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                          <Bell className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getReminderTypeColor(reminder.reminder_type)}>
                              {reminder.reminder_type.replace('_', ' ')}
                            </Badge>
                            {reminder.status === 'completed' && (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                Completed
                              </Badge>
                            )}
                            {overdue && (
                              <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-zinc-400 space-x-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(reminder.reminder_date)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {reminder.message && (
                        <p className="text-white mb-3">{reminder.message}</p>
                      )}

                      {/* Vehicle & Customer Info */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        {vehicle && (
                          <Link
                            to={`/vehicles/${vehicle.id}`}
                            className="flex items-center space-x-2 px-3 py-2 bg-zinc-800/30 rounded-sm hover:bg-zinc-800/50 transition-colors"
                          >
                            <Car className="w-4 h-4 text-amber-500" />
                            <span className="text-white">
                              {vehicle.make} {vehicle.model} ({vehicle.registration_number})
                            </span>
                          </Link>
                        )}
                        {customer && (
                          <Link
                            to={`/customers/${customer.id}`}
                            className="flex items-center space-x-2 px-3 py-2 bg-zinc-800/30 rounded-sm hover:bg-zinc-800/50 transition-colors"
                          >
                            <User className="w-4 h-4 text-blue-500" />
                            <span className="text-white">{customer.full_name}</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {reminder.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <Button
                          onClick={() => handleStatusUpdate(reminder.id, 'completed')}
                          data-testid="mark-completed-button"
                          size="sm"
                          className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(reminder.id, 'cancelled')}
                          size="sm"
                          variant="outline"
                          className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
              <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">
                No {filter !== 'all' ? filter : ''} reminders
              </h3>
              <p className="text-zinc-500">Create a job with a reminder to get started</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
