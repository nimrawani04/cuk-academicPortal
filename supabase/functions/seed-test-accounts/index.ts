import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const accounts = [
    { email: "admin@test.com", password: "admin123456", full_name: "Admin User", role: "admin" },
    { email: "teststudent1@test.com", password: "student123456", full_name: "Aisha Khan", role: "student" },
    { email: "teststudent2@test.com", password: "student123456", full_name: "Rahul Sharma", role: "student" },
    { email: "testteacher1@test.com", password: "teacher123456", full_name: "Dr. Faisal Ahmed", role: "teacher" },
    { email: "testteacher2@test.com", password: "teacher123456", full_name: "Prof. Sara Malik", role: "teacher" },
  ];

  const results = [];

  for (const acc of accounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { full_name: acc.full_name, role: acc.role },
    });

    if (error) {
      results.push({ email: acc.email, status: "error", message: error.message });
    } else {
      results.push({ email: acc.email, status: "created", role: acc.role });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
