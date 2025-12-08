import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import api from '../lib/api';
import { toast } from 'sonner';
import { formatDate, formatCurrency, generateWhatsAppMessage, copyToClipboard } from '../lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  ArrowLeft,
  Car as CarIcon,
  Calendar,
  Gauge,
  Wrench,
  FileText,
  CreditCard,
  QrCode,
  Copy,
  MessageCircle,
  User,
  Download
} from 'lucide-react';

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [tuneRevisions, setTuneRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicleData();
  }, [vehicleId]);

  const fetchVehicleData = async () => {
    try {
      const vehicleRes = await api.get(`/vehicles/${vehicleId}`);
      const vehicleData = vehicleRes.data;
      setVehicle(vehicleData);

      const [customerRes, jobsRes, revisionsRes] = await Promise.all([
        api.get(`/customers/${vehicleData.customer_id}`),
        api.get(`/jobs?vehicle_id=${vehicleId}`),
        api.get(`/tune-revisions?vehicle_id=${vehicleId}`),
      ]);

      setCustomer(customerRes.data);
      setJobs(jobsRes.data);
      setTuneRevisions(revisionsRes.data);
    } catch (error) {
      console.error('Failed to fetch vehicle data:', error);
      toast.error('Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQR = () => {
    if (vehicle?.qr_code) {
      toast.success('QR code image copied to clipboard');
    }
  };

  const handleCopyWhatsAppMessage = (job) => {
    const message = generateWhatsAppMessage(customer, vehicle, job);
    copyToClipboard(message)
      .then(() => toast.success('WhatsApp message copied to clipboard!'))
      .catch(() => toast.error('Failed to copy message'));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Vehicle not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            onClick={() => navigate('/vehicles')}
            variant="ghost"
            className="text-zinc-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicles
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-zinc-400">{vehicle.variant} • {vehicle.year}</p>
            </div>
            <Button
              onClick={() => navigate(`/jobs/create?vehicle_id=${vehicle.id}`)}
              data-testid="create-job-for-vehicle-button"
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
            >
              + New Job
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vehicle & Customer Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Vehicle Technical Details */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
              <h2 className="font-heading text-xl font-bold text-white mb-4">Technical Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">Registration Number</p>
                  <p className="font-mono text-white text-lg">{vehicle.registration_number}</p>
                </div>
                <Separator className="bg-zinc-800" />
                <div>
                  <p className="text-xs text-zinc-500">VIN</p>
                  <p className="font-mono text-white text-xs break-all">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Engine Code</p>
                  <p className="font-mono text-amber-500">{vehicle.engine_code}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">ECU Type</p>
                  <p className="font-mono text-amber-500 text-xs">{vehicle.ecu_type}</p>
                </div>
                <Separator className="bg-zinc-800" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">Fuel Type</p>
                    <p className="text-white">{vehicle.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Gearbox</p>
                    <p className="text-white">{vehicle.gearbox}</p>
                  </div>
                </div>
                {vehicle.odometer_at_last_visit && (
                  <div>
                    <p className="text-xs text-zinc-500">Last Odometer</p>
                    <p className="text-white">{vehicle.odometer_at_last_visit.toLocaleString()} km</p>
                  </div>
                )}
                {vehicle.notes && (
                  <>
                    <Separator className="bg-zinc-800" />
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Notes</p>
                      <p className="text-zinc-300 text-sm">{vehicle.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Customer Info */}
            {customer && (
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
                <h2 className="font-heading text-xl font-bold text-white mb-4">Owner</h2>
                <Link to={`/customers/${customer.id}`} className="block">
                  <div className="flex items-center space-x-3 p-3 bg-zinc-800/30 rounded-sm hover:bg-zinc-800/50 transition-colors">
                    <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{customer.full_name}</p>
                      <p className="text-xs text-zinc-400 font-mono">{customer.phone_number}</p>
                    </div>
                  </div>
                </Link>
              </Card>
            )}

            {/* QR Code */}
            {vehicle.qr_code && (
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
                <h2 className="font-heading text-xl font-bold text-white mb-4">QR Code</h2>
                <div className="flex flex-col items-center space-y-3">
                  <img src={vehicle.qr_code} alt="Vehicle QR Code" className="w-48 h-48 bg-white p-2 rounded-sm" />
                  <p className="text-xs text-zinc-500 text-center">Scan to open vehicle details</p>
                  <Button
                    onClick={handleCopyQR}
                    variant="outline"
                    size="sm"
                    className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Save QR Code
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Job History & Tune Revisions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tune Revisions */}
            {tuneRevisions.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-white tracking-tight mb-4">
                  Tune Revision History ({tuneRevisions.length})
                </h2>
                <div className="space-y-3">
                  {tuneRevisions.map((revision, index) => (
                    <Card
                      key={revision.id}
                      data-testid="tune-revision-card"
                      className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-mono text-lg text-amber-500 font-bold">
                              {revision.revision_label}
                            </span>
                            {index === 0 && (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                Latest
                              </Badge>
                            )}
                          </div>
                          {revision.description && (
                            <p className="text-sm text-zinc-300 mb-2">{revision.description}</p>
                          )}
                          {revision.diff_notes && (
                            <p className="text-xs text-zinc-500 italic">{revision.diff_notes}</p>
                          )}
                          <p className="text-xs text-zinc-600 mt-2">{formatDate(revision.created_at)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Job History Timeline */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight mb-4">
                Job History ({jobs.length})
              </h2>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Card
                      key={job.id}
                      data-testid="job-card"
                      className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6"
                    >
                      <div className="space-y-4">
                        {/* Job Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-mono text-sm text-zinc-400">
                                #{job.id.slice(0, 8)}
                              </span>
                              {job.tune_stage && (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase">
                                  {job.tune_stage}
                                </Badge>
                              )}
                              {job.warranty_or_retune_status && (
                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                  {job.warranty_or_retune_status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-zinc-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(job.date)}
                              </div>
                              <div className="flex items-center">
                                <Wrench className="w-4 h-4 mr-1" />
                                {job.technician_name}
                              </div>
                              {job.odometer_at_visit && (
                                <div className="flex items-center">
                                  <Gauge className="w-4 h-4 mr-1" />
                                  {job.odometer_at_visit.toLocaleString()} km
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleCopyWhatsAppMessage(job)}
                            data-testid="copy-whatsapp-message-button"
                            variant="outline"
                            size="sm"
                            className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Copy WhatsApp
                          </Button>
                        </div>

                        <Separator className="bg-zinc-800" />

                        {/* Work Performed */}
                        {job.work_performed && (
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Work Performed</p>
                            <p className="text-sm text-white">{job.work_performed}</p>
                          </div>
                        )}

                        {/* Grid of Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {job.mods_installed && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">Mods Installed</p>
                              <p className="text-white">{job.mods_installed}</p>
                            </div>
                          )}
                          {job.dyno_results && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">Dyno Results</p>
                              <p className="text-amber-500 font-mono">{job.dyno_results}</p>
                            </div>
                          )}
                          {job.before_ecu_map_version && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">Before ECU Map</p>
                              <p className="text-white font-mono text-xs">{job.before_ecu_map_version}</p>
                            </div>
                          )}
                          {job.after_ecu_map_version && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">After ECU Map</p>
                              <p className="text-green-500 font-mono text-xs">{job.after_ecu_map_version}</p>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {(job.calibration_notes || job.road_test_notes || job.next_recommendations) && (
                          <>
                            <Separator className="bg-zinc-800" />
                            <div className="space-y-2 text-sm">
                              {job.calibration_notes && (
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Calibration Notes</p>
                                  <p className="text-zinc-300">{job.calibration_notes}</p>
                                </div>
                              )}
                              {job.road_test_notes && (
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Road Test Notes</p>
                                  <p className="text-zinc-300">{job.road_test_notes}</p>
                                </div>
                              )}
                              {job.next_recommendations && (
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Next Recommendations</p>
                                  <p className="text-amber-500">{job.next_recommendations}</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400 mb-2">No jobs yet</h3>
                  <p className="text-zinc-500 mb-4">Create a job for this vehicle</p>
                  <Button
                    onClick={() => navigate(`/jobs/create?vehicle_id=${vehicle.id}`)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider btn-glow"
                  >
                    Create First Job
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
