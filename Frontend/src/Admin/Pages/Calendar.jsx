import React, { useState, useEffect, useRef } from 'react';
import { Calendar as RBCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const localizer = momentLocalizer(moment);

const HolidayFormModal = ({ 
  show, 
  onClose, 
  holidayForm, 
  onFormChange, 
  onDateChange, 
  onSave, 
  onDelete, 
  selectedEvent,
  inputRef
}) => {
  if (!show) return null;

  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {selectedEvent ? 'Edit Holiday' : 'Add Holiday'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
            <input
              ref={inputRef}
              type="text"
              name="title"
              value={holidayForm.title}
              onChange={onFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter holiday name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={moment(holidayForm.start_date).format('YYYY-MM-DD')}
                onChange={onDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={moment(holidayForm.end_date).format('YYYY-MM-DD')}
                onChange={onDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={holidayForm.type}
              onChange={onFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="company-wide">Company-wide</option>
              <option value="department">Department-specific</option>
              <option value="festival">Festival</option>
              <option value="birthday">Birthday</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
            <select
              name="recurrence_rule"
              value={holidayForm.recurrence_rule}
              onChange={onFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={holidayForm.description}
              onChange={onFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter description"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          {selectedEvent && (
            <button 
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
          
          <div className="flex space-x-3 ml-auto">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BulkActionsModal = ({ show, onClose, bulkYear, setBulkYear, onMarkWeekends }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Mark Weekends as Holidays</h3>
        <p className="text-gray-600 mb-4">
          This will mark all Saturdays and Sundays as holidays for the selected year.
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Year:</label>
          <select 
            value={bulkYear}
            onChange={(e) => setBulkYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onMarkWeekends}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark Weekends
          </button>
        </div>
      </div>
    </div>
  );
};

const ImportExportModal = ({ show, onClose, onImport, onExport }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Import/Export Holidays</h3>
        
        <div className="mb-8">
          <h4 className="font-medium text-gray-700 mb-3">Import Holidays</h4>
          <p className="text-gray-600 mb-4">
            Upload a CSV file with holiday data in the required format.
          </p>
          
          <div className="flex items-center space-x-3">
            <label className="block flex-1">
              <span className="sr-only">Choose file</span>
              <input 
                type="file" 
                accept=".csv"
                onChange={onImport}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </label>
            
            <button 
              onClick={() => {
                const csvContent = "title,start_date,end_date,type,recurrence_rule,description\n" +
                  "New Year,2023-01-01,2023-01-01,company-wide,annual,Happy New Year!\n" +
                  "Christmas,2023-12-25,2023-12-25,company-wide,annual,Merry Christmas!";
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'holidays_template.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Template
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Export Holidays</h4>
          <p className="text-gray-600 mb-4">
            Download all holidays as a CSV file.
          </p>
          <button 
            onClick={onExport}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export to CSV
          </button>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    title: '',
    start_date: new Date(),
    end_date: new Date(),
    type: 'company-wide',
    recurrence_rule: 'none',
    description: ''
  });

  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showFormModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showFormModal]);

  // Fetch holidays from backend
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await api.get('/holidays');
      
      const holidays = response.data.map(event => ({
        ...event,
        id: event._id,
        start: new Date(event.start_date),
        end: new Date(event.end_date)
      }));
      
      setEvents(holidays);
    } catch (error) {
      toast.error('Failed to load holidays');
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Event handlers
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setHolidayForm({
      title: event.title,
      start_date: new Date(event.start),
      end_date: new Date(event.end),
      type: event.type.toLowerCase(),
      recurrence_rule: event.recurrence_rule || 'none',
      description: event.description || ''
    });
    setShowFormModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setHolidayForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setHolidayForm(prev => ({ ...prev, [name]: new Date(value) }));
  };

  const saveHoliday = async () => {
    try {
      // Map type values to match backend enum
      let mappedType = 'Company-wide';
      if (holidayForm.type === 'company-wide') {
        mappedType = 'Company-wide';
      } else if (holidayForm.type === 'department') {
        mappedType = 'Department-specific';
      } else if (holidayForm.type === 'festival') {
        mappedType = 'Festival';
      } else if (holidayForm.type === 'birthday') {
        mappedType = 'Birthday';
      }

      const payload = {
        ...holidayForm,
        type: mappedType,
        start_date: holidayForm.start_date,
        end_date: holidayForm.end_date
      };

      if (selectedEvent) {
        await api.put(`/holidays/${selectedEvent.id}`, payload);
        toast.success('Holiday updated successfully');
      } else {
        await api.post('/holidays', payload);
        toast.success('Holiday created successfully');
      }
      
      setShowFormModal(false);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to save holiday');
      console.error('Error saving holiday:', error);
    }
  };

  const deleteHoliday = async () => {
    if (!selectedEvent) return;
    
    try {
      await api.delete(`/holidays/${selectedEvent.id}`);
      
      toast.success('Holiday deleted successfully');
      setShowFormModal(false);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to delete holiday');
      console.error('Error deleting holiday:', error);
    }
  };

  const markWeekends = async () => {
    try {
      await api.post('/holidays/bulk-weekends', { year: bulkYear });
      
      toast.success('Weekends marked successfully');
      setShowBulkModal(false);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to mark weekends');
      console.error('Error marking weekends:', error);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/holidays/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Holidays imported successfully');
      setShowImportExportModal(false);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to import holidays');
      console.error('Error importing holidays:', error);
    }
  };

  const exportHolidays = async () => {
    try {
      const response = await api.get('/holidays/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'holidays.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Holidays exported successfully');
      setShowImportExportModal(false);
    } catch (error) {
      toast.error('Failed to export holidays');
      console.error('Error exporting holidays:', error);
    }
  };

  // Event type color mapping
  const eventStyleGetter = (event) => {
    const backgroundColor = {
      'Company-wide': '#ef4444',
      'Department-specific': '#10b981',
      'Festival': '#8b5cf6',
      'Birthday': '#f59e0b'
    }[event.type] || '#ef4444';

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '0.5rem',
        border: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Company Holiday Calendar</h2>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              setSelectedEvent(null);
              setHolidayForm({
                title: '',
                start_date: new Date(),
                end_date: new Date(),
                type: 'company-wide',
                recurrence_rule: 'none',
                description: ''
              });
              setShowFormModal(true);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Add Holiday
          </button>
          
          <button 
            onClick={() => setShowBulkModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Mark Weekends
          </button>
          
          <button 
            onClick={() => setShowImportExportModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Import/Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <RBCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '70vh' }}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day']}
            eventPropGetter={eventStyleGetter}
            components={{
              event: ({ event }) => (
                <div className="p-2">
                  <span className=""></span>
                  <strong>{event.title}</strong>
                </div>
              )
            }}
          />
        </div>
      )}

      <HolidayFormModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        holidayForm={holidayForm}
        onFormChange={handleFormChange}
        onDateChange={handleDateChange}
        onSave={saveHoliday}
        onDelete={deleteHoliday}
        selectedEvent={selectedEvent}
        inputRef={inputRef}
      />
      
      <BulkActionsModal
        show={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        bulkYear={bulkYear}
        setBulkYear={setBulkYear}
        onMarkWeekends={markWeekends}
      />
      
      <ImportExportModal
        show={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
        onImport={handleImport}
        onExport={exportHolidays}
      />
    </div>
  );
};

export default Calendar;