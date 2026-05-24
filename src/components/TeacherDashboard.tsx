import React, { useState, useEffect } from "react";
import { 
  Plus, Edit2, Save, Printer, Trash2, Search, BookOpen, AlertCircle, Sparkles, 
  ChevronRight, ArrowLeft, CheckCircle, Database, BarChart3, Users, FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClassLevel, Difficulty, ScenarioItem, Task, StudentAttempt } from "../types";
import { SYLLABUS_TOPICS } from "../preseededData";

interface TeacherDashboardProps {
  items: ScenarioItem[];
  attempts: StudentAttempt[];
  onSaveItem: (newItem: ScenarioItem) => void;
  onDeleteItem: (itemId: string) => void;
  onInjectDemoReports: () => void;
}

export default function TeacherDashboard({
  items,
  attempts,
  onSaveItem,
  onDeleteItem,
  onInjectDemoReports
}: TeacherDashboardProps) {
  // Tabs: 'generate' | 'bank' | 'reports'
  const [activeTab, setActiveTab] = useState<"generate" | "bank" | "reports">("generate");

  // Form states
  const [classLevel, setClassLevel] = useState<ClassLevel>("S5");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Intermediate");
  const [numTasks, setNumTasks] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [genError, setGenError] = useState("");

  // Edit states for generated / selected item
  const [editingItem, setEditingItem] = useState<ScenarioItem | null>(null);
  const [selectedItemForView, setSelectedItemForView] = useState<ScenarioItem | null>(null);
  const [viewMode, setViewMode] = useState<"standard" | "exam" | "markScheme">("standard");

  // Filter bank states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("All");
  
  // Custom School header for print
  const [schoolName, setSchoolName] = useState("PEARL OF AFRICA HIGH SCHOOL");
  const [examDate, setExamDate] = useState("MAY CURRITECH HUB Biolearn");

  // Sync topic select when class level changes
  useEffect(() => {
    const available = SYLLABUS_TOPICS[classLevel];
    if (available && available.length > 0) {
      setTopic(available[0]);
    }
  }, [classLevel]);

  // Handle AI draft generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenError("");
    setLoadingStep(0);

    const steps = [
      "Accessing NCDC CBC Biology Syllabus benchmarks...",
      "Designing Uganda-specific narrative context...",
      "Embedding target biological concepts naturally...",
      "Formulating UNEB competence-based tasks (Bloom's Taxonomy)...",
      "Drafting model rubrics and marking schemes..."
    ];

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 2200);

    try {
      const res = await fetch("/api/generate-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          class_level: classLevel,
          difficulty,
          num_tasks: numTasks
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate exam item.");
      }

      const data = await res.json();
      // Inject ID
      const newItem: ScenarioItem = {
        ...data,
        id: "ai-" + Date.now(),
        topic: topic // lock selected topic
      };
      
      clearInterval(interval);
      setEditingItem(newItem);
    } catch (err: any) {
      setGenError(err.message || "Something went wrong during generation.");
    } finally {
      setGenerating(false);
      clearInterval(interval);
    }
  };

  // Edit handlers
  const handleUpdateItemField = (field: keyof ScenarioItem, value: any) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      [field]: value
    });
  };

  const handleUpdateTaskField = (index: number, field: keyof Task, value: any) => {
    if (!editingItem) return;
    const updatedTasks = [...editingItem.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value
    };
    setEditingItem({
      ...editingItem,
      tasks: updatedTasks
    });
  };

  const handleSaveDraft = () => {
    if (!editingItem) return;
    onSaveItem(editingItem);
    setSelectedItemForView(editingItem);
    setEditingItem(null);
    setActiveTab("bank");
  };

  // Analytical Competency Score Calculator
  const getCompetencyAverages = () => {
    const competencies = [
      "Critical thinking and problem-solving",
      "Creativity and innovation",
      "Communication",
      "Co-operation and Self-Directed Learning"
    ];

    const results: { [key: string]: { scored: number; total: number; count: number } } = {};
    competencies.forEach(comp => {
      results[comp] = { scored: 0, total: 0, count: 0 };
    });

    attempts.forEach(attempt => {
      Object.keys(attempt.grades).forEach(key => {
        const taskNum = parseInt(key);
        // Find corresponding task in original items to get competency
        const item = items.find(it => it.id === attempt.itemId);
        const task = item?.tasks.find(tk => tk.task_number === taskNum);
        
        if (task) {
          // Normalize matching competency
          let compKey = task.competency;
          if (compKey.toLowerCase().includes("critical") || compKey.toLowerCase().includes("problem")) {
            compKey = "Critical thinking and problem-solving";
          } else if (compKey.toLowerCase().includes("creativity") || compKey.toLowerCase().includes("innovation")) {
            compKey = "Creativity and innovation";
          } else if (compKey.toLowerCase().includes("communication")) {
            compKey = "Communication";
          } else {
            compKey = "Co-operation and Self-Directed Learning";
          }

          const grade = attempt.grades[taskNum];
          if (grade && grade.evaluated) {
            results[compKey].scored += grade.score;
            results[compKey].total += task.marks;
            results[compKey].count += 1;
          }
        }
      });
    });

    return competencies.map(comp => {
      const data = results[comp];
      const avg = data.total > 0 ? Math.round((data.scored / data.total) * 100) : 0;
      return {
        name: comp,
        avg: avg,
        count: data.count
      };
    });
  };

  const competencyData = getCompetencyAverages();

  // Print execution helper
  const triggerPrint = (mode: "exam" | "markScheme") => {
    setViewMode(mode);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Filter items bank
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterClass === "All" || item.class_level === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Tab bar (Teacher navigation) */}
      <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex space-x-2">
        <button
          onClick={() => { setActiveTab("generate"); setSelectedItemForView(null); setEditingItem(null); }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === "generate" && !editingItem && !selectedItemForView
              ? "bg-emerald-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-emerald-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Scenario Generator (AI)</span>
        </button>
        <button
          onClick={() => { setActiveTab("bank"); setSelectedItemForView(null); setEditingItem(null); }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === "bank" && !editingItem && !selectedItemForView
              ? "bg-emerald-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-emerald-950"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Item Bank ({items.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab("reports"); setSelectedItemForView(null); setEditingItem(null); }}
          className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === "reports" && !editingItem && !selectedItemForView
              ? "bg-emerald-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-emerald-950"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Syllabus Reports & Gaps</span>
        </button>
      </div>

      {/* 1. EDIT MODE SCREEN */}
      {editingItem && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="no-print bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                Review & Edit Draft
              </span>
              <p className="text-sm text-slate-600">Tweak before committing to the Item Bank</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-sm text-slate-500 bg-white hover:bg-slate-50 rounded-lg border border-slate-200"
              >
                Cancel Draft
              </button>
              <button
                onClick={handleSaveDraft}
                className="bg-emerald-900 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-850 text-sm font-bold flex items-center space-x-1 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save to Item Bank</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Topic</label>
                <input 
                  type="text" 
                  value={editingItem.topic}
                  onChange={(e) => handleUpdateItemField("topic", e.target.value)}
                  className="w-full text-sm font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Class</label>
                <select 
                  value={editingItem.class_level}
                  onChange={(e) => handleUpdateItemField("class_level", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
                >
                  {["S1", "S2", "S3", "S4", "S5", "S6"].map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Difficulty</label>
                <select 
                  value={editingItem.difficulty}
                  onChange={(e) => handleUpdateItemField("difficulty", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
                >
                  {["Foundation", "Intermediate", "Advanced"].map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scenario Text input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-emerald-900 uppercase tracking-wider">
                  The Scenario Structure (Ugandan Real-life Stimulus)
                </label>
                <span className="text-xs text-slate-400">Target words: 150-300</span>
              </div>
              <textarea
                value={editingItem.scenario}
                onChange={(e) => handleUpdateItemField("scenario", e.target.value)}
                rows={8}
                className="w-full text-sm border border-slate-200 rounded-lg p-3 font-serif leading-relaxed focus:ring-1 focus:ring-emerald-850 focus:border-emerald-900"
              />
            </div>

            {/* Task edits */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>UNEB Competence Tasks</span>
                <span className="text-xs text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
                  Taxonomy Progression (Concept Application)
                </span>
              </h4>

              {editingItem.tasks.map((task, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="bg-emerald-900 text-white font-bold px-2 py-0.5 rounded">
                      Task {task.task_number}
                    </span>
                    <div className="flex space-x-2">
                      <span className="bg-white border rounded px-1.5 py-0.5">
                        Marks: 
                        <input 
                          type="number"
                          value={task.marks}
                          onChange={(e) => handleUpdateTaskField(idx, "marks", parseInt(e.target.value) || 0)}
                          className="w-8 ml-1 font-bold text-center border-b border-gray-300 focus:outline-none"
                        />
                      </span>
                      <span className="bg-white border rounded px-2 py-0.5">
                        Bloom: 
                        <select
                          value={task.bloom_level}
                          onChange={(e) => handleUpdateTaskField(idx, "bloom_level", e.target.value)}
                          className="font-semibold bg-transparent focus:outline-none ml-1 text-emerald-900"
                        >
                          {["Knowledge", "Comprehension", "Application", "Analysis", "Evaluation", "Creation"].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Task Question Text</label>
                    <textarea
                      value={task.task_text}
                      onChange={(e) => handleUpdateTaskField(idx, "task_text", e.target.value)}
                      rows={2}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:border-emerald-850 focus:ring-1 focus:ring-emerald-850"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Target CBC Generic Competency</label>
                      <select
                        value={task.competency}
                        onChange={(e) => handleUpdateTaskField(idx, "competency", e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-1.5 focus:border-emerald-850 focus:ring-1 focus:ring-emerald-850"
                      >
                        <option value="Critical thinking and problem-solving">Critical thinking and problem-solving</option>
                        <option value="Creativity and innovation">Creativity and innovation</option>
                        <option value="Communication">Communication</option>
                        <option value="Co-operation and Self-Directed Learning">Co-operation and Self-Directed Learning</option>
                        <option value="Mathematical Computation">Mathematical Computation</option>
                        <option value="Information and Communication Technology (ICT) Proficiency">ICT Proficiency</option>
                        <option value="Diversity and Multicultural Skills">Diversity and Multicultural Skills</option>
                        <option value="Lifelong learning">Lifelong learning</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Mark Scheme Scoring Guide</label>
                      <input
                        type="text"
                        value={task.mark_scheme}
                        onChange={(e) => handleUpdateTaskField(idx, "mark_scheme", e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-1.5 focus:border-emerald-850 focus:ring-1 focus:ring-emerald-850"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Model / Ideal Answer (for evaluation calibration)</label>
                    <textarea
                      value={task.model_answer}
                      onChange={(e) => handleUpdateTaskField(idx, "model_answer", e.target.value)}
                      rows={2}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:border-emerald-850 focus:ring-1 focus:ring-emerald-850"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. ITEM PRINTABLE PREVIEW MODAL/SCREEN */}
      {selectedItemForView && (
        <div className="space-y-4">
          <div className="no-print bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setSelectedItemForView(null)}
              className="flex items-center space-x-1.5 text-slate-500 hover:text-emerald-950 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => triggerPrint("exam")}
                className="bg-emerald-900 hover:bg-emerald-850 text-white px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Exam (Student Paper)</span>
              </button>
              <button
                onClick={() => triggerPrint("markScheme")}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Teacher Mark Scheme</span>
              </button>
            </div>
          </div>

          {/* Formatted printable paper component */}
          <div className="print-area bg-white text-black border border-gray-300 p-8 md:p-12 shadow-sm rounded-xl font-serif leading-relaxed">
            {/* National Exam Paper Sheet Styling */}
            <div className="border-b-4 border-double border-black pb-4 text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold font-display uppercase tracking-wider">{schoolName}</h2>
              <div className="flex justify-between items-center text-xs font-sans font-semibold px-4">
                <span>CLASS: {selectedItemForView.class_level} INTERIM ASSESSMENTS</span>
                <span>SUBJECT: BIOLOGY</span>
                <span>DATE: {examDate}</span>
              </div>
              <h3 className="text-md font-bold tracking-wide text-gray-700 font-sans border-t border-gray-200 pt-1.5 mt-2">
                {viewMode === "markScheme" ? "TEACHER ASSESSMENT GUIDELINES / MARKING MEMORANDUM" : "COMPETENCY-BASED SCENARIO-BEDA ASSESSMENT PAPER"}
              </h3>
            </div>

            {/* Instruction headers */}
            <div className="text-xs font-sans border border-black p-3 space-y-1 mb-8">
              <p className="font-bold">INSTRUCTIONS TO THE CANDIDATE:</p>
              {viewMode === "markScheme" ? (
                <ol className="list-decimal list-inside space-y-1">
                  <li>This document is private and confidential, intended strictly for examiners.</li>
                  <li>Incorporate full generic competencies: Critical thinking, problem-solving and ICT when assessing student's reasoning.</li>
                  <li>Award marks based on the sub-points indicated in the rubric scheme column.</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1">
                  <li>Read the real-life Ugandan scenario carefully before attempting any task.</li>
                  <li>Answer ALL tasks. Provide detailed explanations displaying biological accuracy and competent analysis.</li>
                  <li>Your answers must specifically draw from information presented in the narrative.</li>
                </ol>
              )}
            </div>

            {/* Topic tag */}
            <div className="mb-4 text-xs font-sans text-slate-500 uppercase tracking-widest flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span>Syllabus Topic: {selectedItemForView.topic}</span>
              <span>Level: {selectedItemForView.difficulty}</span>
            </div>

            {/* The actual Scenario text block */}
            <div className="bg-slate-100/50 p-5 border border-slate-200 rounded-lg italic text-slate-800 pr-5 py-4 leading-relaxed mb-8">
              <span className="font-bold font-sans text-[10px] bg-amber-400/25 text-emerald-950 border border-amber-400/30 px-2.5 py-0.5 rounded-md not-italic mr-2">
                SCENARIO DIALOGUE / CASE
              </span>
              {selectedItemForView.scenario}
            </div>

            {/* Numbered tasks */}
            <div className="space-y-6">
              <h3 className="font-sans text-xs font-extrabold uppercase tracking-widest border-b border-slate-200 pb-1.5 text-slate-400">
                Candidate Tasks & Question Guidelines
              </h3>
              
              {selectedItemForView.tasks.map((task) => (
                <div key={task.task_number} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-bold pr-12 text-slate-900">
                      <span className="font-sans text-emerald-900 mr-1.5 font-black">
                        Task {task.task_number}.
                      </span>
                      {task.task_text}
                    </p>
                    <span className="font-sans font-bold text-sm whitespace-nowrap">
                      [{task.marks} Marks]
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 font-sans italic">
                    Assessing CBC Competence: {task.competency} | Bloom cognitive level: {task.bloom_level}
                  </p>

                  {/* Render markings if view mode is "markScheme" */}
                  {viewMode === "markScheme" && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="bg-amber-50/60 text-amber-950 border border-amber-200 rounded p-3 text-xs mt-2 space-y-2 font-sans"
                    >
                      <div>
                        <strong className="text-amber-800">Ideal Model Answer:</strong>
                        <p className="mt-1 leading-relaxed italic">{task.model_answer}</p>
                      </div>
                      <div className="border-t border-amber-200/50 pt-2">
                        <strong className="text-amber-800">Scoring Rubric Scheme:</strong>
                        <p className="mt-1 leading-relaxed opacity-90 whitespace-pre-line">{task.mark_scheme}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* UNEB Footer stamp */}
            <div className="border-t border-gray-300 mt-12 pt-4 text-center text-xs font-sans text-gray-500 flex justify-between">
              <span>CURRITECH HUB Biolearn Uganda Assessment Engine</span>
              <span>** END OF BIOLOGY ASSESSMENT **</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. GENERATION FORM & PRESEEDED CONTAINER */}
      {activeTab === "generate" && !editingItem && !selectedItemForView && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
          
          {/* Generation form panel */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-emerald-950 font-display flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                <span>Generate New Exam Scenario</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Utilize the server-side Gemini Model to generate Uganda-context scenario questions based on NCDC CBC specifications.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Class levels */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Target Class Level</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {(["S1", "S2", "S3", "S4", "S5", "S6"] as ClassLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setClassLevel(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        classLevel === lvl
                          ? "bg-amber-400 text-emerald-950 border-amber-500 shadow-xs"
                          : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">S5 & S6 denote advanced level, S1 to S4 correspond to lower secondary.</p>
              </div>

              {/* Dynamic Topics based on syllabus */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Target Curriculum Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-emerald-800 focus:border-emerald-900 bg-white font-medium prose-input"
                >
                  {(SYLLABUS_TOPICS[classLevel] || []).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty and task count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Complexity</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-emerald-800 focus:border-emerald-900 bg-white prose-input"
                  >
                    <option value="Foundation">Foundation (Bloom LO1-3)</option>
                    <option value="Intermediate">Intermediate (Bloom LO2-4)</option>
                    <option value="Advanced">Advanced (HOTS LO3-6)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Number of Tasks</label>
                  <input
                    type="number"
                    min={2}
                    max={5}
                    value={numTasks}
                    onChange={(e) => setNumTasks(parseInt(e.target.value) || 2)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 bg-white font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-emerald-900 hover:bg-emerald-850 disabled:bg-emerald-800/40 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-xs transition duration-150 flex items-center justify-center space-x-2"
              >
                {generating ? (
                  <>
                    <div className="w-4.5 h-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1" />
                    <span>AI Generating Item...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Scenario-Based Item</span>
                  </>
                )}
              </button>

              {genError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-600 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{genError}</p>
                </div>
              )}
            </form>
          </div>

          {/* Right Preview/Aesthetic space */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between overflow-hidden relative min-h-[300px] shadow-sm">
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-50 rounded-full blur-2xl opacity-60 -z-1" />
            
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center space-y-4 py-8 text-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-200 border-t-emerald-900 rounded-full animate-spin" />
                    <Sparkles className="w-6 h-6 text-amber-500 absolute top-5 left-5 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <p className="font-extrabold text-slate-850 font-display tracking-tight text-md">Crafting UNEB-Aligned Scenario</p>
                    <p className="text-xs text-slate-650 font-semibold animate-pulse">
                      {["Accessing NCDC CBC Biology Syllabus benchmarks...",
                        "Designing Uganda-specific narrative context...",
                        "Embedding target biological concepts naturally...",
                        "Formulating UNEB competence-based tasks (Bloom's Taxonomy)...",
                        "Drafting model rubrics and marking schemes..."][loadingStep]}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">
                       Please wait, writing biological relationships under Ugandan realities...
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col justify-between py-2"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-xs bg-amber-400/15 text-emerald-900 border border-amber-400/20 px-3 py-1.5 rounded-full font-bold w-fit">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Uganda NCDC CBC Biology Guidelines (2025/CURRITECH HUB Biolearn)</span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-800 font-display tracking-tight leading-snug">
                      Shift from Rote Recall to Real-life Biological Analysis
                    </h4>

                    <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                      <p>
                        In Uganda's Competence-Based Curriculum (CBC), secondary biology items are structured into 
                        stimulated case-studies. Instead of asking candidates <em>"Define photosynthesis and describe C3 processes"</em>, 
                        the UNEB assessment presents <strong>Peter Mukasa's intercropped Matooke bank and dry spell anomalies in Nakifuma</strong>.
                      </p>
                      <p>
                        Learners are challenged to map this real-world hazard to photosynthesis chemical pathways (RuBisCO vs PEP Carboxylase photorespiration) and construct heat mitigation models.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                        <strong className="text-emerald-900 block mb-1 font-semibold">Ugandan Realities</strong>
                        <span className="text-slate-500 text-[11px] leading-relaxed">Integrates local names, climates, wetlands, malaria factors and endemic organisms.</span>
                      </div>
                      <div className="bg-amber-400/5 p-3.5 rounded-lg border border-slate-200 text-xs">
                        <strong className="text-amber-800 block mb-1 font-semibold">Competency Mapping</strong>
                        <span className="text-slate-500 text-[11px] leading-relaxed">Links questions to Critical thinking, Creativity, Problem-Solving, and Cooperation.</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 mt-4">
                    Ensure your <strong className="text-emerald-900 font-bold">GEMINI_API_KEY</strong> environment variable is saved in the platform context.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 4. SAVED ITEMS BANK WORKSPACE */}
      {activeTab === "bank" && !editingItem && !selectedItemForView && (
        <div className="space-y-4 no-print">
          {/* Header controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search topic or scenario details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
            </div>

            <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
              {["All", "S1", "S2", "S3", "S4", "S5", "S6"].map((classOpt) => (
                <button
                  key={classOpt}
                  onClick={() => setFilterClass(classOpt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    filterClass === classOpt
                      ? "bg-amber-400 text-emerald-950 shadow-xs"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {classOpt === "All" ? "All Levels" : `${classOpt} Syllabus`}
                </button>
              ))}
            </div>
          </div>

          {/* Grid display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layoutId={`card-${item.id}`}
                className="bg-white rounded-xl shadow-xs border border-slate-200 hover:border-slate-350 hover:shadow-sm transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="bg-amber-100 text-emerald-950 px-2.5 py-0.5 rounded-md font-extrabold uppercase text-[10px]">
                      {item.class_level}
                    </span>
                    <span className="text-slate-400 font-medium tracking-wide">
                      {item.difficulty} Difficulty
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 line-clamp-2 leading-snug">
                    {item.topic}
                  </h4>

                  <p className="text-xs text-gray-500 line-clamp-3 mt-2 leading-relaxed">
                    {item.scenario}
                  </p>

                  <div className="flex space-x-1.5 mt-3 text-[10px] text-gray-400 font-sans font-medium uppercase tracking-wider">
                    <span>({item.tasks.length} Structured Tasks)</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3.5 flex justify-between items-center">
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1 px-2 hover:bg-amber-50 text-amber-700 hover:text-amber-800 text-[11px] font-bold rounded flex items-center space-x-1 transition"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    {!item.isPreseeded && (
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 px-2 hover:bg-red-50 text-red-600 hover:text-red-700 text-[11px] font-bold rounded flex items-center space-x-1 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => { setSelectedItemForView(item); setViewMode("exam"); }}
                    className="bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900 hover:text-white px-3.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Assess & Print</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 shadow-xs">
                <Database className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No items match your filters.</p>
                <p className="text-xs">Adjust your search query or class level selection.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CLASS PERFORMANCE & SYLLABUS REPORTS */}
      {activeTab === "reports" && !editingItem && !selectedItemForView && (
        <div className="space-y-6 no-print">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-emerald-950 font-display flex items-center space-x-1.5">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  <span>NCDC Biology CBC Key Competency gaps</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Average student scoring distributions tracked automatically under the Uganda competence framework.
                </p>
              </div>

              {attempts.length === 0 && (
                <button
                  onClick={onInjectDemoReports}
                  className="bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-lg text-xs hover:bg-amber-500 transition-colors cursor-pointer"
                >
                  Inject 12 Student Mock Assessment Records
                </button>
              )}
            </div>

            {attempts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">No Assessment Records Found</p>
                <p className="text-xs max-w-sm mx-auto leading-relaxed mt-1">
                  Have students take assessment items in the student exercise portal, or click the gold button above to inject demo reports to see full dashboard analytics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Bar Charts representing Competency Gaps */}
                <div className="lg:col-span-6 space-y-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Average generic skills evaluation index
                  </h4>

                  <div className="space-y-4">
                    {competencyData.map((data, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate pr-4">{data.name}</span>
                          <span className="font-bold">{data.avg}% Average</span>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${data.avg}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              data.avg >= 70 
                                ? "bg-emerald-600" 
                                : data.avg >= 50 
                                ? "bg-amber-400" 
                                : "bg-red-500"
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>{data.count} Tasks Marked</span>
                          <span>
                            {data.avg >= 70 ? "Competence Demonstrated" : data.avg >= 50 ? "Approaching Target" : "Critical Gap Identified"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs leading-relaxed text-slate-700 space-y-1">
                    <strong className="text-emerald-950 block">Assessment Triangulation Note:</strong>
                    The Competence-Based Curriculum measures generic skill achievements using conversational marks and physical products. This AI tracker automatically captures written 'Product' grades and translates them into proficiency levels (Demonstrated / Approaching / Critical).
                  </div>
                </div>

                {/* Historic attempts list */}
                <div className="lg:col-span-6 space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Recent class assessment logs
                  </h4>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 divide-y divide-gray-100">
                    {attempts.slice().reverse().map((att, index) => {
                      const scorePercent = att.totalAvailable > 0 ? Math.round((att.totalScore / att.totalAvailable) * 100) : 0;
                      return (
                        <div key={index} className="flex items-center justify-between py-2 text-xs">
                          <div className="space-y-0.5">
                            <strong className="text-gray-800">{att.studentName}</strong>
                            <p className="text-gray-400 font-medium text-[11px] truncate max-w-[240px]">
                              Topic: {att.itemTitle}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] ${
                              scorePercent >= 70 ? "bg-emerald-50 text-emerald-700" : scorePercent >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                            }`}>
                              {att.totalScore} / {att.totalAvailable} ({scorePercent}%)
                            </span>
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5">{new Date(att.attemptedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
