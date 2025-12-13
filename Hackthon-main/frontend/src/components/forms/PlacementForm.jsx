import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import axios from 'axios';

const PlacementForm = () => {
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [packageLPA, setPackageLPA] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [shortlisted, setShortlisted] = useState('');

  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // constants
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const styles = {
    container: { maxWidth: 820, margin: '0 auto', padding: 16 },
    headerTitle: { margin: 0 },
    headerSub: { margin: '6px 0 0', color: '#555' },
    uploadBox: {
      position: 'relative',
      border: '2px dashed #ccc',
      borderRadius: 8,
      padding: 20,
      textAlign: 'center',
      background: '#c8d0d6ff',
      color: '#666',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      minHeight: 110,
      justifyContent: 'center',
    },
    inputBase: {
      width: '100%',
      padding: 8,
      borderRadius: 6,
      border: '1px solid rgba(0,0,0,0.6)',
      color: '#000', // IMPORTANT: visible text
      background: '#fff',
      outline: 'none',
      boxSizing: 'border-box',
    },
    smallGray: { fontSize: '0.8rem', color: '#999' },
    removeBtn: {
      position: 'absolute',
      top: -10,
      right: -10,
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    submitBtn: {
      padding: '10px 16px',
      borderRadius: 8,
      border: 'none',
      background: '#4f46e5',
      color: '#fff',
      cursor: 'pointer',
    },
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      alert('Please select an image file (png/jpg/gif).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('Image too large — maximum 5MB allowed.');
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const url = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreview(url);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    // clear underlying file input if needed
    const input = document.getElementById('imageUpload');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      alert('Company name is required');
      return;
    }

    const formData = new FormData();
    formData.append('companyName', companyName.trim());
    if (packageLPA) formData.append('packageLPA', packageLPA.trim());
    if (role) formData.append('role', role.trim());
    if (description) formData.append('description', description.trim());
    if (shortlisted) formData.append('shortlisted', shortlisted.trim());
    if (selectedImage) formData.append('companyLogo', selectedImage);

    try {
      setUploading(true);
      setProgress(0);

      const resp = await axios.post('https://hacker01.onrender.com/api/placements', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      setUploading(false);
      setProgress(0);

      // reset form
      setCompanyName('');
      setPackageLPA('');
      setRole('');
      setDescription('');
      setShortlisted('');
      removeImage();

      if (resp?.data?.placement) {
        alert('Placement posted successfully.');
        console.log('Saved placement:', resp.data.placement);
      } else {
        alert('Placement posted (no placement object returned).');
        console.log('Response:', resp.data);
      }
    } catch (err) {
      setUploading(false);
      setProgress(0);
      console.error('Upload error:', err);
      const msg = err?.response?.data?.error || err.message || 'Failed to post placement';
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="admin-form fade-in" style={styles.container}>
      <div className="form-header" style={{ marginBottom: 16 }}>
        <h3 style={styles.headerTitle}>Placement Drive Updates</h3>
        <p style={styles.headerSub}>Post new job opportunities or shortlisted student lists.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* --- Image Upload --- */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Company Logo / Job Poster (Optional)</label>

          {!imagePreview ? (
            <div
              className="upload-box-container"
              style={styles.uploadBox}
              onClick={() => document.getElementById('imageUpload')?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') document.getElementById('imageUpload')?.click();
              }}
            >
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
                aria-label="Upload company logo or job poster"
              />
              <Upload size={24} />
              <span>Click or drag to upload an image</span>
              <small style={styles.smallGray}>PNG, JPG up to 5MB</small>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block', marginTop: 10 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove selected image"
                style={styles.removeBtn}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="form-row" style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Company Name</label>
            <input
              type="text"
              placeholder="e.g. TCS, Wipro, Accenture"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              name="companyName"
              required
              style={styles.inputBase}
            />
          </div>

          <div className="form-group" style={{ width: 160 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Package (LPA)</label>
            <input
              type="text"
              placeholder="e.g. 4.5 LPA"
              value={packageLPA}
              onChange={(e) => setPackageLPA(e.target.value)}
              name="packageLPA"
              style={styles.inputBase}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Job Role / Profile</label>
          <input
            type="text"
            placeholder="e.g. Graduate Trainee / System Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            name="role"
            style={styles.inputBase}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Job Description & Eligibility</label>
          <textarea
            rows="4"
            placeholder="Enter eligibility criteria (e.g. 60% in B.Tech), skills required, and job location..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            name="description"
            style={{ ...styles.inputBase, resize: 'vertical', minHeight: 90 }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Shortlisted Students (List)</label>
          <textarea
            rows="6"
            placeholder="Paste the Roll Numbers or Names of selected students here..."
            style={{ ...styles.inputBase, fontFamily: 'monospace', fontSize: '0.9rem', minHeight: 120 }}
            value={shortlisted}
            onChange={(e) => setShortlisted(e.target.value)}
            name="shortlisted"
          />
          <small style={{ color: '#666' }}>These students will be notified on their dashboard.</small>
        </div>

        {uploading && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 8, background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: '#4f46e5',
                  transition: 'width 200ms ease',
                }}
              />
            </div>
            <small>{progress}% uploaded</small>
          </div>
        )}

        <button
          className="submit-btn"
          type="submit"
          disabled={uploading}
          style={{ ...styles.submitBtn, opacity: uploading ? 0.7 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? `Posting... (${progress}%)` : 'Post Placement Update'}
        </button>
      </form>
    </div>
  );
};

export default PlacementForm;
