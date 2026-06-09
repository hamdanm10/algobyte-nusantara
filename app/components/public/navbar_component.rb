# frozen_string_literal: true

class Public::NavbarComponent < ApplicationComponent
  NavLink = Data.define(:label, :path)

  def links
    [
      NavLink.new(label: "Home",       path: helpers.root_path),
      NavLink.new(label: "About",      path: helpers.about_path),
      NavLink.new(label: "Services",   path: helpers.services_path),
      NavLink.new(label: "Portfolios", path: helpers.portfolios_path),
      NavLink.new(label: "Articles",   path: helpers.articles_path),
      NavLink.new(label: "Contact",    path: helpers.contact_path)
    ]
  end
end
