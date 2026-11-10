import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { postImageUrl } from "@/lib/storage/post-images";
import { listPosts } from "@/modules/employer/posts/service";
import { deletePostAction } from "@/modules/employer/posts/actions";
import { toEmbedUrl } from "@/modules/employer/posts/schemas";
import { PostForm } from "@/components/employer/PostForm";

export default async function PostsPage() {
  const { companyId } = await requireEmployerCompanyPage();
  const posts = await listPosts(companyId);

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Publications</h1>
      <PostForm />
      <ul className="space-y-5">
        {posts.map((p) => {
          const embed = toEmbedUrl(p.videoUrl);
          return (
            <li key={p.id} className="space-y-3 rounded-md border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-gray-500">
                    {p.type === "PROJECT" ? "Réalisation" : "Actualité"} · {p.createdAt.toLocaleDateString("fr-FR")}
                  </span>
                  <h2 className="font-medium">{p.title}</h2>
                </div>
                <form action={deletePostAction}>
                  <input type="hidden" name="postId" value={p.id} />
                  <button className="text-sm text-red-600 hover:underline">Supprimer</button>
                </form>
              </div>
              <p className="whitespace-pre-line text-sm">{p.content}</p>
              {p.imageKeys.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {p.imageKeys.map((k) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} src={postImageUrl(k)} alt={p.title} className="rounded-md border object-cover" />
                  ))}
                </div>
              )}
              {embed && (
                <iframe src={embed} title={p.title} className="aspect-video w-full rounded-md"
                  allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
              )}
            </li>
          );
        })}
        {posts.length === 0 && <p className="text-sm text-gray-500">Aucune publication.</p>}
      </ul>
    </main>
  );
}