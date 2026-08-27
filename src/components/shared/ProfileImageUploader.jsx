import React, { useState, useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function ProfileImageUploader({ imageUrl, userName, onUpdated, size = "md" }) {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const dimensions = size === "lg" ? "w-24 h-24" : size === "sm" ? "w-9 h-9" : "w-16 h-16";
  const iconSize = size === "lg" ? 28 : size === "sm" ? 14 : 20;
  const initials = (userName || "?").charAt(0).toUpperCase();

  const processAndUpload = async (file) => {
    setUploading(true);
    try {
      // Center-crop to square using canvas
      const img = new Image();
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
      const croppedFile = new File([blob], "profile.jpg", { type: "image/jpeg" });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: croppedFile });
      await base44.auth.updateMe({ profile_image_url: file_url });
      onUpdated?.(file_url);
      toast({ title: "Profile picture updated" });
    } catch {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) processAndUpload(file);
    e.target.value = "";
  };

  const removeImage = async () => {
    setUploading(true);
    try {
      await base44.auth.updateMe({ profile_image_url: "" });
      onUpdated?.("");
      toast({ title: "Profile picture removed" });
    } catch {
      toast({ title: "Failed to remove image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`relative ${dimensions} rounded-full shrink-0`}>
        {imageUrl ? (
          <img src={imageUrl} alt={userName || "Profile"} className={`w-full h-full rounded-full object-cover`} />
        ) : (
          <div className={`w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold ${size === "sm" ? "text-sm" : "text-2xl"}`}>
            {initials}
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
          aria-label="Change profile picture"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {size !== "sm" && imageUrl && (
        <button
          onClick={removeImage}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
        >
          <Trash2 size={12} /> Remove
        </button>
      )}
    </div>
  );
}