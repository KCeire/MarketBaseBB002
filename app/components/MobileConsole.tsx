"use client";

import { useState, useEffect, useRef } from 'react';

interface ConsoleLog {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
}

export function MobileConsole() {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show console in all environments for debugging
    console.log('🔧 Mobile console viewer initialized');

    // Store original console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Create log capturing function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createLogCapture = (type: ConsoleLog['type'], originalMethod: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) => {
        // Call original method first
        originalMethod.apply(console, args);

        // Capture the log
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const newLog: ConsoleLog = {
          id: ++logIdRef.current,
          type,
          message,
          timestamp: new Date().toLocaleTimeString()
        };

        setLogs(prev => {
          const updated = [...prev, newLog];
          // Keep only last 100 logs to prevent memory issues
          return updated.slice(-100);
        });
      };
    };

    // Override console methods
    console.log = createLogCapture('log', originalLog);
    console.error = createLogCapture('error', originalError);
    console.warn = createLogCapture('warn', originalWarn);
    console.info = createLogCapture('info', originalInfo);

    // Cleanup function to restore original console methods
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current && isVisible && !isMinimized) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isVisible, isMinimized]);

  const getLogStyle = (type: ConsoleLog['type']) => {
    const baseStyle = "text-xs font-mono p-1 border-b border-gray-200 dark:border-gray-700";
    switch (type) {
      case 'error':
        return `${baseStyle} bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'warn':
        return `${baseStyle} bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'info':
        return `${baseStyle} bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default:
        return `${baseStyle} bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200`;
    }
  };

  return (
    <>
      {/* Floating console button */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-20 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Open Mobile Console"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-3 3v-3H4a1 1 0 01-1-1V5z" clipRule="evenodd" />
          </svg>
          {logs.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {logs.length > 99 ? '99+' : logs.length}
            </span>
          )}
        </button>
      )}

      {/* Console overlay */}
      {isVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className={`bg-white dark:bg-gray-900 w-full transition-all duration-300 ${
            isMinimized ? 'h-12' : 'h-96'
          } border-t border-gray-200 dark:border-gray-700`}>
            {/* Console header */}
            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Mobile Console ({logs.length} logs)
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    {isMinimized ? (
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Clear logs"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l2.293 2.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Close console"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Console content */}
            {!isMinimized && (
              <div
                ref={logContainerRef}
                className="h-80 overflow-y-auto bg-white dark:bg-gray-900"
              >
                {logs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No console logs yet. Start testing to see logs here!
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className={getLogStyle(log.type)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 whitespace-pre-wrap break-words">
                          <span className="text-gray-500 dark:text-gray-400 mr-2">
                            {log.timestamp}
                          </span>
                          <span className={`font-semibold mr-2 ${
                            log.type === 'error' ? 'text-red-600 dark:text-red-400' :
                            log.type === 'warn' ? 'text-yellow-600 dark:text-yellow-400' :
                            log.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`}>
                            [{log.type.toUpperCase()}]
                          </span>
                          {log.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}