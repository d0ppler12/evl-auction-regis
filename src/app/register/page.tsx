"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Building2,
  Shirt,
  Hash,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Mail,
  Lock,
  Award,
  Users,
  Link,
} from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1 = Registration form, 3 = Success page
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phoneNumber: "",
    wing: "",
    flatNumber: "",
    jerseyName: "",
    jerseySize: "",
    jerseyNumber: "",
    experience: "", // Maps to volleyball_experience: "Played prior" or "Playing for the first time"
    photo: "",
    email: "",
    password: "",
    gender: "", // Maps to gender: "Male" or "Female"
  });

  const handleInputChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image file is too large. Please select a photo under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Create hidden canvas for client-side resizing and optimization
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG at 0.8 quality
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          setPhotoPreview(compressedBase64);
          setFormData((prev) => ({ ...prev, photo: compressedBase64 }));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.age ||
      !formData.phoneNumber ||
      !formData.wing ||
      !formData.flatNumber ||
      !formData.jerseyName ||
      !formData.jerseySize ||
      !formData.jerseyNumber ||
      !formData.photo ||
      !formData.email ||
      !formData.password ||
      !formData.gender ||
      !formData.experience
    ) {
      alert(
        "Please fill all required fields, select a gender, an experience level, and upload your profile photo.",
      );
      return;
    }

    // Strong email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Strong password validation
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Indian mobile phone validation (exactly 10 digits stripped)
    const phoneDigits = formData.phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Valid age range validation
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 90) {
      alert("Please enter a valid age between 10 and 90.");
      return;
    }

    // Valid jersey number validation
    const jerseyNum = parseInt(formData.jerseyNumber);
    if (isNaN(jerseyNum) || jerseyNum < 0 || jerseyNum > 999) {
      alert("Please enter a valid jersey number between 0 and 999.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          age: formData.age,
          phone_number: formData.phoneNumber,
          wing_building: `${formData.wing}-${formData.flatNumber}`,
          jersey_name: formData.jerseyName,
          jersey_size: formData.jerseySize,
          jersey_number: formData.jerseyNumber,
          utr_number: "CASH", // Strictly cash payments only
          volleyball_experience: formData.experience,
          photo: formData.photo,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
        }),
      });
      const data = await res.json();
      setIsSubmitting(false);
      if (res.ok) setStep(3);
      else alert(data.error || "Error submitting registration");
    } catch {
      setIsSubmitting(false);
      alert("Error submitting registration");
    }
  };

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
                <span className="font-black text-white italic text-xl tracking-tighter">
                  EVL
                </span>
              </div>
              <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">
                Monsoon Smash
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-6 italic">
              YOUR GAME
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                BEGINS HERE.
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-300 font-medium mb-12 max-w-md">
              From the Futsal court to the EVL spotlight — register now and
              enter the Monsoon Smash auction pool.
            </p>

            <div className="border-t border-white/10 pt-8">
              <div>
                <div className="text-3xl font-black text-white mb-1">₹700</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Player Entry Fee
                </div>
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
              {/* MAIN FORM */}
              {step === 1 && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="relative z-10 space-y-6"
                >
                  {/* Header */}
                  <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                        Player Registration
                      </h3>
                      <p className="text-sm text-slate-400">
                        Fill in details to join the draft pool.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => window.open("/players/login", "_SELF")}
                        className="px-8 py-4 rounded-xl bg-gold hover:bg-yellow-400 text-background font-bold shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all flex items-center gap-2 hover:-translate-y-1"
                      >
                        LOGIN
                      </button>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Full Name <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <input
                          required
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          type="text"
                          placeholder="Enter your full name"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Email Address{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-slate-500" />
                        </div>
                        <input
                          required
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          type="email"
                          placeholder="you@domain.com"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Password <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-slate-500" />
                        </div>
                        <input
                          required
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          type="password"
                          placeholder="Min 6 characters"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Gender <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <select
                          required
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-500">
                            Select Gender
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Age <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <input
                          required
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          type="number"
                          placeholder="Years (10 - 90)"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Prior Volleyball Play Experience */}
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Volleyball Experience{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Award className="w-5 h-5 text-slate-500" />
                        </div>
                        <select
                          required
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-500">
                            Select Experience Level
                          </option>
                          <option value="Played prior">Played prior</option>
                          <option value="Playing for the first time">
                            Playing for the first time
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Wing and Flat Number */}
                    <div className="flex gap-4 lg:col-span-2">
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Wing <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building2 className="w-4 h-4 text-slate-500" />
                          </div>
                          <select
                            required
                            name="wing"
                            value={formData.wing}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-gray-500">
                              Wing
                            </option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Flat No.{" "}
                          <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            required
                            name="flatNumber"
                            value={formData.flatNumber}
                            onChange={handleInputChange}
                            type="text"
                            placeholder="101"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-2 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Phone Number{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="w-5 h-5 text-slate-500" />
                        </div>
                        <input
                          required
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          type="tel"
                          placeholder="10-digit mobile number"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Jersey Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Jersey Name{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Shirt className="w-5 h-5 text-slate-500" />
                        </div>
                        <input
                          required
                          name="jerseyName"
                          value={formData.jerseyName}
                          onChange={handleInputChange}
                          type="text"
                          placeholder="Name on back"
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Jersey Size & Number */}
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Size <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <select
                          required
                          name="jerseySize"
                          value={formData.jerseySize}
                          onChange={handleInputChange}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-500">
                            Size
                          </option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                        </select>
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          No. <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="w-4 h-4 text-slate-500" />
                          </div>
                          <input
                            required
                            name="jerseyNumber"
                            value={formData.jerseyNumber}
                            onChange={handleInputChange}
                            type="number"
                            placeholder="10"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-2 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="lg:col-span-2 pt-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Player Photo{" "}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>

                      <label
                        htmlFor="photo-upload"
                        className={`flex items-center gap-6 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${photoPreview ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700 hover:border-slate-500 bg-slate-800/30"}`}
                      >
                        <div className="relative w-20 h-20 shrink-0">
                          <div
                            className={`absolute inset-0 rounded-full border-2 ${photoPreview ? "border-blue-500" : "border-slate-600"} overflow-hidden shadow-lg flex items-center justify-center bg-slate-900`}
                          >
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
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
                          <h4 className="text-sm font-bold text-white mb-1">
                            {photoPreview
                              ? "Photo Selected & Compressed"
                              : "Upload Photo"}
                          </h4>
                          <p className="text-xs text-slate-400 mb-2">
                            {photoPreview
                              ? "Click to change photo"
                              : "Browse player profile photo"}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                            <UploadCloud className="w-3 h-3" /> Auto-Optimized
                          </span>
                        </div>
                      </label>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Cash Details Alert */}
                  <div className="bg-slate-800/40 border border-emerald-500/20 rounded-2xl p-6 text-left shadow-inner relative overflow-hidden mt-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[20px] rounded-full pointer-events-none" />
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-black">
                        💵
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">
                          CONFIRM YOUR ENTRY
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Complete your ₹700 registration fee in cash through
                          the EVL coordinators below:
                          <br />
                          Nikhil Naik <br />
                          Parth Thakker <br />
                          Tanish Gupta
                        </p>
                        <p className="text-xs text-emerald-400 font-bold mt-2">
                          Player profiles will be approved after payment
                          confirmation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">
                        Submitting Profile...
                      </span>
                    ) : (
                      <>
                        Submit Registration <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* SUCCESS PAGE */}
              {step === 3 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 text-center py-12 space-y-6"
                >
                  <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                      REGISTRATION COMPLETE
                    </h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                      Your player profile has been saved successfully. To
                      confirm your eligibility, please pay the ₹700 entry fee in
                      cash to the EVL coordinators.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 my-8 text-left max-w-sm mx-auto">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Player
                    </p>
                    <p className="text-lg font-black text-white">
                      {formData.fullName}
                    </p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-3 mb-1">
                      Payment Mode
                    </p>
                    <p className="text-sm font-semibold text-emerald-400">
                      Cash Payment (Pending Verification)
                    </p>
                  </div>

                  <button
                    onClick={() => window.open("/players/login", "_self")}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    RETURN TO PLAYER LOGIN
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
