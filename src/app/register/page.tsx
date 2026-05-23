"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const [formData, setFormData] = useState({
    fullName: '', age: '', phoneNumber: '', wingBuilding: '',
    jerseyName: '', jerseySize: '', jerseyNumber: '', experience: '', utrNumber: '',
    photo: ''
  })

  const handleInputChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setPhotoPreview(base64String)
      setFormData(prev => ({ ...prev, photo: base64String }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          age: formData.age,
          phone_number: formData.phoneNumber,
          wing_building: formData.wingBuilding,
          jersey_name: formData.jerseyName,
          jersey_size: formData.jerseySize,
          jersey_number: formData.jerseyNumber,
          utr_number: formData.utrNumber,
          volleyball_experience: formData.experience,
          photo: formData.photo,
        }),
      })
      const data = await res.json()
      setIsSubmitting(false)
      if (res.ok) setStep(3)
      else alert(data.error || 'Error submitting registration')
    } catch {
      setIsSubmitting(false)
      alert('Error submitting registration')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="font-display font-bold text-2xl text-white">V</span>
          </div>
          <h2 className="text-3xl font-display font-black text-heading uppercase tracking-wide">Draft Entry</h2>
          <p className="text-muted mt-2">Join the tournament player pool</p>
        </div>

        {/* Form Card */}
        <div className="card-elevated rounded-3xl p-8">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Player Info */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-heading text-lg">Player Profile</h3>
                  <span className="text-xs text-primary font-mono font-bold">Step 1 / 2</span>
                </div>

                <div>
                  <label className="block text-sm font-bold text-body mb-2">Full Name</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Enter your full name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-body mb-2">Age</label>
                    <input required name="age" value={formData.age} onChange={handleInputChange} type="number" placeholder="Age" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-body mb-2">Wing/Bldg</label>
                    <input required name="wingBuilding" value={formData.wingBuilding} onChange={handleInputChange} type="text" placeholder="Building" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-body mb-2">Phone Number</label>
                  <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type="tel" placeholder="+91 XXXXX XXXXX" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-body mb-2">Player Photo</label>
                  <div className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-3">
                    <div className="w-16 h-16 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">No Image</span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload-input" />
                      <label htmlFor="photo-upload-input" className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-white/5 rounded-lg text-xs font-bold text-white cursor-pointer transition-all">
                        Choose Photo
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">JPEG/PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-body mb-2">Jersey Name</label>
                  <input required name="jerseyName" value={formData.jerseyName} onChange={handleInputChange} type="text" placeholder="Enter Jersey Name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-body mb-2">Jersey Size</label>
                  <select required name="jerseySize" value={formData.jerseySize} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer">
                    <option value="" disabled className="text-gray-400">Select Jersey Size</option>
                    <option value="S" className="bg-slate-800 text-white">S</option>
                    <option value="M" className="bg-slate-800 text-white">M</option>
                    <option value="L" className="bg-slate-800 text-white">L</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-body mb-2">Jersey Number</label>
                  <input required name="jerseyNumber" value={formData.jerseyNumber} onChange={handleInputChange} type="number" placeholder="Enter Jersey Number" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>

                <Button 
                  variant="primary" size="lg" className="w-full mt-4"
                  onClick={() => {
                    if(formData.fullName && formData.age && formData.phoneNumber && formData.wingBuilding && formData.jerseyName && formData.jerseySize && formData.jerseyNumber && formData.photo) setStep(2)
                    else alert('Please fill all required fields, including uploading a player photo.')
                  }}
                >
                  Continue to Payment →
                </Button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.form key="step2" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                
                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-primary font-bold hover:underline">← Back</button>
                  <span className="text-xs text-secondary font-mono font-bold">Step 2 / 2</span>
                </div>

                <div>
                  <h3 className="text-4xl font-display font-black text-heading">₹500</h3>
                  <p className="text-sm text-muted uppercase tracking-widest mt-1">Tournament Entry Fee</p>
                </div>

                <div className="w-48 h-48 bg-white mx-auto rounded-2xl flex items-center justify-center shadow-lg">
                  <p className="text-surface font-bold font-mono text-sm">[UPI QR Code]</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-body mb-2 text-left">Transaction UTR Number</label>
                  <input required name="utrNumber" value={formData.utrNumber} onChange={handleInputChange} type="text" placeholder="Enter UTR from payment" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full bg-secondary hover:bg-violet-500" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : '✓ Submit Draft Entry'}
                </Button>
              </motion.form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-6">
                <div className="w-20 h-20 bg-success/20 border-2 border-success rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-display font-bold text-heading uppercase">Entry Received!</h3>
                <p className="text-body">Your registration is pending payment verification.</p>
                
                <Button variant="primary" size="lg" className="w-full bg-[#25D366] hover:bg-[#20bd5a]" onClick={() => window.open(`https://wa.me/1234567890?text=Registered! Name: ${formData.fullName}, UTR: ${formData.utrNumber}`, '_blank')}>
                  📱 Send Proof on WhatsApp
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
