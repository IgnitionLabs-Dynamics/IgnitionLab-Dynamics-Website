import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import api from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CreateJob() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicle_id');

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [jobData, setJobData] = useState({
    customer_id: '',
    vehicle_id: preselectedVehicleId || '',
    date: new Date().toISOString().split('T')[0],
    technician_name: '',
    work_performed: '',
    tune_stage: '',
    mods_installed: '',
    dyno_results: '',
    before_ecu_map_version: '',
    after_ecu_map_version: '',
    calibration_notes: '',
    road_test_notes: '',
    next_recommendations: '',
    warranty_or_retune_status: '',
    odometer_at_visit: '',
  });

  const [billingData, setBillingData] = useState({
    quoted_amount: '',
    final_billed_amount: '',
    payment_method: '',
    payment_status: 'pending',
    gst_invoice_number: '',
    discounts: '',
    notes: '',
  });

  const [reminderData, setReminderData] = useState({
    reminder_type: 'follow_up',
    reminder_date: '',
    message: '',
  });

  const [createReminder, setCreateReminder] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (preselectedVehicleId && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === preselectedVehicleId);
      if (vehicle) {
        setJobData(prev => ({ ...prev, customer_id: vehicle.customer_id }));
      }
    }
  }, [preselectedVehicleId, vehicles]);

  useEffect(() => {
    if (jobData.customer_id) {
      const filtered = vehicles.filter(v => v.customer_id === jobData.customer_id);
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [jobData.customer_id, vehicles]);

  const fetchData = async () => {
    try {
      const [customersRes, vehiclesRes] = await Promise.all([
        api.get('/customers'),
        api.get('/vehicles'),
      ]);
      setCustomers(customersRes.data);
      setVehicles(vehiclesRes.data);
      setFilteredVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create job
      const jobPayload = {
        ...jobData,
        odometer_at_visit: jobData.odometer_at_visit ? parseInt(jobData.odometer_at_visit) : null,
      };
      const jobResponse = await api.post('/jobs', jobPayload);
      const createdJob = jobResponse.data;

      // Create billing if amounts are provided
      if (billingData.final_billed_amount) {
        await api.post('/billing', {
          job_id: createdJob.id,
          quoted_amount: parseFloat(billingData.quoted_amount) || parseFloat(billingData.final_billed_amount),
          final_billed_amount: parseFloat(billingData.final_billed_amount),
          payment_method: billingData.payment_method,
          payment_status: billingData.payment_status,
          gst_invoice_number: billingData.gst_invoice_number || null,
          discounts: billingData.discounts ? parseFloat(billingData.discounts) : null,
          notes: billingData.notes || null,
        });
      }

      // Create reminder if requested
      if (createReminder && reminderData.reminder_date) {
        await api.post('/reminders', {
          vehicle_id: jobData.vehicle_id,
          customer_id: jobData.customer_id,
          job_id: createdJob.id,
          reminder_type: reminderData.reminder_type,
          reminder_date: reminderData.reminder_date,
          message: reminderData.message || `Follow-up for job #${createdJob.id.slice(0, 8)}`,
        });
      }

      toast.success('Job created successfully!');
      navigate(`/vehicles/${jobData.vehicle_id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            Create New Job
          </h1>
          <p className="text-zinc-400">Log a new job for a vehicle</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
            <h2 className="font-heading text-xl font-bold text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_id" className="text-zinc-300">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={jobData.customer_id}
                  onValueChange={(value) => {
                    setJobData({ ...jobData, customer_id: value, vehicle_id: '' });
                  }}
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
                  value={jobData.vehicle_id}
                  onValueChange={(value) => setJobData({ ...jobData, vehicle_id: value })}
                  required
                  disabled={!jobData.customer_id}
                >
                  <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {filteredVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id} className="text-white">
                        {vehicle.make} {vehicle.model} ({vehicle.registration_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="text-zinc-300">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  data-testid="job-date-input"
                  type="date"
                  value={jobData.date}
                  onChange={(e) => setJobData({ ...jobData, date: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="technician_name" className="text-zinc-300">
                  Technician Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="technician_name"
                  data-testid="job-technician-input"
                  value={jobData.technician_name}
                  onChange={(e) => setJobData({ ...jobData, technician_name: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tune_stage" className="text-zinc-300">
                  Tune Stage
                </Label>
                <Input
                  id="tune_stage"
                  data-testid="job-tune-stage-input"
                  value={jobData.tune_stage}
                  onChange={(e) => setJobData({ ...jobData, tune_stage: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  placeholder="e.g., Stage 1, Stage 2+"
                />
              </div>

              <div>
                <Label htmlFor="odometer_at_visit" className="text-zinc-300">
                  Odometer (km)
                </Label>
                <Input
                  id="odometer_at_visit"
                  type="number"
                  value={jobData.odometer_at_visit}
                  onChange={(e) => setJobData({ ...jobData, odometer_at_visit: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  placeholder="Current odometer reading"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="work_performed" className="text-zinc-300">
                  Work Performed
                </Label>
                <Textarea
                  id="work_performed"
                  data-testid="job-work-performed-input"
                  value={jobData.work_performed}
                  onChange={(e) => setJobData({ ...jobData, work_performed: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Technical Details */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
            <h2 className="font-heading text-xl font-bold text-white mb-4">Technical Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mods_installed" className="text-zinc-300">
                  Mods Installed
                </Label>
                <Textarea
                  id="mods_installed"
                  value={jobData.mods_installed}
                  onChange={(e) => setJobData({ ...jobData, mods_installed: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="dyno_results" className="text-zinc-300">
                  Dyno Results
                </Label>
                <Textarea
                  id="dyno_results"
                  value={jobData.dyno_results}
                  onChange={(e) => setJobData({ ...jobData, dyno_results: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                  rows={2}
                  placeholder="e.g., 150hp / 200Nm"
                />
              </div>

              <div>
                <Label htmlFor="before_ecu_map_version" className="text-zinc-300">
                  Before ECU Map Version
                </Label>
                <Input
                  id="before_ecu_map_version"
                  value={jobData.before_ecu_map_version}
                  onChange={(e) => setJobData({ ...jobData, before_ecu_map_version: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                  placeholder="e.g., Stock_v1.0"
                />
              </div>

              <div>
                <Label htmlFor="after_ecu_map_version" className="text-zinc-300">
                  After ECU Map Version
                </Label>
                <Input
                  id="after_ecu_map_version"
                  value={jobData.after_ecu_map_version}
                  onChange={(e) => setJobData({ ...jobData, after_ecu_map_version: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                  placeholder="e.g., Stage1_v1.2"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="calibration_notes" className="text-zinc-300">
                  Calibration Notes
                </Label>
                <Textarea
                  id="calibration_notes"
                  value={jobData.calibration_notes}
                  onChange={(e) => setJobData({ ...jobData, calibration_notes: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="road_test_notes" className="text-zinc-300">
                  Road Test Notes
                </Label>
                <Textarea
                  id="road_test_notes"
                  value={jobData.road_test_notes}
                  onChange={(e) => setJobData({ ...jobData, road_test_notes: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="next_recommendations" className="text-zinc-300">
                  Next Recommendations
                </Label>
                <Textarea
                  id="next_recommendations"
                  value={jobData.next_recommendations}
                  onChange={(e) => setJobData({ ...jobData, next_recommendations: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="warranty_or_retune_status" className="text-zinc-300">
                  Warranty / Retune Status
                </Label>
                <Input
                  id="warranty_or_retune_status"
                  value={jobData.warranty_or_retune_status}
                  onChange={(e) => setJobData({ ...jobData, warranty_or_retune_status: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  placeholder="e.g., Under warranty, Free retune"
                />
              </div>
            </div>
          </Card>

          {/* Billing */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
            <h2 className="font-heading text-xl font-bold text-white mb-4">Billing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quoted_amount" className="text-zinc-300">
                  Quoted Amount (₹)
                </Label>
                <Input
                  id="quoted_amount"
                  data-testid="billing-quoted-amount-input"
                  type="number"
                  value={billingData.quoted_amount}
                  onChange={(e) => setBillingData({ ...billingData, quoted_amount: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                />
              </div>

              <div>
                <Label htmlFor="final_billed_amount" className="text-zinc-300">
                  Final Billed Amount (₹)
                </Label>
                <Input
                  id="final_billed_amount"
                  data-testid="billing-final-amount-input"
                  type="number"
                  value={billingData.final_billed_amount}
                  onChange={(e) => setBillingData({ ...billingData, final_billed_amount: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                />
              </div>

              <div>
                <Label htmlFor="payment_method" className="text-zinc-300">
                  Payment Method
                </Label>
                <Select
                  value={billingData.payment_method}
                  onValueChange={(value) => setBillingData({ ...billingData, payment_method: value })}
                >
                  <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="cash" className="text-white">Cash</SelectItem>
                    <SelectItem value="upi" className="text-white">UPI</SelectItem>
                    <SelectItem value="card" className="text-white">Card</SelectItem>
                    <SelectItem value="bank_transfer" className="text-white">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment_status" className="text-zinc-300">
                  Payment Status
                </Label>
                <Select
                  value={billingData.payment_status}
                  onValueChange={(value) => setBillingData({ ...billingData, payment_status: value })}
                >
                  <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="paid" className="text-white">Paid</SelectItem>
                    <SelectItem value="pending" className="text-white">Pending</SelectItem>
                    <SelectItem value="partial" className="text-white">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gst_invoice_number" className="text-zinc-300">
                  GST Invoice Number
                </Label>
                <Input
                  id="gst_invoice_number"
                  value={billingData.gst_invoice_number}
                  onChange={(e) => setBillingData({ ...billingData, gst_invoice_number: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white font-mono"
                />
              </div>

              <div>
                <Label htmlFor="discounts" className="text-zinc-300">
                  Discounts (₹)
                </Label>
                <Input
                  id="discounts"
                  type="number"
                  value={billingData.discounts}
                  onChange={(e) => setBillingData({ ...billingData, discounts: e.target.value })}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                />
              </div>
            </div>
          </Card>

          {/* Reminder (Optional) */}
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-white">Set Reminder (Optional)</h2>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createReminder}
                  onChange={(e) => setCreateReminder(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-zinc-300">Create reminder</span>
              </label>
            </div>
            {createReminder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminder_type" className="text-zinc-300">
                    Reminder Type
                  </Label>
                  <Select
                    value={reminderData.reminder_type}
                    onValueChange={(value) => setReminderData({ ...reminderData, reminder_type: value })}
                  >
                    <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="follow_up" className="text-white">Follow-up</SelectItem>
                      <SelectItem value="service" className="text-white">Service</SelectItem>
                      <SelectItem value="retune" className="text-white">Retune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reminder_date" className="text-zinc-300">
                    Reminder Date
                  </Label>
                  <Input
                    id="reminder_date"
                    type="date"
                    value={reminderData.reminder_date}
                    onChange={(e) => setReminderData({ ...reminderData, reminder_date: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="reminder_message" className="text-zinc-300">
                    Message
                  </Label>
                  <Textarea
                    id="reminder_message"
                    value={reminderData.message}
                    onChange={(e) => setReminderData({ ...reminderData, message: e.target.value })}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-amber-500 text-white"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="submit-job-button"
              disabled={submitting}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
            >
              {submitting ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}