import {
  useSessionContext,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Database } from "../db_types";

type UserType = Database["public"]["Tables"]["users"]["Row"];

const LoginPage: NextPage = () => {
  const { isLoading, session, error } = useSessionContext();
  const user = useUser();
  const supabaseClient = useSupabaseClient<Database>();

  const [data, setData] = useState<UserType | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabaseClient.from("users").select("*").single();
      setData(data);
    }

    if (user) loadData();
  }, [user, supabaseClient]);

  if (!session)
    return (
      <>
        {error && <p>{error.message}</p>}
        {isLoading ? <h1>Loading...</h1> : <h1>Loaded!</h1>}
        <button
          onClick={() => {
            supabaseClient.auth.signInWithOAuth({
              provider: "github",
              options: { scopes: "repo", redirectTo: "http://localhost:3000" },
            });
          }}
        >
          Login with github
        </button>
        <Auth
          appearance={{ theme: ThemeSupa }}
          // view="update_password"
          supabaseClient={supabaseClient}
          providers={["google", "github"]}
          // scopes={{github: 'repo'}} // TODO: enable scopes in Auth component.
          socialLayout="horizontal"
        />
      </>
    );

  return (
    <>
      <p>
        [<Link href="/profile">getServerSideProps</Link>] | [
        <Link href="/protected-page">server-side RLS</Link>] |{" "}
        <button
          onClick={() =>
            supabaseClient.auth.updateUser({ data: { test1: "updated" } })
          }
        >
          Update user metadata
        </button>
        <button onClick={() => supabaseClient.auth.refreshSession()}>
          Refresh session
        </button>
      </p>
      {isLoading ? <h1>Loading...</h1> : <h1>Loaded!</h1>}
      <p>user:</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <p>client-side data fetching with RLS</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

export default LoginPage;
