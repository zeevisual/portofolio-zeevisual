import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function zeevisualLocalCmsPlugin(): Plugin {
  return {
    name: 'zeevisual-local-cms',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/cms/')) {
          return next();
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

        const sanitizeAndTruncateFileName = (rawFileName: string) => {
          const extMatch = String(rawFileName).toLowerCase().match(/(\.[a-z0-9]{2,5})$/);
          const ext = extMatch ? extMatch[1] : '';
          const rawBase = ext
            ? String(rawFileName).slice(0, -ext.length)
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
                if (folder === 'videos' && fs.existsSync(fullSavePath)) {
                  const stat = fs.statSync(fullSavePath);
                  const isNonMp4 = !cleanName.endsWith('.mp4');
                  const isLargeVideo = stat.size > 28 * 1024 * 1024; // > 28 MB

                  // Auto-convert .mov/.mkv or compress large/long videos to fast web H.264 .mp4 (< 50MB)
                  if (isNonMp4 || isLargeVideo) {
                    const ffmpegBin = findFfmpegBin();
                    if (ffmpegBin) {
                      // @ts-ignore
                      const { execSync } = await import('node:child_process');
                      const mp4Name = cleanName.replace(/\.[^.]+$/, '') + '.mp4';
                      const tempOutPath = path.join(targetDir, `_opt_${Date.now()}_${mp4Name}`);
                      const finalOutPath = path.join(targetDir, mp4Name);
                      try {
                        execSync(
                          `"${ffmpegBin}" -y -i "${fullSavePath}" -c:v h264_mf -b:v 3000k -vf "scale='min(1280,iw)':-2" -c:a aac -b:a 128k -movflags +faststart "${tempOutPath}"`,
                          { stdio: 'pipe', timeout: 180000 }
                        );
                        if (fs.existsSync(tempOutPath) && fs.statSync(tempOutPath).size > 1024) {
                          if (fs.existsSync(fullSavePath)) {
                            fs.unlinkSync(fullSavePath);
                          }
                          fs.renameSync(tempOutPath, finalOutPath);
                          finalFileName = mp4Name;
                        }
                      } catch {
                        if (fs.existsSync(tempOutPath)) {
                          try {
                            fs.unlinkSync(tempOutPath);
                          } catch {}
                        }
                      }
                    }
                  }
                }

                const publicUrl = `/${targetSubfolder}/${finalFileName}`;
                return sendJson(200, { ok: true, url: publicUrl });
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
                const sec = getSecurityConfig();
                if (payload.password === sec.adminPassword) {
                  return sendJson(200, { ok: true });
                }
                return sendJson(401, { ok: false, message: 'Password admin tidak sesuai.' });
              }

              if (req.url === '/api/cms/change-password') {
                const sec = getSecurityConfig();
                const { currentPassword, newPassword } = payload;
                if (currentPassword !== sec.adminPassword) {
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
    port: 3000,
    open: false,
  },
});
