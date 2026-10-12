import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const assetsDir = path.resolve(process.cwd(), "../frontend/src/app/assests");
const outPath = path.resolve(process.cwd(), "../frontend/src/lib/cloudinaryImages.json");

async function uploadMissing() {
  const existing: Record<string, string> = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf-8"))
    : {};

  const files = fs.readdirSync(assetsDir);

  for (const file of files) {
    const baseName = path.parse(file).name;
    if (existing[file]) {
      console.log(`Already uploaded: ${file}`);
      continue;
    }

    const filePath = path.join(assetsDir, file);
    console.log(`Uploading ${file}...`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await cloudinary.uploader.upload(filePath, {
          folder: "crm-assets",
          public_id: baseName,
          overwrite: true,
          resource_type: "image",
          timeout: 60000,
        });

        console.log(`Uploaded ${file} -> ${res.secure_url}`);
        existing[file] = res.secure_url;
        existing[baseName] = res.secure_url;
        break;
      } catch (err) {
        console.error(`Attempt ${attempt} failed for ${file}:`, err);
        if (attempt === 3) throw err;
      }
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
  console.log("All images uploaded and JSON updated successfully!");
}

uploadMissing().catch((err) => {
  console.error("Upload error:", err);
  process.exit(1);
});
