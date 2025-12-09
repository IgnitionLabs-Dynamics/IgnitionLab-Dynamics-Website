import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AuthDiagnostics() {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    localStorageAvailable: false,
    tokenExists: false,
    tokenLength: 0,
    userLoggedIn: false,
    browserInfo: '',
    timestamp: new Date().toISOString(),
  });

  const runDiagnostics = () => {
    const results = {
      timestamp: new Date().toISOString(),
      userLoggedIn: !!user,
      browserInfo: navigator.userAgent,
      localStorageAvailable: false,
      tokenExists: false,
      tokenLength: 0,
      cookiesEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
    };

    // Test localStorage
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      results.localStorageAvailable = true;

      // Check for token
      const token = localStorage.getItem('token');
      results.tokenExists = !!token;
      results.tokenLength = token ? token.length : 0;

      // Decode token to check expiry
      if (token) {
        try {
          const parts = token.split('.');
          const payload = parts[1] + '='.repeat((4 - (parts[1].length % 4)) % 4);
          const decoded = JSON.parse(atob(payload));
          results.tokenExpiry = new Date(decoded.exp * 1000).toISOString();
          results.tokenValid = decoded.exp * 1000 > Date.now();
        } catch (e) {
          results.tokenDecodeError = e.message;
        }
      }
    } catch (e) {
      results.localStorageError = e.message;
    }

    setDiagnostics(results);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const StatusIcon = ({ status }) => {
    if (status) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const DiagnosticRow = ({ label, value, status }) => (
    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded border border-zinc-800">
      <div className="flex items-center space-x-3">
        {status !== undefined && <StatusIcon status={status} />}
        {status === undefined && <AlertCircle className="w-5 h-5 text-yellow-500" />}
        <span className="text-zinc-300">{label}</span>
      </div>
      <span className="text-white font-mono text-sm">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-white mb-2">
            Authentication Diagnostics
          </h1>
          <p className="text-zinc-400">
            Use this page to troubleshoot "Remember Me" and login persistence issues.
          </p>
        </div>

        <div className="space-y-6">
          {/* User Status */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="font-heading text-2xl font-bold text-white mb-4">User Status</h2>
            <div className="space-y-3">
              <DiagnosticRow
                label="Logged In"
                value={diagnostics.userLoggedIn ? 'Yes' : 'No'}
                status={diagnostics.userLoggedIn}
              />
              {user && (
                <>
                  <DiagnosticRow
                    label="Username"
                    value={user.username}
                    status={true}
                  />
                  <DiagnosticRow
                    label="Role"
                    value={user.role}
                    status={true}
                  />
                </>
              )}
            </div>
          </div>

          {/* Storage Status */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="font-heading text-2xl font-bold text-white mb-4">Storage Status</h2>
            <div className="space-y-3">
              <DiagnosticRow
                label="localStorage Available"
                value={diagnostics.localStorageAvailable ? 'Yes' : 'No'}
                status={diagnostics.localStorageAvailable}
              />
              <DiagnosticRow
                label="Token Exists"
                value={diagnostics.tokenExists ? 'Yes' : 'No'}
                status={diagnostics.tokenExists}
              />
              {diagnostics.tokenExists && (
                <>
                  <DiagnosticRow
                    label="Token Length"
                    value={`${diagnostics.tokenLength} characters`}
                    status={diagnostics.tokenLength > 0}
                  />
                  {diagnostics.tokenExpiry && (
                    <>
                      <DiagnosticRow
                        label="Token Expires"
                        value={new Date(diagnostics.tokenExpiry).toLocaleString()}
                        status={diagnostics.tokenValid}
                      />
                      <DiagnosticRow
                        label="Token Valid"
                        value={diagnostics.tokenValid ? 'Yes (not expired)' : 'No (expired)'}
                        status={diagnostics.tokenValid}
                      />
                    </>
                  )}
                </>
              )}
              {diagnostics.localStorageError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                  <p className="text-red-400 text-sm">
                    <strong>Error:</strong> {diagnostics.localStorageError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Browser Status */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="font-heading text-2xl font-bold text-white mb-4">Browser Status</h2>
            <div className="space-y-3">
              <DiagnosticRow
                label="Cookies Enabled"
                value={diagnostics.cookiesEnabled ? 'Yes' : 'No'}
                status={diagnostics.cookiesEnabled}
              />
              <DiagnosticRow
                label="Online"
                value={diagnostics.online ? 'Yes' : 'No'}
                status={diagnostics.online}
              />
              <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800">
                <p className="text-zinc-400 text-xs mb-1">User Agent</p>
                <p className="text-zinc-300 text-xs font-mono break-all">
                  {diagnostics.browserInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="font-heading text-2xl font-bold text-white mb-4">Recommendations</h2>
            <div className="space-y-3 text-sm">
              {!diagnostics.localStorageAvailable && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded">
                  <p className="text-amber-400">
                    <strong>⚠️ localStorage is disabled.</strong> This usually happens in private/incognito mode. 
                    Please use regular browsing mode for "Remember Me" to work.
                  </p>
                </div>
              )}
              {!diagnostics.tokenExists && diagnostics.userLoggedIn && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded">
                  <p className="text-amber-400">
                    <strong>⚠️ No token found but user appears logged in.</strong> This is unusual. 
                    Try logging out and logging in again.
                  </p>
                </div>
              )}
              {diagnostics.tokenExists && !diagnostics.tokenValid && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded">
                  <p className="text-amber-400">
                    <strong>⚠️ Token has expired.</strong> You'll be logged out automatically. 
                    Check "Remember me" next time for a 30-day token.
                  </p>
                </div>
              )}
              {diagnostics.localStorageAvailable && diagnostics.tokenExists && diagnostics.tokenValid && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                  <p className="text-green-400">
                    <strong>✅ Everything looks good!</strong> Your authentication should persist correctly.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              onClick={runDiagnostics}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Diagnostics
            </Button>
            <Button
              onClick={() => {
                const data = JSON.stringify(diagnostics, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `auth-diagnostics-${Date.now()}.json`;
                a.click();
              }}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Export Report
            </Button>
          </div>

          <p className="text-zinc-500 text-xs">
            Last checked: {new Date(diagnostics.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
