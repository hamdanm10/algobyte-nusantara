# frozen_string_literal: true

class Public::ServiceCardComponent < ApplicationComponent
  def initialize(icon:, title:, description:)
    @icon = icon
    @title = title
    @description = description
  end
end
