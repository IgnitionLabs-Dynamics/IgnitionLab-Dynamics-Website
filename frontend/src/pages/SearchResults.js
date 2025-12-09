import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import api from '../lib/api';
import { toast } from 'sonner';
import { Search, User, Car, Phone, Mail, ChevronRight } from 'lucide-react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState({ customers: [], vehicles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/search/${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const totalResults = (results.customers?.length || 0) + (results.vehicles?.length || 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-zinc-400">Searching...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Search className="w-8 h-8 text-amber-500" />
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tighter">
              Search Results
            </h1>
          </div>
          <p className="text-zinc-400">
            Found <span className="text-amber-500 font-bold">{totalResults}</span> results for "{query}"
          </p>
        </div>

        {totalResults === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No results found</h3>
            <p className="text-zinc-500">
              Try searching with different keywords like customer name, phone, vehicle registration, VIN, engine code, or ECU type
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Customers Section */}
            {results.customers && results.customers.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-4 flex items-center">
                  <User className="w-6 h-6 mr-2 text-green-500" />
                  Customers ({results.customers.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.customers.map((customer) => (
                    <Link key={customer.id} to={`/customers/${customer.id}`}>
                      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-5 card-hover cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-sm flex items-center justify-center">
                                <User className="w-5 h-5 text-green-500" />
                              </div>
                              <div>
                                <h3 className="font-heading text-lg font-bold text-white">
                                  {customer.full_name}
                                </h3>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              {customer.phone_number && (
                                <div className="flex items-center text-zinc-400">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {customer.phone_number}
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center text-zinc-400">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-600" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicles Section */}
            {results.vehicles && results.vehicles.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-4 flex items-center">
                  <Car className="w-6 h-6 mr-2 text-amber-500" />
                  Vehicles ({results.vehicles.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.vehicles.map((vehicle) => (
                    <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`}>
                      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-5 card-hover cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-sm flex items-center justify-center">
                            <Car className="w-5 h-5 text-amber-500" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-600" />
                        </div>
                        
                        <h3 className="font-heading text-lg font-bold text-white mb-3">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-xs text-zinc-500">Registration</p>
                            <p className="font-mono text-white">{vehicle.registration_number}</p>
                          </div>
                          
                          {vehicle.engine_code && (
                            <div>
                              <p className="text-xs text-zinc-500">Engine Code</p>
                              <p className="font-mono text-xs text-blue-400">{vehicle.engine_code}</p>
                            </div>
                          )}
                          
                          {vehicle.ecu_type && (
                            <div>
                              <p className="text-xs text-zinc-500">ECU Type</p>
                              <p className="font-mono text-xs text-amber-500">{vehicle.ecu_type}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
