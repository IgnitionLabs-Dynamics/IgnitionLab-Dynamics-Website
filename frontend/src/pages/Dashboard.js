import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import api from '../lib/api';
import { formatDate, formatCurrency } from '../lib/utils';
import {
  Briefcase,
  CreditCard,
  Bell,
  Users,
  Car,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomePeriod, setIncomePeriod] = useState('weekly'); // weekly, monthly, all_time

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Loading...</div>
      </DashboardLayout>
    );
  }

  // Get income value based on selected period
  const getIncomeValue = () => {
    if (!stats) return 0;
    switch (incomePeriod) {
      case 'weekly':
        return stats.weekly_income || 0;
      case 'monthly':
        return stats.monthly_income || 0;
      case 'all_time':
        return stats.all_time_income || 0;
      default:
        return 0;
    }
  };

  const getIncomeLabel = () => {
    switch (incomePeriod) {
      case 'weekly':
        return 'Weekly Income';
      case 'monthly':
        return 'Monthly Income';
      case 'all_time':
        return 'All-Time Income';
      default:
        return 'Income';
    }
  };

  const statCards = [
    {
      title: 'Jobs This Week',
      value: stats?.jobs_this_week || 0,
      icon: Briefcase,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Pending Payments',
      value: stats?.pending_payments || 0,
      icon: CreditCard,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Upcoming Reminders',
      value: stats?.upcoming_reminders || 0,
      icon: Bell,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Total Customers',
      value: stats?.total_customers || 0,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Total Vehicles',
      value: stats?.total_vehicles || 0,
      icon: Car,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-400">Overview of your workshop operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const getNavigationPath = (title) => {
              switch (title) {
                case 'Jobs This Week':
                  return '/jobs?filter=this_week';
                case 'Pending Payments':
                  return '/jobs?filter=pending_payments';
                case 'Upcoming Reminders':
                  return '/reminders';
                case 'Total Customers':
                  return '/customers';
                case 'Total Vehicles':
                  return '/vehicles';
                default:
                  return '/';
              }
            };

            return (
              <Link key={stat.title} to={getNavigationPath(stat.title)}>
                <Card
                  data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6 card-hover ${stat.borderColor} cursor-pointer transition-transform hover:scale-105`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">{stat.title}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-sm ${stat.bgColor} ${stat.borderColor} border`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
              Recent Jobs
            </h2>
            <Link
              to="/vehicles"
              className="text-amber-500 hover:text-amber-400 flex items-center text-sm font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recent_jobs && stats.recent_jobs.length > 0 ? (
              stats.recent_jobs.map((job) => (
                <Link key={job.id} to={`/vehicle/${job.vehicle_id}`}>
                  <Card
                    data-testid="recent-job-card"
                    className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-4 card-hover cursor-pointer transition-transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <span className="font-mono text-sm text-white">
                            Job #{job.id.slice(0, 8)}
                          </span>
                          {job.tune_stage && (
                            <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                              {job.tune_stage}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">
                          {job.work_performed || 'Tuning service'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Technician: {job.technician_name} • {formatDate(job.date)}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800 p-8 text-center">
                <p className="text-zinc-400">No recent jobs</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}