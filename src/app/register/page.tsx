"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Building2, Shirt, Hash, UploadCloud, CheckCircle2, ChevronRight, Image as ImageIcon, Mail, Lock } from 'lucide-react'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const [formData, setFormData] = useState({
    fullName: '', age: '', phoneNumber: '', wing: '', flatNumber: '',
    jerseyName: '', jerseySize: '', jerseyNumber: '', experience: '', utrNumber: '',
    photo: '', email: '', password: ''
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
          wing_building: `${formData.wing}-${formData.flatNumber}`,
          jersey_name: formData.jerseyName,
          jersey_size: formData.jerseySize,
          jersey_number: formData.jerseyNumber,
          utr_number: formData.utrNumber,
          volleyball_experience: formData.experience,
          photo: formData.photo,
          email: formData.email,
          password: formData.password,
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B1121] overflow-hidden selection:bg-blue-500/30">
      
      {/* Left Visual Section */}
      <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-screen flex flex-col justify-center p-8 lg:p-16 overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-[#0B1121]/80 to-transparent z-10 lg:bg-gradient-to-r lg:from-[#0B1121] lg:via-[#0B1121]/50 lg:to-transparent" />
          <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay z-10" />
          <img 
            src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2000" 
            alt="Volleyball Player" 
            className="w-full h-full object-cover object-center opacity-60 scale-105"
          />
        </div>

        {/* Floating Particles/Glows */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/30 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col h-full justify-center max-w-xl mt-12 lg:mt-0 pt-12 lg:pt-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <span className="font-black text-white italic text-xl tracking-tighter">EVL</span>
              </div>
              <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Season 1 Draft</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6 italic">
              ENTER THE<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">AUCTION.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-300 font-medium mb-12 max-w-md">
              Only the elite get drafted. Secure your spot in the player pool and prove your worth on the court.
            </p>

            <div className="border-t border-white/10 pt-8">
               <div>
                 <div className="text-3xl font-black text-white mb-1">₹500</div>
                 <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Entry Fee</div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 z-20 overflow-y-auto min-h-screen bg-[#0B1121] lg:bg-transparent shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-xl">
           
           {/* Glassmorphism Card */}
           <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden">
             
             {/* Card ambient glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

             <AnimatePresence mode="wait">
               
               {/* STEP 1: PLAYER INFO */}
               {step === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10 space-y-6">
                   
                   {/* Header & Stepper */}
                   <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                     <div>
                       <h3 className="text-2xl font-black text-white tracking-tight mb-1">Player Profile</h3>
                       <p className="text-sm text-slate-400">Fill in your athletic details.</p>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                       <div className="w-4 h-1 bg-slate-700 rounded-full" />
                     </div>
                   </div>

                   {/* Form Grid */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                     
                     {/* Full Name */}
                     <div className="lg:col-span-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name <span className="text-red-500 ml-0.5">*</span></label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <User className="w-5 h-5 text-slate-500" />
                         </div>
                         <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Enter your full name" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                       </div>
                     </div>

                     {/* Email */}
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address <span className="text-red-500 ml-0.5">*</span></label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Mail className="w-5 h-5 text-slate-500" />
                         </div>
                         <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="you@domain.com" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                       </div>
                     </div>

                     {/* Password */}
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password <span className="text-red-500 ml-0.5">*</span></label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Lock className="w-5 h-5 text-slate-500" />
                         </div>
                         <input required name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Min 6 characters" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                       </div>
                     </div>

                     {/* Age */}
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Age <span className="text-red-500 ml-0.5">*</span></label>
                       <div className="relative">
                         <input required name="age" value={formData.age} onChange={handleInputChange} type="number" placeholder="Years" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                       </div>
                     </div>

                     {/* Wing and Flat Number */}
                     <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Wing <span className="text-red-500 ml-0.5">*</span></label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Building2 className="w-4 h-4 text-slate-500" />
                            </div>
                            <select required name="wing" value={formData.wing} onChange={handleInputChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all appearance-none cursor-pointer">
                              <option value="" disabled className="text-gray-500">Wing</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                        </div>
                        <div className="w-1/2">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Flat No. <span className="text-red-500 ml-0.5">*</span></label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Hash className="w-4 h-4 text-slate-500" />
                            </div>
                            <input required name="flatNumber" value={formData.flatNumber} onChange={handleInputChange} type="text" placeholder="101" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-2 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                          </div>
                        </div>
                     </div>

                     {/* Phone Number */}
                     <div className="lg:col-span-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number <span className="text-red-500 ml-0.5">*</span></label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Phone className="w-5 h-5 text-slate-500" />
                         </div>
                         <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type="tel" placeholder="+91 XXXXX XXXXX" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                       </div>
                     </div>

                     {/* Jersey Name */}
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Jersey Name <span className="text-red-500 ml-0.5">*</span></label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Shirt className="w-5 h-5 text-slate-500" />
                         </div>
                         <input required name="jerseyName" value={formData.jerseyName} onChange={handleInputChange} type="text" placeholder="Name on back" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                       </div>
                     </div>

                     {/* Jersey Size & Number */}
                     <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Size <span className="text-red-500 ml-0.5">*</span></label>
                          <select required name="jerseySize" value={formData.jerseySize} onChange={handleInputChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all appearance-none cursor-pointer">
                            <option value="" disabled className="text-gray-500">Size</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                          </select>
                        </div>
                        <div className="w-1/2">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">No. <span className="text-red-500 ml-0.5">*</span></label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Hash className="w-4 h-4 text-slate-500" />
                            </div>
                            <input required name="jerseyNumber" value={formData.jerseyNumber} onChange={handleInputChange} type="number" placeholder="10" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-2 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner" />
                          </div>
                        </div>
                     </div>

                     {/* Photo Upload */}
                     <div className="lg:col-span-2 pt-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Player Photo <span className="text-red-500 ml-0.5">*</span></label>
                       
                       <label htmlFor="photo-upload" className={`flex items-center gap-6 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${photoPreview ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}`}>
                          <div className="relative w-20 h-20 shrink-0">
                            <div className={`absolute inset-0 rounded-full border-2 ${photoPreview ? 'border-blue-500' : 'border-slate-600'} overflow-hidden shadow-lg flex items-center justify-center bg-slate-900`}>
                              {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-slate-600" />
                              )}
                            </div>
                            {photoPreview && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-grow">
                            <h4 className="text-sm font-bold text-white mb-1">{photoPreview ? 'Photo Selected' : 'Upload Image'}</h4>
                            <p className="text-xs text-slate-400 mb-2">{photoPreview ? 'Click to change photo' : 'Drag & drop or click to browse'}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                              <UploadCloud className="w-3 h-3" /> Max 5MB
                            </span>
                          </div>
                       </label>
                       <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                     </div>

                   </div>

                   <button 
                     type="button"
                     className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
                     onClick={() => {
                        if (
                          formData.fullName && formData.age && formData.phoneNumber &&
                          formData.wing && formData.flatNumber && formData.jerseyName &&
                          formData.jerseySize && formData.jerseyNumber && formData.photo &&
                          formData.email && formData.password
                        ) {
                          if (!formData.email.includes('@')) {
                            alert('Please enter a valid email address.')
                            return
                          }
                          if (formData.password.length < 6) {
                            alert('Password must be at least 6 characters long.')
                            return
                          }
                          setStep(2)
                        } else {
                          alert('Please fill all required fields, including your email, password, and player photo.')
                        }
                      }}
                   >
                     Continue to Payment <ChevronRight className="w-5 h-5" />
                   </button>
                 </motion.div>
               )}

               {/* STEP 2: PAYMENT */}
               {step === 2 && (
                 <motion.form key="step2" onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10 space-y-8 text-center py-4">
                   
                   <div className="flex justify-between items-center mb-4">
                     <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-400 font-bold hover:text-white transition-colors flex items-center gap-1">
                       ← Back
                     </button>
                     <div className="flex items-center gap-2">
                       <div className="w-4 h-1 bg-blue-500/30 rounded-full" />
                       <div className="w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                     </div>
                   </div>

                   <div>
                     <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)] transform -rotate-6">
                        <span className="text-3xl font-black text-white">₹</span>
                     </div>
                     <h3 className="text-5xl font-black text-white tracking-tighter mb-2">500</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tournament Entry Fee</p>
                   </div>

                   <div className="w-56 h-56 bg-white mx-auto rounded-3xl flex items-center justify-center shadow-2xl p-4">
                     <div className="w-full h-full border-4 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                       <p className="text-slate-400 font-bold font-mono text-sm">[ UPI QR CODE ]</p>
                     </div>
                   </div>

                   <div className="text-left">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction UTR Number</label>
                     <input required name="utrNumber" value={formData.utrNumber} onChange={handleInputChange} type="text" placeholder="Enter 12-digit UTR" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-slate-800 transition-all shadow-inner text-center font-mono tracking-widest text-lg" />
                   </div>

                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                     {isSubmitting ? (
                       <span className="animate-pulse">Verifying...</span>
                     ) : (
                       <>Complete Registration <CheckCircle2 className="w-5 h-5" /></>
                     )}
                   </button>
                 </motion.form>
               )}

               {/* STEP 3: SUCCESS */}
               {step === 3 && (
                 <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center py-12 space-y-6">
                   <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                     <CheckCircle2 className="w-12 h-12 text-green-400" />
                   </div>
                   
                   <div>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Draft Entry Saved</h3>
                     <p className="text-slate-400 text-sm max-w-xs mx-auto">Your registration is pending payment verification by the admins.</p>
                   </div>
                   
                   <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 my-8 text-left">
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Player</p>
                     <p className="text-lg font-black text-white">{formData.fullName}</p>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-3 mb-1">UTR</p>
                     <p className="text-sm font-mono text-white">{formData.utrNumber}</p>
                   </div>

                   <button 
                     onClick={() => window.open(`https://wa.me/1234567890?text=Registered! Name: ${formData.fullName}, UTR: ${formData.utrNumber}`, '_blank')}
                     className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                   >
                     Send Proof on WhatsApp
                   </button>
                 </motion.div>
               )}

             </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  )
}
