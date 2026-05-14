import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { ThemeProvider } from "@/lib/theme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md text-center rounded-3xl p-8">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page drifted off into the aurora.</p>
        <Link to="/" className="mt-5 inline-flex rounded-xl bg-gradient-hero px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md text-center rounded-3xl p-8">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-5 inline-flex rounded-xl bg-gradient-hero px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SignSenseAI — Real-time Sign Language Detection" },
      { name: "description", content: "AI-powered sign language detection in your browser. Real-time hand tracking with MediaPipe, instant text and speech." },
      { name: "author", content: "SignSenseAI" },
      { property: "og:title", content: "SignSenseAI — Real-time Sign Language Detection" },
      { property: "og:description", content: "AI-powered sign language detection in your browser. Real-time hand tracking with MediaPipe, instant text and speech." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SignSenseAI — Real-time Sign Language Detection" },
      { name: "twitter:description", content: "AI-powered sign language detection in your browser. Real-time hand tracking with MediaPipe, instant text and speech." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5cb21920-4b4c-41cb-b647-c0df3b2b4a11/id-preview-7d533cd3--cbd5fde8-73f1-48ea-8ccd-839c5013ea6a.lovable.app-1778725869197.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5cb21920-4b4c-41cb-b647-c0df3b2b4a11/id-preview-7d533cd3--cbd5fde8-73f1-48ea-8ccd-839c5013ea6a.lovable.app-1778725869197.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
