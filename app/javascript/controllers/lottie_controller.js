import { Controller } from "@hotwired/stimulus";
import { DotLottie } from "@lottiefiles/dotlottie-web";

export default class extends Controller {
  static values = {
    src: String,
    autoplay: { type: Boolean, default: true },
    loop: { type: Boolean, default: true },
    speed: { type: Number, default: 1 },
  };

  connect() {
    this.dotLottie = new DotLottie({
      canvas: this.element,
      src: this.srcValue,
      autoplay: this.autoplayValue,
      loop: this.loopValue,
      speed: this.speedValue,
    });
  }

  disconnect() {
    this.dotLottie?.destroy();
    this.dotLottie = null;
  }

  play() {
    this.dotLottie?.play();
  }

  pause() {
    this.dotLottie?.pause();
  }

  stop() {
    this.dotLottie?.stop();
  }
}
