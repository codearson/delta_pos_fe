import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { getUserByEmail } from "../Api/config";

/* ─── Crop Modal (same as Admin Details) ─────────────────── */
function CropModal({ imageSrc, onCrop, onCancel }) {
  const imgRef       = useRef(null);
  const containerRef = useRef(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop]       = useState({ x: 0, y: 0, r: 80 });
  const dragRef = useRef(null);

  const onImgLoad = () => {
    const el = imgRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setImgSize({ w, h });
    setCrop({ x: w / 2, y: h / 2, r: Math.min(w, h) * 0.35 });
  };

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

  const resize = (delta) => {
    setCrop(c => ({
      ...c,
      r: Math.max(40, Math.min(Math.min(imgSize.w, imgSize.h) / 2 - 4, c.r + delta)),
    }));
  };

  const applyCrop = () => {
    const img = imgRef.current;
    const scaleX = img.naturalWidth  / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;
    const out = 300;
    const canvas = document.createElement("canvas");
    canvas.width  = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
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
    onCrop(canvas.toDataURL("image/jpeg", 0.92));
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
              <svg className="crop-svg-overlay" width={svgW} height={svgH}>
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

CropModal.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  onCrop:   PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

/* ─── Field ──────────────────────────────────────────────── */
const Field = ({ label, value }) => (
  <div className="col-lg-6 col-sm-12 mb-3">
    <label className="form-label text-muted" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {label}
    </label>
    <div className="form-control" style={{ background: "#f8f9fa", color: "#333", fontWeight: 500 }}>
      {value}
    </div>
  </div>
);

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

/* ─── Profile Page ───────────────────────────────────────── */
const Profile = () => {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [photo, setPhoto]         = useState(null);
  const [cropModal, setCropModal] = useState({ show: false, imageSrc: null });
  const fileInputRef = useRef(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Load saved photo
    if (userId) {
      const saved = localStorage.getItem(`adminPhoto_${userId}`);
      if (saved) setPhoto(saved);
    }

    // Fetch user details
    const email = localStorage.getItem("email");
    if (!email) { setLoading(false); return; }
    getUserByEmail(email)
      .then((data) => { if (data) setUser(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const firstName   = user?.firstName      || localStorage.getItem("firstName")      || "—";
  const lastName    = user?.lastName       || localStorage.getItem("lastName")       || "—";
  const email       = user?.emailAddress   || localStorage.getItem("email")          || "—";
  const role        = user?.userRoleDto?.userRole || localStorage.getItem("userRole") || "—";
  const branchName  = user?.branchDto?.branchName     || localStorage.getItem("branchName")    || "—";
  const branchCode  = user?.branchDto?.branchCode     || localStorage.getItem("branchCode")    || "—";
  const branchAddr  = user?.branchDto?.address        || localStorage.getItem("branchAddress") || "—";
  const branchPhone = user?.branchDto?.contactNumber  || localStorage.getItem("branchContact") || "—";
  const shopName    = user?.branchDto?.shopDetailsDto?.name || localStorage.getItem("shopName") || "—";

  const initials  = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const roleColors = { ADMIN: "#9D00FF", MANAGER: "#28C76F", USER: "#EDC001" };
  const roleColor  = roleColors[role] || "#6c757d";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1800;
        if (img.naturalWidth <= MAX_DIM && img.naturalHeight <= MAX_DIM) {
          setCropModal({ show: true, imageSrc: ev.target.result });
        } else {
          const scale = MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight);
          const w = Math.round(img.naturalWidth * scale);
          const h = Math.round(img.naturalHeight * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, w, h);
          setCropModal({ show: true, imageSrc: canvas.toDataURL("image/png") });
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCropDone = (base64) => {
    localStorage.setItem(`adminPhoto_${userId}`, base64);
    setPhoto(base64);
    setCropModal({ show: false, imageSrc: null });
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Profile</h4>
            <h6>Logged-in User Details</h6>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <div className="card">
            <div className="card-body">

              {/* Avatar + name header */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: "1px solid #eee" }}>
                {/* Clickable photo / initials */}
                <div
                  style={{ position: "relative", width: 80, height: 80, flexShrink: 0, cursor: "pointer" }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to change photo"
                >
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: roleColor, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 700,
                    overflow: "hidden", border: `3px solid ${roleColor}`
                  }}>
                    {photo
                      ? <img src={photo} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : initials
                    }
                  </div>
                  {/* Camera overlay */}
                  <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    background: "#fff", borderRadius: "50%",
                    width: 26, height: 26, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.25)", fontSize: 14
                  }}>
                    📷
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                <div>
                  <h5 className="mb-1" style={{ fontWeight: 700 }}>{firstName} {lastName}</h5>
                  <span style={{
                    background: roleColor, color: "#fff",
                    borderRadius: 20, padding: "3px 14px",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.5px"
                  }}>
                    {role}
                  </span>
                </div>
              </div>

              {/* Personal info */}
              <h6 className="mb-3" style={{ fontWeight: 700, color: "#555" }}>Personal Information</h6>
              <div className="row">
                <Field label="First Name" value={firstName} />
                <Field label="Last Name"  value={lastName}  />
                <Field label="Email"      value={email}     />
                <Field label="Role"       value={role}      />
              </div>

              {/* Branch info */}
              <h6 className="mt-2 mb-3" style={{ fontWeight: 700, color: "#555" }}>Branch Information</h6>
              <div className="row">
                <Field label="Shop Name"      value={shopName}    />
                <Field label="Branch Name"    value={branchName}  />
                <Field label="Branch Code"    value={branchCode}  />
                <Field label="Branch Address" value={branchAddr}  />
                <Field label="Branch Contact" value={branchPhone} />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Crop modal */}
      {cropModal.show && (
        <CropModal
          imageSrc={cropModal.imageSrc}
          onCrop={handleCropDone}
          onCancel={() => setCropModal({ show: false, imageSrc: null })}
        />
      )}
    </div>
  );
};

export default Profile;
