import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, RotateCcw, Printer, Play } from 'lucide-react';

export default function PhotoboxTwinsFast() {
  const [step, setStep] = useState('start');
  const [currentPose, setCurrentPose] = useState(1);
  const [photos, setPhotos] = useState([null, null, null, null]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [filter, setFilter] = useState('none'); 
  const [retakeIndex, setRetakeIndex] = useState(null);
  const [countdown, setCountdown] = useState(null);


  const webcamRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const [webcamReady, setWebcamReady] = useState(false);
useEffect(() => {
  if (step === 'capture' || step === 'retake') {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setWebcamReady(true);
      } catch (err) {
        alert('Tidak bisa akses kamera 😭');
      }
    }
    initCamera();
  }
}, [step, currentPose]);



  const monkeyPoses = [
    '/monyet1.jpeg',
    '/monyet2.jpeg',
    '/monyet3.jpeg',
    '/monyet4.jpeg',
  ];

  // Musik
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsMusicPlaying(!isMusicPlaying);
  };

  const startCamera = async () => {
  setStep('capture');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user', width: 640, height: 480 },
      audio: false 
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play(); // pastikan autoplay jalan
    }
    setWebcamReady(true); // sekarang bisa render video
  } catch (err) {
    alert('Tidak bisa akses kamera ');
  }
};


  // Ambil foto
const capturePhoto = () => {
  if (!videoRef.current || videoRef.current.videoWidth === 0) {
    alert("Kamera belum siap 😭");
    return;
  }

  // Mulai countdown 3 detik
  let count = 3;
  setCountdown(count);

  const timer = setInterval(() => {
    count -= 1;
    if (count > 0) {
      setCountdown(count);
    } else {
      clearInterval(timer);
      setCountdown(null);

      // Ambil foto setelah countdown selesai
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageSrc = canvas.toDataURL('image/png');
      const updated = [...photos];
      updated[currentPose - 1] = imageSrc;
      setPhotos(updated);
      setStep('preview');
    }
  }, 1000);
};



  // Capture khusus untuk retake dari halaman final
  const captureRetake = () => {
  const video = videoRef.current;
  if (!video || video.videoWidth === 0) {
    alert("Kamera belum siap 😭");
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageSrc = canvas.toDataURL('image/png');
  const updated = [...photos];
  updated[retakeIndex] = imageSrc;
  setPhotos(updated);
  setRetakeIndex(null);
  setStep('final');
};


  const nextPose = () => {
    if (currentPose < 4) {
      setCurrentPose(currentPose + 1);
      setStep('capture');
    } else {
      setStep('final');
    }
  };

  const retakePhoto = (poseIndex = null) => {
    if (poseIndex !== null) {
      setRetakeIndex(poseIndex);
      setStep('retake');
    } else {
      setStep('capture');
    }
  };

const downloadInstagram = async () => {
  const finalCanvas = document.createElement('canvas');
  const ctx = finalCanvas.getContext('2d');

  finalCanvas.width = 1080;
  finalCanvas.height = 1920;

  const cols = 2; // user kiri, monyet kanan
  const rows = 4;
  const cellW = finalCanvas.width / cols; // 540
  const cellH = finalCanvas.height / rows; // 480

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  // ✅ drawCoverImage versi baru di atas
  const drawCoverImage = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sx, sy, sWidth, sHeight;

    if (imgRatio > boxRatio) {
      sHeight = img.height;
      sWidth = img.height * boxRatio;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = img.width / boxRatio;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  };

  // ✅ Looping semua baris 4x
  for (let i = 0; i < 4; i++) {
    if (!photos[i]) continue;

    const userImg = new Image();
    const monkeyImg = new Image();
    userImg.src = photos[i];
    monkeyImg.src = monkeyPoses[i];

    await Promise.all([
      new Promise((res) => (userImg.onload = res)),
      new Promise((res) => (monkeyImg.onload = res)),
    ]);

    const y = i * cellH;
    const xUser = 0;
    const xMonkey = cellW;

    // ✅ gambar kiri & kanan dengan cover
    drawCoverImage(ctx, userImg, xUser, y, cellW, cellH);
    drawCoverImage(ctx, monkeyImg, xMonkey, y, cellW, cellH);
  }

  finalCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'twins-instagram-story.png';
    a.click();
  });
};

// Download untuk Photobox (dengan separator, format 4R)
// Download untuk Photobox (format 4R)
const downloadPhotobox = async () => {
  const finalCanvas = document.createElement('canvas');
  const ctx = finalCanvas.getContext('2d');

  const photoW = 540;
  const photoH = 405;
  const gapX = 50;
  const gapY = 50;
  const bottomMargin = 90;

  finalCanvas.width = 2 * photoW + 3 * gapX;
  finalCanvas.height = photos.length * photoH + (photos.length + 1) * gapY + bottomMargin;

  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  // fungsi bantu crop gambar biar pas
  const drawCoverImage = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sx, sy, sWidth, sHeight;

    if (imgRatio > boxRatio) {
      sHeight = img.height;
      sWidth = img.height * boxRatio;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = img.width / boxRatio;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  };

  // loop semua pose (4 foto)
  for (let i = 0; i < photos.length; i++) {
    if (!photos[i]) continue;

    const userImg = new Image();
    const monkeyImg = new Image();
    userImg.src = photos[i];
    monkeyImg.src = monkeyPoses[i];

    await Promise.all([
      new Promise((res) => (userImg.onload = res)),
      new Promise((res) => (monkeyImg.onload = res)),
    ]);

    const y = gapY + i * (photoH + gapY);
    const x1 = gapX;
    const x2 = x1 + photoW + gapX;

    // gambar kiri (user)
    drawCoverImage(ctx, userImg, x1, y, photoW, photoH);

    // gambar kanan (monyet) – crop 10% bagian bawah
    const cropH = monkeyImg.height * 0.9;
    ctx.drawImage(
      monkeyImg,
      0,
      0,
      monkeyImg.width,
      cropH,
      x2,
      y,
      photoW,
      photoH
    );
  }

  // teks bawah
  ctx.fillStyle = '#333';
  ctx.font = 'italic 42px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Made with ❤️ by Dinda', finalCanvas.width / 2, finalCanvas.height - 40);

  // download
  finalCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'twins-photobox-4r.png';
    a.click();
  });
};
  // Print langsung format 4R
  const printResult = async () => {
    const printCanvas = document.createElement('canvas');
    const ctx = printCanvas.getContext('2d');
    
    printCanvas.width = 1200;
    printCanvas.height = 1800;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);

   const photoW = 540;
    const photoH = 405;
    const gapX = 30;
    const gapY = 30;
    const marginTop = 50;
    const bottomMargin = 120; // untuk teks

    for (let i = 0; i < photos.length; i++) {
      if (!photos[i]) continue;

      const userImg = new Image();
      const monkeyImg = new Image();
      userImg.src = photos[i];
      monkeyImg.src = monkeyPoses[i];

      await Promise.all([
        new Promise((res) => (userImg.onload = res)),
        new Promise((res) => (monkeyImg.onload = res)),
      ]);

      const y = marginTop + i * (photoH + gapY);
      const x1 = 30;
      const x2 = x1 + photoW + gapX;

      const userScale = Math.max(photoW / userImg.width, photoH / userImg.height);
      const userScaledW = userImg.width * userScale;
      const userScaledH = userImg.height * userScale;
      const userOffsetX = (photoW - userScaledW) / 2;
      const userOffsetY = (photoH - userScaledH) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(x1, y, photoW, photoH);
      ctx.clip();
      ctx.drawImage(userImg, x1 + userOffsetX, y + userOffsetY, userScaledW, userScaledH);
      ctx.restore();

      const monkeyScale = Math.max(photoW / monkeyImg.width, photoH / monkeyImg.height);
      const monkeyScaledW = monkeyImg.width * monkeyScale;
      const monkeyScaledH = monkeyImg.height * monkeyScale;
      const monkeyOffsetX = (photoW - monkeyScaledW) / 2;
      const monkeyOffsetY = (photoH - monkeyScaledH) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(x2, y, photoW, photoH);
      ctx.clip();
      ctx.drawImage(monkeyImg, x2 + monkeyOffsetX, y + monkeyOffsetY, monkeyScaledW, monkeyScaledH);
      ctx.restore();
    }

    const dataUrl = printCanvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photobox</title>
          <style>
            @page { size: 4in 6in; margin: 0; }
            body { margin: 0; padding: 0; }
            img { width: 100%; height: 100%; display: block; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const restart = () => {
    setPhotos([null, null, null, null]);
    setCurrentPose(1);
    setStep('start');
  };

  const getFilterStyle = (filterName) => {
    switch (filterName) {
      case 'Bantul':
        return 'contrast(1.2) brightness(1.1) saturate(1.3)';
      case 'Gunkid':
        return 'hue-rotate(20deg) contrast(1.1) brightness(1.05)';
      case 'Jakarta':
        return 'sepia(0.3) contrast(1.2)';
      case 'Sleman':
        return 'grayscale(0.2) brightness(1.1) saturate(1.2)';
      default:
        return 'none';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-green-50 to-pink-50 p-4 md:p-6 flex flex-col items-center w-full overflow-x-hidden">
      <audio ref={audioRef} loop>
        <source src="/You Da One.mp3" type="audio/mpeg" />
      </audio>

      <div className="max-w-4xl text-center mb-6">
        <h1 className="text-5xl font-bold text-green-700 mb-2 drop-shadow-sm">
          Photobox Twins
        </h1>
        <p className="text-lg text-pink-600 font-medium">
          Be twins with a monkey
        </p>
        <button
          onClick={toggleMusic}
          className="mt-4 bg-pink-400 text-white px-6 py-2 rounded-full hover:bg-pink-500 transition flex items-center gap-2 mx-auto"
        >
          <Play size={20} />
          {isMusicPlaying ? 'Pause Music' : 'Play Music'}
        </button>
      </div>

      {step === 'start' && (
        <div className="max-w-2xl bg-white rounded-3xl shadow-xl p-8 text-center">
          <img
            src="/monyet2.jpeg"
            alt="Monkey"
            className="w-48 h-48 object-cover rounded-full mx-auto border-4 border-pink-300 mb-6"
          />
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Ready to be my twins?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Lesgo take foto tercihuy sama kembaranmu!
          </p>
          <button
            onClick={startCamera}
            className="bg-gradient-to-r from-green-400 to-pink-400 text-white px-12 py-4 rounded-full text-xl font-bold hover:shadow-lg transition transform hover:scale-105"
          >
            <Camera className="inline mr-2" size={28} />
            Mulai Foto!
          </button>
        </div>
      )}

      {step === 'capture' && (
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6">
          <div className="text-center mb-4">
            <span className="bg-pink-400 text-white px-6 py-2 rounded-full text-xl font-bold">
              Pose {currentPose} / 4
            </span>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {['none', 'Bantul', 'Gunkid', 'Jakarta', 'Sleman'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-white font-semibold transition ${
                  filter === f ? 'bg-pink-500' : 'bg-gray-400'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
          {/* Kamera */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-[4/3] w-full md:w-1/2 flex items-center justify-center">
            {webcamReady ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl"
                style={{ filter: getFilterStyle(filter), transform: 'scaleX(-1)' }}
              />
            ) : (
              <p className="text-white font-bold text-center">Kamera sedang menyiapkan...</p>
            )}

            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-[8rem] font-extrabold drop-shadow-lg animate-pulse">
                  {countdown}
                </span>
              </div>
            )}
          </div>


          {/* Gambar Monyet */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-[4/3] w-full md:w-1/2 flex items-center justify-center">
            <img
              src={monkeyPoses[currentPose - 1]}
              alt="Monkey pose"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 🔘 Tombol Kamera baru */}
          <div className="flex justify-center mt-4">
            <button
              onClick={capturePhoto}
              className="bg-gradient-to-r from-green-400 to-pink-400 hover:shadow-lg text-white px-12 py-4 rounded-full text-xl font-bold flex items-center gap-3 transition-transform hover:scale-105"
            >
              <Camera size={28} />
              Ambil Foto
            </button>
          </div>
        </div>
      )}

      {step === 'retake' && (
        <div className="max-w-4xl bg-white rounded-3xl shadow-2xl p-6 text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-6">
            Ulangi Pose {retakeIndex + 1}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-green-50 to-pink-50 p-4 rounded-2xl">
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-2xl w-full h-full object-cover"
                style={{ filter: getFilterStyle(filter), transform: 'scaleX(-1)' }}
              />
            </div>

            <div className="relative bg-gray-200 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <img
                src={monkeyPoses[retakeIndex]}
                alt="Monkey Pose"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <button
            onClick={captureRetake}
            className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 mx-auto shadow-lg transition"
          >
            <Camera size={28} />
            Ambil Ulang Foto
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="max-w-4xl bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
            Gimana hasilnya?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={photos[currentPose - 1]}
                alt="Your photo"
                className="w-full h-full object-cover"
                style={{ filter: getFilterStyle(filter) }}
              />
            </div>
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={monkeyPoses[currentPose - 1]}
                alt="Monkey twin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => retakePhoto()}
              className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Retake
            </button>
            <button
              onClick={nextPose}
              className="bg-gradient-to-r from-green-400 to-pink-400 hover:shadow-lg text-white px-8 py-3 rounded-full font-bold"
            >
              {currentPose < 4 ? 'Next Pose!' : 'Selesai!'}
            </button>
          </div>
        </div>
      )}

      {step === 'final' && (
        <div className="max-w-4xl bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold text-center text-green-700 mb-6">
            Twins Complete!
          </h2>
          <div className="grid grid-cols-1 gap-4 mb-8">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 bg-gradient-to-r from-green-50 to-pink-50 p-4 rounded-2xl"
              >
                <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow-lg relative group flex items-center justify-center">
                  <img
                    src={photo}
                    alt={`Pose ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ filter: getFilterStyle(filter) }}
                  />
                  <button
                    onClick={() => retakePhoto(index)}
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <RotateCcw className="text-white" size={32} />
                  </button>
                </div>

                <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                  <img
                    src={monkeyPoses[index]}
                    alt="Monkey twin"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={downloadInstagram}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
            >
              <Download size={20} />
              Instagram
            </button>
            <button
                onClick={downloadPhotobox}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
              >
                <Download size={20} />
                Photobox 4R
              </button>

            <button
              onClick={printResult}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
            >
              <Printer size={20} />
              Print
            </button>
            <button
              onClick={restart}
              className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Mulai Lagi
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-8 text-gray-800">
        <p className="font-medium">Made with ❤️ by Dinda</p>
      </div>

      <style jsx>{`
        video, img {
          object-fit: cover;
        }

        /* biar sejajar di semua device */
        @media (max-width: 768px) {
          .aspect-[4/3] {
            aspect-ratio: auto;
            height: auto;
          }
        }

        @media (min-width: 768px) {
          .aspect-[4/3] {
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}