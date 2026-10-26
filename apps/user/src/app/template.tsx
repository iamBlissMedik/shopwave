/**
 * App Router `template` files re-mount on every navigation, so this is the
 * natural place for a page-enter transition: each route fades and rises in.
 * Pure CSS (`animate-page-in`), so it also plays on the server-rendered first
 * paint without waiting for JavaScript, and honours "reduce motion".
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
