// src/components/DispositionForm.js

import React, { useState, useRef, useEffect } from 'react';
import './Form.css';

const INIT = {
    company: '',
    name: '',
    contact_number: '',
    email: '',
    call_type: '',
    disposition_1: '',
    disposition_2: '',
    query: '',
    queue_id: '',
    queue_name: '',
    agent_id: '',
    agent_ext: '',
    caller_id_name: '',
    caller_id_number: '',
};

export default function DispositionForm() {
  const [values, setValues] = useState(INIT);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [dispositionHierarchy, setDispositionHierarchy] = useState({});
  const [availableDisposition1, setAvailableDisposition1] = useState([]);
  const [availableDisposition2, setAvailableDisposition2] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const formRef = useRef(null);

  // Fetch disposition hierarchy on component mount
  useEffect(() => {
    const fetchDispositionHierarchy = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/disposition-hierarchy`);
        if (!response.ok) {
          throw new Error('Failed to fetch disposition hierarchy');
        }
        const data = await response.json();
        setDispositionHierarchy(data);
      } catch (error) {
        console.error('Error fetching disposition hierarchy:', error);
        setStatus('Error loading form configuration. Please refresh the page.');
      }
    };

    fetchDispositionHierarchy();
  }, []);

  // Handle URL parameters for record loading
  useEffect(() => {
    const fetchRecordData = async (id) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/forms/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch record data');
        }
        const data = await response.json();
        
        // Load all form data for editing
        setValues({
          company: data.company || '',
          name: data.name || '',
          contact_number: data.contact_number || '',
          email: data.email || '',
          call_type: data.call_type || '',
          disposition_1: data.disposition_1 || '',
          disposition_2: data.disposition_2 || '',
          disposition_2_custom: data.disposition_2_custom || '',
          query: data.query || '',
          queue_id: data.queue_id || '',
          queue_name: data.queue_name || '',
          agent_id: data.agent_id || '',
          agent_ext: data.agent_ext || '',
          caller_id_name: data.caller_id_name || '',
          caller_id_number: data.caller_id_number || '',
        });
        
        setRecordId(id);
        
        // Set up cascading dropdowns based on loaded data
        if (data.call_type && dispositionHierarchy[data.call_type]) {
          setAvailableDisposition1(Object.keys(dispositionHierarchy[data.call_type]));
          
          if (data.disposition_1 && dispositionHierarchy[data.call_type][data.disposition_1]) {
            setAvailableDisposition2(dispositionHierarchy[data.call_type][data.disposition_1]);
            
            // Check if it's a custom input
            const disposition2Option = dispositionHierarchy[data.call_type][data.disposition_1]
              .find(opt => opt.value === data.disposition_2);
            setShowCustomInput(disposition2Option?.isCustomInput || false);
          }
        }
        
      } catch (error) {
        console.error('Error fetching record:', error);
        setStatus('Error loading record data.');
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id && dispositionHierarchy && Object.keys(dispositionHierarchy).length > 0) {
      fetchRecordData(id);
    }
  }, [dispositionHierarchy]);

  // Handle call type change
  const handleCallTypeChange = (callType) => {
    setValues(prev => ({
      ...prev,
      call_type: callType,
      disposition_1: '',
      disposition_2: '',
      disposition_2_custom: ''
    }));
    
    if (callType && dispositionHierarchy[callType]) {
      setAvailableDisposition1(Object.keys(dispositionHierarchy[callType]));
    } else {
      setAvailableDisposition1([]);
    }
    
    setAvailableDisposition2([]);
    setShowCustomInput(false);
  };

  // Handle disposition 1 change
  const handleDisposition1Change = (disposition1) => {
    setValues(prev => ({
      ...prev,
      disposition_1: disposition1,
      disposition_2: '',
      disposition_2_custom: ''
    }));
    
    // If "Others" is selected, don't show disposition 2 dropdown
    if (disposition1 === 'Others') {
      setAvailableDisposition2([]);
      setShowCustomInput(false);
    } else if (disposition1 && values.call_type && dispositionHierarchy[values.call_type][disposition1]) {
      setAvailableDisposition2(dispositionHierarchy[values.call_type][disposition1]);
      setShowCustomInput(false);
    } else {
      setAvailableDisposition2([]);
      setShowCustomInput(false);
    }
  };

  // Handle disposition 2 change
  const handleDisposition2Change = (disposition2) => {
    setValues(prev => ({
      ...prev,
      disposition_2: disposition2,
      disposition_2_custom: ''
    }));
    
    // Check if this option requires custom input
    if (values.call_type && values.disposition_1) {
      const disposition2Option = dispositionHierarchy[values.call_type][values.disposition_1]
        .find(opt => opt.value === disposition2);
      setShowCustomInput(disposition2Option?.isCustomInput || false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['company', 'name', 'contact_number', 'email', 'call_type', 'disposition_1', 'disposition_2'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      setStatus(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate custom input if required
    if (showCustomInput && !values.disposition_2_custom.trim()) {
      setStatus('Please provide details for the "Others" option.');
      return;
    }

    setIsSubmitting(true);
    setStatus('');

    try {
      const url = recordId 
        ? `${process.env.REACT_APP_API_URL}/forms/${recordId}`
        : `${process.env.REACT_APP_API_URL}/forms`;
      
      const method = recordId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      setIsSuccess(true);
      setStatus(recordId ? 'Form updated successfully!' : 'Form submitted successfully!');
      
      // Reset form automatically after 3 seconds for new submissions
      if (!recordId) {
        setTimeout(() => {
          console.log('Auto-resetting form after 3 seconds...');
          resetForm();
        }, 3000); // Reset after 3 seconds
      } else {
        // For updates, clear success status after showing the message
        setTimeout(() => {
          setIsSuccess(false);
          setStatus('');
        }, 3000); // Clear status after 3 seconds for updates
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    console.log('Starting form reset...');
    
    // Reset all form values to empty strings
    setValues({
      company: '',
      name: '',
      contact_number: '',
      email: '',
      call_type: '',
      disposition_1: '',
      disposition_2: '',
      query: '',
      queue_id: '',
      queue_name: '',
      agent_id: '',
      agent_ext: '',
      caller_id_name: '',
      caller_id_number: '',
    });
    
    // Reset all dropdown states
    setAvailableDisposition1([]);
    setAvailableDisposition2([]);
    setShowCustomInput(false);
    
    // Reset form states
    setRecordId(null);
    setIsSuccess(false);
    setStatus('');
    setIsSubmitting(false);
    
    console.log('Form reset completed - all values cleared');
  };

  return (
    <div className="form-wrapper">
      <div className="header-logo">
        <img src="/uploads/logo.webp" alt="spcform logo" className="logooo"/>
      </div>
      
      <h2>{recordId ? 'Customer Service Form' : 'Customer Service Form'}</h2>
      
      <form className="form-body" ref={formRef} onSubmit={handleSubmit}>
        {/* Hidden fields for call center data */}
        <input type="hidden" name="queue_id" value={values.queue_id} />
        <input type="hidden" name="queue_name" value={values.queue_name} />
        <input type="hidden" name="agent_id" value={values.agent_id} />
        <input type="hidden" name="agent_ext" value={values.agent_ext} />
        <input type="hidden" name="caller_id_name" value={values.caller_id_name} />
        <input type="hidden" name="caller_id_number" value={values.caller_id_number} />

        {/* Mandatory Fields */}
        <label>
          Company *
          <input
            type="text"
            name="company"
            value={values.company}
            onChange={handleChange}
            required
            placeholder="Enter company name"
          />
        </label>

        <label>
          Client Name *
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            placeholder="Enter customer name"
          />
        </label>

        <label>
          Contact Number *
          <input
            type="tel"
            name="contact_number"
            value={values.contact_number}
            onChange={handleChange}
            required
            placeholder="Enter contact number"
          />
        </label>

        <label>
          Email *
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
          />
        </label>

        {/* Cascading Dropdowns */}
        <label>
          Call Type *
          <select
            name="call_type"
            value={values.call_type}
            onChange={(e) => handleCallTypeChange(e.target.value)}
            required
          >
            <option value="">Select Call Type</option>
            {Object.keys(dispositionHierarchy).map(callType => (
              <option key={callType} value={callType}>{callType}</option>
            ))}
          </select>
        </label>

        {availableDisposition1.length > 0 && (
          <label>
            Disposition 1 *
            <select
              name="disposition_1"
              value={values.disposition_1}
              onChange={(e) => handleDisposition1Change(e.target.value)}
              required
            >
              <option value="">Select Disposition 1</option>
              {availableDisposition1.map(disp1 => (
                <option key={disp1} value={disp1}>{disp1}</option>
              ))}
            </select>
          </label>
        )}

        {availableDisposition2.length > 0 && (
          <label>
            Disposition 2 *
            <select
              name="disposition_2"
              value={values.disposition_2}
              onChange={(e) => handleDisposition2Change(e.target.value)}
              required
            >
              <option value="">Select Disposition 2</option>
              {availableDisposition2.map(disp2 => (
                <option key={disp2.value} value={disp2.value}>
                  {disp2.value}
                </option>
              ))}
            </select>
          </label>
        )}

        {showCustomInput && (
          <label>
            Please specify details *
            <textarea
              name="disposition_2_custom"
              value={values.disposition_2_custom}
              onChange={handleChange}
              required
              placeholder="Please provide specific details..."
              rows="3"
            />
          </label>
        )}

        <label>
          Query/Details
          <textarea
            name="query"
            value={values.query}
            onChange={handleChange}
            placeholder="Enter any additional details or query..."
            rows="4"
          />
        </label>
        {status && (
        <div className="status">
          {status}
        </div>
        )}
        <div className="submit-container">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? 'Submitting...' : (isSuccess ? 'Submitted ✓' : 'Submit')}
          </button>
        </div>
      </form>
      
      
    </div>
  );
}
