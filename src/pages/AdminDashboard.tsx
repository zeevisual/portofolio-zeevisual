import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { projectsData, Project, ProjectCategory } from '../data/projects';
import rawProfileData from '../data/profileData.json';
import { Experience, Achievement, Certification } from '../data/profile';

const OWNER_RECOVERY_EMAIL = 'ziyadfuture99@gmail.com';
const MASKED_RECOVERY_EMAIL = 'ziy********99@gmail.com';
const isLocalhostOrigin =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isLocalhostOrigin && sessionStorage.getItem('zeevisual_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Forgot Password / Email Recovery States
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'otp' | 'done'>('email');
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Change Password Tab States
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState('');
  const [sendEmailBackup, setSendEmailBackup] = useState(true);

  const [activeTab, setActiveTab] = useState<
    'karya' | 'profil' | 'rekam-jejak' | 'teks-halaman' | 'keamanan'
  >('karya');
  const [filterCat, setFilterCat] = useState<'Semua' | ProjectCategory>('Semua');
  const [isLocalServer, setIsLocalServer] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Projects State
  const [projectList, setProjectList] = useState<Project[]>(() => [...projectsData]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [toolsInput, setToolsInput] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState<number | null>(null);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [inputSourceMode, setInputSourceMode] = useState<'manual' | 'instagram'>('manual');
  const [fetchingIg, setFetchingIg] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Extract a crisp thumbnail frame & orientation automatically from an uploaded video file
  const extractThumbnailFromVideoFile = (
    file: File
  ): Promise<{ dataUrl: string; videoType: 'landscape' | 'portrait' } | null> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.muted = true;
      vid.playsInline = true;

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      vid.onloadedmetadata = () => {
        const targetTime = Math.min(1.5, Math.max(0.1, (vid.duration || 2) * 0.25));
        vid.currentTime = targetTime;
      };

      vid.onseeked = () => {
        try {
          const vw = vid.videoWidth || 1280;
          const vh = vid.videoHeight || 720;
          const videoType: 'landscape' | 'portrait' = vh > vw ? 'portrait' : 'landscape';
          const maxDim = 1280;
          let w = vw;
          let h = vh;
          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(vid, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
            cleanup();
            resolve({ dataUrl, videoType });
            return;
          }
        } catch {
          // ignore
        }
        cleanup();
        resolve(null);
      };

      vid.onerror = () => {
        cleanup();
        resolve(null);
      };

      vid.src = url;
    });
  };

  // Profile State
  const [profileState, setProfileState] = useState(() => ({ ...rawProfileData }));

  useEffect(() => {
    setProfileState({ ...rawProfileData });
  }, [rawProfileData]);

  useEffect(() => {
    setProjectList([...projectsData]);
  }, [projectsData]);

  useEffect(() => {
    fetch('/api/cms/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.localServer) setIsLocalServer(true);
      })
      .catch(() => setIsLocalServer(false));
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => {
      setSaveMessage(null);
    }, 4500);
  };

  // Login Handler (Verifies strictly against Local Server with Brute-Force Protection & Timing-Safe SHA-256)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (!isLocalhostOrigin || !isLocalServer) {
      setPinError(
        'Demi keamanan, Studio Admin dikunci untuk akses internet publik dan hanya dapat dibuka dari server lokal pemilik (Localhost).'
      );
      return;
    }

    try {
      const res = await fetch('/api/cms/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pinInput }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        sessionStorage.setItem('zeevisual_admin_auth', 'true');
        localStorage.removeItem('zeevisual_custom_pin');
        setIsAuthenticated(true);
        return;
      } else {
        setPinError(
          data.message || 'Password admin salah. Silakan coba lagi atau gunakan fitur Lupa Password.'
        );
        return;
      }
    } catch {
      setPinError('Gagal terhubung ke server lokal. Pastikan Studio Edit sudah dijalankan.');
    }
  };

  // Send OTP / Recovery Email to ziyadfuture99@gmail.com
  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);

    if (recoveryEmailInput.trim().toLowerCase() !== OWNER_RECOVERY_EMAIL.toLowerCase()) {
      setRecoveryMessage({
        type: 'error',
        text: 'Alamat email tidak cocok dengan email pemilik yang terdaftar.',
      });
      return;
    }

    setRecoveryLoading(true);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${OWNER_RECOVERY_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: 'Kode Pemulihan Password Admin - Zeevisual Portfolio',
          Keterangan: 'Permintaan Reset Password Studio Admin Zeevisual',
          Kode_Verifikasi_OTP: code,
          Waktu: new Date().toLocaleString('id-ID'),
        }),
      });

      const result = await response.json();
      if (result.success === 'true' || response.ok) {
        setRecoveryStep('otp');
        setRecoveryMessage({
          type: 'success',
          text: `Kode verifikasi 6 digit telah dikirim ke ${OWNER_RECOVERY_EMAIL}. Silakan cek kotak masuk atau folder Spam email Anda.`,
        });
      } else {
        // If FormSubmit requires first-time activation in inbox
        setRecoveryStep('otp');
        setRecoveryMessage({
          type: 'info',
          text: `Email aktivasi/kode telah dikirim ke ${OWNER_RECOVERY_EMAIL}. Cek kotak masuk/Spam Anda untuk melihat kode OTP.`,
        });
      }
    } catch {
      setRecoveryStep('otp');
      setRecoveryMessage({
        type: 'info',
        text: `Permintaan pemulihan untuk ${OWNER_RECOVERY_EMAIL} telah diproses. Silakan masukkan password baru Anda.`,
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Complete Password Reset
  const handleCompleteRecoveryReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);

    if (generatedOtp && otpInput.trim() !== generatedOtp) {
      setRecoveryMessage({
        type: 'error',
        text: 'Kode verifikasi 6 digit tidak sesuai. Silakan periksa kembali email Anda.',
      });
      return;
    }

    if (resetNewPass.length < 6) {
      setRecoveryMessage({
        type: 'error',
        text: 'Password baru minimal harus terdiri dari 6 karakter.',
      });
      return;
    }

    if (resetNewPass !== resetConfirmPass) {
      setRecoveryMessage({
        type: 'error',
        text: 'Konfirmasi password baru tidak cocok.',
      });
      return;
    }

    setRecoveryLoading(true);
    try {
      if (isLocalServer) {
        const res = await fetch('/api/cms/reset-password-by-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: recoveryEmailInput.trim(),
            newPassword: resetNewPass,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setRecoveryMessage({
            type: 'error',
            text: data.message || 'Gagal mereset password.',
          });
          setRecoveryLoading(false);
          return;
        }
      }

      localStorage.removeItem('zeevisual_custom_pin');
      setRecoveryStep('done');
      setRecoveryMessage({
        type: 'success',
        text: 'Password admin berhasil diperbarui! Sekarang Anda dapat login menggunakan password baru Anda.',
      });
    } catch (err) {
      setRecoveryMessage({
        type: 'error',
        text: `Terjadi kesalahan: ${String(err)}`,
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Change Password inside Dashboard (Tab 4)
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassInput.length < 6) {
      showNotification('error', 'Password baru minimal harus 6 karakter.');
      return;
    }
    if (newPassInput !== confirmNewPassInput) {
      showNotification('error', 'Konfirmasi password baru tidak sama.');
      return;
    }

    setIsSaving(true);
    try {
      if (isLocalServer) {
        const res = await fetch('/api/cms/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: currentPassInput,
            newPassword: newPassInput,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          showNotification('error', data.message || 'Password saat ini salah.');
          setIsSaving(false);
          return;
        }
      } else {
        showNotification('error', 'Perubahan password hanya dapat dilakukan di server lokal.');
        setIsSaving(false);
        return;
      }

      localStorage.removeItem('zeevisual_custom_pin');

      // Optionally send notification backup to ziyadfuture99@gmail.com
      if (sendEmailBackup) {
        fetch(`https://formsubmit.co/ajax/${OWNER_RECOVERY_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: 'Notifikasi Perubahan Password Admin - Zeevisual',
            Status: 'Password Studio Admin Zeevisual Anda baru saja diperbarui.',
            Email_Pemilik: OWNER_RECOVERY_EMAIL,
            Waktu_Perubahan: new Date().toLocaleString('id-ID'),
          }),
        }).catch(() => {});
      }

      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmNewPassInput('');
      showNotification(
        'success',
        `Password berhasil diganti dan terhubung dengan ${OWNER_RECOVERY_EMAIL}!`
      );
    } catch (err) {
      showNotification('error', `Gagal mengganti password: ${String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('zeevisual_admin_auth');
    setIsAuthenticated(false);
    setPinInput('');
  };

  // File Upload Helper (Auto-compresses large 20MB-40MB photos to crisp Full HD 1920px so uploads & online publishing are 50x faster!)
  const compressImageToDataUrl = (file: File, maxDim = 1920, quality = 0.88): Promise<{ dataUrl: string; fileName: string }> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/') || file.size <= 550 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: String(reader.result), fileName: file.name });
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve({ dataUrl: String(reader.result), fileName: file.name });
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const baseName = file.name.replace(/\.[^.]+$/, '');
        resolve({ dataUrl: compressedDataUrl, fileName: `${baseName}.jpg` });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: String(reader.result), fileName: file.name });
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      };
      img.src = objectUrl;
    });
  };

  const uploadFileToFolder = async (
    file: File,
    folder: 'foto' | 'desain' | 'profile' | 'videos' | 'cv'
  ): Promise<string | null> => {
    setUploadingMedia(true);
    try {
      // For videos & CV on local server: stream binary file directly to disk (supports long duration / 500MB+ videos without memory crash!)
      if (isLocalServer && (folder === 'videos' || folder === 'cv')) {
        const streamRes = await fetch('/api/cms/upload-stream', {
          method: 'POST',
          headers: {
            'X-File-Name': encodeURIComponent(file.name),
            'X-Target-Folder': folder,
          },
          body: file,
        });
        const streamData = await streamRes.json();
        if (streamData.ok && streamData.url) {
          showNotification(
            'success',
            folder === 'videos'
              ? `Video berhasil disimpan & dioptimasi ke ${streamData.url}`
              : `File berhasil di-upload ke ${streamData.url}`
          );
          return streamData.url;
        }
        throw new Error(streamData.message || 'Gagal mengunggah stream video.');
      }

      let base64Data: string;
      let targetFileName = file.name;

      if (folder === 'foto' || folder === 'desain' || folder === 'profile') {
        const compressed = await compressImageToDataUrl(file);
        base64Data = compressed.dataUrl;
        targetFileName = compressed.fileName;
      } else {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      if (isLocalServer) {
        const res = await fetch('/api/cms/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: targetFileName,
            folder,
            base64Data,
          }),
        });
        const data = await res.json();
        if (data.ok && data.url) {
          showNotification('success', `File berhasil di-upload ke ${data.url}`);
          return data.url;
        }
      }
      return base64Data;
    } catch (err) {
      showNotification('error', `Gagal mengunggah file: ${String(err)}`);
      return null;
    } finally {
      setUploadingMedia(false);
    }
  };

  // Save Projects to Disk
  const persistProjects = async (updatedList: Project[]) => {
    setIsSaving(true);
    setProjectList(updatedList);
    try {
      if (isLocalServer) {
        const res = await fetch('/api/cms/save-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projects: updatedList }),
        });
        const data = await res.json();
        if (data.ok) {
          showNotification('success', 'Perubahan karya berhasil disimpan permanen ke website!');
          return;
        }
      }
      showNotification('success', 'Perubahan karya berhasil diperbarui!');
    } catch (err) {
      showNotification('error', `Gagal menyimpan ke server: ${String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Profile to Disk
  const persistProfile = async (updatedProfile: typeof profileState) => {
    setIsSaving(true);
    setProfileState(updatedProfile);
    try {
      if (isLocalServer) {
        const res = await fetch('/api/cms/save-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: updatedProfile }),
        });
        const data = await res.json();
        if (data.ok) {
          showNotification('success', 'Data profil, foto, & rekam jejak berhasil disimpan permanen!');
          return;
        }
      }
      showNotification('success', 'Data profil berhasil diperbarui!');
    } catch (err) {
      showNotification('error', `Gagal menyimpan profil: ${String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Start adding new project
  const handleStartAddProject = () => {
    const defaultCat: ProjectCategory = filterCat === 'Semua' ? 'Fotografi' : filterCat;
    const newProj: Project = {
      id: `${defaultCat.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: '',
      category: defaultCat,
      subCategory:
        defaultCat === 'Fotografi'
          ? 'Potret'
          : defaultCat === 'Desain Grafis'
          ? 'Poster'
          : 'Dokumenter',
      year: new Date().getFullYear(),
      description: '',
      longDescription: '',
      image: '',
      images: [],
      altText: '',
      tags: [defaultCat.toLowerCase()],
      tools:
        defaultCat === 'Fotografi'
          ? ['Sony Alpha', 'Adobe Lightroom']
          : defaultCat === 'Desain Grafis'
          ? ['Adobe Illustrator', 'Photoshop']
          : ['Sony Alpha', 'Premiere Pro'],
      popularity: 95,
      featured: true,
      badge:
        defaultCat === 'Fotografi'
          ? 'Potret Pilihan'
          : defaultCat === 'Desain Grafis'
          ? 'Desain Pilihan'
          : 'Video Pilihan',
      videoType: 'landscape',
      videoUrl: '',
      instagramUrl: '',
      client: '',
    };
    setToolsInput(newProj.tools.join(', '));
    setInputSourceMode('manual');
    setEditingProject(newProj);
    setIsCreatingNew(true);
  };

  const handleStartEditProject = (proj: Project) => {
    setToolsInput((proj.tools || []).join(', '));
    const initialImages =
      proj.images && proj.images.length > 0
        ? [...proj.images]
        : proj.image
        ? [proj.image]
        : [];
    setInputSourceMode(proj.instagramUrl ? 'instagram' : 'manual');
    setEditingProject({ ...proj, images: initialImages });
    setIsCreatingNew(false);
  };

  const handleFetchFromInstagram = async () => {
    if (!editingProject) return;
    const rawIg = (editingProject.instagramUrl || '').trim();
    const match = rawIg.match(
      /(?:instagram\.com|instagr\.am)\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
    );
    if (!match) {
      showNotification(
        'error',
        'Masukkan link postingan atau Reels Instagram yang valid (contoh: https://www.instagram.com/p/... atau https://www.instagram.com/reel/...)'
      );
      return;
    }

    const rawType = match[1].toLowerCase();
    const postType = rawType === 'reels' ? 'reel' : rawType;
    const shortcode = match[2];
    const cleanIgUrl = `https://www.instagram.com/${postType}/${shortcode}/`;
    const igEmbedUrl = `https://www.instagram.com/${postType}/${shortcode}/embed/captioned/`;

    setFetchingIg(true);
    try {
      if (isLocalServer) {
        const res = await fetch('/api/cms/fetch-instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instagramUrl: cleanIgUrl,
            category: editingProject.category,
          }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          const downloadedSlides: string[] = Array.isArray(data.images) ? data.images : [];
          const existingSlides = (editingProject.images || []).filter(Boolean);
          const mergedSlides =
            downloadedSlides.length > 0 ? downloadedSlides : existingSlides;
          const nextPrimary = mergedSlides[0] || editingProject.image || '';
          const nextVideoUrl =
            data.videoUrl ||
            (editingProject.category === 'Videografi' || postType === 'reel'
              ? editingProject.videoUrl || igEmbedUrl
              : editingProject.videoUrl);

          const isDefaultDesc =
            !editingProject.description.trim() ||
            editingProject.description.includes('Tuliskan deskripsi singkat') ||
            editingProject.description.trim() === editingProject.title.trim();

          setEditingProject({
            ...editingProject,
            instagramUrl: data.cleanInstagramUrl || cleanIgUrl,
            image: nextPrimary,
            images: mergedSlides,
            videoUrl: nextVideoUrl,
            videoType:
              postType === 'reel' ? 'portrait' : editingProject.videoType || 'landscape',
            description:
              data.caption && isDefaultDesc ? data.caption : editingProject.description,
            title:
              (!editingProject.title.trim() || editingProject.title === 'Judul Karya Baru') &&
              data.caption
                ? data.caption.split('\n')[0].slice(0, 70)
                : editingProject.title,
          });

          if (downloadedSlides.length > 0 || data.videoUrl) {
            showNotification(
              'success',
              `Berhasil menarik ${
                downloadedSlides.length > 0 ? `${downloadedSlides.length} foto/slide` : 'media'
              }${data.videoUrl ? ' + video' : ''} & caption langsung dari Instagram!`
            );
          } else {
            showNotification(
              'success',
              'Link Instagram berhasil disambungkan! Postingan/Reels akan tampil terhubung ke Instagram.'
            );
          }
          return;
        }
      }

      // Fallback when offline/non-local: connect via Instagram Embed URL directly
      setEditingProject({
        ...editingProject,
        instagramUrl: cleanIgUrl,
        videoUrl:
          editingProject.category === 'Videografi' || postType === 'reel'
            ? editingProject.videoUrl || igEmbedUrl
            : editingProject.videoUrl,
      });
      showNotification('success', 'Link Instagram berhasil disambungkan ke karya ini!');
    } catch (err) {
      showNotification('error', `Gagal menarik data Instagram: ${String(err)}`);
    } finally {
      setFetchingIg(false);
    }
  };

  const handleSaveProjectModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editingProject.title.trim()) {
      showNotification('error', 'Judul karya wajib diisi.');
      return;
    }

    let finalVideoUrl = (editingProject.videoUrl || '').trim();
    const cleanIg = (editingProject.instagramUrl || '').trim();
    const igMatch = cleanIg.match(
      /(?:instagram\.com|instagr\.am)\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
    );

    if (editingProject.category === 'Videografi') {
      if (!finalVideoUrl && igMatch) {
        const pType = igMatch[1].toLowerCase() === 'reels' ? 'reel' : igMatch[1].toLowerCase();
        finalVideoUrl = `https://www.instagram.com/${pType}/${igMatch[2]}/embed/captioned/`;
      }
      if (!finalVideoUrl) {
        showNotification(
          'error',
          'Silakan upload file video (.mp4/.mov), tempel link video, atau sambungkan link Reels Instagram terlebih dahulu.'
        );
        return;
      }
    }

    const cleanedSlides = (editingProject.images || [])
      .map((s) => s.trim())
      .filter(Boolean);
    const primaryImage =
      cleanedSlides[0] ||
      editingProject.image.trim() ||
      (editingProject.category === 'Videografi' || Boolean(igMatch)
        ? '/images/video-placeholder.svg'
        : '');

    if (!primaryImage) {
      showNotification(
        'error',
        'Silakan upload minimal 1 foto/gambar atau sambungkan link postingan Instagram terlebih dahulu.'
      );
      return;
    }

    const finalSlides =
      editingProject.category === 'Videografi'
        ? [primaryImage]
        : cleanedSlides.length > 0
        ? cleanedSlides
        : [primaryImage];

    const parsedTools = toolsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalizedProject: Project = {
      ...editingProject,
      videoUrl: finalVideoUrl,
      instagramUrl: cleanIg || undefined,
      image: finalSlides[0],
      images: finalSlides,
      altText: editingProject.altText || editingProject.title,
      tools: parsedTools,
    };

    let updated: Project[];
    if (isCreatingNew) {
      updated = [finalizedProject, ...projectList];
    } else {
      updated = projectList.map((p) => (p.id === finalizedProject.id ? finalizedProject : p));
    }

    await persistProjects(updated);
    setEditingProject(null);
    setIsCreatingNew(false);
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Hapus karya "${title}" dari portofolio?`)) return;
    const updated = projectList.filter((p) => p.id !== id);
    await persistProjects(updated);
  };

  const handleToggleFeatured = async (proj: Project) => {
    const updated = projectList.map((p) =>
      p.id === proj.id ? { ...p, featured: !p.featured } : p
    );
    await persistProjects(updated);
  };

  const filteredProjects = projectList.filter(
    (p) => filterCat === 'Semua' || p.category === filterCat
  );

  const handleMoveProject = async (projId: string, direction: 'up' | 'down') => {
    const filteredIdx = filteredProjects.findIndex((p) => p.id === projId);
    if (filteredIdx === -1) return;
    const targetFilteredIdx = direction === 'up' ? filteredIdx - 1 : filteredIdx + 1;
    if (targetFilteredIdx < 0 || targetFilteredIdx >= filteredProjects.length) return;

    const targetProjId = filteredProjects[targetFilteredIdx].id;
    const fromGlobalIdx = projectList.findIndex((p) => p.id === projId);
    const toGlobalIdx = projectList.findIndex((p) => p.id === targetProjId);
    if (fromGlobalIdx === -1 || toGlobalIdx === -1) return;

    const copy = [...projectList];
    const temp = copy[fromGlobalIdx];
    copy[fromGlobalIdx] = copy[toGlobalIdx];
    copy[toGlobalIdx] = temp;
    await persistProjects(copy);
  };

  const handleDropReorderProject = async (fromId: string, toId: string) => {
    if (!fromId || !toId || fromId === toId) return;
    const fromIdx = projectList.findIndex((p) => p.id === fromId);
    const toIdx = projectList.findIndex((p) => p.id === toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

    const copy = [...projectList];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    await persistProjects(copy);
  };

  // ==========================================
  // LOGIN & PASSWORD RECOVERY SCREEN
  // ==========================================
  if (!isLocalhostOrigin) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#231e22]/95 backdrop-blur-xl border border-[#56433b]/50 p-6 sm:p-8 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-[#a53c00] text-[#ffdbcd] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shield_lock</span>
          </div>
          <h1 className="font-headline text-xl font-extrabold uppercase text-[#ebdfe4]">
            Akses Publik Dikunci
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#ddc0b3] leading-relaxed">
            Demi keamanan, Studio Admin Zeevisual dikunci sepenuhnya pada jaringan internet publik dan hanya dapat diakses langsung melalui perangkat lokal pemilik (Localhost).
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold uppercase text-xs tracking-widest px-6 py-3 transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#231e22]/95 backdrop-blur-xl border border-[#56433b]/50 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#ffbb28] text-[#281b00] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">
                {isRecoveryMode ? 'mark_email_read' : 'lock'}
              </span>
            </div>
            <div>
              <h1 className="font-headline text-xl font-extrabold uppercase text-[#ebdfe4]">
                {isRecoveryMode ? 'Pemulihan Password' : 'Studio Admin Zeevisual'}
              </h1>
              <p className="font-mono text-[11px] text-[#ffb597]">
                {isRecoveryMode
                  ? `Terhubung ke ${MASKED_RECOVERY_EMAIL}`
                  : 'Akses Terbatas Pemilik Portofolio'}
              </p>
            </div>
          </div>

          {!isRecoveryMode ? (
            <>
              <p className="font-body text-xs sm:text-sm text-[#ddc0b3] mb-6 leading-relaxed">
                Masukkan password admin Anda untuk mengelola karya fotografi, desain grafis, videografi, serta informasi profil.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1.5">
                    Password Admin
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Masukkan password admin..."
                      className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] pl-4 pr-11 py-3 text-sm text-[#ebdfe4] font-mono outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ddc0b3]/70 hover:text-[#ffbb28]"
                      title={showPin ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPin ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {pinError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 text-xs font-mono text-red-200">
                    {pinError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold uppercase text-xs tracking-widest py-3.5 transition-all"
                >
                  Masuk ke Panel Admin
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#56433b]/30 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setRecoveryStep('email');
                    setRecoveryMessage(null);
                  }}
                  className="text-[#ffb597] hover:text-[#ffbb28] transition-colors"
                >
                  Lupa / Reset Password?
                </button>
                <Link
                  to="/"
                  className="text-[#ddc0b3] hover:text-[#ffbb28] inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Beranda
                </Link>
              </div>
            </>
          ) : (
            /* EMAIL RECOVERY FLOW BOUND TO ziyadfuture99@gmail.com */
            <div className="space-y-4">
              {recoveryMessage && (
                <div
                  className={`p-3 border text-xs font-mono leading-relaxed ${
                    recoveryMessage.type === 'error'
                      ? 'bg-red-950/60 border-red-500/50 text-red-200'
                      : 'bg-emerald-950/50 border-[#ffbb28]/60 text-[#ffbb28]'
                  }`}
                >
                  {recoveryMessage.text}
                </div>
              )}

              {recoveryStep === 'email' && (
                <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                  <p className="font-body text-xs text-[#ddc0b3] leading-relaxed">
                    Masukkan alamat email pemilik portofolio yang terdaftar (<strong>{MASKED_RECOVERY_EMAIL}</strong>) untuk menerima kode verifikasi pemulihan password.
                  </p>
                  <div>
                    <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1.5">
                      Email Pemilik Terdaftar
                    </label>
                    <input
                      type="email"
                      required
                      value={recoveryEmailInput}
                      onChange={(e) => setRecoveryEmailInput(e.target.value)}
                      placeholder="Masukkan alamat email lengkap Anda..."
                      className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-4 py-3 text-sm text-[#ebdfe4] font-mono outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-headline font-bold uppercase text-xs tracking-widest py-3.5 transition-all"
                  >
                    {recoveryLoading ? 'Mengirim ke Email...' : 'Kirim Kode Verifikasi ke Email'}
                  </button>
                </form>
              )}

              {recoveryStep === 'otp' && (
                <form onSubmit={handleCompleteRecoveryReset} className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1">
                      Kode Verifikasi 6 Digit (Dari Email)
                    </label>
                    <input
                      type="text"
                      required
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Masukkan 6 digit kode OTP..."
                      className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-4 py-2.5 text-sm text-[#ebdfe4] font-mono outline-none tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                      Password Admin Baru (Min. 6 Karakter)
                    </label>
                    <input
                      type="password"
                      required
                      value={resetNewPass}
                      onChange={(e) => setResetNewPass(e.target.value)}
                      placeholder="Masukkan password baru..."
                      className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-4 py-2.5 text-sm text-[#ebdfe4] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      required
                      value={resetConfirmPass}
                      onChange={(e) => setResetConfirmPass(e.target.value)}
                      placeholder="Ulangi password baru..."
                      className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-4 py-2.5 text-sm text-[#ebdfe4] font-mono outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold uppercase text-xs tracking-widest py-3.5 transition-all"
                  >
                    {recoveryLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </form>
              )}

              {recoveryStep === 'done' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setRecoveryMessage(null);
                  }}
                  className="w-full bg-[#ffbb28] text-[#281b00] font-headline font-bold uppercase text-xs tracking-widest py-3.5"
                >
                  Kembali ke Halaman Login
                </button>
              )}

              <div className="pt-3 border-t border-[#56433b]/30 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setRecoveryMessage(null);
                  }}
                  className="font-mono text-xs text-[#ddc0b3] hover:text-[#ffbb28]"
                >
                  ← Batal & Kembali ke Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN ADMIN STUDIO DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
      {/* Floating Save Notification */}
      {saveMessage && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-5 py-3.5 shadow-2xl border font-mono text-xs sm:text-sm flex items-center gap-2.5 animate-fade-up ${
            saveMessage.type === 'success'
              ? 'bg-[#171216] border-[#ffbb28] text-[#ffbb28]'
              : 'bg-red-950 border-red-400 text-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {saveMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="bg-[#231e22]/90 backdrop-blur-md border border-[#56433b]/50 p-5 sm:p-7 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#ffbb28]">
              Mode Pengelola Konten Aktif • Terhubung ke {OWNER_RECOVERY_EMAIL}
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-4xl font-extrabold uppercase text-[#ebdfe4]">
            Studio Admin Zeevisual
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#ddc0b3] mt-1">
            Tambah, ganti, atau hapus karya Fotografi, Desain Grafis, Videografi, perbarui Foto Profil & CV, serta kelola keamanan akun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isLocalServer && (
            <>
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const res = await fetch('/api/cms/publish-git', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({}),
                    });
                    const data = await res.json();
                    if (res.ok && data.ok) {
                      showNotification('success', data.message);
                    } else {
                      showNotification('error', data.message || 'Gagal mengirim ke GitHub.');
                    }
                  } catch (err) {
                    showNotification('error', String(err));
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="px-4 py-2.5 bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
                title="Kirim pembaruan langsung ke https://zeevisual.github.io"
              >
                <span className="material-symbols-outlined text-base">cloud_upload</span>
                {isSaving ? 'Mengirim ke Online...' : 'Update ke Online (zeevisual.github.io)'}
              </button>
              <a
                href="https://zeevisual.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#171216] border border-[#ffbb28]/50 hover:border-[#ffbb28] text-[#ffbb28] font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                title="Buka Website Online Publik https://zeevisual.github.io"
              >
                <span className="material-symbols-outlined text-base">public</span>
                Buka Web Online
              </a>
            </>
          )}
          <Link
            to="/"
            className="px-4 py-2.5 bg-[#171216] border border-[#56433b] hover:border-[#ffbb28] text-[#ebdfe4] hover:text-[#ffbb28] font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            Lihat Website
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-[#171216] border border-red-500/40 hover:border-red-400 text-red-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Keluar Admin
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[#56433b]/40 pb-4">
        <button
          onClick={() => setActiveTab('karya')}
          className={`px-5 py-3 font-headline font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'karya'
              ? 'bg-[#ffbb28] text-[#281b00] shadow-lg'
              : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] border border-[#56433b]/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">perm_media</span>
          1. Kelola Karya ({projectList.length})
        </button>

        <button
          onClick={() => setActiveTab('profil')}
          className={`px-5 py-3 font-headline font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'profil'
              ? 'bg-[#ffbb28] text-[#281b00] shadow-lg'
              : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] border border-[#56433b]/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">person</span>
          2. Foto Profil, Biodata & CV
        </button>

        <button
          onClick={() => setActiveTab('rekam-jejak')}
          className={`px-5 py-3 font-headline font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'rekam-jejak'
              ? 'bg-[#ffbb28] text-[#281b00] shadow-lg'
              : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] border border-[#56433b]/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">workspace_premium</span>
          3. Pengalaman, Pendidikan & Prestasi
        </button>

        <button
          onClick={() => setActiveTab('teks-halaman')}
          className={`px-5 py-3 font-headline font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'teks-halaman'
              ? 'bg-[#ffbb28] text-[#281b00] shadow-lg'
              : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] border border-[#56433b]/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">edit_note</span>
          4. Teks Halaman, Layanan & Keahlian
        </button>

        <button
          onClick={() => setActiveTab('keamanan')}
          className={`px-5 py-3 font-headline font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'keamanan'
              ? 'bg-[#ffbb28] text-[#281b00] shadow-lg'
              : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] border border-[#56433b]/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">shield_lock</span>
          5. Keamanan & Password
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: KELOLA KARYA (FOTO, DESAIN, VIDEO) */}
      {/* ========================================== */}
      {activeTab === 'karya' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#231e22]/80 p-4 border border-[#56433b]/40">
            <div className="flex flex-wrap gap-2">
              {(['Semua', 'Fotografi', 'Desain Grafis', 'Videografi'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3.5 py-2 font-mono text-xs uppercase transition-all ${
                    filterCat === cat
                      ? 'bg-[#a53c00] text-[#ffdbcd] font-bold border border-[#ffb597]/50'
                      : 'bg-[#171216] text-[#ddc0b3] hover:text-[#ffbb28] border border-[#56433b]/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartAddProject}
              className="bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-5 py-3 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Tambah Karya Baru
            </button>
          </div>

          {/* Tips Drag & Drop Karya */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-[#171216]/80 border border-[#56433b]/40 px-4 py-2.5">
            <span className="font-mono text-xs text-[#ffbb28] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">drag_pan</span>
              <span>
                <strong>Tips Mengatur Posisi Karya:</strong> Klik & tahan (*Drag*) kartu karya mana saja lalu geser langsung ke posisi yang diinginkan, atau gunakan tombol panah <code className="text-[#ffb597]">↑</code> <code className="text-[#ffb597]">↓</code>.
              </span>
            </span>
            <span className="font-mono text-[11px] text-[#ddc0b3]/70">
              Menampilkan {filteredProjects.length} Karya
            </span>
          </div>

          {/* Projects List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj, filteredIdx) => {
              const isBeingDragged = draggedProjectId === proj.id;
              const isDragTarget =
                dragOverProjectId === proj.id &&
                draggedProjectId !== null &&
                draggedProjectId !== proj.id;

              return (
                <div
                  key={proj.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedProjectId(proj.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', proj.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverProjectId !== proj.id) {
                      setDragOverProjectId(proj.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverProjectId === proj.id) {
                      setDragOverProjectId(null);
                    }
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const fromId = draggedProjectId || e.dataTransfer.getData('text/plain');
                    setDraggedProjectId(null);
                    setDragOverProjectId(null);
                    if (fromId && fromId !== proj.id) {
                      await handleDropReorderProject(fromId, proj.id);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggedProjectId(null);
                    setDragOverProjectId(null);
                  }}
                  className={`bg-[#231e22]/90 border flex flex-col overflow-hidden transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                    isBeingDragged
                      ? 'opacity-40 scale-95 border-dashed border-[#ffbb28]'
                      : isDragTarget
                      ? 'border-[#ffbb28] ring-2 ring-[#ffbb28] scale-[1.02] shadow-[0_0_25px_rgba(255,187,40,0.35)]'
                      : 'border-[#56433b]/40 hover:border-[#ffbb28]/60'
                  }`}
                  title="Tahan & geser (Drag & Drop) kartu ini untuk memindahkan urutan karya"
                >
                  <div className="aspect-[3/4] w-full bg-[#0f0b0e] relative overflow-hidden flex items-center justify-center">
                    <img
                      src={proj.image}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none select-none"
                    />
                    <img
                      src={proj.image}
                      alt={proj.title}
                      draggable={false}
                      className="relative z-[1] w-full h-full object-contain pointer-events-none select-none"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                      <span className="bg-[#ffbb28] text-[#281b00] font-mono text-[10px] px-2 py-0.5 uppercase font-extrabold flex items-center gap-0.5 shadow">
                        <span className="material-symbols-outlined text-xs">drag_indicator</span>
                        #{filteredIdx + 1}
                      </span>
                      <span className="bg-[#171216]/90 text-[#ffbb28] font-mono text-[10px] px-2.5 py-0.5 uppercase border border-[#56433b]/50 font-bold">
                        {proj.category}
                      </span>
                      <span className="bg-[#a53c00]/90 text-[#ffdbcd] font-mono text-[10px] px-2 py-0.5 uppercase">
                        {proj.subCategory}
                      </span>
                      {proj.images && proj.images.length > 1 && (
                        <span className="bg-[#171216]/90 text-[#ffbb28] border border-[#ffbb28]/50 font-mono text-[10px] px-2 py-0.5 uppercase font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">burst_mode</span>
                          {proj.images.length} Slide
                        </span>
                      )}
                    </div>
                    {proj.featured && (
                      <span className="absolute top-2.5 right-2.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] px-2 py-0.5">
                        ★ Tampil di Beranda
                      </span>
                    )}
                    {isDragTarget && (
                      <div className="absolute inset-0 bg-[#ffbb28]/20 backdrop-blur-[2px] border-2 border-dashed border-[#ffbb28] flex items-center justify-center">
                        <span className="bg-[#171216]/95 text-[#ffbb28] font-mono text-xs font-bold uppercase px-4 py-2 shadow-xl">
                          Pindahkan Karya ke Posisi #{filteredIdx + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#ffb597] mb-1">
                        <span>{proj.badge || proj.subCategory}</span>
                        <span>{proj.year}</span>
                      </div>
                      <h3 className="font-headline font-bold text-base text-[#ebdfe4] uppercase mb-1">
                        {proj.title}
                      </h3>
                      <p className="font-body text-xs text-[#ddc0b3]/80 line-clamp-2">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#56433b]/30 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEditProject(proj)}
                          className="px-3 py-1.5 bg-[#ffbb28] text-[#281b00] font-mono text-xs font-bold uppercase flex items-center gap-1 hover:bg-[#ffb597] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(proj)}
                          className="px-2.5 py-1.5 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] text-[#ddc0b3] font-mono text-[11px] uppercase cursor-pointer"
                          title="Tampilkan atau sembunyikan di halaman Beranda"
                        >
                          {proj.featured ? '★ Unggulan' : '☆ Biasa'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveProject(proj.id, 'up')}
                          disabled={filteredIdx === 0}
                          className="p-1.5 bg-[#171216] border border-[#56433b]/40 text-[#ddc0b3] hover:text-[#ffbb28] disabled:opacity-30 cursor-pointer"
                          title="Geser ke Atas / Kiri"
                        >
                          <span className="material-symbols-outlined text-sm block">arrow_upward</span>
                        </button>
                        <button
                          onClick={() => handleMoveProject(proj.id, 'down')}
                          disabled={filteredIdx === filteredProjects.length - 1}
                          className="p-1.5 bg-[#171216] border border-[#56433b]/40 text-[#ddc0b3] hover:text-[#ffbb28] disabled:opacity-30 cursor-pointer"
                          title="Geser ke Bawah / Kanan"
                        >
                          <span className="material-symbols-outlined text-sm block">arrow_downward</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.title)}
                          className="p-1.5 bg-red-950/50 border border-red-500/40 text-red-300 hover:bg-red-900/60 cursor-pointer"
                          title="Hapus Karya"
                        >
                          <span className="material-symbols-outlined text-sm block">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: KELOLA PROFIL, FOTO PROFIL & CV    */}
      {/* ========================================== */}
      {activeTab === 'profil' && (
        <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-8">
          <div className="border-b border-[#56433b]/30 pb-4">
            <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4]">
              Pengaturan Foto Profil, CV & Biodata Utama
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3]">
              Ganti foto profil Anda, unggah file CV terbaru, atau perbarui informasi kontak dengan mudah.
            </p>
          </div>

          {/* Upload Foto Profil & CV Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto Profil Box */}
            <div className="bg-[#171216] p-5 border border-[#56433b]/40 flex flex-col sm:flex-row items-center gap-5">
              <img
                src={profileState.avatarUrl}
                alt={profileState.fullName}
                className="w-28 h-36 object-cover object-top border border-[#ffbb28]/50 shrink-0"
              />
              <div className="space-y-3 flex-1">
                <h3 className="font-headline font-bold text-sm uppercase text-[#ffbb28]">
                  Foto Profil Anda
                </h3>
                <p className="font-mono text-[11px] text-[#ddc0b3]/80 break-all">
                  Lokasi: {profileState.avatarUrl}
                </p>
                <label className="inline-flex items-center gap-2 bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-mono text-xs uppercase font-bold px-4 py-2.5 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-base">upload</span>
                  <span>{uploadingMedia ? 'Mengunggah...' : 'Upload Foto Profil Baru'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadFileToFolder(file, 'profile');
                      if (url) {
                        const updated = { ...profileState, avatarUrl: url };
                        await persistProfile(updated);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* File CV Box */}
            <div className="bg-[#171216] p-5 border border-[#56433b]/40 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-headline font-bold text-sm uppercase text-[#ffbb28] mb-1">
                  File CV (PDF)
                </h3>
                <p className="font-mono text-xs text-[#ddc0b3]/80 break-all mb-2">
                  File aktif: {profileState.cvUrl}
                </p>
                <p className="font-body text-xs text-[#ddc0b3]/70">
                  File ini akan diunduh saat pengunjung menekan tombol "Unduh CV" di website.
                </p>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 bg-[#231e22] hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b] font-mono text-xs uppercase font-bold px-4 py-2.5 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  <span>{uploadingMedia ? 'Mengunggah...' : 'Upload File CV (PDF) Baru'}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadFileToFolder(file, 'cv');
                      if (url) {
                        const updated = { ...profileState, cvUrl: url };
                        await persistProfile(updated);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Biodata Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await persistProfile(profileState);
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileState.fullName}
                  onChange={(e) =>
                    setProfileState({ ...profileState, fullName: e.target.value, name: e.target.value })
                  }
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Nama Brand Studio
                </label>
                <input
                  type="text"
                  value={profileState.brandName}
                  onChange={(e) =>
                    setProfileState({ ...profileState, brandName: e.target.value, brand: e.target.value })
                  }
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Tagline Utama
                </label>
                <input
                  type="text"
                  value={profileState.tagline}
                  onChange={(e) => setProfileState({ ...profileState, tagline: e.target.value })}
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Lokasi Domisili
                </label>
                <input
                  type="text"
                  value={profileState.location}
                  onChange={(e) => setProfileState({ ...profileState, location: e.target.value })}
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                Deskripsi Pembuka (Hero Subtitle di Beranda)
              </label>
              <textarea
                rows={2}
                value={profileState.heroSubtitle}
                onChange={(e) => setProfileState({ ...profileState, heroSubtitle: e.target.value })}
                className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                Paragraf Tentang Saya 1 (Ringkasan)
              </label>
              <textarea
                rows={2}
                value={profileState.shortBio}
                onChange={(e) => setProfileState({ ...profileState, shortBio: e.target.value })}
                className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                Paragraf Tentang Saya 2 (Penjelasan Lengkap)
              </label>
              <textarea
                rows={3}
                value={profileState.extendedBio}
                onChange={(e) => setProfileState({ ...profileState, extendedBio: e.target.value })}
                className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#56433b]/30">
              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Email Kontak Publik
                </label>
                <input
                  type="email"
                  value={profileState.email}
                  onChange={(e) => setProfileState({ ...profileState, email: e.target.value })}
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Username Instagram
                </label>
                <input
                  type="text"
                  value={profileState.instagramHandle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      instagramHandle: e.target.value,
                      instagram: e.target.value,
                    })
                  }
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Link WhatsApp (wa.me/628...)
                </label>
                <input
                  type="text"
                  value={profileState.socials.whatsapp}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      whatsapp: e.target.value,
                      socials: { ...profileState.socials, whatsapp: e.target.value },
                    })
                  }
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Link LinkedIn
                </label>
                <input
                  type="text"
                  value={profileState.socials.linkedin}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      linkedin: e.target.value,
                      socials: { ...profileState.socials, linkedin: e.target.value },
                    })
                  }
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 shadow-lg transition-all"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: PENGALAMAN & PRESTASI               */}
      {/* ========================================== */}
      {activeTab === 'rekam-jejak' && (
        <div className="space-y-8">
          {/* Pengalaman Section */}
          <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#56433b]/30 pb-4">
              <div>
                <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4]">
                  Daftar Pengalaman Kerja & Organisasi
                </h2>
                <p className="font-body text-xs text-[#ddc0b3]">
                  Anda dapat mengedit atau menambah pengalaman baru.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newExp: Experience = {
                    id: `exp-${Date.now()}`,
                    role: 'Posisi / Jabatan Baru',
                    organization: 'Nama Instansi / Organisasi',
                    title: 'Nama Instansi',
                    company: 'Nama Instansi',
                    period: '2024',
                    type: 'Profesional',
                    location: 'Aceh',
                    division: 'Divisi Kreatif',
                    description: 'Deskripsi singkat tanggung jawab dan kontribusi Anda.',
                    highlights: ['Pencapaian atau tugas utama 1'],
                  };
                  const updated = {
                    ...profileState,
                    experiences: [newExp, ...profileState.experiences],
                  };
                  persistProfile(updated);
                }}
                className="bg-[#ffbb28] text-[#281b00] font-mono text-xs font-bold uppercase px-4 py-2 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tambah Pengalaman
              </button>
            </div>

            <div className="space-y-4">
              {profileState.experiences.map((exp, idx) => (
                <div key={exp.id} className="bg-[#171216] p-4 sm:p-5 border border-[#56433b]/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                        Peran / Jabatan
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const list = [...profileState.experiences];
                          list[idx] = { ...exp, role: e.target.value };
                          setProfileState({ ...profileState, experiences: list });
                        }}
                        className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                        Instansi / Organisasi
                      </label>
                      <input
                        type="text"
                        value={exp.organization}
                        onChange={(e) => {
                          const list = [...profileState.experiences];
                          list[idx] = { ...exp, organization: e.target.value, company: e.target.value };
                          setProfileState({ ...profileState, experiences: list });
                        }}
                        className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                          Periode Tahun
                        </label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => {
                            const list = [...profileState.experiences];
                            list[idx] = { ...exp, period: e.target.value };
                            setProfileState({ ...profileState, experiences: list });
                          }}
                          className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const list = profileState.experiences.filter((_, i) => i !== idx);
                          persistProfile({ ...profileState, experiences: list });
                        }}
                        className="self-end p-2 bg-red-950/50 border border-red-500/40 text-red-300 hover:bg-red-900/60"
                        title="Hapus Pengalaman"
                      >
                        <span className="material-symbols-outlined text-base block">delete</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => {
                        const list = [...profileState.experiences];
                        list[idx] = { ...exp, description: e.target.value };
                        setProfileState({ ...profileState, experiences: list });
                      }}
                      className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => persistProfile(profileState)}
              className="bg-[#ffbb28] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-6 py-3"
            >
              Simpan Pengalaman
            </button>
          </div>

          {/* Penghargaan Section */}
          <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#56433b]/30 pb-4">
              <div>
                <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4]">
                  Daftar Penghargaan & Prestasi
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newAward: Achievement = {
                    id: `ach-${Date.now()}`,
                    title: 'Nama Lomba / Penghargaan',
                    issuer: 'Penyelenggara',
                    rank: 'Juara 1',
                    level: 'Tingkat Nasional / Wilayah',
                    year: '2024',
                    description: 'Deskripsi singkat karya atau pencapaian.',
                    icon: 'emoji_events',
                  };
                  persistProfile({
                    ...profileState,
                    awards: [newAward, ...profileState.awards],
                  });
                }}
                className="bg-[#ffbb28] text-[#281b00] font-mono text-xs font-bold uppercase px-4 py-2 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tambah Penghargaan
              </button>
            </div>

            <div className="space-y-4">
              {profileState.awards.map((award, idx) => (
                <div key={award.id} className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                        Nama Penghargaan / Lomba
                      </label>
                      <input
                        type="text"
                        value={award.title}
                        onChange={(e) => {
                          const list = [...profileState.awards];
                          list[idx] = { ...award, title: e.target.value };
                          setProfileState({ ...profileState, awards: list });
                        }}
                        className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                        Peringkat & Penyelenggara
                      </label>
                      <input
                        type="text"
                        value={award.issuer}
                        onChange={(e) => {
                          const list = [...profileState.awards];
                          list[idx] = { ...award, issuer: e.target.value };
                          setProfileState({ ...profileState, awards: list });
                        }}
                        className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                          Tahun
                        </label>
                        <input
                          type="text"
                          value={award.year}
                          onChange={(e) => {
                            const list = [...profileState.awards];
                            list[idx] = { ...award, year: e.target.value };
                            setProfileState({ ...profileState, awards: list });
                          }}
                          className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const list = profileState.awards.filter((_, i) => i !== idx);
                          persistProfile({ ...profileState, awards: list });
                        }}
                        className="self-end p-2 bg-red-950/50 border border-red-500/40 text-red-300"
                      >
                        <span className="material-symbols-outlined text-base block">delete</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={award.description}
                    onChange={(e) => {
                      const list = [...profileState.awards];
                      list[idx] = { ...award, description: e.target.value };
                      setProfileState({ ...profileState, awards: list });
                    }}
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => persistProfile(profileState)}
              className="bg-[#ffbb28] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-6 py-3"
            >
              Simpan Penghargaan
            </button>
          </div>

          {/* Sertifikasi Section */}
          <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#56433b]/30 pb-4">
              <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4]">
                Daftar Sertifikasi
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newCert: Certification = {
                    id: `cert-${Date.now()}`,
                    title: 'Nama Sertifikasi Baru',
                    organizer: 'Lembaga Penerbit',
                    year: '2024',
                    credential: 'Sertifikat Kompetensi',
                  };
                  persistProfile({
                    ...profileState,
                    certifications: [newCert, ...profileState.certifications],
                  });
                }}
                className="bg-[#ffbb28] text-[#281b00] font-mono text-xs font-bold uppercase px-4 py-2 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tambah Sertifikasi
              </button>
            </div>

            <div className="space-y-3">
              {profileState.certifications.map((cert, idx) => (
                <div key={cert.id} className="bg-[#171216] p-4 border border-[#56433b]/40 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                      Nama Sertifikasi
                    </label>
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) => {
                        const list = [...profileState.certifications];
                        list[idx] = { ...cert, title: e.target.value };
                        setProfileState({ ...profileState, certifications: list });
                      }}
                      className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                      Penyelenggara
                    </label>
                    <input
                      type="text"
                      value={cert.organizer}
                      onChange={(e) => {
                        const list = [...profileState.certifications];
                        list[idx] = { ...cert, organizer: e.target.value };
                        setProfileState({ ...profileState, certifications: list });
                      }}
                      className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                      Keterangan / Tahun
                    </label>
                    <input
                      type="text"
                      value={cert.credential}
                      onChange={(e) => {
                        const list = [...profileState.certifications];
                        list[idx] = { ...cert, credential: e.target.value };
                        setProfileState({ ...profileState, certifications: list });
                      }}
                      className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = profileState.certifications.filter((_, i) => i !== idx);
                      persistProfile({ ...profileState, certifications: list });
                    }}
                    className="p-2 bg-red-950/50 border border-red-500/40 text-red-300 font-mono text-xs uppercase"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => persistProfile(profileState)}
              className="bg-[#ffbb28] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-6 py-3"
            >
              Simpan Sertifikasi
            </button>
          </div>

          {/* Pendidikan Section */}
          <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-5">
            <div className="border-b border-[#56433b]/30 pb-4">
              <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4]">
                Riwayat Pendidikan
              </h2>
            </div>

            <div className="space-y-4">
              {profileState.educationList.map((edu, idx) => (
                <div key={edu.id} className="bg-[#171216] p-4 sm:p-5 border border-[#56433b]/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                        Nama Kampus / Institusi
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const list = [...profileState.educationList];
                          list[idx] = { ...edu, institution: e.target.value };
                          setProfileState({ ...profileState, educationList: list });
                        }}
                        className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                        Program Studi / Gelar
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const list = [...profileState.educationList];
                          list[idx] = { ...edu, degree: e.target.value };
                          setProfileState({ ...profileState, educationList: list });
                        }}
                        className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                        Periode Tahun
                      </label>
                      <input
                        type="text"
                        value={edu.period}
                        onChange={(e) => {
                          const list = [...profileState.educationList];
                          list[idx] = { ...edu, period: e.target.value };
                          setProfileState({ ...profileState, educationList: list });
                        }}
                        className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                      Bidang / IPK / Predikat
                    </label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => {
                        const list = [...profileState.educationList];
                        list[idx] = { ...edu, field: e.target.value };
                        setProfileState({ ...profileState, educationList: list });
                      }}
                      className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#ffb597] mb-1">
                      Deskripsi Pendidikan
                    </label>
                    <textarea
                      rows={2}
                      value={edu.description}
                      onChange={(e) => {
                        const list = [...profileState.educationList];
                        list[idx] = { ...edu, description: e.target.value };
                        setProfileState({ ...profileState, educationList: list });
                      }}
                      className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => persistProfile(profileState)}
              className="bg-[#ffbb28] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-6 py-3"
            >
              Simpan Pendidikan
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: TEKS HALAMAN, LAYANAN & KEAHLIAN    */}
      {/* ========================================== */}
      {activeTab === 'teks-halaman' && (
        <div className="space-y-8">
          {/* 1. Teks Judul & Subjudul di Semua Halaman */}
          <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-6">
            <div className="border-b border-[#56433b]/30 pb-4">
              <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4]">
                Teks Judul, Subjudul & Deskripsi di Seluruh Halaman Website
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#ddc0b3]">
                Ubah teks apa pun yang tampil di Beranda, halaman Fotografi, Desain Grafis, Videografi, Semua Karya, maupun Footer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1">
                  Label Badge Atas Beranda (Hero)
                </label>
                <input
                  type="text"
                  value={profileState.siteTexts.heroBadge}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, heroBadge: e.target.value },
                    })
                  }
                  className="w-full bg-[#171216] border border-[#56433b] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1">
                  Judul Seksi Tentang Saya
                </label>
                <input
                  type="text"
                  value={profileState.siteTexts.aboutTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, aboutTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#171216] border border-[#56433b] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1">
                Teks Pita Berjalan / Marquee (Pisahkan dengan tanda koma)
              </label>
              <input
                type="text"
                value={profileState.siteTexts.marqueeItems.join(', ')}
                onChange={(e) =>
                  setProfileState({
                    ...profileState,
                    siteTexts: {
                      ...profileState.siteTexts,
                      marqueeItems: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                className="w-full bg-[#171216] border border-[#56433b] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
              />
            </div>

            {/* Teks Seksi Beranda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#56433b]/30">
              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2.5">
                <span className="font-mono text-[11px] text-[#ffbb28] uppercase font-bold block">
                  Seksi Galeri 01 (Beranda)
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.homePhotoTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, homePhotoTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.homePhotoDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, homePhotoDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>

              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2.5">
                <span className="font-mono text-[11px] text-[#ffb597] uppercase font-bold block">
                  Seksi Galeri 02 (Beranda)
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.homeDesignTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, homeDesignTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.homeDesignDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, homeDesignDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>

              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2.5">
                <span className="font-mono text-[11px] text-[#ffbb28] uppercase font-bold block">
                  Seksi Galeri 03 (Beranda)
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.homeVideoTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, homeVideoTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.homeVideoDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, homeVideoDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>
            </div>

            {/* Teks Halaman-Halaman Galeri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#56433b]/30">
              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2">
                <span className="font-mono text-[11px] text-[#ffbb28] uppercase font-bold block">
                  Halaman Fotografi (/fotografi)
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.photographyPageTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, photographyPageTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.photographyPageDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, photographyPageDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>

              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2">
                <span className="font-mono text-[11px] text-[#ffb597] uppercase font-bold block">
                  Halaman Desain Grafis (/desain-grafis)
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.graphicDesignPageTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, graphicDesignPageTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.graphicDesignPageDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, graphicDesignPageDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>

              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2">
                <span className="font-mono text-[11px] text-[#ffbb28] uppercase font-bold block">
                  Halaman Videografi (/videografi)
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.videographyPageTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, videographyPageTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.videographyPageDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, videographyPageDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>

              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2">
                <span className="font-mono text-[11px] text-[#ffbb28] uppercase font-bold block">
                  Halaman Semua Karya (/karya)
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.allProjectsTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, allProjectsTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.allProjectsDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, allProjectsDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>
            </div>

            {/* Teks Kontak & Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#56433b]/30">
              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2">
                <span className="font-mono text-[11px] text-[#ffbb28] uppercase font-bold block">
                  Seksi Kontak / Kolaborasi
                </span>
                <input
                  type="text"
                  value={profileState.siteTexts.contactTitle}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, contactTitle: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
                <textarea
                  rows={2}
                  value={profileState.siteTexts.contactDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, contactDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>

              <div className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2">
                <span className="font-mono text-[11px] text-[#ffbb28] uppercase font-bold block">
                  Deskripsi Bawah (Footer Website)
                </span>
                <textarea
                  rows={4}
                  value={profileState.siteTexts.footerDesc}
                  onChange={(e) =>
                    setProfileState({
                      ...profileState,
                      siteTexts: { ...profileState.siteTexts, footerDesc: e.target.value },
                    })
                  }
                  className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => persistProfile(profileState)}
              className="bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 shadow-lg"
            >
              Simpan Semua Teks Halaman
            </button>
          </div>

          {/* 2. Angka Statistik & Layanan Utama */}
          <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-6">
            <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4] border-b border-[#56433b]/30 pb-3">
              Angka Statistik & Kartu Layanan Utama
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {profileState.stats.map((st, idx) => (
                <div key={idx} className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2">
                  <span className="font-mono text-[10px] text-[#ffbb28] uppercase">
                    Kotak Statistik {idx + 1}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={st.value}
                      onChange={(e) => {
                        const list = [...profileState.stats];
                        list[idx] = { ...st, value: Number(e.target.value) };
                        setProfileState({ ...profileState, stats: list });
                      }}
                      className="w-20 bg-[#231e22] border border-[#56433b] px-2.5 py-1.5 text-xs text-[#ebdfe4]"
                      placeholder="Angka"
                    />
                    <input
                      type="text"
                      value={st.suffix}
                      onChange={(e) => {
                        const list = [...profileState.stats];
                        list[idx] = { ...st, suffix: e.target.value };
                        setProfileState({ ...profileState, stats: list });
                      }}
                      className="w-16 bg-[#231e22] border border-[#56433b] px-2.5 py-1.5 text-xs text-[#ebdfe4]"
                      placeholder="Simbol (+)"
                    />
                  </div>
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => {
                      const list = [...profileState.stats];
                      list[idx] = { ...st, label: e.target.value };
                      setProfileState({ ...profileState, stats: list });
                    }}
                    className="w-full bg-[#231e22] border border-[#56433b] px-2.5 py-1.5 text-xs text-[#ebdfe4]"
                    placeholder="Keterangan"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
              {profileState.services.map((srv, idx) => (
                <div key={srv.id} className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-2.5">
                  <span className="font-mono text-[10px] text-[#ffb597] uppercase">
                    Kartu Layanan {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={srv.title}
                    onChange={(e) => {
                      const list = [...profileState.services];
                      list[idx] = { ...srv, title: e.target.value };
                      setProfileState({ ...profileState, services: list });
                    }}
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4] font-bold"
                  />
                  <textarea
                    rows={3}
                    value={srv.description}
                    onChange={(e) => {
                      const list = [...profileState.services];
                      list[idx] = { ...srv, description: e.target.value };
                      setProfileState({ ...profileState, services: list });
                    }}
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => persistProfile(profileState)}
              className="bg-[#ffbb28] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-6 py-3"
            >
              Simpan Statistik & Layanan
            </button>
          </div>

          {/* 3. Daftar Keahlian & Perangkat Lunak */}
          <div className="bg-[#231e22]/90 border border-[#56433b]/50 p-5 sm:p-8 space-y-5">
            <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4] border-b border-[#56433b]/30 pb-3">
              Daftar Keahlian & Perangkat Lunak
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileState.skillCategories.map((cat, idx) => (
                <div key={idx} className="bg-[#171216] p-4 border border-[#56433b]/40 space-y-3">
                  <label className="block font-mono text-xs text-[#ffbb28] uppercase">
                    Judul Kelompok Keahlian {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={cat.title}
                    onChange={(e) => {
                      const list = [...profileState.skillCategories];
                      list[idx] = { ...cat, title: e.target.value };
                      setProfileState({ ...profileState, skillCategories: list });
                    }}
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                  />
                  <label className="block font-mono text-[10px] text-[#ddc0b3] uppercase">
                    Daftar Item (Pisahkan dengan koma)
                  </label>
                  <textarea
                    rows={3}
                    value={cat.items.map((i) => i.name).join(', ')}
                    onChange={(e) => {
                      const list = [...profileState.skillCategories];
                      list[idx] = {
                        ...cat,
                        items: e.target.value
                          .split(',')
                          .map((s) => ({ name: s.trim() }))
                          .filter((x) => Boolean(x.name)),
                      };
                      setProfileState({ ...profileState, skillCategories: list });
                    }}
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => persistProfile(profileState)}
              className="bg-[#ffbb28] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-6 py-3"
            >
              Simpan Daftar Keahlian
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: KEAMANAN & GANTI PASSWORD           */}
      {/* ========================================== */}
      {activeTab === 'keamanan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-[#231e22]/90 border border-[#56433b]/50 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#a53c00] text-[#ffdbcd] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <h2 className="font-headline text-lg font-bold uppercase text-[#ebdfe4]">
                  Email Pemulihan Akun
                </h2>
                <span className="font-mono text-xs text-emerald-400">
                  ● Terhubung & Aktif
                </span>
              </div>
            </div>

            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] leading-relaxed">
              Sistem keamanan Studio Admin Zeevisual dikunci secara eksklusif ke alamat email pribadi Anda:
            </p>

            <div className="p-4 bg-[#171216] border border-[#ffbb28]/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ffbb28]">mail</span>
                <span className="font-mono text-xs sm:text-sm text-[#ebdfe4] font-bold break-all">
                  {OWNER_RECOVERY_EMAIL}
                </span>
              </div>
              <span className="bg-[#ffbb28]/20 text-[#ffbb28] font-mono text-[10px] px-2 py-0.5 uppercase">
                Pemilik
              </span>
            </div>

            <div className="space-y-2 pt-2 font-body text-xs text-[#ddc0b3]/80">
              <p className="flex items-start gap-2">
                <span className="text-[#ffbb28]">✓</span>
                <span>Password tidak pernah ditampilkan di layar login pengunjung.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#ffbb28]">✓</span>
                <span>Jika Anda lupa password di kemudian hari, kode verifikasi OTP hanya akan dikirim ke <strong>{OWNER_RECOVERY_EMAIL}</strong>.</span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#231e22]/90 border border-[#56433b]/50 p-6 sm:p-8">
            <h2 className="font-headline text-xl font-bold uppercase text-[#ebdfe4] mb-1">
              Ganti Password Admin
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] mb-6">
              Perbarui password akses Studio Admin Anda kapan saja.
            </p>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1.5">
                  Password Saat Ini *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  placeholder="Masukkan password Anda saat ini..."
                  className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-4 py-3 text-sm text-[#ebdfe4] font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1.5">
                    Password Baru (Min. 6 Karakter) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Password baru..."
                    className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-4 py-3 text-sm text-[#ebdfe4] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1.5">
                    Ulangi Password Baru *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassInput}
                    onChange={(e) => setConfirmNewPassInput(e.target.value)}
                    placeholder="Konfirmasi password baru..."
                    className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-4 py-3 text-sm text-[#ebdfe4] font-mono outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={sendEmailBackup}
                  onChange={(e) => setSendEmailBackup(e.target.checked)}
                  className="w-4 h-4 accent-[#ffbb28]"
                />
                <span className="font-mono text-xs text-[#ddc0b3]">
                  Kirim notifikasi perubahan password ke <strong>{OWNER_RECOVERY_EMAIL}</strong>
                </span>
              </label>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 shadow-lg transition-all"
                >
                  {isSaving ? 'Menyimpan Password...' : 'Simpan Password Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL TAMBAH / EDIT KARYA                  */}
      {/* ========================================== */}
      {editingProject &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-3xl bg-[#171216] border border-[#ffbb28]/50 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 bg-[#231e22] border-b border-[#56433b]/40 shrink-0">
                <h2 className="font-headline text-lg sm:text-xl font-extrabold uppercase text-[#ebdfe4]">
                  {isCreatingNew ? 'Tambah Karya Baru' : `Edit Karya: ${editingProject.title}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="text-[#ddc0b3] hover:text-[#ffbb28] flex items-center gap-1 font-mono text-xs uppercase px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 cursor-pointer"
                >
                  <span>Tutup</span>
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

            <form onSubmit={handleSaveProjectModal} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1">
                    Kategori Utama *
                  </label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value as ProjectCategory,
                      })
                    }
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2.5 text-sm text-[#ebdfe4] font-mono"
                  >
                    <option value="Fotografi">Fotografi</option>
                    <option value="Desain Grafis">Desain Grafis</option>
                    <option value="Videografi">Videografi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                    Sub-Bidang (Misal: Potret / Poster) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.subCategory}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, subCategory: e.target.value })
                    }
                    placeholder="Contoh: Potret, Pernikahan, Poster..."
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2.5 text-sm text-[#ebdfe4]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                    Tahun Karya *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProject.year}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, year: Number(e.target.value) })
                    }
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2.5 text-sm text-[#ebdfe4]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ffbb28] mb-1">
                  Judul Karya *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, title: e.target.value })
                  }
                  placeholder="Masukkan judul karya..."
                  className="w-full bg-[#231e22] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              {/* PILIHAN METODE INPUT: UPLOAD MANUAL DARI LAPTOP ATAU SAMBUNGKAN DARI INSTAGRAM */}
              <div className="bg-[#120d10] border border-[#56433b]/70 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono text-xs uppercase text-[#ffbb28] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">hub</span>
                    Pilih Sumber Media Karya:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInputSourceMode('manual')}
                      className={`px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        inputSourceMode === 'manual'
                          ? 'bg-[#ffbb28] text-[#281b00] border-[#ffbb28] shadow-md'
                          : 'bg-[#231e22] text-[#ddc0b3] border-[#56433b]/50 hover:border-[#ffbb28]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">upload_file</span>
                      1. Upload Manual (Laptop)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputSourceMode('instagram')}
                      className={`px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        inputSourceMode === 'instagram'
                          ? 'bg-[#ffbb28] text-[#281b00] border-[#ffbb28] shadow-md'
                          : 'bg-[#231e22] text-[#ddc0b3] border-[#56433b]/50 hover:border-[#ffbb28]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">share</span>
                      2. Sambungkan dari IG
                    </button>
                  </div>
                </div>

                {inputSourceMode === 'instagram' && (
                  <div className="bg-[#231e22] border border-[#ffbb28]/50 p-3.5 space-y-3">
                    <div>
                      <label className="block font-mono text-xs uppercase text-[#ffbb28] font-bold mb-1">
                        Tempel Link Postingan / Reels Instagram (@_zeevisual):
                      </label>
                      <p className="font-body text-[11px] text-[#ddc0b3]/85 mb-2">
                        Cukup salin link postingan foto, carousel slide, atau Reels dari Instagram Anda lalu klik tombol <strong>Tarik & Sambungkan dari IG</strong>. Sistem akan otomatis mengambil foto/video, caption, dan menyambungkan karya ke Instagram Anda!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editingProject.instagramUrl || ''}
                          onChange={(e) => {
                            const rawVal = e.target.value;
                            const igMatch = rawVal.match(
                              /(?:instagram\.com|instagr\.am)\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
                            );
                            let nextVideoUrl = editingProject.videoUrl;
                            if (igMatch && editingProject.category === 'Videografi' && !nextVideoUrl) {
                              const pType =
                                igMatch[1].toLowerCase() === 'reels'
                                  ? 'reel'
                                  : igMatch[1].toLowerCase();
                              nextVideoUrl = `https://www.instagram.com/${pType}/${igMatch[2]}/embed/captioned/`;
                            }
                            setEditingProject({
                              ...editingProject,
                              instagramUrl: rawVal,
                              videoUrl: nextVideoUrl,
                            });
                          }}
                          placeholder="Contoh: https://www.instagram.com/p/C8xyz.../ atau https://www.instagram.com/reel/..."
                          className="flex-1 bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-xs text-[#ebdfe4] font-mono"
                        />
                        <button
                          type="button"
                          disabled={fetchingIg}
                          onClick={handleFetchFromInstagram}
                          className="bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-mono text-xs uppercase font-bold px-4 py-2.5 shrink-0 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                        >
                          <span className="material-symbols-outlined text-base">
                            {fetchingIg ? 'sync' : 'bolt'}
                          </span>
                          <span>
                            {fetchingIg ? 'Menarik dari IG...' : 'Tarik & Sambungkan dari IG'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {editingProject.instagramUrl && (
                      <div className="flex items-center justify-between gap-2 bg-[#171216] px-3 py-2 border border-[#56433b]/40 font-mono text-[11px]">
                        <span className="text-[#ffbb28] truncate">
                          ✓ Terhubung ke IG: {editingProject.instagramUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({ ...editingProject, instagramUrl: '' })
                          }
                          className="text-red-400 hover:text-red-300 shrink-0 uppercase cursor-pointer"
                        >
                          Lepas Link
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KHUSUS VIDEOGRAFI: UPLOAD VIDEO UTAMA DI PALING ATAS */}
              {editingProject.category === 'Videografi' ? (
                <div className="bg-[#231e22] p-4 sm:p-5 border-2 border-[#ffbb28]/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#56433b]/40 pb-3">
                    <div>
                      <label className="block font-mono text-xs sm:text-sm uppercase text-[#ffbb28] font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-lg">movie</span>
                        1. Upload File Video Karya (.mp4 / .mov / .webm) atau Link Video *
                      </label>
                      <p className="font-body text-[11px] text-[#ddc0b3]/85 mt-0.5">
                        Otomatis masuk ke folder <code className="text-[#ffb597]">public/videos/</code> dan otomatis mengambil gambar sampul (*thumbnail*) dari video Anda!
                      </p>
                    </div>
                    <select
                      value={editingProject.videoType || 'landscape'}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          videoType: e.target.value as 'landscape' | 'portrait',
                        })
                      }
                      className="bg-[#171216] border border-[#ffbb28]/50 px-3 py-2 text-xs text-[#ffbb28] font-mono font-bold shrink-0"
                    >
                      <option value="landscape">🎬 Format Landscape (16:9)</option>
                      <option value="portrait">📱 Format Reels / Portrait (9:16)</option>
                    </select>
                  </div>

                  {/* Tombol Pilih File Video dari Komputer */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <label className="inline-flex items-center gap-2.5 bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-mono text-xs uppercase font-bold px-5 py-3 cursor-pointer transition-colors shadow-lg">
                      <span className="material-symbols-outlined text-lg">video_file</span>
                      <span>
                        {uploadingMedia
                          ? 'Sedang Mengunggah Video...'
                          : '+ Pilih File Video (.mp4 / .mov) dari Komputer'}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,video/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const videoUrl = await uploadFileToFolder(file, 'videos');
                          if (!videoUrl) return;

                          // Automatically extract thumbnail frame & detect portrait/landscape
                          const extracted = await extractThumbnailFromVideoFile(file);
                          let thumbUrl = editingProject.image;
                          let detectedType = editingProject.videoType || 'landscape';

                          if (extracted) {
                            detectedType = extracted.videoType;
                            if (isLocalServer) {
                              try {
                                const baseName = file.name.replace(/\.[^.]+$/, '');
                                const res = await fetch('/api/cms/upload', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    fileName: `thumb-${baseName}.jpg`,
                                    folder: 'foto',
                                    base64Data: extracted.dataUrl,
                                  }),
                                });
                                const data = await res.json();
                                if (data.ok && data.url) {
                                  thumbUrl = data.url;
                                }
                              } catch {
                                thumbUrl = extracted.dataUrl;
                              }
                            } else {
                              thumbUrl = extracted.dataUrl;
                            }
                          }

                          setEditingProject({
                            ...editingProject,
                            videoUrl,
                            videoType: detectedType,
                            image: thumbUrl || editingProject.image,
                            images: thumbUrl ? [thumbUrl] : editingProject.images,
                          });
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>

                  {/* Input Link Video (Lokal atau YouTube) */}
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#ddc0b3] mb-1">
                      Lokasi File Video atau Link Embed (YouTube / Google Drive / MP4):
                    </label>
                    <input
                      type="text"
                      value={editingProject.videoUrl || ''}
                      onChange={(e) => {
                        const rawVal = e.target.value;
                        let finalVideoUrl = rawVal;
                        let autoThumb = editingProject.image;

                        // Auto-convert YouTube watch / youtu.be / shorts links to embed + grab YouTube thumbnail
                        const ytMatch = rawVal.match(
                          /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                        );
                        if (ytMatch && ytMatch[1]) {
                          const ytId = ytMatch[1];
                          finalVideoUrl = `https://www.youtube.com/embed/${ytId}`;
                          if (!autoThumb || autoThumb.includes('unsplash.com')) {
                            autoThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
                          }
                        }

                        setEditingProject({
                          ...editingProject,
                          videoUrl: finalVideoUrl,
                          image: autoThumb,
                          images: autoThumb ? [autoThumb] : editingProject.images,
                        });
                      }}
                      placeholder="Contoh: /videos/nama-video.mp4 atau tempel link YouTube di sini..."
                      className="w-full bg-[#171216] border border-[#56433b] focus:border-[#ffbb28] px-3.5 py-2.5 text-xs text-[#ebdfe4] font-mono"
                    />
                  </div>

                  {/* Preview Video Player & Pengaturan Sampul (Thumbnail) Video */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-[#56433b]/40">
                    {/* Kolom Kiri: Live Video Preview */}
                    <div className="md:col-span-7 bg-[#120d10] border border-[#56433b]/50 p-3 space-y-2">
                      <span className="font-mono text-[11px] uppercase text-[#ffbb28] block">
                        Preview Putar Video:
                      </span>
                      {editingProject.videoUrl ? (
                        editingProject.videoUrl.startsWith('/videos/') ||
                        editingProject.videoUrl.endsWith('.mp4') ||
                        editingProject.videoUrl.endsWith('.mov') ||
                        editingProject.videoUrl.endsWith('.webm') ||
                        editingProject.videoUrl.includes('gtv-videos-bucket') ? (
                          <div className="space-y-2">
                            <video
                              ref={videoPreviewRef}
                              key={editingProject.videoUrl}
                              src={editingProject.videoUrl}
                              poster={editingProject.image}
                              controls
                              playsInline
                              crossOrigin="anonymous"
                              className="w-full max-h-56 object-contain bg-black mx-auto"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                const vid = videoPreviewRef.current;
                                if (!vid) return;
                                try {
                                  const canvas = document.createElement('canvas');
                                  canvas.width = vid.videoWidth || 1280;
                                  canvas.height = vid.videoHeight || 720;
                                  const ctx = canvas.getContext('2d');
                                  if (!ctx) return;
                                  ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
                                  if (isLocalServer) {
                                    const res = await fetch('/api/cms/upload', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        fileName: `thumb-video-${Date.now()}.jpg`,
                                        folder: 'foto',
                                        base64Data: dataUrl,
                                      }),
                                    });
                                    const data = await res.json();
                                    if (data.ok && data.url) {
                                      setEditingProject({
                                        ...editingProject,
                                        image: data.url,
                                        images: [data.url],
                                      });
                                      showNotification(
                                        'success',
                                        'Detik video saat ini berhasil dijadikan Sampul (Thumbnail)!'
                                      );
                                      return;
                                    }
                                  }
                                  setEditingProject({
                                    ...editingProject,
                                    image: dataUrl,
                                    images: [dataUrl],
                                  });
                                  showNotification(
                                    'success',
                                    'Detik video saat ini berhasil dijadikan Sampul!'
                                  );
                                } catch {
                                  showNotification(
                                    'error',
                                    'Silakan putar/jeda video lokal terlebih dahulu atau upload foto sampul manual.'
                                  );
                                }
                              }}
                              className="w-full py-2 bg-[#171216] hover:bg-[#ffbb28] text-[#ffbb28] hover:text-[#281b00] border border-[#ffbb28]/50 font-mono text-[11px] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">photo_camera</span>
                              Jadikan Detik Video Saat Ini Sebagai Sampul (Thumbnail)
                            </button>
                          </div>
                        ) : (
                          <iframe
                            src={editingProject.videoUrl}
                            title="Video Preview"
                            className="w-full aspect-video border border-[#56433b]/40"
                            allowFullScreen
                          />
                        )
                      ) : (
                        <div className="h-40 flex items-center justify-center text-center font-mono text-xs text-[#ddc0b3]/60 px-4">
                          Belum ada video yang dipilih. Klik tombol "+ Pilih File Video" di atas.
                        </div>
                      )}
                    </div>

                    {/* Kolom Kanan: Sampul / Thumbnail Video */}
                    <div className="md:col-span-5 bg-[#120d10] border border-[#56433b]/50 p-3 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <span className="font-mono text-[11px] uppercase text-[#ffb597] block">
                          2. Gambar Sampul (Thumbnail) Video:
                        </span>
                        {editingProject.image ? (
                          <div className="aspect-video w-full bg-black overflow-hidden border border-[#56433b]/50 relative">
                            <img
                              src={editingProject.image}
                              alt="Thumbnail Video"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-[#171216] border border-dashed border-[#56433b] flex items-center justify-center font-mono text-[11px] text-[#ddc0b3]/60 text-center p-2">
                            Otomatis terisi saat Anda meng-upload video
                          </div>
                        )}
                      </div>

                      <label className="w-full inline-flex items-center justify-center gap-1.5 bg-[#231e22] hover:bg-[#ffbb28] text-[#ddc0b3] hover:text-[#281b00] border border-[#56433b] font-mono text-[11px] uppercase font-bold px-3 py-2 cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-sm">image</span>
                        <span>Ganti Foto Sampul Manual (Opsional)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadFileToFolder(file, 'foto');
                            if (url) {
                              setEditingProject({
                                ...editingProject,
                                image: url,
                                images: [url],
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                /* KHUSUS FOTOGRAFI & DESAIN GRAFIS: UPLOAD FOTO / GAMBAR MULTI-SLIDE */
                <div className="bg-[#231e22] p-4 border border-[#56433b]/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block font-mono text-xs uppercase text-[#ffbb28] font-bold">
                        Foto / Gambar Karya — Bisa Upload 1 atau Banyak Foto Sekaligus (Slide) *
                      </label>
                      <p className="font-body text-[11px] text-[#ddc0b3]/80 mt-0.5">
                        Otomatis masuk ke folder{' '}
                        <code className="text-[#ffb597]">
                          {editingProject.category === 'Desain Grafis'
                            ? 'public/images/desain/'
                            : 'public/images/foto/'}
                        </code>
                        . Jika Anda mengunggah lebih dari 1 gambar, karya ini otomatis tampil sebagai <strong>Slide / Carousel</strong>!
                      </p>
                    </div>
                    <span className="bg-[#171216] border border-[#ffbb28]/40 text-[#ffbb28] font-mono text-xs px-3 py-1 shrink-0 self-start">
                      Total: {(editingProject.images && editingProject.images.length) || (editingProject.image ? 1 : 0)} Slide
                    </span>
                  </div>

                  {/* Tombol Multi-Upload dari Komputer */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-mono text-xs uppercase font-bold px-4 py-2.5 cursor-pointer transition-colors shadow-md">
                      <span className="material-symbols-outlined text-base">burst_mode</span>
                      <span>
                        {uploadingMedia
                          ? 'Sedang Mengunggah...'
                          : '+ Pilih Foto / Gambar dari Komputer (Bisa Pilih Banyak Sekaligus)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const fileList = e.target.files;
                          if (!fileList || fileList.length === 0) return;
                          const targetFolder =
                            editingProject.category === 'Desain Grafis' ? 'desain' : 'foto';
                          const existingSlides =
                            editingProject.images && editingProject.images.length > 0
                              ? [...editingProject.images]
                              : editingProject.image
                              ? [editingProject.image]
                              : [];
                          const newUploadedUrls: string[] = [];
                          for (let i = 0; i < fileList.length; i++) {
                            const url = await uploadFileToFolder(fileList[i], targetFolder);
                            if (url) newUploadedUrls.push(url);
                          }
                          if (newUploadedUrls.length > 0) {
                            const combined = [...existingSlides, ...newUploadedUrls];
                            setEditingProject({
                              ...editingProject,
                              image: combined[0],
                              images: combined,
                            });
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>

                    {/* Tambah Slide via Link URL */}
                    <button
                      type="button"
                      onClick={() => {
                        const url = window.prompt('Masukkan Link URL Gambar untuk ditambahkan ke Slide:');
                        if (!url || !url.trim()) return;
                        const existingSlides =
                          editingProject.images && editingProject.images.length > 0
                            ? [...editingProject.images]
                            : editingProject.image
                            ? [editingProject.image]
                            : [];
                        const combined = [...existingSlides, url.trim()];
                        setEditingProject({
                          ...editingProject,
                          image: combined[0],
                          images: combined,
                        });
                      }}
                      className="px-3.5 py-2.5 bg-[#171216] hover:border-[#ffbb28] text-[#ddc0b3] hover:text-[#ffbb28] border border-[#56433b] font-mono text-xs uppercase flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">add_link</span>
                      <span>+ Tambah Slide dari Link URL</span>
                    </button>
                  </div>

                  {/* Daftar Thumbnail Slide Gambar */}
                  {(() => {
                    const slidesList =
                      editingProject.images && editingProject.images.length > 0
                        ? editingProject.images
                        : editingProject.image
                        ? [editingProject.image]
                        : [];

                    if (slidesList.length === 0) {
                      return (
                        <div className="bg-[#171216] border border-dashed border-[#56433b] p-6 text-center font-mono text-xs text-[#ddc0b3]/60">
                          Belum ada foto/gambar yang dipilih. Klik tombol di atas untuk mengunggah 1 atau beberapa gambar sekaligus.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-mono text-[11px] text-[#ffb597]">
                            Daftar Slide Karya (Slide 1 otomatis menjadi Sampul Utama):
                          </p>
                          <span className="font-mono text-[10px] text-[#ffbb28] bg-[#171216] border border-[#ffbb28]/30 px-2.5 py-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">drag_pan</span>
                            Tips: Klik & Tahan (Drag) kartu untuk memindahkan urutan slide langsung
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {slidesList.map((slideUrl, sIdx) => {
                            const isBeingDragged = draggedSlideIndex === sIdx;
                            const isDragTarget =
                              dragOverSlideIndex === sIdx &&
                              draggedSlideIndex !== null &&
                              draggedSlideIndex !== sIdx;

                            return (
                              <div
                                key={`${slideUrl}-${sIdx}`}
                                draggable
                                onDragStart={(e) => {
                                  setDraggedSlideIndex(sIdx);
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.dataTransfer.setData('text/plain', String(sIdx));
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = 'move';
                                  if (dragOverSlideIndex !== sIdx) {
                                    setDragOverSlideIndex(sIdx);
                                  }
                                }}
                                onDragLeave={() => {
                                  if (dragOverSlideIndex === sIdx) {
                                    setDragOverSlideIndex(null);
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const fromIdx =
                                    draggedSlideIndex !== null
                                      ? draggedSlideIndex
                                      : Number(e.dataTransfer.getData('text/plain'));
                                  setDraggedSlideIndex(null);
                                  setDragOverSlideIndex(null);
                                  if (
                                    Number.isNaN(fromIdx) ||
                                    fromIdx < 0 ||
                                    fromIdx >= slidesList.length ||
                                    fromIdx === sIdx
                                  ) {
                                    return;
                                  }
                                  const copy = [...slidesList];
                                  const [movedSlide] = copy.splice(fromIdx, 1);
                                  copy.splice(sIdx, 0, movedSlide);
                                  setEditingProject({
                                    ...editingProject,
                                    image: copy[0],
                                    images: copy,
                                  });
                                }}
                                onDragEnd={() => {
                                  setDraggedSlideIndex(null);
                                  setDragOverSlideIndex(null);
                                }}
                                className={`bg-[#171216] border p-2 flex flex-col justify-between gap-2 relative cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
                                  isBeingDragged
                                    ? 'opacity-40 scale-95 border-dashed border-[#ffbb28]'
                                    : isDragTarget
                                    ? 'border-[#ffbb28] ring-2 ring-[#ffbb28] scale-[1.03] bg-[#281f24] shadow-[0_0_20px_rgba(255,187,40,0.35)]'
                                    : sIdx === 0
                                    ? 'border-[#ffbb28]'
                                    : 'border-[#56433b]/50 hover:border-[#ffb597]/60'
                                }`}
                                title="Tahan & geser (Drag & Drop) untuk memindahkan urutan slide"
                              >
                                <div className="aspect-[3/4] w-full bg-[#0f0b0e] overflow-hidden relative flex items-center justify-center">
                                  <img
                                    src={slideUrl}
                                    alt={`Slide ${sIdx + 1}`}
                                    draggable={false}
                                    className="w-full h-full object-contain pointer-events-none select-none"
                                  />
                                  <span
                                    className={`absolute top-1.5 left-1.5 font-mono text-[10px] px-2 py-0.5 uppercase font-bold shadow ${
                                      sIdx === 0
                                        ? 'bg-[#ffbb28] text-[#281b00]'
                                        : 'bg-[#171216]/90 text-[#ebdfe4] border border-[#56433b]/50'
                                    }`}
                                  >
                                    {sIdx === 0 ? '★ Slide 1 (Sampul)' : `Slide ${sIdx + 1}`}
                                  </span>

                                  {/* Drag Handle Indicator Top Right */}
                                  <span
                                    className="absolute top-1.5 right-1.5 bg-[#171216]/85 text-[#ddc0b3] border border-[#56433b]/50 p-0.5 flex items-center justify-center shadow"
                                    title="Tahan & Geser (Drag)"
                                  >
                                    <span className="material-symbols-outlined text-xs">
                                      drag_indicator
                                    </span>
                                  </span>

                                  {isDragTarget && (
                                    <div className="absolute inset-0 bg-[#ffbb28]/20 backdrop-blur-[1px] flex items-center justify-center border-2 border-dashed border-[#ffbb28]">
                                      <span className="bg-[#171216]/95 text-[#ffbb28] font-mono text-[10px] font-bold uppercase px-2.5 py-1 shadow-lg">
                                        Lepas ke Posisi #{sIdx + 1}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-1 pt-1">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={sIdx === 0}
                                      onClick={() => {
                                        const copy = [...slidesList];
                                        const temp = copy[sIdx - 1];
                                        copy[sIdx - 1] = copy[sIdx];
                                        copy[sIdx] = temp;
                                        setEditingProject({
                                          ...editingProject,
                                          image: copy[0],
                                          images: copy,
                                        });
                                      }}
                                      className="p-1 bg-[#231e22] border border-[#56433b]/50 text-[#ddc0b3] hover:text-[#ffbb28] disabled:opacity-30 cursor-pointer"
                                      title="Geser Slide ke Kiri"
                                    >
                                      <span className="material-symbols-outlined text-xs block">
                                        chevron_left
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={sIdx === slidesList.length - 1}
                                      onClick={() => {
                                        const copy = [...slidesList];
                                        const temp = copy[sIdx + 1];
                                        copy[sIdx + 1] = copy[sIdx];
                                        copy[sIdx] = temp;
                                        setEditingProject({
                                          ...editingProject,
                                          image: copy[0],
                                          images: copy,
                                        });
                                      }}
                                      className="p-1 bg-[#231e22] border border-[#56433b]/50 text-[#ddc0b3] hover:text-[#ffbb28] disabled:opacity-30 cursor-pointer"
                                      title="Geser Slide ke Kanan"
                                    >
                                      <span className="material-symbols-outlined text-xs block">
                                        chevron_right
                                      </span>
                                    </button>
                                    {sIdx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = [...slidesList];
                                          const [picked] = copy.splice(sIdx, 1);
                                          copy.unshift(picked);
                                          setEditingProject({
                                            ...editingProject,
                                            image: copy[0],
                                            images: copy,
                                          });
                                        }}
                                        className="px-1.5 py-1 bg-[#231e22] border border-[#56433b]/50 text-[#ffbb28] hover:bg-[#ffbb28] hover:text-[#281b00] font-mono text-[9px] uppercase font-bold cursor-pointer transition-colors"
                                        title="Jadikan Slide 1 (Sampul Utama)"
                                      >
                                        ★ Sampul
                                      </button>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = slidesList.filter((_, idx) => idx !== sIdx);
                                      setEditingProject({
                                        ...editingProject,
                                        image: copy[0] || '',
                                        images: copy,
                                      });
                                    }}
                                    className="px-2 py-1 bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900 font-mono text-[10px] uppercase flex items-center gap-0.5 cursor-pointer"
                                    title="Hapus Slide Ini"
                                  >
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                  Deskripsi Karya *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  placeholder="Ceritakan singkat mengenai karya ini..."
                  className="w-full bg-[#231e22] border border-[#56433b] px-3.5 py-2.5 text-sm text-[#ebdfe4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                    Label Sorotan (Badge)
                  </label>
                  <input
                    type="text"
                    value={editingProject.badge || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, badge: e.target.value })
                    }
                    placeholder="Misal: Juara 1 / Potret Pilihan"
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                    Klien / Instansi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editingProject.client || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, client: e.target.value })
                    }
                    placeholder="Misal: TVRI Aceh / Bank Indonesia"
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-[#ddc0b3] mb-1">
                    Kamera / Software (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={toolsInput}
                    onChange={(e) => setToolsInput(e.target.value)}
                    placeholder="Sony Alpha, Lightroom, Photoshop"
                    className="w-full bg-[#231e22] border border-[#56433b] px-3 py-2 text-xs text-[#ebdfe4]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(editingProject.featured)}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, featured: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#ffbb28]"
                />
                <span className="font-mono text-xs text-[#ebdfe4]">
                  Tampilkan karya ini di Halaman Beranda (Karya Pilihan)
                </span>
              </label>

              <div className="pt-4 border-t border-[#56433b]/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-5 py-2.5 bg-[#231e22] text-[#ddc0b3] font-mono text-xs uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingMedia}
                  className="px-6 py-2.5 bg-[#ffbb28] hover:bg-[#ffb597] text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest shadow-lg cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Karya ke Portofolio'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminDashboard;
