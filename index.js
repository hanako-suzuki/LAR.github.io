const medias = {
  audio: false,
  video: {
    // width: {
    //   min: 1280,
    //   max: 1920,
    // },
    // height: {
    //   min: 720,
    //   max: 1080,
    // },  
    facingMode: {
      exact: "environment"
    }
  }
};
const video = document.getElementById("video");
video.autoplay = true;
video.muted = true;
video.playsInline = true;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const promise = navigator.mediaDevices.getUserMedia(medias);
const textArea = document.getElementById("textArea");

// import LSD from './lsd/lsd';

promise.then(successCallback)
       .catch(errorCallback);

function successCallback(stream) {
  video.srcObject = stream;
  const FPS = 30;

  /* ここから */
  const width = canvas.width*1.5;
  const height = canvas.height*4;
  const median = height/2;

  let videoMatPre = new cv.Mat(height, width, cv.CV_8UC4);
  let videoMatNow = new cv.Mat(height, width, cv.CV_8UC4);
  let blackAndWhiteMatPre = new cv.Mat(height, width, cv.CV_8UC1);
  let blackAndWhiteMatNow = new cv.Mat(height, width, cv.CV_8UC1);

  let posLog = []; // 0:x 1:y 2: theta 3:frequency
  const comp_length = 5;
  let colorRed = new cv.Scalar(255, 0, 0);
  let threshold_size = 5;

  let read_flag = 0;
  let H_inv;


  canvas.width = width;
  canvas.height = height;

  processVideo();
  // processVideo();

  function processVideo() {
    const begin = Date.now();

    // ctx.drawImage(video, 0, 0, width, height);
    ctx.drawImage(video, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
    // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // videoMatPre.copyTo(videoMatNow);
    // videoMatNow.data.set(ctx.getImageData(0, 0, width, height).data);
    videoMatNow = cv.matFromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // cv.imshow("canvas", videoMatNow);
    // videoMatNow.data.set(cv.matFromImageData(imageData));

    const R_pilot = [200, 15, 2];
    const G_pilot = [35, 195, 2];
    const B_pilot = [10, 0, 185];
    if(read_flag == 0){
      H_inv = calc_H(R_pilot, G_pilot, B_pilot);
    }
    color(videoMatNow, H_inv);
    // cv.line(videoMatNow, (10,10),(10,11),(0,255,0),1);

    // ２値化
    cv.cvtColor(videoMatNow, blackAndWhiteMatNow, cv.COLOR_RGB2GRAY);
    if(read_flag !=0){
      cv.cvtColor(videoMatPre, blackAndWhiteMatPre, cv.COLOR_RGB2GRAY);
      // cv.imshow("canvas", blackAndWhiteMatPre);
    }
    // cv.imshow("canvas", blackAndWhiteMatNow);

  
    if(read_flag != 0){
      // 差分取得
      let diffMat = new cv.Mat(height, width, cv.CV_8UC1);
      cv.absdiff(blackAndWhiteMatNow, blackAndWhiteMatPre, diffMat);
      // cv.imshow("canvas", diffMat);

      // 矩形検出
      // let rect = new cv.Rect(100, 100, 200, 200);
      // let dst = diffMat.roi(rect);
      // cv.imshow("canvas", dst);

      // 線分検出 LSD
      // const detector = new LSD();
      // const lines = detector.detect(diffMat);
      // detector.drawSegments(ctx, lines);

      // 線分検出 Hough
      if(diffMat.width!=NaN){

        if (posLog.length >= comp_length){ // comp_lengthの長さ分だけ前のものを保持して比較
          posLog.pop(); // posLogの一番最後を削除
        }
        posLog.unshift([]); // posLogの一番最初に空の配列を追加

        let lines = new cv.Mat();
        // cv.bitwise_not(diffMat, diffMat);
        cv.Canny(diffMat, diffMat, 30, 300, 3); // エッジ検出

        // 始点と角度座標var.
        // cv.HoughLines(diffMat, lines, 1, Math.PI / 180, 100, 0, 0, 0, Math.PI); // ハフ検出　始点と角度座標
        // // draw lines
        // for (let i = 0; i < lines.rows; ++i) {
        //   let rho = lines.data32F[i * 2];
        //   let theta = lines.data32F[i * 2 + 1];
        //   let tmp_theta = theta*180/Math.PI;
        //   if((tmp_theta<100 & tmp_theta>80) || (tmp_theta>260 & tmp_theta<280)){
        //     let a = Math.cos(theta);
        //     let b = Math.sin(theta);
        //     let x0 = a * rho;
        //     let y0 = b * rho;
        //     posLog[0].push([x0, y0, theta, 0])
        //     for(let i=1; i<posLog.length; i++){
        //       for(let j=0; j<posLog[i].length; j++){
        //         let tmp_x = posLog[i][j][0];
        //         let tmp_y = posLog[i][j][1];
        //         if(tmp_x-5<x0 & x0<tmp_x+5 & tmp_y-5<y0 & y0 < tmp_y+5){
        //           posLog[i][j][3] += 1;
        //         }
        //       }
        //     }
        //     if(posLog.length == comp_length){
        //       for(let i=0; i<posLog[comp_length-1].length; i++){
        //         if(posLog[comp_length-1][i][3] > comp_length*0.8){
        //           let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
        //           let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
        //           cv.line(videoMatPre, startPoint, endPoint, [255, 0, 0, 255]);
        //         }
        //       }
              
        //     }
        //     // let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
        //     // let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
        //     // cv.line(videoMatPre, startPoint, endPoint, [255, 0, 0, 255]);
        //   }
        //   // cv.line(diffMat, startPoint, endPoint, [255, 0, 0, 255]);
        // }

        // 始点と終点座標var.
        cv.HoughLinesP(diffMat, lines, 1, Math.PI / 180, 2, 0, 0);
        // draw lines
        for (let i = 0; i < lines.rows; ++i) {
          let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
          let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
          if(startPoint.x == endPoint.x & startPoint.y == endPoint.y){
            continue;
          }

          // 線分の角度を求める
          let theta;
          if(startPoint.x != endPoint.x){
            theta = Math.atan(Math.abs((startPoint.y-endPoint.y)/(startPoint.x-endPoint.x)));
          }
          else{
            theta = Math.PI/2;
          }
          // let tmp_theta = theta*180/Math.PI;
          if(theta<0.1745){
            posLog[0].push([startPoint, endPoint, theta, 0])
            for(let i=1; i<posLog.length; i++){
              for(let j=0; j<posLog[i].length; j++){
                let s_x = posLog[i][j][0].x;
                let s_y = posLog[i][j][0].y;
                let e_x = posLog[i][j][1].x;
                let e_y = posLog[i][j][1].y;
                if(s_x-2<startPoint.x & startPoint.x<s_x+2 & s_y-2<startPoint.y & startPoint.y<s_y+2){
                  if(e_x-2<endPoint.x & endPoint.x<e_x+2 & e_y-2<endPoint.y & endPoint.y<e_y+2){
                    posLog[i][j][3] += 1;
                  }
                }
              }
            }
          }
        }
        if(posLog.length == comp_length){
          let targetLines = posLog[comp_length-1].concat();
          targetLines = integlate_lines(targetLines, threshold_size, comp_length);
          let fuse_lines = fusion(targetLines, (height+width)/2);
          for(let i=0; i<fuse_lines.length; i++){
            cv.line(videoMatPre, fuse_lines[i][0], fuse_lines[i][1], colorRed);
          }
        }
      }
      cv.imshow("canvas", videoMatPre);
      // diffMat.delete();
      // lines.delete();
      // blackAndWhiteMatNow.delete();
      // blackAndWhiteMatPre.delete();
      // videoMatPre.delete();
  }

    videoMatPre = videoMatNow.clone();
    // cv.line(videoMatPre, (10,10), (10, 11), (255, 0, 0), 1);
    // cv.imshow("canvas", videoMatPre);

    // キャンバス上に線を描画
    // ctx.beginPath();       // 新しいパスを開始
    // ctx.moveTo(10, 10);    // ペンを (30, 50) へ移動
    // ctx.lineTo(11, 10);  // 直線を (150, 100) へ描く
    // ctx.stroke();          // パスを描画

    read_flag = 1;
    let delay = 1000 / FPS - (Date.now() - begin);
    if(delay<0){
      delay = 0;
    }
    setTimeout(processVideo, delay);
    // processVideo();

  }

  function integlate_lines(bare_lines, threshold_size, comp_length){
    // 同一の直線と思われる直線を統合する

    let ori_lines = [];

    for(let i=0; i<bare_lines.length; i++){
      if(bare_lines[i][3] > comp_length*0.8){
        let integlateFlag = 0;
        for(let j=0; j<ori_lines.length; j++){
          // 2直線の始点と終点の差分d1, d2を算出して、それが共に指定距離よりも近くにあるかどうかで、同じ直線かどうかを判断
          let d1 = Math.sqrt((ori_lines[j][0].x - bare_lines[i][0].x)**2 + (ori_lines[j][0].y - bare_lines[i][0].y)**2);
          let d2 = Math.sqrt((ori_lines[j][1].x - bare_lines[i][1].x)**2 + (ori_lines[j][1].y - bare_lines[i][1].y)**2);
          if(d1<threshold_size & d2 <threshold_size){
            integlateFlag = 1;
            break
          }
        }
        if(flag == 0){
          ori_lines.push(bare_lines[i]);
        }
      }
    }

    return ori_lines;
  }

  function fusion(para_lines, size){
    // 各直線が他の直線と重なっているかを確認し重なっていれば融合

    let fuse_lines = [];
    let fused_list = [];

    for(let i; i<para_lines.length; i++){
      if(fused_list.indexOf(i)>-1){
        continue;
      }
      let new_line = para_lines[i].concat();
      for(let j=0; j<para_lines.length; j++){
        if(i != j){
          let tmp = fusion_lines(new_line, para_lines[j], size);
          new_line = tmp[0].concat();
          if(tmp[1]==1){
            fused_list.push(j);
          }
        }
      }
      fuse_lines.push(new_line);
    }

    return fuse_lines;
  }

  function fusion_lines(lineA, lineB, size){
    const distance = Math.abs(lineA[0].y - lineB[0].y);
    const pA = [Math.min(lineA[0].x, lineA[1].x), Math.max(lineA[0].y, lineA[1].y)];
    const pB = [Math.min(lineB[0].x, lineB[1].x), Math.max(lineB[0].y, lineB[1].y)];

    if(distance > size/100){
      // ２つの線が十分に離れていれば終了
      return [lineA, 0];
    }
    if(pA[0] > pB[1]+5 || pB[0] > pA[1]+5){
      // 重なっていなければ終了
      return [lineA, 0];
    }

    let y = (lineA[0].y + lineA[1].y + lineB[0].y + lineB[1].y)/4;
    let x1 = Math.min(lineA[0].x, lineA[1].x, lineB[0].x, lineB[1].x);
    let x2 = Math.max(lineA[0].x, lineA[1].x, lineB[0].x, lineB[1].x);
    let new_line = [new Point(x1, y), new Point(x2, y)];

    return [new_line, 1];
  }

  function color(videoMatNow, H_inv){
    const x_l = 10;
    const x_r = 11;
    const y_u = 10;
    const y_d = 11;
    const x = [0.65,  0.3,  0.15,  0.275,  0.4,   0.25,  0.4,  0.5];
    const y = [0.3,   0.6,  0.05,  0.4,    0.45,  0.2,   0.2,  0.35];
    const color_name = ["red", "green", "blue", "lightblue", "yellow", "navy", "purple", "orange"];
    const color_bit = ["100","011","010","110","111","000","001","101"];

    // 読み取り範囲の平均輝度値を取得
    let R_value = 0.0;
    let G_value = 0.0;
    let B_value = 0.0;
    for(let i=x_l; i<=x_r; i++){
      for(let j=y_u; j<=y_d; j++){
        let data = videoMatNow.ucharPtr(j,i);
        R_value += data[0]/4;
        G_value += data[1]/4;
        B_value += data[2]/4;
      }
    }

    const receptColor = [R_value, G_value, B_value];

    // チャネル補正
    const n = 3;
    let ans_sum = 0.0;
    let ans = [0.0, 0.0, 0.0];
    for(let r=0; r<n; r++){
      let sum = 0;
      for(let i=0; i<n; i++){
        sum += H_inv[r][i]*receptColor[i];
        ans_sum += H_inv[r][i]*receptColor[i];
      }
      if(sum>0){
        ans[r] = sum;
      }else{
        ans[r] = 0;
      }
    }
    for(let r=0; r<n; r++){
      if(ans_sum != 0){
        ans[r] /= ans_sum;
      }
    }
    const ans_x = 0.65*ans[0] + 0.3*ans[1] + 0.15*ans[2];
    const ans_y = 0.3*ans[0] + 0.6*ans[1] + 0.05*ans[2];

    // let color_dis = [0,0,0,0,0,0,0,0]; // 各シンボルとの距離を格納
    let tmp;
    let min_dis;
    let min_id=0;
    for(let i=0; i<8; i++){
      tmp = Math.sqrt((x[i]-ans_x)**2 + (y[i]-ans_y)**2);
      if(i==0 || tmp<min_dis){
        min_dis = tmp;
        min_id = i;
      }
    }
    const bit = color_bit[min_id];
    // 色表示
    // textArea.innerHTML = String(color[0]) + ", " + String(color[1]) + ", " + String(color[1]) + " " + color_name[min_id];
    textArea.innerHTML = String(receptColor[0]) + ", " + String(receptColor[1]) + ", " + String(receptColor[2]) + ", " + color_name[min_id];
  }

  // チャネル行列計算
  function calc_H(R_pilot, G_pilot, B_pilot){
    let H = [[R_pilot[0], G_pilot[0], B_pilot[0]], [R_pilot[1], G_pilot[1], B_pilot[1]], [R_pilot[2], G_pilot[2], B_pilot[2]]];

    // 逆行列計算
    // 掃き出し法
    let H_inv = [[1,0,0],[0,1,0],[0,0,1]];
    let buf;
    const n = 3;

    for(let i=0; i<n; i++){
      buf = 1/H[i][i];
      for(let j=0; j<n; j++){
        H[i][j] *= buf;
        H_inv[i][j] *= buf;
      }
      for(let j=0; j<n; j++){
        if(i!=j){
          buf = H[j][i];
          for(let k=0; k<n; k++){
            H[j][k] -= H[i][k]*buf;
            H_inv[j][k] -= H_inv[i][k]*buf;
          }
        }
      }
    }
    return H_inv;
  }
};

function errorCallback(err) {
  alert(err);
};




