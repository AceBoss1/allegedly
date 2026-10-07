import Nav from "@/components/Nav";
import PostComposer from "@/components/create/PostComposer";

export default function CreatePage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-5 font-display text-lg font-semibold">Post a Gist</h1>
        <PostComposer />
      </main>
    </div>
  );
}
