const medias = {
  audio: false,
  video: {
    facingMode: {
      exact: "user"
    }
  }
};
const video  = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const promise = navigator.mediaDevices.getUserMedia(medias);

promise.then(successCallback)
       .catch(errorCallback);

function successCallback(stream) {
  video.srcObject = stream;
  const FPS = 30;

  /* ここから */
  const width = canvas.width/4;
  const height = canvas.height/4;

  const videoMatPre = new cv.Mat(height, width, cv.CV_8UC4);
  const videoMatNow = new cv.Mat(height, width, cv.CV_8UC4);
  const blackAndWhiteMatPre = new cv.Mat(height, width, cv.CV_8UC1);
  const blackAndWhiteMatNow = new cv.Mat(height, width, cv.CV_8UC1);


  // canvasList.forEach((canvas) => {
  //   canvas.width = width;
  //   canvas.height = height;
  // });

  processVideo();

  function processVideo() {
    const begin = Date.now();

    // ctx.drawImage(video, 0, 0, width, height);
    ctx.drawImage(video, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    videoMatPre.copyTo(videoMatNow);
    // videoMatNow.data.set(ctx.getImageData(0, 0, width, height).data);
    videoMatNow.data.set(cv.matFromImageData(imageData));

    // ２値化
    cv.cvtColor(videoMatNow, blackAndWhiteMatNow, cv.COLOR_RGB2GRAY);
    cv.cvtColor(videoMatPre, blackAndWhiteMatPre, cv.COLOR_RGB2GRAY);

    // 差分取得
    const diffMat = new cv.Mat(height, width, cv.CV_8UC1);
    cv.absdiff(blackAndWhiteMatNow, blackAndWhiteMatPre, diffMat);
    cv.imshow("canvas", diffMat);

    const delay = 1000 / FPS - (Date.now() - begin);

    setTimeout(processVideo, delay);
    // processVideo();
  }
  /* ここまで */
  // video.oncanplay = () => {
  //   const width = video.clientWidth;
  //   const height = video.clientHeight;

  //   const videoMatPre = new cv.Mat(height, width, cv.CV_8UC4);
  //   const videoMatNow = new cv.Mat(height, width, cv.CV_8UC4);
  //   const blackAndWhiteMatPre = new cv.Mat(height, width, cv.CV_8UC1);
  //   const blackAndWhiteMatNow = new cv.Mat(height, width, cv.CV_8UC1);


  //   canvasList.forEach((canvas) => {
  //     canvas.width = width;
  //     canvas.height = height;
  //   });

  //   processVideo();

  //   function processVideo() {
  //     const begin = Date.now();

  //     ctx.drawImage(video, 0, 0, width, height);

  //     videoMatPre.copyTo(videoMatNow);
  //     videoMatNow.data.set(ctx.getImageData(0, 0, width, height).data);

  //     // ２値化
  //     cv.cvtColor(videoMatNow, blackAndWhiteMatNow, cv.COLOR_RGB2GRAY);
  //     cv.cvtColor(videoMatPre, blackAndWhiteMatPre, cv.COLOR_RGB2GRAY);

  //     // 差分取得
  //     const diffMat = new cv.Mat(height, width, cv.CV_8UC1);
  //     cv.absdiff(blackAndWhiteMatNow, blackAndWhiteMatPre, diffMat);
  //     cv.imshow("canvas", diffMat);

  //     const delay = 1000 / FPS - (Date.now() - begin);

  //     setTimeout(processVideo, delay);
  //   }
  // };
};

function errorCallback(err) {
  alert(err);
};




