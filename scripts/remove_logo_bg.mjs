import sharp from "sharp";
import path from "path";

const inputPath = path.resolve("public/site-assets/birkenhead/logo.png");
const outputPath = path.resolve("public/site-assets/birkenhead/logo.png");
const backupPath = path.resolve("public/site-assets/birkenhead/logo-black-bg.png");

async function run() {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Extract raw RGBA
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const outputBuffer = Buffer.alloc(data.length);

  // Black background removal with smooth thresholding & unmultiplication
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const maxVal = Math.max(r, g, b);

    // If pixel is black or near black (below threshold 15)
    if (maxVal <= 14) {
      outputBuffer[i] = 0;
      outputBuffer[i + 1] = 0;
      outputBuffer[i + 2] = 0;
      outputBuffer[i + 3] = 0;
    } else {
      let alpha;
      if (maxVal < 65) {
        alpha = (maxVal - 14) / (65 - 14);
      } else {
        alpha = Math.min(1.0, maxVal / 220);
      }

      // If near-white text, full opacity
      if (r > 120 && g > 120 && b > 120) {
        alpha = 1.0;
      }

      // Unpremultiply color against black background to eliminate dark borders
      const effectiveAlpha = Math.max(alpha, 0.01);
      const newR = Math.min(255, Math.round(r / effectiveAlpha));
      const newG = Math.min(255, Math.round(g / effectiveAlpha));
      const newB = Math.min(255, Math.round(b / effectiveAlpha));

      outputBuffer[i] = newR;
      outputBuffer[i + 1] = newG;
      outputBuffer[i + 2] = newB;
      outputBuffer[i + 3] = Math.round(alpha * 255);
    }
  }

  // Save backup of the original black-bg logo
  await sharp(inputPath).toFile(backupPath);
  console.log("Original black-bg logo backed up to", backupPath);

  // Overwrite logo.png with the transparent version
  await sharp(outputBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log("Transparent logo successfully saved to", outputPath);
}

run().catch(console.error);
