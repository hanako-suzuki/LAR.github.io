// const Module = {
//   onRuntimeInitialized() {
//     const medias = {
//       audio: false,
//       video: {
//         facingMode: 'user'
//       }
//     };
//     const promise = navigator.mediaDevices.getUserMedia(medias);

//     promise.then(successCallback).catch(errorCallback);
//   }
// };

const medias = {
  audio: false,
  video: {
    facingMode: {
      exact: "environment"
    }
  }
};
// const video  = document.getElementById("video");
// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");
// const promise = navigator.mediaDevices.getUserMedia(medias);
// // test

function successCallback(stream) {
  const video = document.getElementById('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const imgLength = 2;
  const videoMatList = [];
  const blackAndWhiteMatList = [];
  const FPS = 30;
  const diffMat = new cv.Mat(height, width, cv.CV_8UC1);

  video.oncanplay = () => {
    const width = video.clientWidth/4; // 適当にリサイズ
    const height = video.clientHeight/4; // 適当にリサイズ

    for (let i = 0; i < imgLength; ++i) {
      videoMatList.push(new cv.Mat(height, width, cv.CV_8UC4));
      blackAndWhiteMatList.push(new cv.Mat(height, width, cv.CV_8UC1));
    }

    canvasList.forEach((canvas) => {
      canvas.width = width;
      canvas.height = height;
    });

    processVideo();

    function processVideo() {
      const begin = Date.now();

      ctx.drawImage(video, 0, 0, width, height);

      videoMatList[0].copyTo(videoMatList[1]); // 1フレーム前
      videoMatList[0].data.set(ctx.getImageData(0, 0, width, height).data); // 現在
      cv.imshow('canvas', videoMatList[0]);

      // グレースケールにする
      // cv.cvtColor(videoMatList[0], blackAndWhiteMatList[0], cv.COLOR_RGB2GRAY);
      // cv.cvtColor(videoMatList[1], blackAndWhiteMatList[1], cv.COLOR_RGB2GRAY);

      // diffMat = cv.absdiff(blackAndWhiteMatList[0], blackAndWhiteMatList[1]);
      // cv.imshow('canvas', diffMat);

      const delay = 1000 / FPS - (Date.now() - begin);

      setTimeout(processVideo, delay);
    }
  };

  video.srcObject = stream;
}

function errorCallback(err) {
  alert(err);
};