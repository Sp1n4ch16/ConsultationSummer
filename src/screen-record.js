let mediaRecorder;
let recordedBlobs = [];
let isRecording = false;

const errorMsgElement = document.querySelector("span#errorMsg");
const recordedVideo = document.querySelector("video#recorded");
const recordButton = document.querySelector("button#record");
const playButton = document.querySelector("button#play");
const downloadButton = document.querySelector("button#download");

document.querySelector("button#start").addEventListener("click", async function () {
  const hasEchoCancellation = document.querySelector("#echoCancellation").checked;
  const constraints = {
    audio: {
      echoCancellation: hasEchoCancellation,
    },
    video: true, // Use true to capture the entire screen
  };
  
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    handleSuccess(stream);
  } catch (err) {
    console.error("Error accessing media devices:", err);
    errorMsgElement.textContent =
      "Error accessing media devices. Please check your screen sharing permissions.";
  }
});

function handleSuccess(stream) {
  recordButton.disabled = false;
  playButton.disabled = true;
  downloadButton.disabled = true;

  window.stream = stream;
  const gumVideo = document.querySelector("video#gum");
  gumVideo.srcObject = stream;

  // Set controls to true when stream is available
  recordedVideo.controls = true;
}

recordButton.addEventListener("click", () => {
    if (!isRecording) {
        startRecording();
        recordButton.textContent = "Stop Recording";
        playButton.disabled = true;
        downloadButton.disabled = true;
    } else {
        stopRecording();
        recordButton.textContent = "Record";
        playButton.disabled = false;
        downloadButton.disabled = false;
    }
    isRecording = !isRecording;
});

function startRecording() {
    console.log("Start Recording");
    recordedBlobs = [];

    let options = {
        mimeType: "video/webm;codecs=vp9,opus",
    };

    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (error) {
        console.error("Error creating MediaRecorder:", error);
        errorMsgElement.textContent = "Error creating MediaRecorder. Please use a modern browser that supports the MediaRecorder API.";
        return;
    }

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = () => {
        console.log("Recording is stopped");
    };

    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

playButton.addEventListener("click", () => {
    const superBuffer = new Blob(recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(superBuffer);
    recordedVideo.src = url;
    recordedVideo.play();

    // Play the recorded audio
    const audioBlob = new Blob(recordedBlobs, { type: "audio/webm" });
    const audioUrl = window.URL.createObjectURL(audioBlob);
    const recordedAudio = document.getElementById("recordedAudio");
    recordedAudio.src = audioUrl;
    recordedAudio.play();
});


downloadButton.addEventListener("click", () => {
    try {
        const blob = new Blob(recordedBlobs, { type: "video/webm" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url; // Set the 'href' attribute instead of 'download'
        a.download = "test.webm"; // Use the correct extension
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        console.log("Download successful");
    } catch (error) {
        console.log(error);
    }
});