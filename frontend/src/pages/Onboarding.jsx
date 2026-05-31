import React, { useState } from 'react';
import axios from 'axios';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { Phone, Check, Award, Compass, DollarSign, Clock, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { getCurrency } from '../utils/currency';

const Onboarding = ({ user, onOnboardSuccess }) => {
  const isWorker = user.role === 'worker';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Client states
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Worker states
  const [workerTitle, setWorkerTitle] = useState('');
  const [workerBio, setWorkerBio] = useState('');
  const [workerRate, setWorkerRate] = useState(25);
  const [workerSkills, setWorkerSkills] = useState([]);
  const [customSkills, setCustomSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('17:00');
  const [files, setFiles] = useState([]); // File array for certifications

  const handleAddCustomSkill = () => {
    if (customSkillInput.trim() && !customSkills.includes(customSkillInput.trim())) {
      setCustomSkills([...customSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveCustomSkill = (tag) => {
    setCustomSkills(customSkills.filter((s) => s !== tag));
  };

  const currentCurrency = getCurrency({
    address,
    location: { coordinates: [coords.lng, coords.lat] }
  });

  // Constants
  const categoriesList = [
    { name: 'Plumbing', slug: 'plumbing' },
    { name: 'Electrical', slug: 'electrical' },
    { name: 'Cleaning', slug: 'cleaning' },
    { name: 'Appliance Repair', slug: 'appliance' },
    { name: 'Carpentry', slug: 'carpentry' },
    { name: 'Gardening', slug: 'gardening' },
  ];

  const handleSelectLocation = (location) => {
    setAddress(location.address);
    setCoords({ lat: location.lat, lng: location.lng });
  };

  const handleToggleInterest = (slug) => {
    if (selectedInterests.includes(slug)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== slug));
    } else {
      setSelectedInterests([...selectedInterests, slug]);
    }
  };

  const handleToggleSkill = (slug) => {
    if (workerSkills.includes(slug)) {
      setWorkerSkills(workerSkills.filter((i) => i !== slug));
    } else {
      setWorkerSkills([...workerSkills, slug]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !address) {
      setErrorMsg('Please supply a contact phone and primary address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('fixconnect_token');
      const response = await axios.put(
        'http://localhost:5050/api/users/onboard',
        {
          phone,
          address,
          longitude: coords.lng,
          latitude: coords.lat,
          interests: selectedInterests,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        onOnboardSuccess(response.data.user);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit onboarding profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!workerTitle || !address || !workerBio) {
      setErrorMsg('Please complete all professional details.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('fixconnect_token');
      const formData = new FormData();
      formData.append('title', workerTitle);
      formData.append('bio', workerBio);
      formData.append('hourlyRate', workerRate);
      formData.append('startHour', startHour);
      formData.append('endHour', endHour);
      formData.append('address', address);
      formData.append('longitude', coords.lng);
      formData.append('latitude', coords.lat);
      const mergedSkills = [...workerSkills, ...customSkills];
      formData.append('skills', JSON.stringify(mergedSkills));

      files.forEach((file) => {
        formData.append('certifications', file);
      });

      const response = await axios.put(
        'http://localhost:5050/api/workers/onboard',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        onOnboardSuccess(response.data.user);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit professional application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px' }}>
      <div className="glass-card" style={{ padding: '40px 32px', transform: 'none' }}>
        {/* Progress header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Step {step} of {isWorker ? '3' : '2'}
            </span>
            <h2 style={{ fontSize: '24px', marginTop: '4px' }}>
              {isWorker ? 'Professional Onboarding' : 'Welcome to FixConnect!'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '40px', height: '4px', background: '#10b981', borderRadius: '2px' }} />
            <div
              style={{
                width: '40px',
                height: '4px',
                background: step >= 2 ? '#10b981' : '#cbd5e1',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
              }}
            />
            {isWorker && (
              <div
                style={{
                  width: '40px',
                  height: '4px',
                  background: step >= 3 ? '#10b981' : '#cbd5e1',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                }}
              />
            )}
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              color: '#ef4444',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              marginBottom: '24px',
              border: '1.5px dashed #fee2e2',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* CUSTOMER ONBOARDING */}
        {!isWorker && (
          <div>
            {step === 1 && (
              <div className="onboard-step active">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: '#64748b', fontSize: '15px' }}>
                    Let's complete your profile so you can immediately discover nearby service experts!
                  </p>
                  <div className="form-group">
                    <label className="form-label">Phone Contact Number</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                        placeholder="+639171234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <Phone
                        size={18}
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#10b981',
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Home Address Location</label>
                    <AddressAutocomplete
                      placeholder="Type your address..."
                      initialValue={address}
                      onSelectLocation={handleSelectLocation}
                    />
                    <small style={{ color: '#64748b', fontSize: '12px' }}>
                      We use LocationIQ autocomplete to map your coordinate distances securely.
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={() => {
                      if (!phone || !address) {
                        setErrorMsg('Please specify contact details and select an address.');
                      } else {
                        setErrorMsg('');
                        setStep(2);
                      }
                    }}
                  >
                    Next: Pick Interests
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="onboard-step active">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: '#64748b', fontSize: '15px' }}>
                    Select service sectors you're interested in for personalized discovery filters:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '12px 0' }}>
                    {categoriesList.map((cat) => {
                      const selected = selectedInterests.includes(cat.slug);
                      return (
                        <div
                          key={cat.slug}
                          onClick={() => handleToggleInterest(cat.slug)}
                          style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1.5px solid',
                            borderColor: selected ? '#10b981' : '#cbd5e1',
                            background: selected ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{cat.name}</span>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: selected ? '#10b981' : '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                            }}
                          >
                            {selected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                      onClick={handleClientSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Finish Setup'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WORKER ONBOARDING */}
        {isWorker && (
          <div>
            {step === 1 && (
              <div className="onboard-step active">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: '#64748b', fontSize: '15px' }}>
                    Set up your expert card so clients can locate you.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Professional Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Master Electrician / Deep Cleaning Expert"
                      value={workerTitle}
                      onChange={(e) => setWorkerTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Biography Details</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      style={{ resize: 'none' }}
                      placeholder="Describe your service history, values, or specialized expertise..."
                      value={workerBio}
                      onChange={(e) => setWorkerBio(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Address</label>
                    <AddressAutocomplete
                      placeholder="Find your business area address..."
                      initialValue={address}
                      onSelectLocation={handleSelectLocation}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={() => {
                      if (!workerTitle || !address || !workerBio) {
                        setErrorMsg('Please supply a title, bio, and business address.');
                      } else {
                        setErrorMsg('');
                        setStep(2);
                      }
                    }}
                  >
                    Next: Rate & Skills
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="onboard-step active">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: '#64748b', fontSize: '15px' }}>
                    Configure hourly pricing and select all professional skills you qualify for:
                  </p>

                  <div className="form-group">
                    <label className="form-label">Hourly Billing Rate ({currentCurrency.code}/hr)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                        value={workerRate}
                        onChange={(e) => setWorkerRate(e.target.value)}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#10b981',
                          fontWeight: 'bold',
                          fontSize: '16px',
                        }}
                      >
                        {currentCurrency.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label font-bold">Skills Tags</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {categoriesList.map((skill) => {
                        const selected = workerSkills.includes(skill.slug);
                        return (
                          <div
                            key={skill.slug}
                            onClick={() => handleToggleSkill(skill.slug)}
                            style={{
                              padding: '12px',
                              borderRadius: '12px',
                              border: '1.5px solid',
                              borderColor: selected ? '#10b981' : '#cbd5e1',
                              background: selected ? '#f0fdf4' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{skill.name}</span>
                            {selected && <Check size={14} color="#10b981" strokeWidth={3} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CUSTOM WORKER SKILLS INPUT */}
                  <div className="form-group">
                    <label className="form-label">Add Custom Skills</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Roof sealing, pipe soldering, lock picking..."
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '0 16px', height: '46px', whiteSpace: 'nowrap' }}
                        onClick={handleAddCustomSkill}
                      >
                        Add
                      </button>
                    </div>
                    {customSkills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        {customSkills.map((tag) => (
                          <div
                            key={tag}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#f0fdf4',
                              border: '1px solid #10b981',
                              color: '#047857',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: '#ef4444',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                padding: '0 2px',
                              }}
                              onClick={() => handleRemoveCustomSkill(tag)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Work Starts At</label>
                      <input
                        type="time"
                        className="form-input"
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Work Ends At</label>
                      <input
                        type="time"
                        className="form-input"
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                      onClick={() => {
                        if (workerSkills.length === 0) {
                          setErrorMsg('Please pick at least one qualifying skill tag.');
                        } else {
                          setErrorMsg('');
                          setStep(3);
                        }
                      }}
                    >
                      Next: Certificates
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="onboard-step active">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: '#64748b', fontSize: '15px' }}>
                    Upload business certifications or credentials (PDF/Image format) to fast-track administrative verification:
                  </p>

                  <div
                    style={{
                      border: '2px dashed #10b981',
                      borderRadius: '16px',
                      padding: '32px 20px',
                      textAlign: 'center',
                      background: '#f0fdf4',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                      onChange={handleFileChange}
                    />
                    <Award size={36} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                    <h4 style={{ fontSize: '15px', color: '#047857', marginBottom: '4px' }}>
                      Drag & Drop files or click to browse
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>
                      Supports JPEG, PNG, or PDF credentials (Max 5 files).
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Ready for upload:</span>
                      {files.map((file, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13px',
                          }}
                        >
                          <FileText size={16} color="#64748b" />
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.name}
                          </span>
                          <span style={{ color: '#10b981', fontWeight: '600' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                      onClick={handleWorkerSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Uploading Application...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
