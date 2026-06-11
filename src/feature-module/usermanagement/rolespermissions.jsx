import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { fetchAdmins } from "../Api/UserApi";

const CARD_COLORS = [
  { top: '#00B4D8', footer: '#0077B6' },
  { top: '#7B2FBE', footer: '#560BAD' },
  { top: '#06D6A0', footer: '#028090' },
  { top: '#F72585', footer: '#B5179E' },
  { top: '#FF6B35', footer: '#D94F1E' },
];

/* ─── Crop Modal ─────────────────────────────────────────── */
function CropModal({ imageSrc, onCrop, onCancel }) {
  CropModal.propTypes = {
    imageSrc: PropTypes.string.isRequired,
    onCrop: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, r: 80 });
  const dragRef = useRef(null);

  const onImgLoad = () => {
    const el = imgRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setImgSize({ w, h });
    setCrop({ x: w / 2, y: h / 2, r: Math.min(w, h) * 0.35 });
  };

  // ── drag ──────────────────────────────────────────────────
  const onMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = mx - crop.x;
    const dy = my - crop.y;
    if (Math.sqrt(dx * dx + dy * dy) <= crop.r) {
      dragRef.current = { ox: crop.x, oy: crop.y, mx, my };
      e.preventDefault();
    }
  };

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = mx - dragRef.current.mx;
    const dy = my - dragRef.current.my;
    setCrop(c => ({
      ...c,
      x: Math.max(c.r, Math.min(imgSize.w - c.r, dragRef.current.ox + dx)),
      y: Math.max(c.r, Math.min(imgSize.h - c.r, dragRef.current.oy + dy)),
    }));
  }, [imgSize]);

  const onMouseUp = () => { dragRef.current = null; };

  // ── resize buttons ────────────────────────────────────────
  const resize = (delta) => {
    setCrop(c => ({
      ...c,
      r: Math.max(40, Math.min(Math.min(imgSize.w, imgSize.h) / 2 - 4, c.r + delta)),
    }));
  };

  // ── apply crop via canvas ─────────────────────────────────
  const applyCrop = () => {
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;
    const out = 300;
    const canvas = document.createElement('canvas');
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      img,
      (crop.x - crop.r) * scaleX,
      (crop.y - crop.r) * scaleY,
      crop.r * 2 * scaleX,
      crop.r * 2 * scaleY,
      0, 0, out, out
    );
    onCrop(canvas.toDataURL('image/jpeg', 0.92));
  };

  const svgW = imgSize.w || 1;
  const svgH = imgSize.h || 1;

  return (
    <div className="crop-backdrop">
      <div className="crop-modal">
        <div className="crop-modal-header">
          <span>Crop Photo</span>
          <button className="crop-close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="crop-image-outer">
          <div
            className="crop-image-container"
            ref={containerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="crop"
            className="crop-preview-img"
            onLoad={onImgLoad}
            draggable={false}
          />
          {imgSize.w > 0 && (
            <svg
              className="crop-svg-overlay"
              width={svgW}
              height={svgH}
            >
              <defs>
                <mask id="cropMask">
                  <rect x="0" y="0" width={svgW} height={svgH} fill="white" />
                  <circle cx={crop.x} cy={crop.y} r={crop.r} fill="black" />
                </mask>
              </defs>
              <rect x="0" y="0" width={svgW} height={svgH} fill="rgba(0,0,0,0.55)" mask="url(#cropMask)" />
              <circle cx={crop.x} cy={crop.y} r={crop.r} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="6 3" />
              <circle cx={crop.x} cy={crop.y} r={crop.r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5" />
            </svg>
          )}
          </div>
        </div>

        <div className="crop-hint">Drag the circle to reposition</div>

        <div className="crop-controls">
          <div className="crop-resize-btns">
            <button type="button" className="crop-resize-btn" onClick={() => resize(-10)}>−</button>
            <span className="crop-resize-label">Size</span>
            <button type="button" className="crop-resize-btn" onClick={() => resize(10)}>+</button>
          </div>
          <div className="crop-action-btns">
            <button type="button" className="crop-cancel-btn" onClick={onCancel}>Cancel</button>
            <button type="button" className="crop-save-btn" onClick={applyCrop}>Crop & Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
const RolesPermissions = () => {
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState({});
  const [cropModal, setCropModal] = useState({ show: false, imageSrc: null, adminId: null });
  const fileInputRefs = useRef({});

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAdmins(1, 50);
      const userData = response.payload || [];
      const adminUsers = userData.filter(user => user.userRoleDto?.userRole === "ADMIN");
      setUsersData(adminUsers.map(user => ({
        id: user.id,
        username: `${user.firstName} ${user.lastName}`,
        email: user.emailAddress,
        status: user.isActive ? 'Active' : 'Inactive',
        role: user.userRoleDto?.userRole || 'ADMIN',
        mobileNumber: user.mobileNumber,
      })));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const saved = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('adminPhoto_')) {
        saved[key.replace('adminPhoto_', '')] = localStorage.getItem(key);
      }
    }
    setPhotos(saved);
  }, []);

  useEffect(() => { loadUsers(); }, []);

  const handleFileSelected = (adminId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Only scale if image is extremely large (>1800px) to avoid memory issues.
        // Otherwise use original for full clarity.
        const MAX_DIM = 1800;
        if (img.naturalWidth <= MAX_DIM && img.naturalHeight <= MAX_DIM) {
          setCropModal({ show: true, imageSrc: ev.target.result, adminId });
        } else {
          const scale = MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight);
          const w = Math.round(img.naturalWidth * scale);
          const h = Math.round(img.naturalHeight * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          setCropModal({ show: true, imageSrc: canvas.toDataURL('image/png'), adminId });
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCropDone = (base64) => {
    const { adminId } = cropModal;
    localStorage.setItem(`adminPhoto_${adminId}`, base64);
    setPhotos(prev => ({ ...prev, [adminId]: base64 }));
    setCropModal({ show: false, imageSrc: null, adminId: null });
  };

  if (isLoading) {
    return <div className="page-wrapper"><div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Admin Details</h4>
              <h6>Contact Admin Details</h6>
            </div>
          </div>
        </div>

        <div className="id-cards-wrapper">
          {usersData.map((admin, idx) => {
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            const initials = admin.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div className="id-badge" key={admin.id}>
                <div className="badge-top" style={{ background: `linear-gradient(135deg, ${color.top}, ${color.footer})` }}>
                  <div className="badge-logo-wrap">
                    <img src="/assets/img/logo.png" alt="Delta POS" className="badge-logo" />
                  </div>
                  <div className="badge-company">DELTA POS</div>
                </div>

                <div className="badge-avatar-wrap">
                  <div className="badge-avatar" style={{ border: `3px solid ${color.top}` }}>
                    {photos[admin.id]
                      ? <img src={photos[admin.id]} alt={admin.username} className="badge-photo" />
                      : initials
                    }
                    <div className="badge-upload-overlay" onClick={() => fileInputRefs.current[admin.id]?.click()}>
                      📷
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={el => fileInputRefs.current[admin.id] = el}
                    onChange={(e) => handleFileSelected(admin.id, e)}
                  />
                </div>

                <div className="badge-body">
                  <h3 className="badge-name">{admin.username.toUpperCase()}</h3>
                  <div className="badge-info-row">
                    <span className="badge-info-label">📱</span>
                    <span>{admin.mobileNumber || '—'}</span>
                  </div>
                  <div className="badge-info-row">
                    <span className="badge-info-label">✉️</span>
                    <span className="badge-email">{admin.email}</span>
                  </div>
                  <div className="badge-info-row">
                    <span className="badge-info-label">⚡</span>
                    <span style={{ color: admin.status === 'Active' ? '#28a745' : '#dc3545', fontWeight: 600 }}>
                      {admin.status}
                    </span>
                  </div>
                </div>

                <div className="badge-footer" style={{ background: `linear-gradient(135deg, ${color.footer}, ${color.top})` }}>
                  {admin.role}
                </div>
              </div>
            );
          })}
        </div>

        {cropModal.show && (
          <CropModal
            imageSrc={cropModal.imageSrc}
            onCrop={handleCropDone}
            onCancel={() => setCropModal({ show: false, imageSrc: null, adminId: null })}
          />
        )}

        <style>{`
          /* ── Cards ── */
          .id-cards-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 36px;
            justify-content: center;
            padding: 24px 16px 40px;
          }
          .id-badge {
            position: relative;
            width: 290px;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            overflow: visible;
            display: flex;
            flex-direction: column;
          }
          .badge-top {
            border-radius: 20px 20px 0 0;
            padding: 32px 20px 54px;
            text-align: center;
          }
          .badge-logo-wrap {
            width: 52px; height: 52px;
            background: rgba(255,255,255,0.25);
            border-radius: 50%;
            margin: 0 auto 8px;
            display: flex; align-items: center; justify-content: center;
          }
          .badge-logo { width: 32px; height: 32px; object-fit: contain; filter: brightness(0) invert(1); }
          .badge-company { color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }
          .badge-avatar-wrap { position: relative; height: 0; z-index: 5; }
          .badge-avatar {
            position: absolute; top: -52px; left: 50%; transform: translateX(-50%);
            width: 96px; height: 96px; border-radius: 50%;
            background: #f0f0f0; display: flex; align-items: center; justify-content: center;
            font-size: 34px; font-weight: 700; color: #444;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15); overflow: hidden; cursor: pointer;
          }
          .badge-photo { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
          .badge-upload-overlay {
            position: absolute; inset: 0; border-radius: 50%;
            background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;
            font-size: 26px; opacity: 0; cursor: pointer; transition: opacity 0.2s;
          }
          .badge-avatar:hover .badge-upload-overlay { opacity: 1; }
          .badge-body { padding: 68px 24px 28px; text-align: center; flex: 1; }
          .badge-name { font-size: 16px; font-weight: 800; color: #1a1a2e; margin-bottom: 16px; letter-spacing: 0.5px; }
          .badge-info-row { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: #555; margin-bottom: 8px; font-weight: 500; }
          .badge-email { word-break: break-all; font-size: 12px; }
          .badge-footer { border-radius: 0 0 20px 20px; padding: 16px 20px; text-align: center; color: #fff; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }

          /* ── Crop Modal ── */
          .crop-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            display: flex; align-items: center; justify-content: center; z-index: 9999;
          }
          .crop-modal {
            background: #1e1e2e; border-radius: 16px; width: 90%; max-width: 520px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5); overflow: hidden;
            display: flex; flex-direction: column; max-height: 92vh;
          }
          .crop-modal-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 20px; background: #2a2a3e; color: #fff; font-weight: 700; font-size: 15px;
          }
          .crop-close-btn { background: none; border: none; color: #aaa; font-size: 18px; cursor: pointer; line-height: 1; }
          .crop-close-btn:hover { color: #fff; }
          .crop-image-outer {
            background: #111; display: flex; justify-content: center; align-items: flex-start;
            overflow: hidden; flex: 1 1 auto; min-height: 0;
          }
          .crop-image-container {
            position: relative; display: inline-block;
            cursor: grab; line-height: 0;
          }
          .crop-image-container:active { cursor: grabbing; }
          .crop-preview-img {
            display: block; max-width: 100%; width: auto; height: auto;
            max-height: calc(90vh - 170px); user-select: none;
          }
          .crop-svg-overlay { position: absolute; inset: 0; pointer-events: none; }
          .crop-hint { text-align: center; color: #888; font-size: 12px; padding: 8px 0 4px; }
          .crop-controls { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px 18px; gap: 12px; }
          .crop-resize-btns { display: flex; align-items: center; gap: 10px; }
          .crop-resize-btn {
            width: 32px; height: 32px; border-radius: 50%; border: none;
            background: #3a3a5e; color: #fff; font-size: 18px; font-weight: 700;
            cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;
          }
          .crop-resize-btn:hover { background: #5a5a9e; }
          .crop-resize-label { color: #aaa; font-size: 13px; }
          .crop-action-btns { display: flex; gap: 10px; }
          .crop-cancel-btn {
            padding: 8px 18px; border-radius: 8px; border: 1px solid #555;
            background: transparent; color: #aaa; cursor: pointer; font-size: 13px;
          }
          .crop-cancel-btn:hover { background: #2a2a3e; color: #fff; }
          .crop-save-btn {
            padding: 8px 20px; border-radius: 8px; border: none;
            background: linear-gradient(135deg, #00B4D8, #0077B6);
            color: #fff; cursor: pointer; font-size: 13px; font-weight: 700;
          }
          .crop-save-btn:hover { opacity: 0.9; }
        `}</style>
      </div>
    </div>
  );
};

export default RolesPermissions;
