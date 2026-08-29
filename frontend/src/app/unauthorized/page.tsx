import Link from 'next/link';

export const metadata = {
  title: 'Unauthorized',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">401</h1>
      <h2 className="text-xl font-semibold">Unauthorized</h2>
      <p className="text-muted-foreground max-w-md">
        You don&apos;t have permission to access this page.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go back home
      </Link>
    </div>
  );
}
