# frozen_string_literal: true

class Public::NavbarComponent < ApplicationComponent
  NavLink = Data.define(:label, :path)

  def links
    [
      NavLink.new(label: "Home", path: helpers.root_path),
      NavLink.new(label: "About", path: "#about"),
      NavLink.new(label: "Services", path: "#services"),
      NavLink.new(label: "Portfolios", path: "#services"),
      NavLink.new(label: "Articles", path: "#services"),
      NavLink.new(label: "Contact", path: "#contact")
    ]
  end
end
