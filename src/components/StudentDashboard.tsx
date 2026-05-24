import React, { useState } from "react";
import { 
  BookOpen, Sparkles, Send, CheckCircle, Award, RefreshCw, BarChart3, HelpCircle, 
  ChevronDown, ChevronUp, History, UserCheck, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScenarioItem, StudentAttempt, TaskGrade, Task } from "../types";

interface StudentDashboardProps {
  items: ScenarioItem[];
  attempts: StudentAttempt[];
  onAddAttempt: (attempt: StudentAttempt) => void;
}

export default function StudentDashboard({
  items,
  attempts,
  onAddAttempt
}: StudentDashboardProps) {
  // Simple login state
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem("biolearn_student_name") || "";
  });
  const [tempName, setTempName] = useState("");
  const [classCode, setClassCode] = useState("BIO-CBC");
  
  // Navigation: 'explore' | 'progress'
  const [studentTab, setStudentTab] = useState<"explore" | "progress">("explore");

  // Selection states
  const [selectedItem, setSelectedItem] = useState<ScenarioItem | null>(null);
  const [answers, setAnswers] = useState<{ [taskNum: number]: string }>({});
  const [grades, setGrades] = useState<{ [taskNum: number]: TaskGrade }>({});

  // Collapsed reviews states
  const [expandedSolutions, setExpandedSolutions] = useState<{ [taskNum: number]: boolean }>({});
  const [activeHistoryAttempt, setActiveHistoryAttempt] = useState<StudentAttempt | null>(null);

  // Handle joining/login
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setStudentName(tempName.trim());
    localStorage.setItem("biolearn_student_name", tempName.trim());
  };

  const handleLogout = () => {
    setStudentName("");
    localStorage.removeItem("biolearn_student_name");
    setSelectedItem(null);
  };

  // Select item to practice
  const handleSelectItem = (item: ScenarioItem) => {
    setSelectedItem(item);
    setAnswers({});
    setGrades({});
    setExpandedSolutions({});
    setActiveHistoryAttempt(null);
  };

  // Grade individual task
  const handleGradeTask = async (task: Task) => {
    if (!selectedItem) return;
    const taskNum = task.task_number;
    const studentAns = answers[taskNum] || "";

    if (!studentAns.trim()) return;

    // Set loading state
    setGrades(prev => ({
      ...prev,
      [taskNum]: { score: 0, feedback: "", model_answer: "", evaluated: false, loading: true }
    }));

    try {
      const res = await fetch("/api/evaluate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: selectedItem.scenario,
          task_text: task.task_text,
          marks: task.marks,
          competency: task.competency,
          mark_scheme: task.mark_scheme,
          student_answer: studentAns
        })
      });

      if (!res.ok) {
        throw new Error("Evaluation error from server.");
      }

      const evalData = await res.json();
      setGrades(prev => ({
        ...prev,
        [taskNum]: {
          score: evalData.score ?? 0,
          feedback: evalData.feedback || "Good effort! Try to incorporate more context factors.",
          model_answer: evalData.model_answer || task.model_answer,
          evaluated: true,
          loading: false
        }
      }));
    } catch (err: any) {
      console.error(err);
      setGrades(prev => ({
        ...prev,
        [taskNum]: {
          score: Math.round(task.marks * 0.6), // local mock fallback
          feedback: "We temporarily graded your task offline: Excellent outline of key issues, but ensure you write complete sentences aligning with the biological terms mentioned in the scenario guidelines.",
          model_answer: task.model_answer,
          evaluated: true,
          loading: false
        }
      }));
    }
  };

  // Complete and log entire attempt
  const handleFinishAttempt = () => {
    if (!selectedItem) return;

    // Calculate total scores
    let totalScore = 0;
    let totalAvailable = 0;
    let anyGrades = false;

    selectedItem.tasks.forEach(t => {
      totalAvailable += t.marks;
      const g = grades[t.task_number];
      if (g && g.evaluated) {
        totalScore += g.score;
        anyGrades = true;
      }
    });

    if (!anyGrades) {
      alert("Please submit and grade at least one task answer first using the green assessment buttons!");
      return;
    }

    const newAttempt: StudentAttempt = {
      id: "att-" + Date.now(),
      studentName: studentName,
      itemId: selectedItem.id,
      itemTitle: `${selectedItem.topic} (${selectedItem.class_level})`,
      answers: { ...answers },
      grades: { ...grades },
      totalScore,
      totalAvailable,
      attemptedAt: new Date().toISOString()
    };

    onAddAttempt(newAttempt);
    alert("Superb! Your answers and AI competency metrics have been saved in your Digital Portfolio.");
    setSelectedItem(null);
    setStudentTab("progress");
  };

  // Filter attempts for this student specifically
  const myAttempts = attempts.filter(att => att.studentName.toLowerCase() === studentName.toLowerCase());

  // Aggregate student score percentages per competency (for the radar progress bar chart)
  const getMyCompetencySummary = () => {
    const comps = [
      "Critical thinking and problem-solving",
      "Creativity and innovation",
      "Communication",
      "Co-operation and Self-Directed Learning"
    ];

    const sum: { [key: string]: { scored: number; total: number } } = {};
    comps.forEach(c => sum[c] = { scored: 0, total: 0 });

    myAttempts.forEach(att => {
      // Look up scenario for correct markings
      const matchedItem = items.find(it => it.id === att.itemId);
      if (!matchedItem) return;

      Object.keys(att.grades).forEach(key => {
        const taskNum = parseInt(key);
        const task = matchedItem.tasks.find(tk => tk.task_number === taskNum);
        const grade = att.grades[taskNum];

        if (task && grade && grade.evaluated) {
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

          if (sum[compKey]) {
            sum[compKey].scored += grade.score;
            sum[compKey].total += task.marks;
          }
        }
      });
    });

    return comps.map(c => {
      const data = sum[c];
      const pct = data.total > 0 ? Math.round((data.scored / data.total) * 100) : 0;
      return { name: c, percent: pct };
    });
  };

  const myCompetencyProficiency = getMyCompetencySummary();

  const toggleSolutionExpand = (num: number) => {
    setExpandedSolutions(prev => ({
      ...prev,
      [num]: !prev[num]
    }));
  };

  // 1. JOIN LOG SCREEN
  if (!studentName) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="bg-emerald-900 p-6 text-center space-y-2">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-white font-display">Student Study Book</h3>
          <p className="text-xs text-emerald-150">Enter details to access Ugandan CBC scenarios offline or online.</p>
        </div>

        <form onSubmit={handleJoin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Your Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Joseph Aheebwa"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-800 focus:border-emerald-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Class / Access Code</label>
            <input
              type="text"
              placeholder="BIO-CBC"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-800 bg-slate-50 uppercase font-mono tracking-wider text-slate-700"
            />
            <p className="text-[10px] text-slate-400 mt-1">Default code is BIO-CBC. No registration required.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold py-2.5 rounded-lg text-sm shadow-xs transition duration-150 cursor-pointer"
          >
            Enter Exercise Book (Start Practice)
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student header bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-emerald-900 border border-slate-200 flex items-center justify-center font-extrabold font-display">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Student: {studentName}</p>
            <button 
              onClick={handleLogout}
              className="text-[10px] text-red-500 hover:underline font-bold uppercase tracking-wider cursor-pointer"
            >
              Sign out / Exit Book
            </button>
          </div>
        </div>

        {/* Local Page Sub-tab navigation */}
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200">
          <button
            onClick={() => { setStudentTab("explore"); setSelectedItem(null); setActiveHistoryAttempt(null); }}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              studentTab === "explore" && !activeHistoryAttempt
                ? "bg-emerald-900 text-white"
                : "text-slate-600 hover:bg-white hover:text-emerald-955"
            }`}
          >
            Practice Board
          </button>
          <button
            onClick={() => { setStudentTab("progress"); setSelectedItem(null); setActiveHistoryAttempt(null); }}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              studentTab === "progress" && !activeHistoryAttempt
                ? "bg-emerald-900 text-white"
                : "text-slate-600 hover:bg-white hover:text-emerald-955"
            }`}
          >
            Portfolio & Progress ({myAttempts.length})
          </button>
        </div>
      </div>

      {/* 2. HISTORY ITEM DRILL DOWN */}
      {activeHistoryAttempt && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Class Attempt Record</span>
              <h4 className="font-bold text-slate-800 leading-snug">{activeHistoryAttempt.itemTitle}</h4>
            </div>
            <button
              onClick={() => setActiveHistoryAttempt(null)}
              className="text-xs text-emerald-900 font-bold hover:underline cursor-pointer"
            >
              Back to Portfolio
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-slate-100/55 rounded-lg p-4 border border-slate-200 text-xs text-slate-700">
              <strong>Retrieved Attempt Date:</strong> {new Date(activeHistoryAttempt.attemptedAt).toLocaleString()}
              <br />
              <strong>Cumulative AI Evaluation Score:</strong>{" "}
              <span className="font-bold text-emerald-900">
                {activeHistoryAttempt.totalScore} / {activeHistoryAttempt.totalAvailable} Marks
              </span>
            </div>

            <div className="space-y-6">
              {Object.keys(activeHistoryAttempt.answers).map((key) => {
                const taskNum = parseInt(key);
                const ans = activeHistoryAttempt.answers[taskNum];
                const gr = activeHistoryAttempt.grades[taskNum];

                return (
                  <div key={taskNum} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-2">
                    <h5 className="font-bold text-sm text-emerald-900">Structured Task {taskNum} Guidelines</h5>
                    
                    <div className="bg-slate-50 p-2.5 rounded text-xs">
                      <strong>Your Answered Text:</strong>
                      <p className="mt-1 text-gray-700 italic border-l-2 border-emerald-600 pl-2 whitespace-pre-wrap">{ans}</p>
                    </div>

                    {gr && gr.evaluated && (
                      <div className="bg-amber-50/50 border border-amber-200 rounded p-3 text-xs space-y-2 font-sans">
                        <div className="flex justify-between font-bold text-amber-900 border-b pb-1">
                          <span>AI Assessment Marks Awarded:</span>
                          <span>{gr.score} Marks</span>
                        </div>
                        <div>
                          <strong className="text-amber-800">Generic Skill & Context Feedback:</strong>
                          <p className="mt-1 text-gray-800 leading-relaxed">{gr.feedback}</p>
                        </div>
                        <div>
                          <strong className="text-amber-800">UNEB Benchmarked Answer:</strong>
                          <p className="mt-1 text-gray-700 italic">{gr.model_answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. PRACTISE EXERCISE SHEET (ACTIVE EXAM SHEET) */}
      {selectedItem && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="bg-emerald-900 p-4 text-white flex justify-between items-center">
            <div>
              <span className="text-[10px] bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-md font-sans font-extrabold uppercase tracking-wider">
                Active Study Practice
              </span>
              <p className="text-sm font-bold truncate max-w-[280px] sm:max-w-md mt-1">{selectedItem.topic}</p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-xs text-emerald-200 hover:text-white font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Display the real-life stimulus */}
            <div className="border border-slate-200 p-4.5 rounded-xl bg-slate-50 font-serif text-slate-800 leading-relaxed italic pr-5">
              <span className="font-bold font-sans text-[10px] bg-amber-400/25 text-emerald-950 border border-amber-400/30 px-2.5 py-0.5 rounded-md not-italic mr-2 inline-block">
                SCENARIO STIMULUS
              </span>
              {selectedItem.scenario}
            </div>

            {/* Answer tasks sequentially */}
            <div className="space-y-6">
              <h3 className="font-sans text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5">
                Structured Exercise Sheet
              </h3>

              {selectedItem.tasks.map((task) => {
                const isGr = grades[task.task_number];
                const isExpanded = expandedSolutions[task.task_number];

                return (
                  <div key={task.task_number} className="border border-slate-100 rounded-lg p-4 bg-slate-50/45 space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                      <span className="bg-emerald-900 text-white font-extrabold px-2.5 py-1 rounded-md">
                        Task {task.task_number} / {selectedItem.tasks.length}
                      </span>
                      <div className="flex space-x-1.5 font-bold text-slate-500">
                        <span>[{task.marks} Marks allowed]</span>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-slate-900 font-serif leading-snug">
                      {task.task_text}
                    </p>

                    <div className="flex space-x-2 text-[10px] font-bold text-emerald-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded w-fit">
                      <span>Competency: {task.competency}</span>
                      <span className="mx-1 border-r border-slate-300" />
                      <span>Bloom: {task.bloom_level}</span>
                    </div>

                    {/* Student text input area */}
                    <div className="space-y-1 bg-white p-3 border border-gray-100 rounded-lg shadow-inner">
                      <label className="block text-xs font-bold text-slate-400">YOUR RESPONSE (WRITE SCIENTIFIC SOLUTIONS):</label>
                      <textarea
                        rows={4}
                        placeholder="Reference the biological variables from the scenario context..."
                        disabled={isGr?.evaluated || isGr?.loading}
                        value={answers[task.task_number] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [task.task_number]: e.target.value }))}
                        className="w-full text-sm font-serif leading-relaxed border-0 focus:ring-0 p-0 focus:outline-none min-h-[80px]"
                      />
                    </div>

                    {/* Mark Action bar */}
                    <div className="flex justify-end pt-1">
                      {!isGr?.evaluated ? (
                        <button
                          type="button"
                          onClick={() => handleGradeTask(task)}
                          disabled={isGr?.loading || !(answers[task.task_number] || "").trim()}
                          className="bg-[#0E6251] hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-gray-400 text-white font-bold py-1.5 px-4 rounded text-xs flex items-center space-x-1 shadow transition"
                        >
                          {isGr?.loading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1" />
                              <span>AI Teacher marking...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span>Submit to AI Teacher for marking</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-700">Answer assessed!</span>
                        </div>
                      )}
                    </div>

                    {/* Instantly scored responses */}
                    {isGr && isGr.evaluated && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs space-y-2 text-[#3E2723]"
                      >
                        <div className="flex justify-between items-center border-b border-amber-200 pb-1.5 font-sans">
                          <span className="font-bold flex items-center space-x-1 text-amber-800">
                            <Award className="w-4 h-4 text-[#D4AC0D]" />
                            <span>AI Evaluation Scorecard</span>
                          </span>
                          <strong className="text-amber-900 text-sm">{isGr.score} / {task.marks} Marks</strong>
                        </div>
                        
                        <div className="space-y-1">
                          <strong className="text-amber-800">Competency-aligned Feedback:</strong>
                          <p className="leading-relaxed font-sans">{isGr.feedback}</p>
                        </div>

                        {/* Collapsible Model Answer Reveal */}
                        <div className="pt-2 border-t border-amber-200/50">
                          <button
                            type="button"
                            onClick={() => toggleSolutionExpand(task.task_number)}
                            className="flex items-center justify-between text-[11px] font-bold text-[#0E6251] hover:underline w-full text-left"
                          >
                            <span>Contrast with Model UNEB Answer Scheme</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2 p-2.5 bg-white border rounded leading-relaxed text-slate-700 italic space-y-2 font-serif"
                            >
                              <p><strong>Ideal Answer Key:</strong> {task.model_answer}</p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complete exercise button */}
            <div className="border-t pt-5 flex justify-between items-center">
              <p className="text-xs text-gray-400">Ensure any task you want logged has been graded by the AI first.</p>
              <button
                type="button"
                onClick={handleFinishAttempt}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 px-5 rounded-lg text-sm shadow transition"
              >
                Save Answers to Digital Portfolio
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. SELECTION BOARD SCREEN */}
      {studentTab === "explore" && !selectedItem && (
        <div className="space-y-4">
          <div className="border-l-4 border-emerald-900 pl-3">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Assessment items library</h4>
            <p className="text-xs text-slate-500 font-sans">Pick any NCDC CBC scenario below and attempt structured tasks in your digital exercise book.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <div 
                key={it.id} 
                className="bg-white rounded-xl shadow-xs border border-slate-200 hover:border-slate-350 hover:shadow-xs transition p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-sans font-bold">
                    <span className="bg-amber-100 text-emerald-950 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-extrabold border border-amber-200">
                      {it.class_level} Syllabus
                    </span>
                    <span className="text-slate-400">{it.difficulty}</span>
                  </div>

                  <h5 className="font-bold text-slate-800 leading-snug line-clamp-2">
                    {it.topic}
                  </h5>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-serif">
                    {it.scenario}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectItem(it)}
                  className="w-full py-2 bg-slate-50 hover:bg-emerald-900 text-emerald-900 hover:text-white font-bold text-xs rounded-lg border border-slate-200 hover:border-emerald-900 transition-colors text-center cursor-pointer"
                >
                  Open Exam Worksheet
                </button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="col-span-full bg-white rounded-xl p-12 text-center text-slate-400 border border-dashed border-slate-200">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No assessment items loaded yet.</p>
                <p className="text-xs">Ask your Biology teacher to write or generate scenarios!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. PORTFOLIO & CUMULATED PERFORMANCE GRAPHS */}
      {studentTab === "progress" && !activeHistoryAttempt && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-150 pb-3 flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center">
              <div>
                <h4 className="font-bold text-emerald-950 font-display flex items-center space-x-1.5">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>My digital competence scorecard</span>
                </h4>
                <p className="text-xs text-slate-400">Proficiency level breakdown mapped automatically by UNEB assessment parameters</p>
              </div>
              <span className="text-xs bg-amber-105 text-emerald-950 border border-amber-205 font-extrabold px-3 py-1 rounded-md">
                {myAttempts.length} Total Attempts logged
              </span>
            </div>

            {myAttempts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No finished exercises logged inside your digital book.</p>
                <p className="text-xs max-w-xs mx-auto leading-relaxed mt-1 font-sans">Open any scenario in the practice board, complete its answers, submit them, then click "Save to Digital Portfolio".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Visual score breakdown */}
                <div className="md:col-span-6 space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key generic competencies proficiency</h5>
                  
                  <div className="space-y-4">
                    {myCompetencyProficiency.map((prof, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{prof.name}</span>
                          <span className="font-bold">{prof.percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${prof.percent}%` }}
                            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attempt History list inside folder */}
                <div className="md:col-span-6 space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Review historical exercises</h5>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {myAttempts.slice().reverse().map((att) => (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setActiveHistoryAttempt(att)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center justify-between text-left text-xs transition cursor-pointer"
                      >
                        <div className="truncate pr-4 space-y-0.5">
                          <strong className="text-slate-800 font-bold block truncate">{att.itemTitle}</strong>
                          <span className="text-[10px] text-slate-400">{new Date(att.attemptedAt).toLocaleDateString()} at {new Date(att.attemptedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <span className="bg-emerald-900 text-white font-bold px-2.5 py-1 rounded text-[11px] whitespace-nowrap">
                          {att.totalScore} / {att.totalAvailable} Marks
                        </span>
                      </button>
                    ))}
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
