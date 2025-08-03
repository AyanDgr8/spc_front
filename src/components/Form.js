// // src/components/Form.js

// import React, { useState, useRef, useEffect } from 'react';
// import './Form.css';

// const INIT = {
//     company: '',
//     name: '',
//     contact_number: '',
//     email: '',
//     query: '',
//     disposition: '',
//     queue_id: '',
//     queue_name: '',
//     agent_id: '',
//     agent_ext: '',
//     caller_id__name: '',
//     caller_id__number: '',
// };

// const DISPOSITIONS = [
//   'Application Support',
//   'B2B Lead',
//   'Concierge Services',
//   'Consultant support',
//   'Customer Support',
//   'General Enquiry',
//   'New Lead',
//   'Renewals',
// ];

// export default function Form() {
//   const [values, setValues] = useState(INIT);
//   const [status, setStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [recordId, setRecordId] = useState(null);
//   const formRef = useRef(null);

//   useEffect(() => {
//     const fetchRecordData = async (id) => {
//       try {
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/forms/${id}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch record data');
//         }
//         const data = await response.json();
        
//         // Only store call parameters, leave main form fields blank
//         setValues({
//           company: '',
//           name: '',
//           contact_number: '',
//           email: '',
//           query: '',
//           disposition: '',
//           // Store call parameters in hidden fields
//           queue_id: data.queue_id || '',
//           queue_name: data.queue_name || '',
//           agent_id: data.agent_id || '',
//           agent_ext: data.agent_ext || '',
//           caller_id__name: data.caller_id__name || '',
//           caller_id__number: data.caller_id__number || '',
//         });
//       } catch (error) {
//         console.error('Error fetching record:', error);
//         setStatus('Error loading pre-filled data');
//       }
//     };

//     const queryParams = new URLSearchParams(window.location.search);
//     const id = queryParams.get('id');
    
//     if (id) {
//       setRecordId(id);
//       fetchRecordData(id);
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === 'contact_number') {
//       const allowed = /^\+?\d{0,15}$/;
//       if (!allowed.test(value)) return; 
//     }

//     setValues((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const phoneRegex = /^\+?\d{1,15}$/; 
//     const phone = values.contact_number.trim();
//     if (phone && !phoneRegex.test(phone)) {
//       setStatus('Invalid phone format');
//       return;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
//       setStatus('Invalid email');
//       return;
//     }

//     setStatus('Submitting…');
//     setIsSubmitting(true);
//     setIsSuccess(false);
    
//     try {
//       const method = recordId ? 'PUT' : 'POST';
//       const url = recordId 
//         ? `${process.env.REACT_APP_API_URL}/forms/${recordId}`
//         : `${process.env.REACT_APP_API_URL}/forms`;

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           ...values, 
//           contact_number: phone,
//           queue_id: values.queue_id,
//           queue_name: values.queue_name,
//           agent_id: values.agent_id,
//           agent_ext: values.agent_ext,
//           caller_id__name: values.caller_id__name,
//           caller_id__number: values.caller_id__number,
//         }),
//       });
      
//       if (!res.ok) throw new Error('Request failed');
      
//       setValues(INIT);
//       setIsSuccess(true);
//       formRef.current?.reset();
//       setRecordId(null);
//       setTimeout(() => {
//         setStatus('');
//         setIsSuccess(false);
//       }, 3000);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="form-wrapper">
//         <div className="header-logo">
//             <img src="/uploads/logo.webp" alt="multyform logo" className="logooo"/>
//         </div>
//         <h2>{recordId ? 'Contact Form' : 'Contact Form'}</h2>
//         <form className="form-body" ref={formRef} onSubmit={handleSubmit}>
//             <input type="hidden" name="queue_id" value={values.queue_id} />
//             <input type="hidden" name="queue_name" value={values.queue_name} />
//             <input type="hidden" name="agent_id" value={values.agent_id} />
//             <input type="hidden" name="agent_ext" value={values.agent_ext} />
//             <input type="hidden" name="caller_id__name" value={values.caller_id__name} />
//             <input type="hidden" name="caller_id__number" value={values.caller_id__number} />

//             <label>
//             Company
//             <input name="company" value={values.company} onChange={handleChange} required />
//             </label>
//             <label>
//             Client Name
//             <input name="name" value={values.name} onChange={handleChange} required />
//             </label>
//             <label>
//             Email
//             <input
//               type="email"
//               name="email"
//               value={values.email}
//               onChange={handleChange}
//               required
//             />
//             </label>
//             <label>
//             Contact Number
//             <input
//               type="tel"
//               name="contact_number"
//               inputMode="numeric"
//               value={values.contact_number}
//               onChange={handleChange}
//               required
//               title="Digits only, optional leading +"
//               maxLength={16}
//             />
//             </label>
//             <label>
//             Disposition
//             <select name="disposition" value={values.disposition} onChange={handleChange} required>
//                 <option value="" disabled>Select disposition</option>
//                 {DISPOSITIONS.map((d) => (
//                 <option key={d} value={d}>{d}</option>
//                 ))}
//             </select>
//             </label>
//             <label>
//             Query
//             <textarea name="query" value={values.query} onChange={handleChange} />
//             </label>
            
//             {/* {values.queue_name && (
//               <div className="call-info">
//                 <h4>Call Information</h4>
//                 <p><strong>Queue:</strong> {values.queue_name} ({values.queue_id})</p>
//                 <p><strong>Agent:</strong> {values.agent_id} (Ext: {values.agent_ext})</p>
//                 <p><strong>Caller ID:</strong> {values.caller_id__name} ({values.caller_id__number})</p>
//               </div>
//             )} */}
            
//             <div className="submit-container">
//               <button type="submit" className="submit-btn" disabled={isSubmitting}>
//                 {isSubmitting ? 'Submitting...' : (isSuccess ? 'Submitted ' : 'Submit')}
//                 {isSubmitting && <i className="fas fa-sync fa-spin"></i>}
//                 {isSuccess && <i className="fas fa-check-circle"></i>}
//               </button>
//             </div>
//         </form>
//     </div>
//   );
// }
