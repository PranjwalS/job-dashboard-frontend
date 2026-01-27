import { useNavigate } from "react-router-dom";
import { useReactTable, getCoreRowModel, type ColumnDef } from "@tanstack/react-table";
import type { Job } from "../types/job";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,company,location,score");

      if (error) console.error(error);
      else {
        const sorted = (data as Job[]).sort((a, b) => Number(a.id) - Number(b.id));
        setJobs(sorted);
    }      
    };
    fetchJobs();
  }, []);

const columns: ColumnDef<Job>[] = [
  { accessorKey: "id", header: "ID", id: "id" },
  { accessorKey: "title", header: "Title", id: "title" },
  { accessorKey: "company", header: "Company", id: "company" },
  { accessorKey: "location", header: "Location", id: "location" },
  { accessorKey: "score", header: "Score", id: "score" },
];

  const table = useReactTable({ data: jobs, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <table className="border-collapse w-full border">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="border px-3 py-2 text-left">
                  {header.column.columnDef.header as string}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
            {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-100 cursor-pointer">
                {table.getAllColumns().map(col => (
                <td key={col.id} className="border px-2 py-1">
                    {row.getValue(col.id)}
                </td>
                ))}
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;