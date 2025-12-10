import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import api from '../lib/api';
import { toast } from 'sonner';
import { Briefcase, Calendar, User, Car, ChevronRight, CreditCard, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function Jobs() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  
  const [jobs, setJobs] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [customers, setCustomers] = useState({});
  const [billings, setBillings] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      // Fetch jobs, vehicles, customers, and billing data
      const [jobsRes, vehiclesRes, customersRes, billingsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/vehicles'),
        api.get('/customers'),
        api.get('/billing'),
      ]);

      // Create lookup maps
      const vehiclesMap = {};
      vehiclesRes.data.forEach(v => { vehiclesMap[v.id] = v; });
      
      const customersMap = {};
      customersRes.data.forEach(c => { customersMap[c.id] = c; });
      
      const billingsMap = {};
      billingsRes.data.forEach(b => { billingsMap[b.job_id] = b; });

      setVehicles(vehiclesMap);
      setCustomers(customersMap);
      setBillings(billingsMap);

      // Apply filters
      let filteredJobs = jobsRes.data;

      if (filter === 'this_week') {
        // Get current week (Monday to Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        // Adjust to Monday (0 = Sunday, 1 = Monday, ...)
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(now.getDate() + daysToMonday);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        filteredJobs = filteredJobs.filter(job => {
          const jobDate = new Date(job.date);
          return jobDate >= monday && jobDate <= sunday;
        });
      } else if (filter === 'pending_payments') {
        // Filter jobs with pending or partial payment status
        filteredJobs = filteredJobs.filter(job => {
          const billing = billingsMap[job.id];
          return billing && (billing.payment_status === 'pending' || billing.payment_status === 'partial');
        });
      }

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const getFilterTitle = () => {
    if (filter === 'this_week') return 'Jobs This Week';
    if (filter === 'pending_payments') return 'Jobs with Pending Payments';
    return 'All Jobs';
  };

  const getFilterDescription = () => {
    if (filter === 'this_week') return 'Jobs scheduled for the current calendar week';
    if (filter === 'pending_payments') return 'Jobs with pending or partial payment status';
    return 'Complete list of all jobs';
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
            {getFilterTitle()}
          </h1>
          <p className="text-zinc-400">{getFilterDescription()}</p>
          {filter && (
            <Link to="/jobs" className="text-amber-500 hover:text-amber-400 text-sm mt-2 inline-block">
              ← View All Jobs
            </Link>
          )}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const vehicle = vehicles[job.vehicle_id];
              const customer = customers[job.customer_id];
              const billing = billings[job.id];

              return (
                <Card
                  key={job.id}
                  className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6 card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-heading text-lg font-bold text-white">
                              Job #{job.id.slice(0, 8)}
                            </h3>
                            {job.tune_stage && (
                              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                                {job.tune_stage}
                              </span>
                            )}
                            {billing && (
                              <span
                                className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full ${
                                  billing.payment_status === 'paid'
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : billing.payment_status === 'partial'
                                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}
                              >
                                {billing.payment_status}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 mt-1">{job.work_performed || 'Tuning service'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-13">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          <div>
                            <p className="text-xs text-zinc-500">Date</p>
                            <p className="text-sm text-white">{formatDate(job.date)}</p>
                          </div>
                        </div>

                        {vehicle && (
                          <div className="flex items-center space-x-2">
                            <Car className="w-4 h-4 text-zinc-500" />
                            <div>
                              <p className="text-xs text-zinc-500">Vehicle</p>
                              <Link
                                to={`/vehicles/${vehicle.id}`}
                                className="text-sm text-amber-500 hover:text-amber-400"
                              >
                                {vehicle.make} {vehicle.model}
                              </Link>
                            </div>
                          </div>
                        )}

                        {customer && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-zinc-500" />
                            <div>
                              <p className="text-xs text-zinc-500">Customer</p>
                              <Link
                                to={`/customers/${customer.id}`}
                                className="text-sm text-amber-500 hover:text-amber-400"
                              >
                                {customer.full_name}
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mt-3 ml-13 text-xs text-zinc-500">
                        <span>Technician: {job.technician_name}</span>
                        {job.odometer_at_visit && <span>Odometer: {job.odometer_at_visit} km</span>}
                        {billing && (
                          <span className="flex items-center space-x-1">
                            <CreditCard className="w-3 h-3" />
                            <span>₹{billing.final_billed_amount}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {vehicle && (
                      <Link to={`/vehicles/${vehicle.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
              <Briefcase className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">
                {filter === 'this_week' ? 'No jobs this week' : filter === 'pending_payments' ? 'No pending payments' : 'No jobs yet'}
              </h3>
              <p className="text-zinc-500">
                {filter === 'this_week'
                  ? 'There are no jobs scheduled for the current week'
                  : filter === 'pending_payments'
                  ? 'All payments have been completed'
                  : 'Start by creating your first job'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
