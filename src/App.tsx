import React, { useState, useEffect } from "react";
import { 
  GraduationCap, Sparkles, BookOpen, Users, Compass, HelpCircle, 
  Lightbulb, AlertCircle, RefreshCw, FileSpreadsheet, Award, Library, Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ScenarioItem, StudentAttempt } from "./types";
import { PRESEEDED_ITEMS } from "./preseededData";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";

// Persistent state wrapper helpers
const LOCAL_STORAGE_ITEMS_KEY = "biolearn_items_v1";
const LOCAL_STORAGE_ATTEMPTS_KEY = "biolearn_attempts_v1";

export default function App() {
  // Navigation Role Selection: 'hub' | 'teacher' | 'student'
  const [currentRole, setCurrentRole] = useState<"hub" | "teacher" | "student">("hub");

  // Load scenariosbank
  const [items, setItems] = useState<ScenarioItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse items bank from storage, falling back to seeds...", e);
    }
    // Inject custom seed field to prevent deletion of starters
    return PRESEEDED_ITEMS.map(it => ({ ...it, isPreseeded: true }));
  });

  // Load student attempts scorecard
  const [attempts, setAttempts] = useState<StudentAttempt[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ATTEMPTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse student attempts tracker", e);
    }
    return [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ATTEMPTS_KEY, JSON.stringify(attempts));
  }, [attempts]);

  // Add Item to the shared bank (Teacher workspace)
  const handleSaveItem = (newItem: ScenarioItem) => {
    setItems((prev) => {
      const index = prev.findIndex((itm) => itm.id === newItem.id);
      if (index > -1) {
        const copy = [...prev];
        copy[index] = newItem;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  // Delete custom generated exam item
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this exam item from your bank?")) {
      setItems((prev) => prev.filter((itm) => itm.id !== itemId));
    }
  };

  // Log finished student attempt
  const handleAddAttempt = (newAttempt: StudentAttempt) => {
    setAttempts((prev) => [...prev, newAttempt]);
  };

  // Inject 12 highly realistic mock student reports for Gayaza High, Budo, Kiira, Makerere College
  const handleInjectDemoReports = () => {
    const mockStudents = [
      { name: "Opio Patrick", school: "Kiira College Mwiri" },
      { name: "Namubiru Sarah", school: "Gayaza High School" },
      { name: "Aheebwa Joseph", school: "St. Mary's College Kisubi" },
      { name: "Acen Proscovia", school: "Nabisunsa Girls" },
      { name: "Nsubuga Aloni", school: "King's College Budo" },
      { name: "Kembabazi Ritah", school: "Bweranyangi Girls" },
      { name: "Wanyama Emmanuel", school: "Makerere College School" },
      { name: "Aol Deborah", school: "Gulu High School" },
      { name: "Okot Denis", school: "Lira Town College" },
      { name: "Musoke Henry", school: "Mengon Secondary School" },
      { name: "Nakato Justine", school: "Trinity College Nabbingo" },
      { name: "Chepkurui Shida", school: "Kapchorwa Secondary School" }
    ];

    const injected: StudentAttempt[] = [];

    // Ggaba Ecology seed attempts (total max: 24 marks)
    const ggabaItem = PRESEEDED_ITEMS[0]; // Ggaba ecology
    // Jinja genetics (total max: 18 marks)
    const jinjaItem = PRESEEDED_ITEMS[1]; // Jinja genetics
    // Mukono plant nutrition (total max: 18 marks)
    const mukonoItem = PRESEEDED_ITEMS[2]; // Mukono nutrition

    mockStudents.forEach((stud, index) => {
      const attemptedAt = new Date(Date.now() - index * 6 * 3600 * 1000).toISOString();
      const num = index % 3;

      if (num === 0) {
        // Ggaba Ecology Attempt
        const answers = {
          1: "Eutrophication takes place in Murchison Bay. Chemical run-off from agricultural fertilizers releases nutrients which causes algae to grow uncontrollably on Lake Victoria, blocking light completely and causing fish to drown.",
          2: "No chemical herbicides must be sprayed as this ruins Tilapia. Instead, we should release biological natural enemies like specialized weevils to eat the water hyacinth, and the community can harvest them to build local baskets.",
          3: "Phytoplankton -> Tilapia -> Aloni."
        };
        const grades = {
          1: {
            score: Math.round(7 + Math.random() * 3),
            feedback: "Splendid job! You correctly identified eutrophication and mapped photosynthetic blockages to oxygen starvation in Ggaba tilapias.",
            model_answer: ggabaItem.tasks[0].model_answer,
            evaluated: true
          },
          2: {
            score: Math.round(5 + Math.random() * 3),
            feedback: "Excellent creativity. The bio-weevil suggestion and manual weaving recommendations align exactly with local circular economy goals.",
            model_answer: ggabaItem.tasks[1].model_answer,
            evaluated: true
          },
          3: {
            score: Math.round(4 + Math.random() * 2),
            feedback: "Highly competent. Correct food chain modeling with trophic categories well specified.",
            model_answer: ggabaItem.tasks[2].model_answer,
            evaluated: true
          }
        };

        const totalScore = grades[1].score + grades[2].score + grades[3].score;
        injected.push({
          id: `demo-${index}`,
          studentName: stud.name,
          itemId: ggabaItem.id,
          itemTitle: "Ecology Case - Ggaba Murchison Bay (S6)",
          answers,
          grades,
          totalScore,
          totalAvailable: 24,
          attemptedAt
        });

      } else if (num === 1) {
        // Jinja Genetics Attempt
        const answers = {
          1: "Peter and Monica have genotype HbA HbS. By using a genetic cross diagram, their offspring have a 25% chance of being normal HbA HbA, 50% chance of being sickle cell trait HbA HbS, and 25% chance of severe disease HbS HbS.",
          2: "The HbS allele stays prevalent in Jinja because of natural selection. robert has protected red cells that clear malaria, whereas severe normal children Jane suffer worse malaria. Thus, Robert survives better and passes genetic material onwards."
        };
        const grades = {
          1: {
            score: Math.round(6 + Math.random() * 2),
            feedback: "Good mathematical accuracy. The Punnett square probabilities correspond nicely to 1:2:1 ratios.",
            model_answer: jinjaItem.tasks[0].model_answer,
            evaluated: true
          },
          2: {
            score: Math.round(8 + Math.random() * 2),
            feedback: "Incredible analysis. Protection against lethal Plasmodium falciparum malaria in heterozygotes is the primary selective pressure operating near Jinja banks.",
            model_answer: jinjaItem.tasks[1].model_answer,
            evaluated: true
          }
        };

        const totalScore = grades[1].score + grades[2].score;
        injected.push({
          id: `demo-${index}`,
          studentName: stud.name,
          itemId: jinjaItem.id,
          itemTitle: "Malaria & Sickle Cell - Jinja Banks (S6)",
          answers,
          grades,
          totalScore,
          totalAvailable: 18,
          attemptedAt
        });

      } else {
        // Mukono Plant Nutrition Attempt
        const answers = {
          1: "Matooke banana leaves are C3, meaning they are inefficient under 34 degrees. Maize crops are C4 plants with Kranz anatomy. Maize fixes carbon dioxide using PEP carboxylase which does not do wasteful photorespiration.",
          2: "Mr Mukasa can implement shade-grown banana plantations, use composted organic mulch to trap moisture, and utilize gravity micro-irrigation using bamboo tubes during sunset."
        };
        const grades = {
          1: {
            score: Math.round(7 + Math.random() * 3),
            feedback: "Thorough biochemical explanation. RuBisCO oxygenation vs PEP Carboxylase efficiency was analyzed with immense biological competence.",
            model_answer: mukonoItem.tasks[0].model_answer,
            evaluated: true
          },
          2: {
            score: Math.round(6 + Math.random() * 2),
            feedback: "Wonderful agricultural recommendations. Mulching and agroforestry arrangements are completely viable for Nakifuma soils and humidity.",
            model_answer: mukonoItem.tasks[1].model_answer,
            evaluated: true
          }
        };

        const totalScore = grades[1].score + grades[2].score;
        injected.push({
          id: `demo-${index}`,
          studentName: stud.name,
          itemId: mukonoItem.id,
          itemTitle: "Matooke vs Maize - Mukono Farm (S5)",
          answers,
          grades,
          totalScore,
          totalAvailable: 18,
          attemptedAt
        });
      }
    });

    setAttempts((prev) => [...prev, ...injected]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-300/30">
      
      {/* BRAND HEADER BOARD (No print covers print layout automatically) */}
      <header className="no-print bg-emerald-900 border-b-2 border-amber-400 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Main logo emblem */}
          <div 
            onClick={() => setCurrentRole("hub")}
            className="flex items-center space-x-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <span className="text-emerald-900 font-bold text-xl font-display">B</span>
            </div>
            <div>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-fit leading-none mb-1">
                NCDC CBC Biology S1–S6
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight font-display leading-none text-white uppercase">
                CURRITECH HUB <span className="text-amber-400">Biolearn</span>
              </h1>
              <span className="text-[10px] text-emerald-250 block mt-1 font-mono tracking-wider font-semibold">curritechhub.cbc.ug</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentRole("hub")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentRole === "hub" 
                  ? "bg-white/10 text-white border border-white/20" 
                  : "text-emerald-100 hover:bg-white/5 hover:text-white"
              }`}
            >
              Overview Portal
            </button>
            
            <button
              onClick={() => setCurrentRole("teacher")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center space-x-1.5 border border-transparent shadow-xs ${
                currentRole === "teacher" 
                  ? "bg-amber-400 text-emerald-950 hover:bg-amber-500 hover:border-amber-500 shadow-xs" 
                  : "bg-white/5 text-emerald-100 border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher Workspace</span>
            </button>

            <button
              onClick={() => setCurrentRole("student")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center space-x-1.5 border border-transparent shadow-xs ${
                currentRole === "student" 
                  ? "bg-amber-400 text-emerald-950 hover:bg-amber-500 hover:border-amber-500 shadow-xs" 
                  : "bg-white/5 text-emerald-100 border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Student Exercise Book</span>
            </button>
          </div>
        </div>
      </header>

      {/* PORTAL MAIN CONTENT BODY */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          
          {/* A. PLATFORM HUB LANDING PAGE */}
          {currentRole === "hub" && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 max-w-5xl mx-auto"
            >
              {/* Jumbotron section */}
              <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm overflow-hidden relative flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -z-1 opacity-70" />
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center space-x-2 text-xs font-bold bg-amber-400/10 text-emerald-800 border border-amber-400/20 px-3 py-1 rounded-full w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ugandan National Curriculum Development Centre (NCDC) Aligned</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight font-display leading-[1.15]">
                    Empower High-Fidelity <br />
                    <span className="text-emerald-900">Biology Competency</span> in Uganda
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                    Uganda's curriculum shift moves away from memorization of biochemical formulas 
                    and taxonomies towards <strong>scenario-based practical applications</strong>. CURRITECH HUB Biolearn bridges this gap 
                    by providing teachers with instant curriculum alignment tools and students with prompt, AI-evaluated digital assessments.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-3">
                    <button
                      onClick={() => setCurrentRole("teacher")}
                      className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-colors duration-150"
                    >
                      Access Teacher Workspace
                    </button>
                    <button
                      onClick={() => setCurrentRole("student")}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-xs transition-colors duration-150"
                    >
                      Enter Student Exercise Book
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-80 shrink-0">
                  {/* Decorative visual container */}
                  <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-md border-b-4 border-amber-400 space-y-4 text-xs leading-relaxed max-w-sm mx-auto">
                    <div className="flex items-center space-x-1 text-amber-400 font-bold tracking-wider uppercase text-[10px]">
                      <Library className="w-3.5 h-3.5" />
                      <span>Curriculum Focus</span>
                    </div>
                    <p className="font-serif italic font-medium">
                      &ldquo;The Advanced Curriculum adopted learner-centered approaches. Formative assessment in Biology will focus on the acquisition of required competencies.&rdquo;
                    </p>
                    <div className="border-t border-emerald-800/60 pt-2.5 flex items-center justify-between text-[10px] text-emerald-100 font-sans">
                      <span>NCDC Advanced Biology</span>
                      <span>Kampala, Uganda</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento informational blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-950 flex items-center justify-center font-bold mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-900" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">AI Scenario Generator</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select a class (S1-S6) and a specific topic to instantly draft real-life Ugandan scenario questions loaded with embedded concepts, complete with rubrics and mark schemes.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-950 flex items-center justify-center font-bold mb-3">
                    <Award className="w-5 h-5 text-emerald-900" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Instant Student Grading</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Students submit multi-paragraph answers to tasks and receive immediate evaluation scorecards with structural feedback indicating competencies shown or gaps to address.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 text-amber-800 flex items-center justify-center font-bold mb-3">
                    <Printer className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Printable UNEB Handouts</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Print beautifully formatted exam booklets and matching marking guides directly to physical copies or save as PDF, customized with your secondary school's credentials and date.
                  </p>
                </div>

              </div>

              {/* Curriculum Summary Panel */}
              <div className="bg-emerald-950 text-white rounded-xl p-6 sm:p-8 space-y-4">
                <span className="text-[10px] text-amber-400 font-mono font-extrabold uppercase tracking-widest block">CBC Biology Syllabus (S1-S6) Core Topics Covered</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1 p-3 bg-white/5 rounded-lg border border-white/5">
                    <strong className="text-emerald-300">Junior Level (S1 - S3)</strong>
                    <p className="text-emerald-100/80 leading-relaxed">Scope covers microscopy, cellular organization, soils, respiratory mechanics, human pathogens, homeostasis parameters, and vertebrate skeletal systems.</p>
                  </div>
                  <div className="space-y-1 p-3 bg-white/5 rounded-lg border border-white/5">
                    <strong className="text-emerald-300">Intermediate level (S4)</strong>
                    <p className="text-emerald-100/80 leading-relaxed font-sans">Ecological food cascades, mammalian organs, reproduction, primary genetic traits, and medical application of biotechnology in rural Uganda.</p>
                  </div>
                  <div className="space-y-1 p-3 bg-white/5 rounded-lg border border-white/5">
                    <strong className="text-amber-300">Advanced Placement (S5 - S6)</strong>
                    <p className="text-emerald-100/80 leading-relaxed">C3 vs C4 photosynthetic cycles (Kranz anatomy in Maize vs Matooke), immunology, genetic and evolutionary advancements, and carbon footprints.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* B. TEACHER WORKSPACE PORTAL */}
          {currentRole === "teacher" && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
            >
              <TeacherDashboard
                items={items}
                attempts={attempts}
                onSaveItem={handleSaveItem}
                onDeleteItem={handleDeleteItem}
                onInjectDemoReports={handleInjectDemoReports}
              />
            </motion.div>
          )}

          {/* C. STUDENT STUDY PRACTICE PORTAL */}
          {currentRole === "student" && (
            <motion.div
              key="student"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
            >
              <StudentDashboard
                items={items}
                attempts={attempts}
                onAddAttempt={handleAddAttempt}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* PLATFORM ROOT FOOTER */}
      <footer className="no-print bg-slate-100 border-t border-gray-200 py-8 mt-12 text-center text-xs text-gray-500 space-y-2">
        <p className="font-bold text-slate-700">&copy; CURRITECH HUB Biolearn CBC Uganda.</p>
        <p className="text-emerald-800 font-semibold font-mono">
          Portal URL: <a href="https://curritechhub.cbc.ug" className="underline hover:text-emerald-900">curritechhub.cbc.ug</a>
        </p>
        <p className="text-gray-400 font-sans">Aligned strictly with NCDC Competence-Based Curriculum for Biology & UNEB Scenario standards.</p>
      </footer>
    </div>
  );
}
