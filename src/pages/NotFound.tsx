import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404: route not found ->", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight">404</h1>
        <p className="mb-6 text-muted-foreground">Oops! Page not found.</p>
        <a
          href="/"
          className="text-primary underline underline-offset-4 hover:opacity-80"
        >
          Return to Home
        </a>
      </div>
    </main>
  );
}
