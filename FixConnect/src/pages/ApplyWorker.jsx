import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Briefcase, CreditCard, User, CheckCircle2, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { ResponsiveModal } from '../components/ResponsiveModal';

export default function ApplyWorker() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    dailyRate: '',
    jobsOffered: ''
  });
  const [documentFile, setDocumentFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.category)) {
        setError('Please fill in your name and category.');
        return;
    }
    if (step === 2 && !formData.description) {
        setError('Please provide a brief description.');
        return;
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!documentFile) {
        setError('Please upload a valid ID or Trade Certificate.');
        return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // If not logged in, redirect to login first (simplified for this demo)
      if (!token) {
          navigate('/login', { state: { message: 'Please login or register first before applying as a worker.' } });
          return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      submitData.append('documents', documentFile);

      await axios.post('/api/workers', submitData, {
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
          }
      });

      // Update local storage role so they immediately see the dashboard tab
      localStorage.setItem('role', 'worker');
      setShowWalkthrough(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const [walkthroughStep, setWalkthroughStep] = useState(1);

  const handleWalkthroughNext = () => {
      if (walkthroughStep === 3) {
          navigate('/');
      } else {
          setWalkthroughStep(s => s + 1);
      }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-24 pb-12">
        <div className="w-full max-w-lg bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Become a FixConnect Pro</h1>
                <p className="text-muted-foreground">Join our network of skilled professionals and start earning.</p>
            </div>

            {/* Stepper UI */}
            <div className="flex justify-center items-center gap-2 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= i ? 'bg-emerald-500 text-white' : 'bg-background border border-border text-muted-foreground'}`}>
                            {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                        </div>
                        {i < 3 && <div className={`w-12 h-1 mx-2 rounded-full transition-colors ${step > i ? 'bg-emerald-500' : 'bg-border'}`} />}
                    </div>
                ))}
            </div>

            {error && <div className="p-3 mb-6 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">{error}</div>}

            <div className="space-y-6 min-h-[200px]">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Skill / Category</Label>
                            <Input
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g. Master Plumber, Electrician"
                                className="bg-background/50"
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>Professional Summary</Label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell customers about your experience..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Estimated Daily Rate (₱)</Label>
                            <Input
                                type="number"
                                name="dailyRate"
                                value={formData.dailyRate}
                                onChange={handleChange}
                                placeholder="1500"
                                className="bg-background/50"
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                            <p className="text-sm text-emerald-400">To maintain trust and quality, we require verification.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Upload ID or Trade Certificate</Label>
                            <div className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center bg-background/50 hover:bg-background/80 transition-colors">
                                <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setDocumentFile(e.target.files[0])}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 cursor-pointer"
                                />
                            </div>
                            {documentFile && <p className="text-xs text-center text-emerald-500 mt-2">{documentFile.name}</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-border/50">
                <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading} className="w-24">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>

                {step < 3 ? (
                    <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 w-32">
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 w-40 font-bold">
                        {loading ? 'Submitting...' : 'Submit Form'}
                    </Button>
                )}
            </div>
        </div>

        <ResponsiveModal isOpen={showWalkthrough} setIsOpen={() => {}} title="Welcome to FixConnect Pro!" hideCloseButton>
            <div className="space-y-6 pt-4 pb-4">
                <div className="text-center space-y-4">
                    {walkthroughStep === 1 && (
                        <>
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Your Job Pool</h3>
                            <p className="text-muted-foreground text-sm">When customers book services in your category, they will appear in your 'Job Pool' tab on the Dashboard. You have 2 minutes to accept them!</p>
                        </>
                    )}
                    {walkthroughStep === 2 && (
                        <>
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Track Earnings</h3>
                            <p className="text-muted-foreground text-sm">Visit the new 'My Earnings' tab to track your completed jobs, weekly payouts, and request cash outs directly to your GCash or Bank.</p>
                        </>
                    )}
                    {walkthroughStep === 3 && (
                        <>
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Set Your Radius</h3>
                            <p className="text-muted-foreground text-sm">Control how far you travel! You can toggle your 'Online' status and set your maximum travel radius right from the top of your Dashboard.</p>
                        </>
                    )}
                </div>

                <div className="flex gap-2 justify-center py-4">
                    {[1, 2, 3].map(dot => (
                        <div key={dot} className={`w-2 h-2 rounded-full ${walkthroughStep === dot ? 'bg-emerald-500 w-4' : 'bg-border'} transition-all`} />
                    ))}
                </div>

                <Button onClick={handleWalkthroughNext} className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 py-6 rounded-xl">
                    {walkthroughStep === 3 ? "Go to Dashboard" : "Next"}
                </Button>
            </div>
        </ResponsiveModal>
    </div>
  );
}
