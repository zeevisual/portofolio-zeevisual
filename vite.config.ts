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

        const saveSecurityConfig = (cfg: { adminPassword: string; recoveryEmail: string }) => {
          fs.writeFileSync(
            securityFilePath,
            JSON.stringify({ ...cfg, updatedAt: new Date().toISOString() }, null, 2),
            'utf-8'
          );
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

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: unknown) => {
            body += String(chunk);
          });

          req.on('end', () => {
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

                const cleanName = String(fileName)
                  .toLowerCase()
                  .replace(/[^a-z0-9._-]/g, '-')
                  .replace(/-+/g, '-');

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
