import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, Users, MessageSquare, Trash2, TrendingUp, Award, ChevronDown, Sparkles } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-teal-500 to-green-600",
];

function getAvatarColor(email = "") {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";
}

function Avatar({ name, email, size = "md" }) {
  const color = getAvatarColor(email);
  const sz = size === "lg" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 font-bold text-white shadow-sm`}>
      {getInitials(name)}
    </div>
  );
}

function PostCard({ post, user, onLike, onDelete }) {
  const liked = (post.liked_by || []).includes(user?.email);
  const isOwner = post.user_email === user?.email || user?.role === "admin";
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(post.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="group rounded-2xl border border-border bg-card hover:border-gold/20 transition-all duration-200 p-4 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex gap-3">
        <Avatar name={post.user_name} email={post.user_email} />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold leading-none">{post.user_name}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-[10px] text-gold font-medium">
                <Award className="w-2.5 h-2.5" /> Inversor
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: es })}
              </span>
            </div>
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center gap-1 px-2 py-1 rounded-lg border ${
                  confirmDelete
                    ? "text-red-400 border-red-500/30 bg-red-500/10"
                    : "text-muted-foreground border-transparent hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5"
                }`}
              >
                <Trash2 className="w-3 h-3" />
                {confirmDelete ? "¿Confirmar?" : ""}
              </button>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
            <button
              onClick={() => onLike(post)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                liked
                  ? "text-red-400 scale-110"
                  : "text-muted-foreground hover:text-red-400 hover:scale-105"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 transition-all ${liked ? "fill-red-400 scale-110" : ""}`} />
              <span>{post.likes || 0}</span>
            </button>
            <span className="text-[11px] text-muted-foreground/50">
              {format(new Date(post.created_date), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const PAGE_SIZE = 15;

export default function Comunidad() {
  const { user } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [newCount, setNewCount] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    base44.entities.ForoPost.list("-created_date", 200).then((data) => {
      setPosts(data);
      setLoading(false);
    });
    const unsub = base44.entities.ForoPost.subscribe((event) => {
      if (event.type === "create") {
        setPosts((prev) => {
          const isOwn = event.data.user_email === user?.email;
          if (!isOwn) setNewCount((c) => c + 1);
          return [event.data, ...prev];
        });
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
    setVisible(PAGE_SIZE);
  };

  const handleLike = async (post) => {
    const likedBy = post.liked_by || [];
    const alreadyLiked = likedBy.includes(user.email);
    const newLikedBy = alreadyLiked ? likedBy.filter((e) => e !== user.email) : [...likedBy, user.email];
    await base44.entities.ForoPost.update(post.id, { likes: newLikedBy.length, liked_by: newLikedBy });
  };

  const handleDelete = async (postId) => {
    await base44.entities.ForoPost.delete(postId);
  };

  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
  const visiblePosts = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  if (!user) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Comunidad</h1>
            <p className="text-xs text-muted-foreground">Inversores compartiendo experiencias en tiempo real</p>
          </div>
        </div>

        {/* Stats strip */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 mt-4"
          >
            {[
              { icon: MessageSquare, label: "Publicaciones", value: posts.length, color: "text-blue-400" },
              { icon: Heart, label: "Likes totales", value: totalLikes, color: "text-red-400" },
              { icon: TrendingUp, label: "Activos hoy", value: new Set(posts.filter(p => new Date(p.created_date) > new Date(Date.now() - 86400000)).map(p => p.user_email)).size, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 flex items-center gap-2">
                <s.icon className={`w-3.5 h-3.5 ${s.color} flex-shrink-0`} />
                <div>
                  <p className="text-xs font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Nuevo post */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-border bg-card p-4 space-y-3"
      >
        <div className="flex gap-3">
          <Avatar name={user.full_name} email={user.email} size="lg" />
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{user.full_name || "Inversor"}</p>
            <Textarea
              ref={textareaRef}
              placeholder="Comparte tu experiencia, pregunta o consejo con la comunidad..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handlePost(); }}
              className="bg-secondary border-border/60 focus:border-gold/40 resize-none text-sm min-h-[80px] transition-colors"
              maxLength={500}
            />
          </div>
        </div>
        <div className="flex items-center justify-between pl-12">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${content.length > 450 ? "text-amber-400" : "text-muted-foreground"}`}>
              {content.length}/500
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">Ctrl+Enter para publicar</span>
          </div>
          <Button
            onClick={handlePost}
            disabled={!content.trim() || submitting}
            size="sm"
            className="bg-gold hover:bg-gold-dark text-black font-semibold gap-1.5 shadow-lg shadow-gold/20"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {submitting ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </motion.div>

      {/* New posts banner */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={() => { setNewCount(0); setVisible(PAGE_SIZE); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-xs font-semibold hover:bg-gold/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {newCount} nueva{newCount > 1 ? "s publicaciones" : " publicación"} · Ver
          </motion.button>
        )}
      </AnimatePresence>

      {/* Posts feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-7 h-7 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Cargando publicaciones...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Sé el primero en publicar</p>
          <p className="text-xs mt-1 opacity-60">La comunidad te está esperando</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>

          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="outline"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="w-full border-border/60 hover:border-gold/30 text-muted-foreground hover:text-foreground gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Ver más publicaciones ({posts.length - visible} restantes)
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}