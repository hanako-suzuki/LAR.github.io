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

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const promise = navigator.mediaDevices.getUserMedia(medias);
promise.then(successCallback)
       .catch(errorCallback);

function successCallback(stream) {
  const imgLength = 2;
  const videoMatList = [];
  const blackAndWhiteMatList = [];
  const diffMatList = [];
  const FPS = 30;
//   const canvasList = [].slice.call(document.querySelectorAll('canvas'));
//   const contextList = canvasList.map((canvas) => canvas.getContext('2d'));

  video.oncanplay = () => {
    const width = video.clientWidth / 4; // 適当にリサイズ
    const height = video.clientHeight / 4; // 適当にリサイズ
    const bitwiseMat = new cv.Mat(height, width, cv.CV_8UC1);
    // const distCanvas = document.getElementById('dist');
    // const distCtx = distCanvas.getContext('2d');

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

    //   videoMatList[1].copyTo(videoMatList[2]); // 2フレーム前
      videoMatList[0].copyTo(videoMatList[1]); // 1フレーム前
      videoMatList[0].data.set(ctx.getImageData(0, 0, width, height).data); // 現在

      for (let i = 0; i < videoMatList.length; ++i) {
        // グレースケールにする
        cv.cvtColor(videoMatList[i], blackAndWhiteMatList[i], cv.COLOR_RGB2GRAY);
        cv.imshow(`c${ i + 1 }`, videoMatList[i]);
        cv.imshow(`m${ i + 1 }`, blackAndWhiteMatList[i]);
      }

      diffMatList.push(new cv.Mat(height, width, cv.CV_8UC1));

      // 差分を取る
      cv.absdiff(blackAndWhiteMatList[0], blackAndWhiteMatList[1], diffMatList[0]);
      cv.imshow('canvas', diffMatList[0]);
      

    //   const dilateSize = 8;

    //   cv.bitwise_and(diffMatList[0], diffMatList[1], bitwiseMat); // 論理積を取る
    //   cv.threshold(bitwiseMat, bitwiseMat, 127, 255, cv.THRESH_BINARY); // 白黒にする
    //   cv.dilate( // 範囲を広めに取る
    //     bitwiseMat,
    //     bitwiseMat,
    //     cv.Mat.ones(dilateSize, dilateSize, cv.CV_8U),
    //     new cv.Point(dilateSize / 2, dilateSize / 2),
    //     1,
    //     cv.BORDER_CONSTANT,
    //     cv.morphologyDefaultBorderValue()
    //   );
    //   cv.erode( // 範囲をやや狭くする
    //     bitwiseMat,
    //     bitwiseMat,
    //     cv.Mat.ones(dilateSize / 4, dilateSize / 4, cv.CV_8U),
    //     new cv.Point(dilateSize / 8, dilateSize / 8),
    //     1,
    //     cv.BORDER_CONSTANT,
    //     cv.morphologyDefaultBorderValue()
    //   );
    //   cv.bitwise_not(bitwiseMat, bitwiseMat); // 白黒反転させる
    //   cv.imshow('diff', bitwiseMat);

    //   distCanvas.width = width;
    //   distCanvas.height = height;

    //   distCtx.save();
    //     distCtx.drawImage(document.getElementById('c2'), 0, 0); // 現在（カラー）を描画
    //     distCtx.globalCompositeOperation = 'lighter'; // 合成方法を指定
    //     distCtx.drawImage(document.getElementById('diff'), 0, 0); // マスク画像を描画
    //   distCtx.restore();

      const delay = 1000 / FPS - (Date.now() - begin);

      setTimeout(processVideo, delay);
    }
  };

  video.srcObject = stream;
}

function errorCallback(err) {
  alert(err);
};