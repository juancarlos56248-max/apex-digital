import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, Users, MessageSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function Comunidad() {
  const { user } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    const data = await base44.entities.ForoPost.list("-created_date", 50);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
    const unsub = base44.entities.ForoPost.subscribe((event) => {
      if (event.type === "create") {
        setPosts((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setPosts((prev) => prev.map((p) => (p.id === event.id ? event.data : p)));
      } else if (event.type === "delete") {
        setPosts((prev) => prev.filter((p) => p.id !== event.id));
      }
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    await base44.entities.ForoPost.create({
      user_email: user.email,
      user_name: user.full_name || "Inversor",
      content: content.trim(),
      likes: 0,
      liked_by: [],
    });
    setContent("");
    setSubmitting(false);
  };

  const handleLike = async (post) => {
    const likedBy = post.liked_by || [];
    const alreadyLiked = likedBy.includes(user.email);
    const newLikedBy = alreadyLiked
      ? likedBy.filter((e) => e !== user.email)
      : [...likedBy, user.email];
    await base44.entities.ForoPost.update(post.id, {
      likes: newLikedBy.length,
      liked_by: newLikedBy,
    });
  };

  const handleDelete = async (postId) => {
    await base44.entities.ForoPost.delete(postId);
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-bold">Comunidad</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Comparte experiencias, preguntas y tips con otros inversores
        </p>
      </motion.div>

      {/* Nuevo post */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-border bg-card p-4 space-y-3"
      >
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gold">
            {getInitials(user.full_name)}
          </div>
          <Textarea
            placeholder="Comparte algo con la comunidad..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-secondary border-border resize-none text-sm min-h-[80px]"
            maxLength={500}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{content.length}/500</span>
          <Button
            onClick={handlePost}
            disabled={!content.trim() || submitting}
            size="sm"
            className="bg-gold hover:bg-gold-dark text-black font-semibold gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </motion.div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Sé el primero en publicar algo</p>
        </div>
      ) : (
        <AnimatePresence>
          {posts.map((post, i) => {
            const liked = (post.liked_by || []).includes(user.email);
            const isOwner = post.user_email === user.email || user.role === "admin";
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                    {getInitials(post.user_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <span className="text-sm font-semibold">{post.user_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(post.created_date), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                      {post.content}
                    </p>
                    <button
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 mt-3 text-xs transition-colors ${
                        liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-400" : ""}`} />
                      <span>{post.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}