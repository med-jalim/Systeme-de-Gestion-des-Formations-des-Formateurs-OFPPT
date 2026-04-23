import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Presentation,
  File as FileIcon,
  Upload,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EntityType = "formation" | "theme" | "plan";

interface FileRecord {
  id: number;
  name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

interface Props {
  entityType: EntityType;
  entityId: number;
  readOnly?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const humanSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const FileTypeIcon = ({ mime }: { mime: string }) => {
  if (mime === "application/pdf")
    return <FileText className="h-5 w-5 text-red-500 shrink-0" />;
  if (mime.includes("spreadsheet") || mime.includes("excel"))
    return <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />;
  if (mime.includes("presentation") || mime.includes("powerpoint"))
    return <Presentation className="h-5 w-5 text-orange-500 shrink-0" />;
  if (mime.startsWith("image/"))
    return <FileImage className="h-5 w-5 text-blue-500 shrink-0" />;
  return <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />;
};

const ACCEPTED =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp";

// ─── Component ────────────────────────────────────────────────────────────────

export const DocumentsPanel = ({ entityType, entityId, readOnly = false }: Props) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const qKey = ["files", entityType, entityId];

  const { data: files = [], isLoading } = useQuery<FileRecord[]>({
    queryKey: qKey,
    queryFn: async () =>
      (
        await axiosInstance.get("/files", {
          params: { entity_type: entityType, entity_id: entityId },
        })
      ).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey });
      toast.success("Fichier supprimé.");
      setDeleteTarget(null);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Erreur lors de la suppression."),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_SIZE) {
      toast.error("Le fichier dépasse la taille maximale autorisée (20 MB).");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity_type", entityType);
    formData.append("entity_id", String(entityId));
    formData.append("name", file.name.replace(/\.[^/.]+$/, ""));

    setUploading(true);
    setUploadProgress(0);

    try {
      await axiosInstance.post("/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });
      queryClient.invalidateQueries({ queryKey: qKey });
      toast.success(`"${file.name}" uploadé avec succès.`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (file: FileRecord) => {
    // Open in a new tab — backend will redirect to the R2 temporary URL
    window.open(
      `${axiosInstance.defaults.baseURL}/files/${file.id}/download`,
      "_blank",
    );
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {!readOnly && (
        <div
          className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-5 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">
                Upload en cours... {uploadProgress}%
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2 group-hover:text-primary transition-colors" />
              <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                Cliquer pour uploader un fichier
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                PDF, Word, PowerPoint, Excel, Images — max 20 MB
              </p>
            </>
          )}
        </div>
      )}

      {/* File List */}
      {isLoading ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          Chargement des fichiers...
        </div>
      ) : files.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Aucun fichier attaché.
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-white border rounded-xl hover:shadow-sm transition-shadow"
            >
              <FileTypeIcon mime={file.file_type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {humanSize(file.file_size)} •{" "}
                  {new Date(file.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleDownload(file)}
                  title="Télécharger"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:bg-red-50"
                    onClick={() => setDeleteTarget(file)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File count badge */}
      {files.length > 0 && (
        <p className="text-[11px] text-muted-foreground text-right font-medium">
          {files.length} fichier(s) attaché(s)
        </p>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fichier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez supprimer définitivement{" "}
              <strong>{deleteTarget?.name}</strong>. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
