import React, { useState, useEffect, useRef } from 'react';

export default function ImageConverter() {
  const [loading, setLoading] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [fileName, setFileName] = useState('converted-image');
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [size, setSize] = useState('800');
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (uploadedImage) {
      drawImage();
    }
  }, [uploadedImage, size, format]);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file!');
      return;
    }

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setUploadedImage(img);
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const drawImage = () => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let targetWidth, targetHeight;
    
    if (size === 'original') {
      targetWidth = originalWidth;
      targetHeight = originalHeight;
    } else {
      const sizeNum = parseInt(size);
      const aspectRatio = originalWidth / originalHeight;
      
      if (originalWidth > originalHeight) {
        targetWidth = sizeNum;
        targetHeight = sizeNum / aspectRatio;
      } else {
        targetHeight = sizeNum;
        targetWidth = sizeNum * aspectRatio;
      }
    }
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(uploadedImage, 0, 0, targetWidth, targetHeight);
  };

  const downloadImage = () => {
    if (!uploadedImage) {
      alert('Please upload an image first!');
      return;
    }
    
    const canvas = canvasRef.current;
    const qualityValue = quality / 100;
    
    const mimeTypes = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      bmp: 'image/bmp'
    };
    
    const extensions = {
      png: 'png',
      jpeg: 'jpg',
      webp: 'webp',
      bmp: 'bmp'
    };
    
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to convert image. Please try another format.');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${fileName}.${extensions[format]}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, mimeTypes[format], qualityValue);
  };

  const resetConverter = () => {
    setUploadedImage(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setFileName('converted-image');
    setSize('800');
    setFormat('png');
    setQuality(90);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        #loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        
        #loader.hidden {
          opacity: 0;
          visibility: hidden;
        }
        
        .loader-content {
          text-align: center;
        }
        
        .loader-spinner {
          width: 80px;
          height: 80px;
          border: 8px solid rgba(255, 255, 255, 0.3);
          border-top: 8px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 30px;
        }
        
        .loader-logo {
          font-size: 48px;
          margin-bottom: 20px;
          animation: bounce 1s ease-in-out infinite;
        }
        
        .loader-text {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .loader-subtext {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        #mainContent {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        #mainContent.visible {
          opacity: 1;
        }
        
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: transparent;
          padding: 20px;
          position: relative;
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%),
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px);
          z-index: -1;
          backdrop-filter: blur(10px);
        }
        
        .container {
          background: white;
          padding:20px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 600px;
        }
        
        h1 {
          color: #0077BE;
          margin-bottom: 10px;
        }
        
        p {
          color: #666;
          margin-bottom: 30px;
        }
        
        #logoCanvas {
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          margin: 20px 0;
          max-width: 100%;
        }
        
        .button-group {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        
        button {
          background: linear-gradient(135deg, #0077BE, #005A8D);
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: bold;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,119,190,0.3);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        .size-selector {
          margin: 20px 0;
        }
        
        .format-selector {
          margin: 20px 0;
        }
        
        select {
          padding: 10px 20px;
          border: 2px solid #0077BE;
          border-radius: 8px;
          font-size: 16px;
          color: #333;
          background: white;
          cursor: pointer;
        }
        
        input[type="range"] {
          cursor: pointer;
          accent-color: #0077BE;
        }
        
        .info {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          color: #0077BE;
          font-size: 14px;
        }
        
        .upload-section {
          margin: 20px 0;
        }
        
        .upload-box {
          border: 3px dashed #0077BE;
          border-radius: 15px;
          padding: 40px 20px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
          background: #f8f9ff;
        }
        
        .upload-box:hover {
          border-color: #005A8D;
          background: #f0f4ff;
        }
        
        .upload-box.dragover {
          border-color: #C41E3A;
          background: #fff5f7;
          transform: scale(1.02);
        }
        
        .upload-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        
        #previewSection {
          animation: fadeIn 0.5s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {loading && (
        <div id="loader">
          <div className="loader-content">
            <div className="loader-logo">🤖</div>
            <div className="loader-spinner"></div>
            <div className="loader-text">MiahBot Converter</div>
            <div className="loader-subtext">Preparing your image converter...</div>
          </div>
        </div>
      )}

      <div id="mainContent" className={!loading ? 'visible' : ''}>
        <div className="container">
          <h1>🤖 MiahBot Image Converter</h1>
          <p>Convert your images between all formats with ease</p>
          
          {!uploadedImage ? (
            <div className="upload-section">
              <div 
                className={`upload-box ${isDragging ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📁</div>
                <p><strong>Drop your image here</strong></p>
                <p style={{fontSize: '14px', color: '#999'}}>or</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                    style={{ marginTop: '10px' }}
                    >
                    Choose File
                </button>
                <p style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
                  Supports: JPG, JPEG, WebP, GIF, BMP, SVG
                </p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileInput}
                  style={{display: 'none'}}
                />
              </div>
            </div>
          ) : (
            <div id="previewSection">
              <h3>Preview</h3>
              <canvas ref={canvasRef} id="logoCanvas" />
              
              <div className="size-selector">
                <label htmlFor="sizeSelect"><strong>Output Size:</strong></label>
                <select 
                  id="sizeSelect"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="original">Original Size ({originalWidth}x{originalHeight})</option>
                  <option value="400">Small (400x400)</option>
                  <option value="800">Medium (800x800)</option>
                  <option value="1200">Large (1200x1200)</option>
                  <option value="2000">Extra Large (2000x2000)</option>
                </select>
              </div>
              
              <div className="format-selector">
                <label htmlFor="formatSelect"><strong>Convert To:</strong></label>
                <select 
                  id="formatSelect"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                  <option value="bmp">BMP</option>
                </select>
              </div>
              
              {(format === 'jpeg' || format === 'webp') && (
                <div id="qualityControl" style={{margin: '20px 0'}}>
                  <label htmlFor="qualitySlider">
                    <strong>Quality: <span id="qualityValue">{quality}</span>%</strong>
                  </label>
                  <input 
                    type="range" 
                    id="qualitySlider"
                    min="1" 
                    max="100" 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    style={{width: '100%', marginTop: '10px'}}
                  />
                </div>
              )}
              
              <div className="button-group">
                <button onClick={downloadImage}>📥 Download Image</button>
                <button onClick={resetConverter}>🔄 Convert Another</button>
              </div>
            </div>
          )}
          
          <div className="info">
            💡 <strong>Tip:</strong> Choose your desired format and size. PNG for transparency, JPEG for photos, WebP for modern web!
          </div>
        </div>
      </div>
    </>
  );
}