"use client";
 
import { Upload, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { getPresignedUploadUrl } from "@/lib/actions/uploadFileActions";
import { useSocketProgress } from "@/hooks/use-socket-progress";
import { toast } from "sonner";
 
export function UploadFile() {
  const [files, setFiles] = React.useState<File[]>([]);
  const {progressMap, statusMap} = useSocketProgress();
 

console.log('Files : ', files)
console.log('Progress Map: ',progressMap);
console.log('Status Map: ' ,statusMap);

// 2. Create a reference to the progress state
  // This allows the async loop to read the *latest* values instantly
  const progressRef = React.useRef(progressMap);

  // Keep the ref updated whenever the state changes
  React.useEffect(() => {
    progressRef.current = progressMap;

    // Check if the current file has reached 100% progress
    const currentFile = files[0];
    if (currentFile && progressMap[currentFile.name] === 100) {
      toast.success("File processed successfully");
      setFiles([]); // Clear the file selection
    }
  }, [progressMap, files]);

const onUpload = React.useCallback(
    async (files: File[], { onProgress, onSuccess, onError }: any) => {
      
      const uploadPromises = files.map(async (file) => {
        try {
          // --- Phase 1: Upload to MinIO (0% - 20%) ---
          const { success, url } = await getPresignedUploadUrl(file.name, file.type);
          if (!success || !url) throw new Error("Failed to get upload URL");

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url, true);
            
            // Track upload progress (bytes sent)
            xhr.upload.onprogress = (e) => {
               if (e.lengthComputable) {
                 // Map 100% of the upload to the first 20% of the visual bar
                 const percent = (e.loaded / e.total) * 20; 
                 onProgress(file, percent);
               }
            };
            xhr.onload = () => (xhr.status === 200 ? resolve() : reject());
            xhr.onerror = () => reject();
            xhr.send(file);
          });

          // --- Phase 2: Wait for Node-RED (20% - 100%) ---
          // The file is in MinIO. Now we poll the Ref until Node-RED says "100%"
          
          await new Promise<void>((resolve, reject) => {
            const checkInterval = setInterval(() => {
              // Read the LATEST progress from the Ref
              const currentProgress = progressRef.current[file.name] || 0;
              
              // Only update UI if server progress is ahead of the upload
              if (currentProgress > 20) {
                 onProgress(file, currentProgress);
              }

              // Success! Node-RED said 100%
              if (currentProgress === 100) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 500); // Check every 0.5 seconds

            // Safety Valve: If AI takes more than 60s, stop waiting
            setTimeout(() => {
                clearInterval(checkInterval);
                // Optional: reject(new Error("Timeout waiting for AI")); 
            }, 60000); 
          });

          // Mark as complete
          onSuccess(file);

        } catch (error) {
          onError(file, error instanceof Error ? error : new Error("Failed"));
        }
      });

      await Promise.all(uploadPromises);
    },
    [] // No dependencies needed because we use the Ref!
  );
 
  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);
 
  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      maxFiles={1}
      maxSize={5 * 1024 * 1024}
      className="w-full max-w-3xl mx-auto"
      onUpload={onUpload}
      onFileReject={onFileReject}
      multiple={false}
    >
      <FileUploadDropzone className="bg-white cursor-pointer py-12">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-indigo-600" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (only one file, up to 5MB each)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer border-indigo-600  mt-2 w-fit">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      {files[0] && 
      <FileUploadItem  value={files[0]}>
          <div className="flex w-full items-center gap-2">
              <FileUploadItemPreview />
              <div className="flex-1">
                  {/* Add this Status Text Section */}
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{files[0].name}</span>
                      {/* Display the status from the map */}
                      <span>{statusMap[files[0].name] || "Initializing..."}</span>
                  </div>
                  
                  <FileUploadItemProgress />
              </div>
          </div>
          <FileUploadItemDelete />
      </FileUploadItem>
      }
    
    </FileUpload>
  );
}