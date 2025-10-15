import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, Download, RotateCcw, Printer, Play } from 'lucide-react';

export default function PhotoboxTwinsFast() {
  const [step, setStep] = useState('start');
  const [currentPose, setCurrentPose] = useState(1);
  const [photos, setPhotos] = useState([null, null, null, null]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [filter, setFilter] = useState('none'); 
  const [retakeIndex, setRetakeIndex] = useState(null);

  const webcamRef = useRef(null);
  const audioRef = useRef(null);

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

  const startCamera = () => setStep('capture');

  // Ambil foto
  const capturePhoto = () => {
    if (!webcamRef.current) {
      alert('Kamera belum siap 😅');
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert('Gagal mengambil foto 😭');
      return;
    }

    const updated = [...photos];
    updated[currentPose - 1] = imageSrc;
    setPhotos(updated);
    setStep('preview');
  };

    // 📸 Capture khusus untuk retake dari halaman final
  const captureRetake = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert('Gagal ambil ulang 😭');
      return;
    }
    const updated = [...photos];
    updated[retakeIndex] = imageSrc;
    setPhotos(updated);
    setRetakeIndex(null);
    setStep('final'); // langsung balik ke halaman final
  };

  const nextPose = () => {
    if (currentPose < 4) setCurrentPose(currentPose + 1), setStep('capture');
    else setStep('final');
  };

   const retakePhoto = (poseIndex = null) => {
    if (poseIndex !== null) {
      // kalau dari final page
      setRetakeIndex(poseIndex);
      setStep('retake'); // mode khusus retake satu foto
    } else {
      // kalau dari preview
      setStep('capture');
    }
  };


  // Download hasil
  // Download hasil (versi proporsional 4R)
const downloadResult = async () => {
  const finalCanvas = document.createElement('canvas');
  const ctx = finalCanvas.getContext('2d');
  finalCanvas.width = 1200; // ukuran 4R
  finalCanvas.height = 1800;

  // Latar putih lembut
  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  // Ukuran foto dalam frame (lebih penuh)
  const frameWidth = 520;
  const frameHeight = 390;
  const gapY = 20; // jarak antar baris
  const xGap = 40; // jarak antar kolom

  // Margin atas & samping
  const totalHeight = frameHeight * 4 + gapY * 3;
  const marginTop = (finalCanvas.height - totalHeight) / 2 - 20;
  const marginSide = (finalCanvas.width - (frameWidth * 2 + xGap)) / 2;

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

    const y = marginTop + i * (frameHeight + gapY);

    // Gambar kiri (foto user)
    ctx.drawImage(userImg, marginSide, y, frameWidth, frameHeight);

    // Gambar kanan (foto monyet)
    ctx.drawImage(monkeyImg, marginSide + frameWidth + xGap, y, frameWidth, frameHeight);
  }

  // Teks bawah elegan
  ctx.fillStyle = '#000';
  ctx.font = 'italic 36px "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText('Made with ❤️ by Dinda', finalCanvas.width / 2, finalCanvas.height - 40);

  // Download hasil
  finalCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photobox-twins-dinda.png';
    a.click();
  });
};


  const printResult = () => window.print();
  const restart = () => {
    setPhotos([null, null, null, null]);
    setCurrentPose(1);
    setStep('start');
  };

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  // 🎨 Fungsi style filter
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-green-50 to-pink-50 p-6 flex flex-col items-center">
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

      {/* Start screen */}
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

      {/* Capture */}
      {step === 'capture' && (
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6">
          <div className="text-center mb-4">
            <span className="bg-pink-400 text-white px-6 py-2 rounded-full text-xl font-bold">
              Pose {currentPose} / 4
            </span>
          </div>

          {/* Filter Buttons */}
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Webcam dengan filter */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <Webcam
                ref={webcamRef}
                mirrored
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={videoConstraints}
                className="rounded-2xl w-full h-full object-cover"
                style={{ filter: getFilterStyle(filter) }}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-lg"
                >
                  <Camera size={32} />
                </button>
              </div>
            </div>

            {/* Pose monyet */}
            <div className="bg-gradient-to-br from-green-200 to-green-100 rounded-2xl flex items-center justify-center aspect-[4/3] overflow-hidden">
              <img
                src={monkeyPoses[currentPose - 1]}
                alt="Monkey pose"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

       {/* Retake Mode */}
      {step === 'retake' && (
  <div className="max-w-4xl bg-white rounded-3xl shadow-2xl p-6 text-center">
    <h2 className="text-3xl font-bold text-green-700 mb-6">
      Ulangi Pose {retakeIndex + 1}
    </h2>

    <div className="grid grid-cols-2 gap-4 items-center justify-center">
      {/* Webcam (kiri) */}
      <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
        <Webcam
          ref={webcamRef}
          mirrored
          audio={false}
          screenshotFormat="image/png"
          videoConstraints={videoConstraints}
          className="rounded-2xl w-full h-full object-cover"
          style={{ filter: getFilterStyle(filter) }}
        />
      </div>

      {/* Foto monyet (kanan) */}
      <div className="relative bg-gray-200 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
        <img
          src={monkeyPoses[retakeIndex]}
          alt="Monkey Pose"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>

    {/* Tombol capture */}
    <button
      onClick={captureRetake}
      className="mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 mx-auto shadow-lg transition"
    >
      <Camera size={28} />
      Ambil Ulang Foto
    </button>
  </div>
)}


      {/* Preview */}
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

      {/* Final */}
      {step === 'final' && (
        <div className="max-w-4xl bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold text-center text-green-700 mb-6">
            Twins Complete!
          </h2>
          <div className="grid grid-cols-1 gap-4 mb-8" id="photobox-result">
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
              onClick={downloadResult}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
            >
              <Download size={20} />
              Download
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

      <div className="text-center mt-8 text-gray-600">
        <p className="font-medium">Made with ❤️ by Dinda</p>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #photobox-result,
          #photobox-result * {
            visibility: visible;
          }
          #photobox-result {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
