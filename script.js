let frameCount = 28; // 28 frames (0 to 27)
let urls = new Array(frameCount).fill().map((o, i) => 
  `assets/frame_${i.toString().padStart(2, '0')}_delay-0.1s.png`
);

let canvas, ctx, originalWidth, originalHeight;

function setupCanvas() {
  canvas = document.getElementById('image-sequence');
  ctx = canvas.getContext('2d');
  
  // setting original dimensions (assuming first image represents dimensions for all frames)
  let img = new Image();
  img.onload = function() {
    originalWidth = img.width;
    originalHeight = img.height;
    resizeCanvas();
    initializeImageSequence();
  };
  img.src = urls[0];
}

function resizeCanvas() {
  let windowRatio = window.innerWidth / window.innerHeight;
  let imageRatio = originalWidth / originalHeight;
  
  if (windowRatio > imageRatio) {
    // window is wider than the image
    canvas.height = window.innerHeight;
    canvas.width = window.innerHeight * imageRatio;
  } else {
    // window is taller than the image
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth / imageRatio;
  }
  
  // calculate the scale factor
  let scale = Math.min(canvas.width / originalWidth, canvas.height / originalHeight);
  
  // clear any previous transformations
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  // scale the context
  ctx.scale(scale, scale);
}

function initializeImageSequence() {
  imageSequence({
    urls,
    canvas: "#image-sequence",
    scrollTrigger: {
      start: 0,
      end: "max",
      scrub: true,
    }
  });
}

function imageSequence(config) {
  let playhead = {frame: 0},
      curFrame = -1,
      onUpdate = config.onUpdate,
      images,
      updateImage = function() {
        let frame = Math.round(playhead.frame);
        if (frame !== curFrame) {
          ctx.clearRect(0, 0, originalWidth, originalHeight);
          ctx.drawImage(images[frame], 0, 0, originalWidth, originalHeight);
          curFrame = frame;
          onUpdate && onUpdate.call(this, frame, images[frame]);
        }
      };
  images = config.urls.map((url, i) => {
    let img = new Image();
    img.src = url;
    return img;
  });
  return gsap.to(playhead, {
    frame: images.length - 1,
    ease: "none",
    onUpdate: updateImage,
    duration: images.length / (config.fps || 30),
    paused: !!config.paused,
    scrollTrigger: config.scrollTrigger
  });
}

setupCanvas();

// resize canvas when window size changes
window.addEventListener('resize', resizeCanvas);