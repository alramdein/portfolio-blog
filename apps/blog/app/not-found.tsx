import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container home">
      <section className="home-hero">
        <h1>Not found.</h1>
        <p className="muted">That post doesn&apos;t exist, or it isn&apos;t published.</p>
        <Link href="/" className="btn">Back to all posts</Link>
      </section>
    </div>
  );
}
