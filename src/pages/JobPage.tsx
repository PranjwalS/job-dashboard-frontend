import { useParams } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { SupabaseJob } from "../types/supabase_job";

function TemplateJobPage() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<SupabaseJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
        .from("jobs") 
        .select("*")
        .eq("id", slug)
        .single();


        if (error) throw error;

        setJob(data as SupabaseJob);
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



  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>Job not found!</div>;




  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>{job.title}</h1>
      <h3>{job.company} — {job.location}</h3>
      <p><strong>SCORE:</strong> {job.score} </p>
      <p>  {job.score_breakdown ? JSON.stringify(job.score_breakdown) : null}  </p>
      <p><strong>Apply Type:</strong> {job.apply_type}</p>
      <p><strong>Tags:</strong> {job.tags.join(", ")}</p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Job Description</h2>
        <p>{job.job_desc}</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>About the Company</h2>
        <p>{job.company_desc}</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <a href={job.url} target="_blank" rel="noreferrer">
          Apply Here
        </a>
      </section>
    </div>
  );
}

export default TemplateJobPage;
