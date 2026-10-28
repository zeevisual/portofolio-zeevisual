import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function zeevisualLocalCmsPlugin(): Plugin {
  let failedLoginAttempts = 0;
  let lockoutUntil = 0;

  return {
    name: 'zeevisual-local-cms',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        if (!req.url || !req.url.startsWith('/api/cms/')) {
          return next();
        }

        // Strict Localhost-Only Protection: Block any external network/Wi-Fi requests to /api/cms/*
        const remoteAddr = String(req.socket?.remoteAddress || '');
        const isLoopback =
          remoteAddr === '127.0.0.1' ||
          remoteAddr === '::1' ||
          remoteAddr === '::ffff:127.0.0.1';
        if (!isLoopback) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              ok: false,
              message: 'Akses ditolak: API Studio Admin hanya dapat diakses dari perangkat lokal.',
            })
          );
          return;
        }

        // @ts-ignore - Node built-ins available at Vite server runtime
        const fs = await import('node:fs');
        // @ts-ignore
        const path = await import('node:path');
        // @ts-ignore
        const crypto = await import('node:crypto');
        // @ts-ignore
        const rootDir = process.cwd();
        const securityFilePath = path.join(rootDir, '.admin-security.json');

        const getSecurityConfig = () => {
          try {
            if (fs.existsSync(securityFilePath)) {
              const raw = fs.readFileSync(securityFilePath, 'utf-8');
              return JSON.parse(raw);
            }
          } catch {
            // fallback
          }
          return {
            adminPassword: 'zeevisual2025',
            recoveryEmail: 'ziyadfuture99@gmail.com',
            updatedAt: new Date().toISOString(),
          };
        };

        const saveSecurityConfig = (cfg: Record<string, unknown>) => {
          const existing = getSecurityConfig();
          fs.writeFileSync(
            securityFilePath,
            JSON.stringify({ ...existing, ...cfg, updatedAt: new Date().toISOString() }, null, 2),
            'utf-8'
          );
        };

        // Helper to deploy dist folder directly to Netlify via SHA1 File Digest API
        const deployDistToNetlify = async (siteId: string, token: string) => {
          const distDir = path.join(rootDir, 'dist');
          const filesMap: Record<string, string> = {};
          const shaToFilePath: Record<string, string> = {};

          const walkDir = (currentDir: string) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(currentDir, entry.name);
              if (entry.isDirectory()) {
                walkDir(fullPath);
              } else if (entry.isFile()) {
                const relPath = '/' + path.relative(distDir, fullPath).replace(/\\/g, '/');
                const content = fs.readFileSync(fullPath);
                const sha1 = crypto.createHash('sha1').update(content).digest('hex');
                filesMap[relPath] = sha1;
                shaToFilePath[sha1] = fullPath;
              }
            }
          };

          walkDir(distDir);

          // 1. Create deploy with file digests
          const createRes = await fetch(
            `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ files: filesMap }),
            }
          );

          if (!createRes.ok) {
            throw new Error(`Netlify deploy error: ${createRes.status}`);
          }

          const deployData = (await createRes.json()) as {
            id: string;
            required?: string[];
            ssl_url?: string;
          };

          // 2. Upload only the required (new/changed) files in parallel batches of 6
          const requiredShas = deployData.required || [];
          const batchSize = 6;
          for (let i = 0; i < requiredShas.length; i += batchSize) {
            const batch = requiredShas.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (sha) => {
                const filePath = shaToFilePath[sha];
                if (!filePath) return;
                const relPath = '/' + path.relative(distDir, filePath).replace(/\\/g, '/');
                const fileBuffer = fs.readFileSync(filePath);
                const encodedPath = relPath
                  .split('/')
                  .map((seg) => encodeURIComponent(seg))
                  .join('/');

                await fetch(
                  `https://api.netlify.com/api/v1/deploys/${deployData.id}/files${encodedPath}`,
                  {
                    method: 'PUT',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/octet-stream',
                    },
                    body: fileBuffer,
                  }
                );
              })
            );
          }

          return deployData.ssl_url || 'https://zeevisual.netlify.app';
        };

        const sendJson = (status: number, data: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        if (req.method === 'GET' && req.url === '/api/cms/status') {
          return sendJson(200, {
            localServer: true,
            maskedEmail: 'ziy********99@gmail.com',
          });
        }

        const ALLOWED_MEDIA_EXTENSIONS = new Set([
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
          '.gif',
          '.mp4',
          '.mov',
          '.webm',
          '.mkv',
          '.avi',
          '.pdf',
        ]);

        const verifySecretTimingSafe = (input: string, expected: string) => {
          const hashA = crypto.createHash('sha256').update(String(input || '')).digest();
          const hashB = crypto.createHash('sha256').update(String(expected || '')).digest();
          return crypto.timingSafeEqual(hashA, hashB);
        };

        const sanitizeAndTruncateFileName = (rawFileName: string) => {
          const extMatch = String(rawFileName).toLowerCase().match(/(\.[a-z0-9]{2,5})$/);
          const rawExt = extMatch ? extMatch[1] : '.jpg';
          const ext = ALLOWED_MEDIA_EXTENSIONS.has(rawExt) ? rawExt : '.jpg';
          const rawBase = extMatch
            ? String(rawFileName).slice(0, -rawExt.length)
            : String(rawFileName);
          let cleanBase = rawBase
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          if (!cleanBase) cleanBase = 'media-' + Date.now();
          if (cleanBase.length > 42) {
            const shortHash = crypto
              .createHash('md5')
              .update(rawBase)
              .digest('hex')
              .slice(0, 6);
            cleanBase = `${cleanBase.slice(0, 34)}-${shortHash}`;
          }
          return `${cleanBase}${ext}`;
        };

        const findFfmpegBin = (): string | null => {
          // @ts-ignore
          const localAppData = process.env.LOCALAPPDATA || '';
          const capcutAppsDir = path.join(localAppData, 'CapCut', 'Apps');
          if (fs.existsSync(capcutAppsDir)) {
            try {
              const versions = fs.readdirSync(capcutAppsDir).sort().reverse();
              for (const ver of versions) {
                const candidate = path.join(capcutAppsDir, ver, 'ffmpeg.exe');
                if (fs.existsSync(candidate)) return candidate;
              }
            } catch {
              // ignore
            }
          }
          return null;
        };

        const detectAndCropVideoLetterbox = async (
          fullVidPath: string,
          targetImgDir: string,
          baseName: string
        ) => {
          const ffmpegBin = findFfmpegBin();
          if (!ffmpegBin || !fs.existsSync(fullVidPath)) return null;

          try {
            // @ts-ignore
            const { execSync } = await import('node:child_process');
            let probeOut = '';
            try {
              execSync(`"${ffmpegBin}" -hide_banner -i "${fullVidPath}" 2>&1`, { stdio: 'pipe' });
            } catch (err: any) {
              probeOut =
                (err.stdout ? err.stdout.toString() : '') +
                (err.stderr ? err.stderr.toString() : '');
            }

            const dimMatch = probeOut.match(/Video:.*?(\d{3,4})x(\d{3,4})/);
            if (!dimMatch) return null;
            const width = parseInt(dimMatch[1], 10);
            const height = parseInt(dimMatch[2], 10);

            // Extract 1 gray frame from 3s in to detect black bars
            let raw: Buffer;
            try {
              raw = execSync(
                `"${ffmpegBin}" -ss 3 -i "${fullVidPath}" -vframes 1 -f rawvideo -pix_fmt gray -`,
                { maxBuffer: 15 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] }
              );
            } catch {
              return null;
            }

            if (!raw || raw.length < width * height) return null;

            let topNonBlack = -1;
            let bottomNonBlack = -1;
            for (let y = 0; y < height; y++) {
              let rowSum = 0;
              for (let x = 0; x < width; x++) {
                rowSum += raw[y * width + x];
              }
              const avg = rowSum / width;
              if (avg > 18) {
                if (topNonBlack === -1) topNonBlack = y;
                bottomNonBlack = y;
              }
            }

            if (topNonBlack === -1 || bottomNonBlack === -1) return null;

            const topPad = topNonBlack;
            const bottomPad = height - 1 - bottomNonBlack;
            const rawActiveHeight = bottomNonBlack - topNonBlack + 1;
            const evenActiveHeight = rawActiveHeight - (rawActiveHeight % 2);

            // If letterbox detected (black bars top & bottom > 50px)
            if (topPad > 50 && bottomPad > 50 && evenActiveHeight > 100) {
              const tempCropped = path.join(
                path.dirname(fullVidPath),
                `_cropped_${Date.now()}.mp4`
              );

              // If it's standard 16:9 aspect ratio inside a portrait canvas, upscale to crisp 1280x720
              const is16x9 = Math.abs(width / evenActiveHeight - 16 / 9) < 0.25;
              const vf = is16x9
                ? `crop=${width}:${evenActiveHeight}:0:${topPad},scale=1280:720`
                : `crop=${width}:${evenActiveHeight}:0:${topPad}`;

              execSync(
                `"${ffmpegBin}" -y -i "${fullVidPath}" -vf "${vf}" -c:v h264_mf -b:v 2500k -c:a copy "${tempCropped}"`,
                { timeout: 120000, stdio: 'ignore' }
              );

              if (fs.existsSync(tempCropped) && fs.statSync(tempCropped).size > 5000) {
                fs.unlinkSync(fullVidPath);
                fs.renameSync(tempCropped, fullVidPath);

                // Generate matching clean thumbnail
                const thumbFile = `thumb-${baseName}.jpg`;
                const thumbPath = path.join(targetImgDir, thumbFile);
                execSync(
                  `"${ffmpegBin}" -y -ss 3 -i "${fullVidPath}" -vframes 1 -q:v 2 "${thumbPath}"`,
                  { timeout: 10000, stdio: 'ignore' }
                );

                return {
                  cropped: true,
                  videoType: is16x9 ? 'landscape' : evenActiveHeight > width ? 'portrait' : 'landscape',
                  thumbUrl: `/images/foto/${thumbFile}`,
                };
              }
            }

            return {
              cropped: false,
              videoType: height > width ? 'portrait' : 'landscape',
            };
          } catch (e) {
            return null;
          }
        };

        const transcodeToWebMp4 = async (
          fullVidPath: string,
          targetDir: string,
          baseName: string
        ): Promise<{
          success: boolean;
          finalPath: string;
          fileName: string;
          videoType: 'landscape' | 'portrait';
          thumbUrl?: string;
        } | null> => {
          const ffmpegBin = findFfmpegBin();
          if (!ffmpegBin || !fs.existsSync(fullVidPath)) return null;

          try {
            // @ts-ignore
            const { execSync } = await import('node:child_process');
            const cleanBase = baseName.replace(/\.[^.]+$/, '');
            const mp4Name = `${cleanBase}.mp4`;
            const tempOutPath = path.join(targetDir, `_web_${Date.now()}_${mp4Name}`);
            const finalOutPath = path.join(targetDir, mp4Name);

            // Re-encode to universal Web H.264 + AAC + YUV420P + FastStart
            execSync(
              `"${ffmpegBin}" -y -i "${fullVidPath}" -c:v h264_mf -b:v 2800k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${tempOutPath}"`,
              { stdio: 'pipe', timeout: 300000 }
            );

            if (fs.existsSync(tempOutPath) && fs.statSync(tempOutPath).size > 1024) {
              if (fs.existsSync(fullVidPath) && fullVidPath !== finalOutPath) {
                fs.unlinkSync(fullVidPath);
              }
              if (fs.existsSync(finalOutPath)) {
                try {
                  fs.unlinkSync(finalOutPath);
                } catch {}
              }
              fs.renameSync(tempOutPath, finalOutPath);

              // Auto-detect letterbox & generate thumb
              const targetImgDir = path.join(rootDir, 'public', 'images', 'foto');
              const cropRes = await detectAndCropVideoLetterbox(finalOutPath, targetImgDir, cleanBase);

              return {
                success: true,
                finalPath: finalOutPath,
                fileName: mp4Name,
                videoType: cropRes?.videoType || 'landscape',
                thumbUrl: cropRes?.thumbUrl || undefined,
              };
            }
          } catch (err) {
            // ignore
          }
          return null;
        };

        // Direct binary stream upload for large / long-duration videos & files (no Base64 memory limit!)
        if (req.method === 'POST' && req.url === '/api/cms/upload-stream') {
          try {
            const rawHeaderName = decodeURIComponent(
              String(req.headers['x-file-name'] || `video-${Date.now()}.mp4`)
            );
            const folder = String(req.headers['x-target-folder'] || 'videos');

            const allowedFolders: Record<string, string> = {
              foto: 'images/foto',
              desain: 'images/desain',
              profile: 'images/profile',
              videos: 'videos',
              cv: 'cv',
            };

            const targetSubfolder = allowedFolders[folder] || 'videos';
            const targetDir = path.join(rootDir, 'public', targetSubfolder);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }

            const cleanName = sanitizeAndTruncateFileName(rawHeaderName);
            const fullSavePath = path.join(targetDir, cleanName);
            const writeStream = fs.createWriteStream(fullSavePath);

            req.pipe(writeStream);

            writeStream.on('finish', async () => {
              try {
                let finalFileName = cleanName;
                let detectedVideoType: 'landscape' | 'portrait' = 'landscape';
                let autoThumbUrl: string | undefined = undefined;

                if (folder === 'videos' && fs.existsSync(fullSavePath)) {
                  const stat = fs.statSync(fullSavePath);
                  const isNonMp4 = !cleanName.toLowerCase().endsWith('.mp4');
                  const ffmpegBin = findFfmpegBin();

                  let needsTranscode = isNonMp4 || stat.size > 25 * 1024 * 1024;
                  if (ffmpegBin && !needsTranscode) {
                    try {
                      // @ts-ignore
                      const { execSync } = await import('node:child_process');
                      let probeOut = '';
                      try {
                        execSync(`"${ffmpegBin}" -hide_banner -i "${fullSavePath}" 2>&1`, {
                          stdio: 'pipe',
                        });
                      } catch (err: any) {
                        probeOut =
                          (err.stdout ? err.stdout.toString() : '') +
                          (err.stderr ? err.stderr.toString() : '');
                      }
                      if (
                        /h265|hevc|prores|yuv420p10|yuv422|yuv444/i.test(probeOut) ||
                        !/Video:\s*h264/i.test(probeOut) ||
                        !/Audio:\s*aac/i.test(probeOut)
                      ) {
                        needsTranscode = true;
                      }
                    } catch {}
                  }

                  if (needsTranscode) {
                    const transRes = await transcodeToWebMp4(fullSavePath, targetDir, cleanName);
                    if (transRes && transRes.success) {
                      finalFileName = transRes.fileName;
                      detectedVideoType = transRes.videoType;
                      autoThumbUrl = transRes.thumbUrl;
                    }
                  } else {
                    // Even if already H.264, auto-crop letterbox & make thumbnail
                    const targetImgDir = path.join(rootDir, 'public', 'images', 'foto');
                    const baseName = cleanName.replace(/\.[^.]+$/, '');
                    const cropRes = await detectAndCropVideoLetterbox(
                      fullSavePath,
                      targetImgDir,
                      baseName
                    );
                    if (cropRes) {
                      detectedVideoType = cropRes.videoType;
                      autoThumbUrl = cropRes.thumbUrl;
                    }
                  }
                }

                const publicUrl = `/${targetSubfolder}/${finalFileName}`;
                return sendJson(200, {
                  ok: true,
                  url: publicUrl,
                  videoType: detectedVideoType,
                  thumbUrl: autoThumbUrl,
                });
              } catch (err) {
                return sendJson(500, { ok: false, message: String(err) });
              }
            });

            writeStream.on('error', (err: unknown) => {
              return sendJson(500, { ok: false, message: 'Gagal menyimpan stream: ' + String(err) });
            });
          } catch (err) {
            return sendJson(500, { ok: false, message: String(err) });
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: unknown) => {
            body += String(chunk);
          });

          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');

              if (req.url === '/api/cms/verify-password') {
                if (Date.now() < lockoutUntil) {
                  const waitSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
                  return sendJson(429, {
                    ok: false,
                    message: `Terlalu banyak percobaan salah. Silakan tunggu ${waitSec} detik lagi.`,
                  });
                }
                const sec = getSecurityConfig();
                if (verifySecretTimingSafe(String(payload.password || ''), sec.adminPassword)) {
                  failedLoginAttempts = 0;
                  lockoutUntil = 0;
                  return sendJson(200, { ok: true });
                }
                failedLoginAttempts += 1;
                if (failedLoginAttempts >= 5) {
                  lockoutUntil = Date.now() + 3 * 60 * 1000; // 3-minute cooldown
                  failedLoginAttempts = 0;
                  return sendJson(429, {
                    ok: false,
                    message:
                      'Terlalu banyak percobaan login gagal (5x). Akses dikunci sementara selama 3 menit demi keamanan.',
                  });
                }
                return sendJson(401, {
                  ok: false,
                  message: `Password admin tidak sesuai. (Sisa percobaan: ${5 - failedLoginAttempts}x)`,
                });
              }

              if (req.url === '/api/cms/change-password') {
                const sec = getSecurityConfig();
                const { currentPassword, newPassword } = payload;
                if (!verifySecretTimingSafe(String(currentPassword || ''), sec.adminPassword)) {
                  return sendJson(401, {
                    ok: false,
                    message: 'Password saat ini salah.',
                  });
                }
                if (!newPassword || String(newPassword).length < 6) {
                  return sendJson(400, {
                    ok: false,
                    message: 'Password baru minimal 6 karakter.',
                  });
                }
                saveSecurityConfig({
                  adminPassword: String(newPassword),
                  recoveryEmail: 'ziyadfuture99@gmail.com',
                });
                return sendJson(200, {
                  ok: true,
                  message: 'Password admin berhasil diperbarui secara permanen!',
                });
              }

              if (req.url === '/api/cms/reset-password-by-email') {
                const { email, newPassword } = payload;
                const sec = getSecurityConfig();
                if (
                  String(email).trim().toLowerCase() !==
                  sec.recoveryEmail.toLowerCase()
                ) {
                  return sendJson(403, {
                    ok: false,
                    message: 'Alamat email tidak sesuai dengan email pemilik portofolio.',
                  });
                }
                if (!newPassword || String(newPassword).length < 6) {
                  return sendJson(400, {
                    ok: false,
                    message: 'Password baru minimal 6 karakter.',
                  });
                }
                saveSecurityConfig({
                  adminPassword: String(newPassword),
                  recoveryEmail: 'ziyadfuture99@gmail.com',
                });
                return sendJson(200, {
                  ok: true,
                  message: 'Password berhasil direset! Silakan login dengan password baru Anda.',
                });
              }

              if (req.url === '/api/cms/save-projects') {
                const filePath = path.join(rootDir, 'src', 'data', 'projectsData.json');
                fs.writeFileSync(filePath, JSON.stringify(payload.projects, null, 2), 'utf-8');
                return sendJson(200, { ok: true, message: 'Data karya berhasil disimpan ke projectsData.json' });
              }

              if (req.url === '/api/cms/save-profile') {
                const filePath = path.join(rootDir, 'src', 'data', 'profileData.json');
                fs.writeFileSync(filePath, JSON.stringify(payload.profile, null, 2), 'utf-8');
                return sendJson(200, { ok: true, message: 'Data profil berhasil disimpan ke profileData.json' });
              }

              if (req.url === '/api/cms/publish-git') {
                // @ts-ignore
                const { execSync } = await import('node:child_process');
                // @ts-ignore
                const localAppData = process.env.LOCALAPPDATA || '';
                const mingitPath = path.join(localAppData, 'Programs', 'MinGit', 'cmd', 'git.exe');
                const gitBin = fs.existsSync(mingitPath) ? `"${mingitPath}"` : 'git';
                const viteCmd = path.join(rootDir, 'node_modules', '.bin', 'vite.cmd');

                try {
                  // 1. Rebuild production dist folder automatically
                  const viteJs = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
                  if (fs.existsSync(viteJs)) {
                    execSync(`node "${viteJs}" build`, { cwd: rootDir, stdio: 'pipe' });
                  } else if (fs.existsSync(viteCmd)) {
                    execSync(`"${viteCmd}" build`, { cwd: rootDir, stdio: 'pipe' });
                  }

                  const distDir = path.join(rootDir, 'dist');
                  const indexHtmlPath = path.join(distDir, 'index.html');
                  if (fs.existsSync(indexHtmlPath)) {
                    fs.copyFileSync(indexHtmlPath, path.join(distDir, '404.html'));
                    fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf-8');
                  }

                  // 2. Deploy directly to Netlify (https://zeevisual.netlify.app) if token & credits exist
                  const sec = getSecurityConfig();
                  let netlifyUpdated = false;
                  if (sec.netlifyToken && sec.netlifySiteId) {
                    try {
                      await deployDistToNetlify(sec.netlifySiteId, sec.netlifyToken);
                      netlifyUpdated = true;
                    } catch {
                      // Netlify free monthly credit cap reached; fallback seamlessly to GitHub Pages
                    }
                  }

                  // 3. Deploy dist to Unlimited Free GitHub Pages (https://zeevisual.github.io)
                  try {
                    const distGitDir = path.join(distDir, '.git');
                    if (!fs.existsSync(distGitDir)) {
                      execSync(`${gitBin} init`, { cwd: distDir, stdio: 'pipe' });
                      execSync(`${gitBin} branch -M main`, { cwd: distDir, stdio: 'pipe' });
                      execSync(`${gitBin} remote add origin https://github.com/zeevisual/zeevisual.github.io.git`, {
                        cwd: distDir,
                        stdio: 'pipe',
                      });
                    } else {
                      execSync(`${gitBin} remote set-url origin https://github.com/zeevisual/zeevisual.github.io.git`, {
                        cwd: distDir,
                        stdio: 'pipe',
                      });
                    }
                    execSync(`${gitBin} add -A`, { cwd: distDir, stdio: 'pipe' });
                    execSync(`${gitBin} commit -m "Deploy produksi Zeevisual"`, {
                      cwd: distDir,
                      stdio: 'pipe',
                    });
                    execSync(`${gitBin} push -f origin main`, { cwd: distDir, stdio: 'pipe' });
                  } catch {
                    // Ignore if no changes in dist
                  }

                  // 4. Commit and push source backup to GitHub (portofolio-zeevisual)
                  try {
                    execSync(`${gitBin} remote set-url origin https://github.com/zeevisual/portofolio-zeevisual.git`, {
                      cwd: rootDir,
                      stdio: 'pipe',
                    });
                    execSync(`${gitBin} add .`, { cwd: rootDir, stdio: 'pipe' });
                    execSync(`${gitBin} commit -m "Update portofolio via Studio Admin Zeevisual"`, {
                      cwd: rootDir,
                      stdio: 'pipe',
                    });
                    execSync(`${gitBin} push -u origin main`, { cwd: rootDir, stdio: 'pipe' });
                  } catch {
                    // Ignore git commit/push notice if nothing new
                  }

                  return sendJson(200, {
                    ok: true,
                    netlifyUpdated,
                    message:
                      'Berhasil! Website Online https://zeevisual.github.io & GitHub Anda sudah langsung ter-update!',
                  });
                } catch (err) {
                  return sendJson(400, {
                    ok: false,
                    message: 'Gagal meng-update ke online: ' + String(err),
                  });
                }
              }

              if (req.url === '/api/cms/upload') {
                const { fileName, folder, base64Data } = payload;
                if (!fileName || !base64Data) {
                  return sendJson(400, { ok: false, message: 'Nama file atau data kosong' });
                }

                const allowedFolders: Record<string, string> = {
                  foto: 'images/foto',
                  desain: 'images/desain',
                  profile: 'images/profile',
                  videos: 'videos',
                  cv: 'cv',
                };

                const targetSubfolder = allowedFolders[folder] || 'images/foto';
                const targetDir = path.join(rootDir, 'public', targetSubfolder);
                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true });
                }

                const cleanName = sanitizeAndTruncateFileName(String(fileName));

                const matches = String(base64Data).match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                const rawBase64 = matches ? matches[2] : String(base64Data);
                // @ts-ignore
                const buffer = Buffer.from(rawBase64, 'base64');

                const fullSavePath = path.join(targetDir, cleanName);
                fs.writeFileSync(fullSavePath, buffer);

                const publicUrl = `/${targetSubfolder}/${cleanName}`;
                return sendJson(200, { ok: true, url: publicUrl });
              }

              if (req.url === '/api/cms/fetch-instagram') {
                const { instagramUrl, category } = payload;
                const rawUrl = String(instagramUrl || '').trim();
                const match = rawUrl.match(
                  /(?:instagram\.com|instagr\.am)\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
                );
                if (!match) {
                  return sendJson(400, {
                    ok: false,
                    message:
                      'Link Instagram tidak valid. Gunakan link postingan (instagram.com/p/...) atau Reels (instagram.com/reel/...).',
                  });
                }

                const rawType = match[1].toLowerCase();
                const postType = rawType === 'reels' ? 'reel' : rawType;
                const shortcode = match[2];
                const cleanInstagramUrl = `https://www.instagram.com/${postType}/${shortcode}/`;
                const embedUrl = `https://www.instagram.com/${postType}/${shortcode}/embed/captioned/`;

                const targetSubfolder =
                  category === 'Desain Grafis' ? 'images/desain' : 'images/foto';
                const targetImgDir = path.join(rootDir, 'public', targetSubfolder);
                const targetVidDir = path.join(rootDir, 'public', 'videos');
                if (!fs.existsSync(targetImgDir)) fs.mkdirSync(targetImgDir, { recursive: true });
                if (!fs.existsSync(targetVidDir)) fs.mkdirSync(targetVidDir, { recursive: true });

                const decodeEntities = (str: string) =>
                  str
                    .replace(/\\u0026/g, '&')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>');

                let caption = '';
                const discoveredImageUrls: string[] = [];
                let discoveredVideoUrl = '';

                try {
                  // Instagram only serves full embed data (video_url, display_url, caption)
                  // to link-preview crawlers; regular browser UAs get the login page.
                  const embedRes = await fetch(
                    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
                    {
                      headers: {
                        'User-Agent':
                          'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                      },
                    }
                  );

                  if (embedRes.ok) {
                    const html = await embedRes.text();

                    // 1. Extract media URLs from the (double-escaped) contextJSON blob
                    const unescapeIgUrl = (raw: string) =>
                      decodeEntities(
                        raw
                          .replace(/\\+\//g, '/')
                          .replace(/\\+u0026/g, '&')
                          .replace(/\\+u003d/gi, '=')
                      );
                    const grabAll = (key: string) => {
                      const re = new RegExp(
                        `${key}\\\\*"\\s*:\\s*\\\\*"(https?:[^"]+?)\\\\*"`,
                        'g'
                      );
                      const out: string[] = [];
                      let mm: RegExpExecArray | null;
                      while ((mm = re.exec(html)) !== null) {
                        const u = unescapeIgUrl(mm[1]);
                        if (u && !out.includes(u)) out.push(u);
                      }
                      return out;
                    };

                    const videoUrls = grabAll('video_url');
                    if (videoUrls.length > 0) discoveredVideoUrl = videoUrls[0];
                    for (const u of grabAll('display_url')) {
                      if (!discoveredImageUrls.includes(u)) discoveredImageUrls.push(u);
                    }

                    // 2. Fallback: Extract EmbeddedMediaImage src from embed HTML
                    if (discoveredImageUrls.length === 0) {
                      const imgRegex = /class="EmbeddedMediaImage"[^>]+src="([^"]+)"/gi;
                      let m: RegExpExecArray | null;
                      while ((m = imgRegex.exec(html)) !== null) {
                        const url = decodeEntities(m[1]);
                        if (url && !discoveredImageUrls.includes(url)) {
                          discoveredImageUrls.push(url);
                        }
                      }
                    }

                    // 3. Fallback: Extract Caption from embed HTML
                    if (!caption) {
                      const capHtmlMatch = html.match(
                        /class="Caption"[^>]*>([\s\S]*?)<\/div>/i
                      );
                      if (capHtmlMatch) {
                        const stripped = capHtmlMatch[1]
                          .replace(/<a [^>]*class="CaptionUsername"[^>]*>[\s\S]*?<\/a>/i, '')
                          .replace(/<br\s*\/?>/gi, '\n')
                          .replace(/<[^>]+>/g, '')
                          .trim();
                        caption = decodeEntities(stripped);
                      }
                    }
                  }
                } catch {
                  // Ignore network error and fallback to embed mode
                }

                // Fallback: read Open Graph tags from the public post page (cover image + caption)
                if (discoveredImageUrls.length === 0 || !caption) {
                  try {
                    const pageRes = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
                      headers: {
                        'User-Agent':
                          'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
                      },
                    });
                    if (pageRes.ok) {
                      const pageHtml = await pageRes.text();
                      const ogImg = pageHtml.match(/property="og:image"\s+content="([^"]+)"/i);
                      if (ogImg && discoveredImageUrls.length === 0) {
                        discoveredImageUrls.push(decodeEntities(ogImg[1]));
                      }
                      const ogTitle = pageHtml.match(/property="og:title"\s+content="([^"]*)"/i);
                      if (ogTitle && !caption) {
                        const t = decodeEntities(ogTitle[1]).replace(/&#064;/g, '@');
                        const q = t.match(/Instagram:\s*"([\s\S]*)"\s*$/);
                        caption = (q ? q[1] : t).trim();
                      }
                    }
                  } catch {
                    // ignore
                  }
                }

                caption = caption
                  .replace(/&#064;/g, '@')
                  .replace(/\r/g, '')
                  .replace(/\n{3,}/g, '\n\n')
                  .trim();

                // Download discovered images locally so they never expire
                let savedImages: string[] = [];
                for (let i = 0; i < discoveredImageUrls.length; i++) {
                  try {
                    const imgRes = await fetch(discoveredImageUrls[i], {
                      headers: {
                        'User-Agent':
                          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        Referer: 'https://www.instagram.com/',
                      },
                    });
                    if (imgRes.ok) {
                      const arrBuf = await imgRes.arrayBuffer();
                      // @ts-ignore
                      const buf = Buffer.from(arrBuf);
                      if (buf.length > 1000) {
                        const fileName = `ig-${shortcode}-${i + 1}.jpg`;
                        fs.writeFileSync(path.join(targetImgDir, fileName), buf);
                        savedImages.push(`/${targetSubfolder}/${fileName}`);
                      }
                    }
                  } catch {
                    // skip failed image
                  }
                }

                // Download discovered video if available
                let savedVideoUrl = '';
                let detectedVideoType: 'landscape' | 'portrait' =
                  postType === 'reel' ? 'portrait' : 'landscape';

                if (discoveredVideoUrl) {
                  try {
                    const vidRes = await fetch(discoveredVideoUrl, {
                      headers: {
                        'User-Agent':
                          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        Referer: 'https://www.instagram.com/',
                      },
                    });
                    if (vidRes.ok) {
                      const arrBuf = await vidRes.arrayBuffer();
                      // @ts-ignore
                      const buf = Buffer.from(arrBuf);
                      if (buf.length > 5000) {
                        const vidName = `ig-${shortcode}.mp4`;
                        const fullVidPath = path.join(targetVidDir, vidName);
                        fs.writeFileSync(fullVidPath, buf);
                        savedVideoUrl = `/videos/${vidName}`;

                        // Auto-detect & auto-crop hardcoded black bars so video is full size!
                        const cropRes = await detectAndCropVideoLetterbox(
                          fullVidPath,
                          targetImgDir,
                          `ig-${shortcode}`
                        );
                        if (cropRes) {
                          detectedVideoType = cropRes.videoType;
                          if (cropRes.cropped && cropRes.thumbUrl) {
                            savedImages = [cropRes.thumbUrl];
                          }
                        }
                      }
                    }
                  } catch {
                    // fallback to embedUrl
                  }
                }

                return sendJson(200, {
                  ok: true,
                  shortcode,
                  postType,
                  cleanInstagramUrl,
                  embedUrl,
                  caption,
                  images: savedImages,
                  videoUrl: savedVideoUrl,
                  videoType: detectedVideoType,
                });
              }

              if (req.url === '/api/cms/autocrop-video') {
                const { videoUrl } = payload;
                if (!videoUrl || !String(videoUrl).startsWith('/videos/')) {
                  return sendJson(400, {
                    ok: false,
                    message: 'Hanya file video lokal (/videos/...) yang dapat di-crop otomatis.',
                  });
                }

                const vidFileName = path.basename(String(videoUrl));
                const fullVidPath = path.join(rootDir, 'public', 'videos', vidFileName);
                const targetImgDir = path.join(rootDir, 'public', 'images', 'foto');
                const baseName = vidFileName.replace(/\.[^.]+$/, '');

                const cropRes = await detectAndCropVideoLetterbox(
                  fullVidPath,
                  targetImgDir,
                  baseName
                );

                if (!cropRes) {
                  return sendJson(400, {
                    ok: false,
                    message: 'Gagal menganalisis video atau ffmpeg tidak tersedia.',
                  });
                }

                return sendJson(200, {
                  ok: true,
                  cropped: cropRes.cropped,
                  videoType: cropRes.videoType,
                  thumbUrl: cropRes.thumbUrl || undefined,
                  message: cropRes.cropped
                    ? 'Berhasil memotong garis hitam! Video sekarang berukuran penuh (Full Screen).'
                    : 'Video sudah berukuran penuh optimal (tidak terdeteksi garis hitam tebal).',
                });
              }

              if (req.url === '/api/cms/transcode-video') {
                const { videoUrl } = payload;
                if (!videoUrl || !String(videoUrl).startsWith('/videos/')) {
                  return sendJson(400, {
                    ok: false,
                    message: 'Hanya file video lokal (/videos/...) yang dapat di-konversi.',
                  });
                }

                const vidFileName = path.basename(String(videoUrl));
                const targetDir = path.join(rootDir, 'public', 'videos');
                const fullVidPath = path.join(targetDir, vidFileName);

                if (!fs.existsSync(fullVidPath)) {
                  return sendJson(404, { ok: false, message: 'File video tidak ditemukan.' });
                }

                const transRes = await transcodeToWebMp4(fullVidPath, targetDir, vidFileName);
                if (!transRes || !transRes.success) {
                  return sendJson(500, {
                    ok: false,
                    message: 'Gagal mengonversi video ke Web MP4 H.264.',
                  });
                }

                return sendJson(200, {
                  ok: true,
                  url: `/videos/${transRes.fileName}`,
                  videoType: transRes.videoType,
                  thumbUrl: transRes.thumbUrl,
                  message:
                    'Video berhasil dikonversi ke format Web MP4 (H.264)! Dijamin dapat diputar lancar di semua browser.',
                });
              }

              return sendJson(404, { ok: false, message: 'Endpoint tidak ditemukan' });
            } catch (err) {
              return sendJson(500, { ok: false, message: String(err) });
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), zeevisualLocalCmsPlugin()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    open: false,
  },
});
