import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lightbulb, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  imagePath?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function DicasBlog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const { data: postsData, isLoading } = useQuery<{ success: boolean; posts: BlogPost[] }>({
    queryKey: ["/api/blog-posts"],
  });

  // Filtrar apenas posts ativos
  const activePosts = postsData?.posts?.filter(post => post.isActive) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#133903] to-[#2E593F] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <Lightbulb className="w-16 h-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Dicas e Novidades
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Aprenda mais sobre alimentação saudável, receitas, dicas de cultivo e muito mais
            </p>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#133903]"></div>
                <p className="mt-4 text-gray-600">Carregando posts...</p>
              </div>
            ) : activePosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activePosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  >
                    {post.imagePath && (
                      <div className="h-56 overflow-hidden">
                        <img
                          src={post.imagePath}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-[#2E593F] mb-3 hover:text-[#133903] transition-colors">
                        {post.title}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <time dateTime={new Date(post.createdAt).toISOString()}>
                          {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                      <div
                        className="text-gray-600 line-clamp-4 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="mt-4 text-[#133903] font-semibold hover:text-[#6a9e24] transition-colors inline-flex items-center"
                      >
                        Ler mais
                        <span className="iconify ml-2" data-icon="mdi:arrow-right" data-width="20"></span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">
                  Nenhuma dica disponível no momento
                </h3>
                <p className="text-gray-500">
                  Volte em breve para conferir nossos posts!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal para exibir post completo */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-3xl font-bold text-[#2E593F] pr-8">
              {selectedPost?.title}
            </DialogTitle>
            {selectedPost && (
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={new Date(selectedPost.createdAt).toISOString()}>
                  {new Date(selectedPost.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
              </div>
            )}
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2">
            {selectedPost?.imagePath && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={selectedPost.imagePath}
                  alt={selectedPost.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {selectedPost && (
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            )}
          </div>

          <button
            onClick={() => setSelectedPost(null)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
