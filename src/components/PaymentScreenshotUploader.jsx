"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { X, Upload, CheckCircle, Image as ImageIcon } from "lucide-react";

export function PaymentScreenshotUploader({ onUploadComplete, currentUrl = "" }) {
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);

  const handleUploadComplete = (res) => {
    if (res && res.length > 0) {
      const url = res[0].url;
      setUploadedUrl(url);
      onUploadComplete(url);
      setUploading(false);
      toast.dismiss("upload");
      toast.success("Payment screenshot uploaded successfully!");
    }
  };

  const handleRemove = () => {
    setUploadedUrl("");
    onUploadComplete("");
    toast.success("Screenshot removed");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-default-700">
        Payment Proof / Screenshot <span className="text-red-500">*</span>
      </label>
      
      {uploadedUrl ? (
        <div className="relative border-2 border-success rounded-lg p-4 bg-success-50">
          <div className="flex items-start gap-3">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-success-200">
              <img
                src={uploadedUrl}
                alt="Payment proof"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-success-700">
                  Screenshot uploaded successfully
                </span>
              </div>
              <p className="text-xs text-default-600 break-all line-clamp-2">
                {uploadedUrl}
              </p>
              <button
                onClick={() => window.open(uploadedUrl, '_blank')}
                className="text-xs text-primary-600 hover:underline mt-1"
                type="button"
              >
                View full image →
              </button>
            </div>
            <button
              onClick={handleRemove}
              className="flex-shrink-0 p-1.5 hover:bg-danger-100 rounded-full transition-colors"
              type="button"
              title="Remove screenshot"
            >
              <X className="w-5 h-5 text-danger-600" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-default-300 rounded-lg hover:border-primary-400 transition-colors bg-default-50">
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadBegin={() => {
              setUploading(true);
              toast.loading("Uploading screenshot...", { id: "upload" });
            }}
            onUploadError={(error) => {
              console.error("Upload error:", error);
              toast.error("Failed to upload screenshot", { id: "upload" });
              setUploading(false);
            }}
            appearance={{
              container: "w-full cursor-pointer",
              uploadIcon: "text-primary-500",
              label: "text-sm text-default-700 font-medium",
              allowedContent: "text-xs text-default-500",
              button: "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md ut-ready:bg-primary-600 ut-uploading:bg-primary-400 ut-uploading:cursor-not-allowed",
            }}
            content={{
              label: ({ ready, isUploading }) => {
                if (isUploading) return "Uploading...";
                if (ready) return "Drop screenshot here or click to browse";
                return "Getting ready...";
              },
              allowedContent: "PNG, JPG, JPEG (Max 8MB)",
              button: ({ ready, isUploading }) => {
                if (isUploading) return "Uploading...";
                if (ready) return "Choose File";
                return "Loading...";
              },
            }}
            className="ut-container"
          />
        </div>
      )}

      <p className="text-xs text-default-500 flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" />
        Upload a clear screenshot of your payment confirmation or transaction receipt
      </p>
    </div>
  );
}
