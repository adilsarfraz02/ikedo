import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Define your file routes here
  imageUploader: f({ image: { maxFileSize: "8MB" } }).onUploadComplete(
    ({ file }) => {
      console.log("File uploaded:", file);
    },
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
