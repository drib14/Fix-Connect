import re

with open('FixConnect/src/pages/BookingDetail.jsx', 'r') as f:
    content = f.read()

# Make sure ResponsiveModal is imported
if 'import { ResponsiveModal }' not in content:
    content = content.replace('import { Button } from "../components/ui/button";', 'import { Button } from "../components/ui/button";\nimport { ResponsiveModal } from "../components/ResponsiveModal";')

# We need state variables for the cancel modal
state_hooks = """
  const [eta, setEta] = useState(null);
  const [showArrivedModal, setShowArrivedModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
"""

content = re.sub(r'  const \[eta, setEta\] = useState\(null\);\n  const \[showArrivedModal, setShowArrivedModal\] = useState\(false\);\n  const \[showCompletedModal, setShowCompletedModal\] = useState\(false\);', state_hooks.strip('\n'), content)


# Add cancel handler
cancel_handler = """
  const handleCompleteJob = async () => {
      try {
          await api.patch(`/bookings/${id}`, { status: 'completed' });
          setBooking(prev => ({ ...prev, status: 'completed' }));
      } catch (err) {
          console.error('Failed to complete job', err);
      }
  };

  const handleCancelBooking = async () => {
      const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
      if (!finalReason) {
          alert('Please provide a reason for cancellation.');
          return;
      }
      setIsCancelling(true);
      try {
          await api.patch(`/bookings/${id}`, { status: 'cancelled', cancelReason: finalReason });
          setBooking(prev => ({ ...prev, status: 'cancelled' }));
          setShowCancelModal(false);
      } catch (err) {
          console.error('Failed to cancel', err);
      } finally {
          setIsCancelling(false);
      }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>;
"""

content = re.sub(r'  if \(loading\) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>;', cancel_handler.strip('\n'), content)


# Add cancel modal UI
cancel_modal_jsx = """
        <Dialog open={showCompletedModal} onOpenChange={setShowCompletedModal}>
          <DialogContent className="sm:max-w-md bg-card/95 border border-emerald-500/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
                Job Completed!
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {booking.workerId?.name} has completed the service. Thank you for using FixConnect!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
               <Button onClick={() => setShowCompletedModal(false)} className="bg-emerald-600 hover:bg-emerald-700">Okay</Button>
            </div>
          </DialogContent>
        </Dialog>

        <ResponsiveModal
            open={showCancelModal}
            onOpenChange={setShowCancelModal}
            title="Cancel Booking"
            description="Please select a reason for cancellation. Note: Cancelling a worker who is already on the way may incur a fee."
        >
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    {['Worker is taking too long', 'I no longer need the service', 'I found someone else', 'Worker requested cancellation', 'Other'].map(reason => (
                        <label key={reason} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-emerald-500/10 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="cancelReason"
                                value={reason}
                                checked={cancelReason === reason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="accent-emerald-500"
                            />
                            <span className="text-sm">{reason}</span>
                        </label>
                    ))}
                </div>
                {cancelReason === 'Other' && (
                    <textarea
                        className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:border-emerald-500"
                        placeholder="Please specify your reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                    />
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                    <Button variant="ghost" onClick={() => setShowCancelModal(false)} disabled={isCancelling}>Back</Button>
                    <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Cancellation
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
"""

content = re.sub(r'        <Dialog open=\{showCompletedModal\} onOpenChange=\{setShowCompletedModal\}>\n          <DialogContent className="sm:max-w-md bg-card/95 border border-emerald-500/20">\n            <DialogHeader>\n              <DialogTitle className="flex items-center gap-2 text-emerald-400">\n                <CheckCircle2 className="w-6 h-6" />\n                Job Completed!\n              </DialogTitle>\n              <DialogDescription className="text-gray-400">\n                \{booking.workerId\?\.name\} has completed the service. Thank you for using FixConnect!\n              </DialogDescription>\n            </DialogHeader>\n            <div className="flex justify-end mt-4">\n               <Button onClick=\{\(\) => setShowCompletedModal\(false\)\} className="bg-emerald-600 hover:bg-emerald-700">Okay</Button>\n            </div>\n          </DialogContent>\n        </Dialog>', cancel_modal_jsx.strip('\n'), content)


# Wire the button to the state
cancellation_buttons_new = """
                <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3 shrink-0">
                    {['pending', 'accepted', 'in_progress'].includes(booking.status) && localStorage.getItem('userId') !== booking.workerId?.userId && (
                         <Button variant="destructive" className="w-full font-bold" onClick={() => setShowCancelModal(true)}>
                             Cancel Booking
                         </Button>
                    )}
                    {booking.status === 'in_progress' && localStorage.getItem('userId') === booking.workerId?.userId && (
                        <Button className="w-full font-bold bg-emerald-600 hover:bg-emerald-700" onClick={handleCompleteJob}>
                             Complete Job
                         </Button>
                    )}
                </div>
"""

content = re.sub(r'                <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3 shrink-0">\n                    \{\[\'pending\', \'accepted\', \'in_progress\'\]\.includes\(booking\.status\) && localStorage\.getItem\(\'userId\'\) !== booking\.workerId\?\.userId && \(\n                         <Button variant="destructive" className="w-full font-bold">\n                             Cancel Booking\n                         </Button>\n                    \)\}\n                    \{booking\.status === \'in_progress\' && localStorage\.getItem\(\'userId\'\) === booking\.workerId\?\.userId && \(\n                        <Button className="w-full font-bold bg-emerald-600 hover:bg-emerald-700">\n                             Complete Job\n                         </Button>\n                    \)\}\n                </div>', cancellation_buttons_new.strip('\n'), content)

with open('FixConnect/src/pages/BookingDetail.jsx', 'w') as f:
    f.write(content)
