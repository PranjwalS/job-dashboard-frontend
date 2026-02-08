import { useNavigate } from "react-router-dom";
import type { SupabaseJob } from "../types/supabase_job";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender, type ColumnDef, type SortingState, type ColumnFiltersState } from "@tanstack/react-table";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<SupabaseJob[]>([]);
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minScore, setMinScore] = useState<string>("");

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*");

      if (data) {
        setJobs(data as SupabaseJob[]);
      }
    };
    
    fetchJobs();
  }, []);

  // Get unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(jobs.map(job => job.location))).sort();

  const columns: ColumnDef<SupabaseJob>[] = [
    { 
      accessorKey: "score", 
      header: "Score", 
      id: "score",
      filterFn: (row, columnId, filterValue) => {
        const score = row.getValue(columnId) as number | null;
        if (score === null) return false;
        return score >= Number(filterValue);
      },
      cell: ({ getValue }) => {
        const score = getValue() as number | null;
        if (!score) return <span className="text-gray-500">N/A</span>;
        
        let colorClass = "text-gray-400";
        if (score >= 80) colorClass = "text-green-400";
        else if (score >= 60) colorClass = "text-yellow-400";
        else if (score >= 40) colorClass = "text-orange-400";
        else colorClass = "text-red-400";
        
        return <span className={`font-bold ${colorClass}`}>{score}</span>;
      }
    },
    { accessorKey: "title", header: "Title", id: "title" },
    { accessorKey: "company", header: "Company", id: "company" },
    { accessorKey: "location", header: "Location", id: "location" },
    { 
      id: "application_status",
      header: "Status",
      accessorKey: "application_status",
      size: 150,
      filterFn: (row, columnId, filterValue) => {
        const status = row.getValue(columnId) as string | null;
        const actualStatus = status || "Not Applied";
        return actualStatus === filterValue;
      },
      cell: ({ getValue }) => {
        const status = getValue() as string | null;
        const isApplied = status === "Applied";
        
        return (
          <div className="min-w-[120px]">
            <span className={`inline-block px-4 py-1.5 rounded text-xs font-medium whitespace-nowrap border-2 ${
              isApplied 
                ? "bg-green-900 text-green-300 border-green-600" 
                : "bg-gray-700 text-gray-300 border-gray-600"
            }`}>
              {status || "Not Applied"}
            </span>
          </div>
        );
      }
    },
  ];

  const table = useReactTable({ 
    data: jobs, 
    columns, 
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  // Apply location filter
  useEffect(() => {
    if (locationFilter === "all") {
      setColumnFilters(prev => prev.filter(f => f.id !== "location"));
    } else {
      setColumnFilters(prev => [
        ...prev.filter(f => f.id !== "location"),
        { id: "location", value: locationFilter }
      ]);
    }
  }, [locationFilter]);

  // Apply status filter
  useEffect(() => {
    if (statusFilter === "all") {
      setColumnFilters(prev => prev.filter(f => f.id !== "application_status"));
    } else {
      setColumnFilters(prev => [
        ...prev.filter(f => f.id !== "application_status"),
        { id: "application_status", value: statusFilter }
      ]);
    }
  }, [statusFilter]);

  // Apply score filter
  useEffect(() => {
    if (minScore === "" || minScore === null) {
      setColumnFilters(prev => prev.filter(f => f.id !== "score"));
    } else {
      const scoreValue = Number(minScore);
      setColumnFilters(prev => [
        ...prev.filter(f => f.id !== "score"),
        { 
          id: "score", 
          value: scoreValue
        }
      ]);
    }
  }, [minScore]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Job Dashboard</h1>
          <p className="text-gray-400">Manage and track your job applications</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search
              </label>
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search by title, company, or location..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Not Applied">Not Applied</option>
                <option value="Applied">Applied</option>
              </select>
            </div>

            {/* Min Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Min Score
              </label>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="0-100"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {table.getFilteredRowModel().rows.length} of {jobs.length} jobs
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className={`px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-750 select-none ${
                          header.id === 'application_status' ? 'w-[150px]' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {header.column.columnDef.header as string}
                          {header.column.getIsSorted() && (
                            <span className="text-blue-400">
                              {header.column.getIsSorted() === "desc" ? "↓" : "↑"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-800">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id}
                      className="hover:bg-gray-800/50 cursor-pointer transition-colors" 
                      onClick={() => navigate(`/jobs/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map(cell => (
<td key={cell.id} className="px-6 py-4 text-sm text-gray-300">
  {flexRender(cell.column.columnDef.cell, cell.getContext())}
</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;