import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import useDebounce from "../Hooks/useDebounce";
import usePagination from "../Hooks/usePagination";
import { useTheme } from "../Hooks/useTheame";

const SETS_URL       = `${API_BASE_URL}/api/client`;
const CATEGORIES_URL = `${API_BASE_URL}/api/client`;
const emptyForm      = { title: "", duration: "", totalMarks: "" };

export default function Set() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const { t }          = useTheme();

  const [category, setCategory]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [form, setForm]                 = useState(emptyForm);
  const [editId, setEditId]             = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [roleNum,setRoleNum]=useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const {
    data: sets,
    loading,
    currentPage,
    totalPages,
    totalItems,
    pageNumbers,
    hasPrev,
    hasNext,
    fetchData,
    goToPage,
  } = usePagination(`${SETS_URL}/quizzes/${categoryId}`, { itemsPerPage: 6 });
  // ── Fetch parent category 
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${CATEGORIES_URL}/quizzes/${categoryId}`);
        setCategory(res.data);
      } catch {
        setCategory(null);
      }
    };
    fetchCategory();
  }, [categoryId]);
//role
  useEffect(()=>{
  const role = localStorage.getItem("role");
  setRoleNum(Number(role));
},[]);

  // ── Fetch sets 
  useEffect(() => {
    fetchData({ page: currentPage, search: debouncedSearch });
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    goToPage(1);
  }, [debouncedSearch]);

  // ── Modal helpers 
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (set) => {
    setForm({
      title:      set.title,
      duration:   set.duration,
      totalMarks: set.totalMarks,
    });
    setEditId(set._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Validation
  const isValid =
    form.title.trim() &&
    Number(form.duration) > 0 &&
    Number(form.totalMarks) > 0;

  // ── Create / Update 
  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title:      form.title.trim(),
        duration:   Number(form.duration),
        totalMarks: Number(form.totalMarks),
      };
      if (editId) {
        await axios.put(`${SETS_URL}/${editId}`, payload);
      } else {
        await axios.post(`${SETS_URL}/quiz`,{ ...payload, categoryId },{headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }});
      }
      closeModal();
      fetchData({ page: currentPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete 
  const confirmDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await axios.delete(`${SETS_URL}/${deleteTarget._id}`);
      setDeleteTarget(null);
      const targetPage =
        sets.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      goToPage(targetPage);
      fetchData({ page: targetPage, search: debouncedSearch });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300 p-6`}>
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => navigate("/categories")}
            className={`text-sm font-semibold ${t.accent} hover:underline`}
          >
            Categories
          </button>
          <span className={`text-sm ${t.textMuted}`}>›</span>
          <span className={`text-sm font-semibold ${t.text}`}>
            {category?.name ?? "..."}
          </span>
          <span className={`text-sm ${t.textMuted}`}>›</span>
          <span className={`text-sm font-semibold ${t.text}`}>Sets</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-black ${t.text}`}>Sets</h1>
            <p className={`text-sm ${t.textMuted} mt-1`}>
              {category?.description && (
                <span className="mr-2">{category.description} ·</span>
              )}
              {totalItems} {totalItems === 1 ? "set" : "sets"} total
            </p>
          </div>

          {/* Only admin/client can create sets */}
          {roleNum !== 3 && (
            <button
              onClick={openCreate}
              className={`${t.accentBg} ${t.accentBgHover} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all`}
            >
              + New Set
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative w-full sm:w-80">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sets…"
            className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-4 h-4 border-2 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className={`w-8 h-8 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
          </div>
        ) : sets.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-24 gap-3 ${t.textMuted}`}>
            <span className="text-5xl">📦</span>
            <p className="font-semibold text-lg">No sets found</p>
            <p className="text-sm">
              {search
                ? "Try a different search term"
                : roleNum === 3
                  ? "No sets available yet"
                  : `Click "+ New Set" to get started`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.quizzes.map((set) => (
              <div
                key={set._id}
                className={`${t.bgCard} border ${t.border} rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all`}
              >
                {/* Card top */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl ${t.accentLight} ${t.accentText} flex items-center justify-center text-lg font-black shrink-0`}>
                    {set.title?.charAt(0).toUpperCase()}
                  </div>

                  {/* Edit/Delete only for non-students */}
                  {roleNum !== 3 && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(set)}
                        className={`w-8 h-8 rounded-lg border ${t.border} ${t.bgCardHover} ${t.textSecondary} flex items-center justify-center text-sm transition-all`}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteTarget(set)}
                        className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm transition-all"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                {/* Card content */}
                <div>
                  <h3 className={`font-bold text-base ${t.text} leading-tight`}>
                    {set.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`flex items-center gap-1 text-xs font-medium ${t.textMuted}`}>
                      ⏱ {set.duration} min
                    </span>
                    <span className={`w-1 h-1 rounded-full bg-current ${t.textMuted}`} />
                    <span className={`flex items-center gap-1 text-xs font-medium ${t.textMuted}`}>
                      🏆 {set.totalMarks} marks
                    </span>
                  </div>
                </div>

                {/* Card footer */}
                <div className={`flex items-center justify-between pt-2 border-t ${t.borderSubtle} mt-auto`}>
                  <span className={`text-xs ${t.textMuted}`}>
                    {new Date(set.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  {/* Role-based action button */}
                  {roleNum === 3 ? (
                    <button
                      onClick={() => navigate(`/sets/${set.id}/start-test`)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${t.accentBg} ${t.accentBgHover} text-white shadow-sm transition-all`}
                    >
                      Start Test →
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/sets/${set.id}/quiz`)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${t.badge} ${t.accentText} hover:underline transition-all`}
                    >
                      View Quiz →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrev || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}
            >
              ← Prev
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dot-${i}`} className={`px-2 text-sm ${t.textMuted}`}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all
                    ${currentPage === p
                      ? `${t.accentBg} text-white border-transparent shadow-md`
                      : `${t.bgCard} ${t.border} ${t.textSecondary} ${t.bgCardHover}`
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNext || loading}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border ${t.border} ${t.bgCard} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover} transition-all`}
            >
              Next →
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <p className={`text-center text-xs ${t.textMuted} mt-3`}>
            Page {currentPage} of {totalPages} · {totalItems} total
          </p>
        )}
      </div>

      {/* ── Create / Edit Modal  */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className={`relative w-full max-w-md ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10`}>

            <h2 className={`text-xl font-black ${t.text} mb-1`}>
              {editId ? "Edit Set" : "New Set"}
            </h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              {editId
                ? "Update the set details below."
                : `Creating inside "${category?.name ?? "this category"}"`}
            </p>

            <div className="flex flex-col gap-5">

              {/* Title */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Chapter 1, Week 2…"
                  className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                />
              </div>

              {/* Duration + Total Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                    Duration (min) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest ${t.textMuted} mb-1.5 block`}>
                    Total Marks <span className="text-rose-400">*</span>
                  </label>
                  <input
                    name="totalMarks"
                    type="number"
                    min="1"
                    value={form.totalMarks}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className={`w-full ${t.inputBg} border ${t.inputBorder} ${t.text} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputFocus} transition placeholder:${t.textMuted}`}
                  />
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={closeModal}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !isValid}
                className={`flex-1 ${t.accentBg} ${t.accentBgHover} text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all`}
              >
                {submitting ? "Saving…" : editId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className={`relative w-full max-w-sm ${t.bgCard} border ${t.border} rounded-3xl p-7 shadow-2xl z-10 text-center`}>
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className={`text-xl font-black ${t.text} mb-2`}>Delete Set?</h2>
            <p className={`text-sm ${t.textMuted} mb-6`}>
              Are you sure you want to delete{" "}
              <span className={`font-bold ${t.text}`}>"{deleteTarget.title}"</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className={`flex-1 border ${t.border} ${t.bgCard} ${t.bgCardHover} ${t.textSecondary} py-2.5 rounded-xl font-semibold text-sm transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={submitting}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-2.5 rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-all"
              >
                {submitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}