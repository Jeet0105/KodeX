import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import { toast } from "react-toastify"


function AdminProblemDashboard() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [confirmId, setConfirmId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const navigate = useNavigate()

  const fetchProblems = useCallback(async () => {
    const controller = new AbortController()

    try {
      setLoading(true)

      const params = { page }
      if (debouncedSearch.trim()) params.search = debouncedSearch

      const res = await api.get("/api/v1/problems", {
        params,
        signal: controller.signal,
      })

      setProblems(res.data.problems)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      if (err.name === "CanceledError") return
      toast.error("Failed to load problems")
    } finally {
      setLoading(false)
    }

    return () => controller.abort()
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)

    return () => clearTimeout(delay)
  }, [search])

  const togglePublish = async (id, isPublished) => {
    setTogglingId(id)

    try {
      const endpoint = isPublished
        ? `/api/v1/problems/${id}/unpublish`
        : `/api/v1/problems/${id}/publish`

      const res = await api.patch(endpoint)
      toast.success(res.data.message)

      setProblems((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isPublished: !isPublished } : p
        )
      )
    } catch (err) {
      toast.error(err.response?.data?.message || "Toggle failed")
    } finally {
      setTogglingId(null)
    }
  }

  const deleteProblem = async (id) => {
    const previous = problems
    setProblems((prev) => prev.filter((p) => p._id !== id))
    setConfirmId(null)

    try {
      const res = await api.delete(`/api/v1/problems/${id}`)
      toast.success(res.data.message)
    } catch (err) {
      setProblems(previous)
      toast.error(err.response?.data?.message || "Delete failed")
    }
  }

  return (
    <div className="bg-[#0B0617] text-white min-h-screen flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Problem Management</h1>
            <p className="text-gray-400">Manage coding problems</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/create-problem")}
            className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            + Create Problem
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="w-full md:w-80 px-4 py-3 rounded-lg bg-[#0F0820] border border-purple-700/30 focus:border-purple-500 outline-none"
          />
        </div>

        {/* TABLE */}
        <div className="bg-[#140A2A] border border-purple-800/30 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Loading problems...
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1A1235] text-gray-300 text-sm">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Difficulty</th>
                  <th className="p-4 text-left">Topics</th>
                  <th className="p-4 text-left">Publish</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-10 text-gray-400">
                      No problems found
                    </td>
                  </tr>
                ) : (
                  problems.map((problem) => (
                    <tr
                      key={problem._id}
                      className="border-t border-purple-800/20 hover:bg-[#1A1235]"
                    >
                      <td className="p-4 font-medium">{problem.title}</td>

                      <td className="p-4">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>

                      <td className="p-4 text-gray-400 text-sm">
                        {problem.topics?.length
                          ? problem.topics.join(", ")
                          : "-"}
                      </td>

                      <td className="p-4">
                        <PublishToggle
                          isPublished={problem.isPublished}
                          isToggling={togglingId === problem._id}
                          onToggle={() =>
                            togglePublish(problem._id, problem.isPublished)
                          }
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex gap-4 items-center">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/problem/${problem._id}`)
                            }
                            className="text-green-400 hover:underline cursor-pointer"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/edit-problem/${problem._id}`)
                            }
                            className="text-blue-400 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>

                          {confirmId === problem._id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => deleteProblem(problem._id)}
                                className="text-red-400 hover:underline cursor-pointer"
                              >
                                Sure?
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmId(null)}
                                className="text-gray-400 hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmId(problem._id)}
                              className="text-red-400 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-lg ${
              page === 1 ? "opacity-40 cursor-not-allowed" : "bg-[#1A1235]"
            }`}
          >
            Prev
          </button>

          <span className="text-gray-400">
            Page {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-lg ${
              page === totalPages ? "opacity-40 cursor-not-allowed" : "bg-[#1A1235]"
            }`}
          >
            Next
          </button>
        </div>

      </div>

    </div>
  )
}

export default AdminProblemDashboard


function DifficultyBadge({ difficulty }) {
  const colors = {
    easy: "text-green-400",
    medium: "text-yellow-400",
    hard: "text-red-400",
  }

  return (
    <span className={`font-semibold capitalize ${colors[difficulty] || ""}`}>
      {difficulty}
    </span>
  )
}


function PublishToggle({ isPublished, isToggling, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={isToggling}
        className={`
          relative inline-flex h-7 w-14 items-center rounded-full
          transition-all duration-300
          ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isPublished ? "bg-green-500" : "bg-gray-600 hover:bg-gray-500"}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white
            shadow-md transition-all duration-300
            ${isPublished ? "translate-x-8" : "translate-x-1"}
          `}
        />
      </button>
      <span className="text-xs text-gray-400">
        {isToggling ? "..." : isPublished ? "Published" : "Draft"}
      </span>
    </div>
  )
}