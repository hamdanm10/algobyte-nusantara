import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "icon"]

  connect() {
    this.contentTarget.style.maxHeight = "0px"
    this.contentTarget.style.overflow = "hidden"
    this.contentTarget.style.transition = "max-height 0.35s ease"
    this._open = false
  }

  toggle() {
    if (this._open) {
      this.contentTarget.style.maxHeight = "0px"
      this.iconTarget.classList.remove("rotate-45")
      this._open = false
    } else {
      this.contentTarget.style.maxHeight = this.contentTarget.scrollHeight + "px"
      this.iconTarget.classList.add("rotate-45")
      this._open = true
    }
  }
}
