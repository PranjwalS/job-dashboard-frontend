import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { SupabaseJob } from "../types/supabase_job";
import JobHeader from "../components/JobHeader";
import JobDescription from "../components/JobDescription";
import CompanyDescription from "../components/CompanyDescription";
import JobScore from "../components/JobScore";
import QuickActions from "../components/QuickActions";
import ApplicationStatus from "../components/ApplicationStatus";
import JobMetadata from "../components/JobMetadata";

function JobPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<SupabaseJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>("Not Applied");

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      const jobId = Number(slug);

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (error) throw error;
        setJob(data as SupabaseJob);
        
        // Set application status from DB
        setApplicationStatus(data.application_status || "Not Applied");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchJob();
  }, [slug]);

  const handleApplicationToggle = async (newStatus: string) => {
    if (!job) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("jobs")
        .update({ application_status: newStatus })
        .eq("id", job.id);

      if (error) throw error;

      // Update local state on success
      setApplicationStatus(newStatus);
      console.log("Application status updated to:", newStatus);
    } catch (err) {
      console.error("Error updating application status:", err);
      // Optionally show an error message to user
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Job not found!</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header with Back Button */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Go Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (60-65%) */}
          <div className="lg:col-span-2 space-y-6">
            <JobHeader
              title={job.title}
              company={job.company}
              location={job.location}
              tags={job.tags}
            />
            
            <JobDescription description={job.job_desc} />
            
            <CompanyDescription description={job.company_desc} />
          </div>

          {/* Right Column - Actions & Info (35-40%) */}
          <div className="lg:col-span-1 space-y-6">
            <JobScore
              score={job.score}
            />
            
            <QuickActions
              jobUrl={job.url}
              applyType={job.apply_type}
              coverLetterText={job.coverletter_text}
              processedCoverLetter={job.processed_coverletter}
              title={job.title}
            />
            
            <ApplicationStatus
              status={applicationStatus}
              onStatusChange={handleApplicationToggle}
            />
            
            <JobMetadata
              scrapedAt={job.scraped_at}
              scoredAt={job.scored_at}
              scoreBreakdown={job.score_breakdown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobPage;